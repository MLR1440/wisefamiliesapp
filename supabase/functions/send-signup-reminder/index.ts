import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SIGNUP-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Require either a valid CRON_SECRET (for scheduled invocations) or an authenticated admin user
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");
    const hasValidCronSecret = cronSecret && providedSecret && providedSecret === cronSecret;

    if (!hasValidCronSecret) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const { data: userData, error: userErr } = await authClient.auth.getUser(token);
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      const adminCheckClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } },
      );
      const { data: isAdmin } = await adminCheckClient.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logStep("RESEND_API_KEY not configured - skipping");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Resend not configured",
        sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch email settings from course_settings
    const { data: settings } = await supabaseClient
      .from('course_settings')
      .select('key, value')
      .in('key', ['signup_reminder_enabled', 'signup_reminder_hours', 'signup_reminder_from_email', 'course_name']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach(s => { settingsMap[s.key] = s.value; });

    // Check if reminders are enabled (default: enabled)
    if (settingsMap['signup_reminder_enabled'] === 'false') {
      logStep("Signup reminders disabled in settings");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Reminders disabled",
        sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the delay hours (default: 24 hours)
    const delayHours = parseInt(settingsMap['signup_reminder_hours'] || '24', 10);
    const cutoffTime = new Date(Date.now() - delayHours * 60 * 60 * 1000);
    
    logStep("Looking for unclaimed purchases", { 
      delayHours, 
      cutoffTime: cutoffTime.toISOString() 
    });

    // Find unclaimed purchases older than the delay period
    const { data: pendingPurchases, error: fetchError } = await supabaseClient
      .from('pending_purchases')
      .select('id, stripe_customer_email, created_at, amount_total, currency, claim_token')
      .is('claimed_by', null)
      .is('claimed_at', null)
      .is('reminder_sent_at', null)
      .not('stripe_customer_email', 'is', null)
      .not('claim_token', 'is', null)
      .lt('created_at', cutoffTime.toISOString())
      .limit(50); // Process in batches

    if (fetchError) {
      logStep("Error fetching pending purchases", { error: fetchError.message });
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!pendingPurchases || pendingPurchases.length === 0) {
      logStep("No unclaimed purchases found needing reminders");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No reminders to send",
        sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found unclaimed purchases", { count: pendingPurchases.length });

    const appUrl = 'https://wisefamiliesapp.lovable.app';
    
    const fromEmail = settingsMap['signup_reminder_from_email'] || 'noreply@wisefamilies.com';
    const courseName = settingsMap['course_name'] || 'Wise Families';

    let sentCount = 0;
    const errors: string[] = [];

    for (const purchase of pendingPurchases) {
      try {
        // Extend token expiry to 72 hours from now
        const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
        const { error: expiryError } = await supabaseClient
          .from('pending_purchases')
          .update({ expires_at: newExpiry })
          .eq('id', purchase.id);

        if (expiryError) {
          logStep("Warning: Could not extend token expiry", { 
            purchaseId: purchase.id, 
            error: expiryError.message 
          });
        }

        const signupUrl = `${appUrl}/signup?token=${purchase.claim_token}`;
        logStep("Sending reminder email", { email: purchase.stripe_customer_email });

        const emailResponse = await resend.emails.send({
          from: `${courseName} <${fromEmail}>`,
          to: [purchase.stripe_customer_email!],
          subject: `Complete your ${courseName} account setup`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #003400; margin: 0;">Almost There!</h1>
  </div>
  
  <p>Hi there,</p>
  
  <p>We noticed you purchased <strong>${courseName}</strong> but haven't created your account yet.</p>
  
  <p>Your course is waiting for you! Click the button below to set up your account and get started:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${signupUrl}" style="display: inline-block; background-color: #f2ba3f; color: #003400; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Create My Account</a>
  </div>
  
  <p>When you sign up, <strong>use the same email address</strong> you used for your purchase (${purchase.stripe_customer_email}) and we'll automatically link your account to your purchase.</p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    If you have any questions or need help, just reply to this email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    You received this email because you purchased ${courseName}.<br>
    If you didn't make this purchase, please contact us immediately.
  </p>
</body>
</html>
          `,
        });

        logStep("Email sent successfully", { 
          email: purchase.stripe_customer_email, 
          response: emailResponse 
        });

        // Mark as reminded
        const { error: updateError } = await supabaseClient
          .from('pending_purchases')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', purchase.id);

        if (updateError) {
          logStep("Warning: Could not update reminder_sent_at", { 
            purchaseId: purchase.id, 
            error: updateError.message 
          });
        }

        sentCount++;
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Error sending email", { 
          email: purchase.stripe_customer_email, 
          error: errorMsg 
        });
        errors.push(`${purchase.stripe_customer_email}: ${errorMsg}`);
      }
    }

    logStep("Reminder batch complete", { sent: sentCount, errors: errors.length });

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    }), {
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
