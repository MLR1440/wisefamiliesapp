import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { jwtVerify } from "https://deno.land/x/jose@v5.2.2/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-PURCHASE] ${step}${detailsStr}`);
};

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

    const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET");
    if (!jwtSecret) throw new Error("SUPABASE_JWT_SECRET is not set");

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const userToken = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(userToken);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Get the claim token from request body
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing claim token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify the claim token
    const secret = new TextEncoder().encode(jwtSecret);
    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (verifyError) {
      logStep("Token verification failed", { error: String(verifyError) });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or expired claim token" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (payload.type !== 'purchase_claim') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid token type" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sessionId = payload.session_id as string;
    const productId = payload.product_id as string;

    logStep("Token verified", { sessionId, productId });

    // Check pending purchase exists and not claimed
    const { data: pending, error: pendingError } = await supabaseClient
      .from('pending_purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (pendingError) {
      logStep("Error fetching pending purchase", { error: pendingError.message });
    }

    if (pending?.claimed_by) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "This purchase has already been claimed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create user_purchases record
    const { error: purchaseError } = await supabaseClient
      .from('user_purchases')
      .insert({
        user_id: user.id,
        stripe_session_id: sessionId,
        product_id: productId,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      // Check if it's a duplicate key error (already claimed via check-payment)
      if (purchaseError.code === '23505') {
        logStep("Purchase already exists in user_purchases");
      } else {
        logStep("Error creating user_purchases", { error: purchaseError.message });
        throw new Error(`Failed to create purchase record: ${purchaseError.message}`);
      }
    } else {
      logStep("User purchase created");
    }

    // Mark pending purchase as claimed
    if (pending) {
      const { error: updateError } = await supabaseClient
        .from('pending_purchases')
        .update({
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', sessionId);

      if (updateError) {
        logStep("Warning: Could not update pending purchase", { error: updateError.message });
      } else {
        logStep("Pending purchase marked as claimed");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
