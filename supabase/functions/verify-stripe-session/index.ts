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

    // Freshness check: only allow verification of recently-created sessions to limit
    // the window in which a leaked session_id could be replayed to fetch a claim token.
    const sessionCreatedMs = (session.created ?? 0) * 1000;
    const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
    if (!sessionCreatedMs || Date.now() - sessionCreatedMs > SESSION_MAX_AGE_MS) {
      logStep("Session too old to verify", { sessionCreatedMs });
      return new Response(JSON.stringify({
        valid: false,
        error: "This checkout session has expired. Please contact support.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 410,
      });
    }

    // If the caller is authenticated, require their email to match the Stripe customer.
    // (Payment-first flow allows anonymous callers; in that case the claim token must
    // still be redeemed via the authenticated claim-purchase function.)
    const sessionEmail = (session.customer_email || session.customer_details?.email || "").toLowerCase();
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const { data: userData } = await authClient.auth.getUser(token);
      const userEmail = userData?.user?.email?.toLowerCase();
      if (userEmail && sessionEmail && userEmail !== sessionEmail) {
        logStep("Email mismatch between caller and Stripe session");
        return new Response(JSON.stringify({
          valid: false,
          error: "This purchase belongs to a different account.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    }

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

    // Verify it's a valid payment mode (one-time or subscription/installments)
    if (session.mode !== "payment" && session.mode !== "subscription") {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid payment mode" 
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

    // Fetch configured product IDs from course_settings
    const { data: productSettings } = await supabaseClient
      .from('course_settings')
      .select('key, value')
      .in('key', ['stripe_price_id_core', 'stripe_price_id_core_installments', 'stripe_price_id_premium']);

    const settingsMap: Record<string, string> = {};
    productSettings?.forEach(s => { settingsMap[s.key] = s.value; });

    // Get all valid price IDs from settings
    const validPriceIds = [
      settingsMap['stripe_price_id_core'],
      settingsMap['stripe_price_id_core_installments'],
      settingsMap['stripe_price_id_premium'],
    ].filter(Boolean);

    logStep("Configured price IDs", { validPriceIds });

    // Extract product_id and price_id from line items
    let productId: string | null = null;
    let priceId: string | null = null;
    let priceMatches = false;

    if (session.line_items?.data) {
      for (const item of session.line_items.data) {
        const price = item.price;
        if (price) {
          priceId = price.id;
          const product = price.product;
          if (typeof product === 'object' && product.id) {
            productId = product.id;
          } else if (typeof product === 'string') {
            productId = product;
          }
          
          // Check if this price ID is configured (if we have settings)
          if (validPriceIds.length > 0) {
            if (priceId && validPriceIds.includes(priceId)) {
              priceMatches = true;
              break;
            }
          } else {
            // No price IDs configured yet - allow any valid payment
            priceMatches = true;
            break;
          }
        }
      }
    }

    logStep("Product verification", { productId, priceId, priceMatches });

    if (!priceMatches && validPriceIds.length > 0) {
      logStep("Price mismatch", { expected: validPriceIds, got: priceId });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid product" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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

    // Insert new pending purchase with claim token and price_id
    const { error: insertError } = await supabaseClient
      .from('pending_purchases')
      .insert({
        stripe_session_id: session_id,
        stripe_customer_email: session.customer_email || session.customer_details?.email,
        product_id: productId || 'unknown',
        price_id: priceId, // NEW: Store price_id for Kit.com routing
        amount_total: session.amount_total,
        currency: session.currency,
        claim_token: claimToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      logStep("Error storing pending purchase", { error: insertError.message });
      // Continue anyway - try to return the token
    } else {
      logStep("Pending purchase stored with claim token", { priceId });
    }

    // ========================================
    // Kit.com Integration - Add Immediately After Payment
    // ========================================
    const kitApiKey = Deno.env.get("KIT_API_KEY");
    const defaultKitFormId = Deno.env.get("KIT_FORM_ID");
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (kitApiKey && customerEmail) {
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

        const emailSettingsMap: Record<string, string> = {};
        emailSettings?.forEach(s => { emailSettingsMap[s.key] = s.value; });

        logStep("Email marketing settings loaded for Kit.com", { 
          hasSettings: !!emailSettings?.length,
          priceId: priceId 
        });

        // Determine which Kit.com form to use based on price_id
        let kitFormId: string | undefined;

        if (priceId === emailSettingsMap['stripe_price_id_premium']) {
          kitFormId = emailSettingsMap['kit_form_id_premium'];
          logStep("Routing to Premium form", { kitFormId });
        } else if (priceId === emailSettingsMap['stripe_price_id_core_installments']) {
          kitFormId = emailSettingsMap['kit_form_id_core_installments'];
          logStep("Routing to Core Installments form", { kitFormId });
        } else if (priceId === emailSettingsMap['stripe_price_id_core']) {
          kitFormId = emailSettingsMap['kit_form_id_core'];
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
              email_address: customerEmail,
              state: 'active',
            }),
          });

          if (createResponse.ok) {
            const subscriberData = await createResponse.json();
            const subscriberId = subscriberData.subscriber?.id;
            
            logStep("Kit.com subscriber created (immediate)", { subscriberId, email: customerEmail });

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
                logStep("Subscriber added to Kit.com form (immediate post-payment)", { 
                  email: customerEmail, 
                  formId: kitFormId 
                });
              } else {
                const formError = await addToFormResponse.text();
                logStep("Kit.com add to form warning", { 
                  status: addToFormResponse.status, 
                  error: formError 
                });
              }
            }
          } else {
            const createError = await createResponse.text();
            logStep("Kit.com create subscriber warning", { 
              status: createResponse.status, 
              error: createError 
            });
          }
        } else {
          logStep("Kit.com integration skipped - no form ID configured");
        }
      } catch (kitError) {
        // Log but don't fail the payment verification
        logStep("Kit.com integration error (non-blocking)", { error: String(kitError) });
      }
    } else if (!customerEmail) {
      logStep("Kit.com integration skipped - no customer email");
    } else {
      logStep("Kit.com integration skipped - missing API key");
    }

    return new Response(JSON.stringify({ 
      valid: true, 
      email: customerEmail,
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
