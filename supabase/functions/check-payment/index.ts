import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
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

    // First check if we already have a purchase record in our database
    const { data: existingPurchase } = await supabaseClient
      .from('user_purchases')
      .select('id, purchased_at, stripe_session_id, refunded, refund_checked_at')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existingPurchase) {
      logStep("Found existing purchase record", { purchaseId: existingPurchase.id });
      
      // Check if the purchase was refunded
      if (existingPurchase.refunded) {
        logStep("Purchase was previously refunded");
        return new Response(JSON.stringify({ 
          hasPurchased: false, 
          refunded: true 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check with Stripe for refund status (max once per hour to reduce API calls)
      const lastCheck = existingPurchase.refund_checked_at 
        ? new Date(existingPurchase.refund_checked_at).getTime() 
        : 0;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastCheck < oneHourAgo && existingPurchase.stripe_session_id) {
        logStep("Checking Stripe for refund status");
        
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        
        try {
          // Get the session to find the payment intent
          const session = await stripe.checkout.sessions.retrieve(existingPurchase.stripe_session_id);
          
          if (session.payment_intent) {
            const paymentIntentId = typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent.id;
            
            // Check for refunds on this payment intent
            const refunds = await stripe.refunds.list({ 
              payment_intent: paymentIntentId,
              limit: 1 
            });
            
            const isRefunded = refunds.data.length > 0 && 
              refunds.data.some((r: { status: string }) => r.status === 'succeeded');
            
            // Update the purchase record with refund status
            await supabaseClient
              .from('user_purchases')
              .update({
                refunded: isRefunded,
                refund_checked_at: new Date().toISOString()
              })
              .eq('id', existingPurchase.id);
            
            if (isRefunded) {
              logStep("Purchase has been refunded in Stripe");
              return new Response(JSON.stringify({ 
                hasPurchased: false, 
                refunded: true 
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
            
            logStep("Refund check complete - no refund found");
          }
        } catch (stripeError) {
          // Log but don't fail - allow access if we can't check refund status
          logStep("Warning: Could not check refund status", { 
            error: stripeError instanceof Error ? stripeError.message : String(stripeError) 
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        hasPurchased: true, 
        purchaseDate: existingPurchase.purchased_at 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // No local record, check Stripe
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
    let successfulSessionId = null;

    for (const session of sessions.data) {
      if (session.payment_status === "paid" && session.mode === "payment") {
        // Verify this was for our course product
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          if (item.price?.product === COURSE_PRODUCT_ID) {
            hasPurchased = true;
            purchaseDate = new Date(session.created * 1000).toISOString();
            successfulSessionId = session.id;
            logStep("Found successful purchase", { sessionId: session.id, purchaseDate });
            break;
          }
        }
        if (hasPurchased) break;
      }
    }

    // If we found a purchase in Stripe, record it in our database for RLS enforcement
    if (hasPurchased && successfulSessionId) {
      const { error: insertError } = await supabaseClient
        .from('user_purchases')
        .insert({
          user_id: user.id,
          stripe_session_id: successfulSessionId,
          product_id: COURSE_PRODUCT_ID,
          purchased_at: purchaseDate
        });

      if (insertError) {
        // Log but don't fail - the purchase is still valid
        logStep("Warning: Could not record purchase", { error: insertError.message });
      } else {
        logStep("Purchase recorded in database");
        
        // ========================================
        // Kit.com Integration for Recovered Purchases
        // ========================================
        const kitApiKey = Deno.env.get("KIT_API_KEY");
        const defaultKitFormId = Deno.env.get("KIT_FORM_ID");

        if (kitApiKey) {
          try {
            // Get the price_id from the Stripe session for form routing
            const sessionDetails = await stripe.checkout.sessions.retrieve(successfulSessionId, {
              expand: ['line_items.data.price'],
            });
            
            let priceId: string | null = null;
            if (sessionDetails.line_items?.data) {
              for (const item of sessionDetails.line_items.data) {
                if (item.price) {
                  priceId = item.price.id;
                  break;
                }
              }
            }
            
            logStep("Retrieved price_id for Kit.com routing", { priceId });

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

            // Determine which Kit.com form to use based on price_id
            let kitFormId: string | undefined;

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

              if (createResponse.ok) {
                const subscriberData = await createResponse.json();
                const subscriberId = subscriberData.subscriber?.id;
                
                logStep("Kit.com subscriber created/updated", { subscriberId, email: user.email });

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
                    logStep("Subscriber added to Kit.com form (recovered purchase)", { 
                      email: user.email, 
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
            // Log but don't fail the purchase recovery
            logStep("Kit.com integration error (non-blocking)", { error: String(kitError) });
          }
        } else {
          logStep("Kit.com integration skipped - missing API key");
        }
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
