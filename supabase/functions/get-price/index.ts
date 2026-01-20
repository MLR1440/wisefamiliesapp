import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS - allows public homepage to read price settings
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get price ID from database settings
    const { data: setting, error: dbError } = await supabaseClient
      .from('course_settings')
      .select('value')
      .eq('key', 'stripe_price_id')
      .single();

    if (dbError) {
      console.error("Error reading course_settings:", dbError.message);
    }
    
    const priceId = setting?.value || "price_1SaqpSQLJHCz1zk9H6YyndT4";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    
    const price = await stripe.prices.retrieve(priceId);
    
    return new Response(
      JSON.stringify({
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching price:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, amount: 99, currency: "usd" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with fallback to avoid breaking UI
      }
    );
  }
});
