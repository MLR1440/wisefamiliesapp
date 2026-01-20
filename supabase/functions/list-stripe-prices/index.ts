import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all active prices with product info expanded
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100,
    });

    // Map to a simpler format
    const formattedPrices = prices.data
      .filter((price: Stripe.Price) => price.unit_amount !== null)
      .map((price: Stripe.Price) => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          amount: (price.unit_amount || 0) / 100, // Convert from cents
          currency: price.currency,
          productName: product?.name || 'Unknown Product',
          nickname: price.nickname || null,
          recurring: price.recurring ? price.recurring.interval : null,
        };
      })
      .sort((a: { amount: number }, b: { amount: number }) => a.amount - b.amount);

    return new Response(
      JSON.stringify({ prices: formattedPrices }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
