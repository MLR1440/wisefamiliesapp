import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SESSION] ${step}${detailsStr}`);
};

const COURSE_PRODUCT_ID = "prod_TXwi6z2RYRGvt2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ valid: false, error: "Missing session_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Verifying session", { session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product'],
    });

    logStep("Session retrieved", { 
      payment_status: session.payment_status,
      mode: session.mode 
    });

    // Verify payment was successful
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify it's a one-time payment
    if (session.mode !== "payment") {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid payment mode" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify product matches our course
    let productMatches = false;
    if (session.line_items?.data) {
      for (const item of session.line_items.data) {
        const product = item.price?.product;
        if (typeof product === 'object' && product.id === COURSE_PRODUCT_ID) {
          productMatches = true;
          break;
        } else if (product === COURSE_PRODUCT_ID) {
          productMatches = true;
          break;
        }
      }
    }

    if (!productMatches) {
      logStep("Product mismatch", { expected: COURSE_PRODUCT_ID });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid product" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Store in pending_purchases using service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if session already processed
    const { data: existing } = await supabaseClient
      .from('pending_purchases')
      .select('id, claimed_by, claim_token')
      .eq('stripe_session_id', session_id)
      .maybeSingle();

    if (existing?.claimed_by) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "This purchase has already been claimed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If existing record, return its token
    if (existing?.claim_token) {
      logStep("Returning existing claim token");
      return new Response(JSON.stringify({ 
        valid: true, 
        email: session.customer_email || session.customer_details?.email,
        token: existing.claim_token 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a secure random claim token
    const claimToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Insert new pending purchase with claim token
    const { error: insertError } = await supabaseClient
      .from('pending_purchases')
      .insert({
        stripe_session_id: session_id,
        stripe_customer_email: session.customer_email || session.customer_details?.email,
        product_id: COURSE_PRODUCT_ID,
        amount_total: session.amount_total,
        currency: session.currency,
        claim_token: claimToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      logStep("Error storing pending purchase", { error: insertError.message });
      // Continue anyway - try to return the token
    } else {
      logStep("Pending purchase stored with claim token");
    }

    return new Response(JSON.stringify({ 
      valid: true, 
      email: session.customer_email || session.customer_details?.email,
      token: claimToken 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ valid: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
