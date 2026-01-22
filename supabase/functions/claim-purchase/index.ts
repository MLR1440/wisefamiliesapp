import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    logStep("Looking up claim token", { token });

    // Look up the pending purchase by claim token
    const { data: pending, error: pendingError } = await supabaseClient
      .from('pending_purchases')
      .select('*')
      .eq('claim_token', token)
      .maybeSingle();

    if (pendingError) {
      logStep("Error fetching pending purchase", { error: pendingError.message });
      throw new Error(`Database error: ${pendingError.message}`);
    }

    if (!pending) {
      logStep("No pending purchase found for token");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or expired claim token" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if already claimed
    if (pending.claimed_by) {
      logStep("Purchase already claimed", { claimedBy: pending.claimed_by });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "This purchase has already been claimed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if token has expired
    if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
      logStep("Claim token expired", { expiresAt: pending.expires_at });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Claim token has expired. Please contact support." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Valid pending purchase found", { 
      sessionId: pending.stripe_session_id, 
      productId: pending.product_id,
      priceId: pending.price_id
    });

    // Create user_purchases record
    const { error: purchaseError } = await supabaseClient
      .from('user_purchases')
      .insert({
        user_id: user.id,
        stripe_session_id: pending.stripe_session_id,
        product_id: pending.product_id,
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
    const { error: updateError } = await supabaseClient
      .from('pending_purchases')
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq('claim_token', token);

    if (updateError) {
      logStep("Warning: Could not update pending purchase", { error: updateError.message });
    } else {
      logStep("Pending purchase marked as claimed");
    }

    // ========================================
    // Kit.com Integration - Two-Step Process
    // ========================================
    const kitApiKey = Deno.env.get("KIT_API_KEY");
    const defaultKitFormId = Deno.env.get("KIT_FORM_ID");

    if (kitApiKey) {
      try {
        // Fetch email marketing settings from course_settings
        const { data: emailSettings } = await supabaseClient
          .from('course_settings')
          .select('key, value')
          .in('key', [
            'stripe_price_id_core',
            'stripe_price_id_core_installments',
            'stripe_price_id_premium',
            'kit_form_id_core',
            'kit_form_id_core_installments',
            'kit_form_id_premium'
          ]);

        const settingsMap: Record<string, string> = {};
        emailSettings?.forEach(s => { settingsMap[s.key] = s.value; });

        logStep("Email marketing settings loaded", { 
          hasSettings: !!emailSettings?.length,
          priceId: pending.price_id 
        });

        // Determine which Kit.com form to use based on price_id
        let kitFormId: string | undefined;
        const priceId = pending.price_id;

        if (priceId === settingsMap['stripe_price_id_premium']) {
          kitFormId = settingsMap['kit_form_id_premium'];
          logStep("Routing to Premium form", { kitFormId });
        } else if (priceId === settingsMap['stripe_price_id_core_installments']) {
          kitFormId = settingsMap['kit_form_id_core_installments'];
          logStep("Routing to Core Installments form", { kitFormId });
        } else if (priceId === settingsMap['stripe_price_id_core']) {
          kitFormId = settingsMap['kit_form_id_core'];
          logStep("Routing to Core Pay-in-Full form", { kitFormId });
        }

        // Fall back to default KIT_FORM_ID if no mapping configured
        if (!kitFormId) {
          kitFormId = defaultKitFormId;
          logStep("Using default KIT_FORM_ID", { kitFormId });
        }

        if (kitFormId) {
          // Step 1: Create or update subscriber to get subscriber_id
          const createResponse = await fetch('https://api.kit.com/v4/subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Kit-Api-Key': kitApiKey,
            },
            body: JSON.stringify({
              email_address: user.email,
              first_name: user.user_metadata?.first_name || '',
              state: 'active',
            }),
          });

          if (!createResponse.ok) {
            const createError = await createResponse.text();
            logStep("Kit.com create subscriber warning", { 
              status: createResponse.status, 
              error: createError 
            });
          } else {
            const subscriberData = await createResponse.json();
            const subscriberId = subscriberData.subscriber?.id;
            
            logStep("Subscriber created/updated", { subscriberId, email: user.email });

            // Step 2: Add subscriber to the specific form
            if (subscriberId) {
              const addToFormResponse = await fetch(
                `https://api.kit.com/v4/forms/${kitFormId}/subscribers/${subscriberId}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Kit-Api-Key': kitApiKey,
                  },
                }
              );

              if (addToFormResponse.ok) {
                logStep("Subscriber added to Kit.com form", { 
                  email: user.email, 
                  formId: kitFormId 
                });
              } else {
                const formError = await addToFormResponse.text();
                logStep("Kit.com add to form warning", { 
                  status: addToFormResponse.status, 
                  formId: kitFormId,
                  error: formError 
                });
              }
            }
          }
        } else {
          logStep("Kit.com integration skipped - no form ID configured");
        }
      } catch (kitError) {
        // Log but don't fail the purchase claim
        logStep("Kit.com integration error (non-blocking)", { error: String(kitError) });
      }
    } else {
      logStep("Kit.com integration skipped - missing API key");
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
