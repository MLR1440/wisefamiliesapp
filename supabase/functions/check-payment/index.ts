import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT] ${step}${detailsStr}`);
};

const COURSE_PRODUCT_ID = "prod_TXwi6z2RYRGvt2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if user has a Stripe customer record
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
    } else {
      logStep("No customer found, checking sessions by email");
    }

    // Check for successful payments for our course product
    // Search by customer if exists, otherwise search all recent sessions and filter by email
    let sessions;
    if (customerId) {
      sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 100,
      });
    } else {
      // Search recent sessions and filter by customer_email
      sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });
      // Filter to only sessions matching user's email
      sessions.data = sessions.data.filter(
        (s: { customer_email?: string | null; customer_details?: { email?: string | null } | null }) => 
          s.customer_email === user.email || s.customer_details?.email === user.email
      );
      logStep("Filtered sessions by email", { count: sessions.data.length });
    }

    let hasPurchased = false;
    let purchaseDate = null;

    for (const session of sessions.data) {
      if (session.payment_status === "paid" && session.mode === "payment") {
        // Verify this was for our course product
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          if (item.price?.product === COURSE_PRODUCT_ID) {
            hasPurchased = true;
            purchaseDate = new Date(session.created * 1000).toISOString();
            logStep("Found successful purchase", { sessionId: session.id, purchaseDate });
            break;
          }
        }
        if (hasPurchased) break;
      }
    }

    logStep("Payment check complete", { hasPurchased, purchaseDate });

    return new Response(JSON.stringify({ 
      hasPurchased, 
      purchaseDate 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
