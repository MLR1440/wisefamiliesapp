import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get sender email from course settings
    const { data: settings } = await supabaseClient
      .from("course_settings")
      .select("key, value")
      .in("key", ["signup_reminder_from_email", "course_name"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s) => { settingsMap[s.key] = s.value; });

    const fromEmail = settingsMap["signup_reminder_from_email"] || "noreply@wisefamilies.com";
    const courseName = settingsMap["course_name"] || "Wise Families";

    // Generate recovery link via Admin API
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://wisefamiliesapp.lovable.app/reset-password",
      },
    });

    if (linkError) {
      console.error("[RECOVERY] generateLink error:", linkError.message);
      // Return success regardless to avoid email enumeration
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recoveryUrl = linkData?.properties?.action_link;
    if (!recoveryUrl) {
      console.error("[RECOVERY] No action_link in response");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: `${courseName} <${fromEmail}>`,
      to: [email],
      subject: `Reset your ${courseName} password`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #003400; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">Hi there,</p>
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">We received a request to reset your password for your <strong style="color: #003400;">${courseName}</strong> account. Click the button below to set a new password:</p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${recoveryUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" fillcolor="#f2ba3f" strokecolor="#f2ba3f">
                      <w:anchorlock/>
                      <center style="color:#003400;font-family:sans-serif;font-size:16px;font-weight:bold;">Reset My Password</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${recoveryUrl}" style="display: inline-block; background-color: #f2ba3f; color: #003400; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; mso-hide: all;">Reset My Password</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.6;">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">This link will expire in 24 hours.</p>
              
              <!-- Fallback link -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 4px 0 0; word-break: break-all; color: #999999; font-size: 12px;">${recoveryUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; background-color: #f9fafb;">
              <p style="margin: 0; color: #999999; font-size: 12px;">&copy; ${new Date().getFullYear()} ${courseName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[RECOVERY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
