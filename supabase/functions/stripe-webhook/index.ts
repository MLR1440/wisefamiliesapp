import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const MAX_INSTALLMENTS = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("Signature verification failed", { error: String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;

      if (!subscriptionId) {
        log("Invoice has no subscription, ignoring");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch subscription to identify which price is being billed.
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? null;

      // Look up the installments price ID from course_settings so we're not hardcoding.
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } },
      );
      const { data: setting } = await supabase
        .from("course_settings")
        .select("value")
        .eq("key", "stripe_price_id_core_installments")
        .maybeSingle();
      const installmentsPriceId = setting?.value ?? null;

      if (!installmentsPriceId || priceId !== installmentsPriceId) {
        log("Not an installments subscription, ignoring", { priceId, installmentsPriceId });
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Count how many invoices have been paid on this subscription.
      let paidCount = 0;
      let hasMore = true;
      let startingAfter: string | undefined;
      while (hasMore) {
        const page: Stripe.ApiList<Stripe.Invoice> = await stripe.invoices.list({
          subscription: subscriptionId,
          limit: 100,
          starting_after: startingAfter,
        });
        for (const inv of page.data) {
          if (inv.status === "paid") paidCount++;
        }
        hasMore = page.has_more;
        startingAfter = page.data[page.data.length - 1]?.id;
      }

      log("Paid invoice count", { subscriptionId, paidCount });

      if (paidCount >= MAX_INSTALLMENTS && subscription.status !== "canceled") {
        await stripe.subscriptions.cancel(subscriptionId);
        log("Subscription cancelled after installment cap reached", { subscriptionId });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("Handler error", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
