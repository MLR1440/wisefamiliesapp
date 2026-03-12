import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { email, firstName, lastName, isAdmin } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new Response(JSON.stringify({ error: "Email, first name, and last name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a secure temporary password
    const tempPassword = crypto.randomUUID() + crypto.randomUUID();

    // Create the user
    const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since admin is creating
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      // Check for duplicate email
      if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
        return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw createError;
    }

    const newUser = newUserData.user;
    console.log("Created user:", newUser.id);

    // Create user_purchases record to grant course access
    const { error: purchaseError } = await adminClient
      .from("user_purchases")
      .insert({
        user_id: newUser.id,
        product_id: "admin_granted",
        stripe_session_id: `manual_${Date.now()}`,
      });

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
      // Don't fail the whole operation, user is created
    }

    // Create user_profiles record
    const { error: profileError } = await adminClient
      .from("user_profiles")
      .insert({
        user_id: newUser.id,
        first_name: firstName,
        onboarding_completed: false,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't fail the whole operation
    }

    // If isAdmin, create admin role
    if (isAdmin) {
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({
          user_id: newUser.id,
          role: "admin",
        });

      if (roleError) {
        console.error("Error creating admin role:", roleError);
        // Don't fail the whole operation
      }
    }

    // Send branded welcome email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      // Fetch branding from course_settings
      const { data: settings } = await adminClient
        .from("course_settings")
        .select("key, value")
        .in("key", ["signup_reminder_from_email", "course_name"]);

      const settingsMap: Record<string, string> = {};
      settings?.forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });

      const fromEmail = settingsMap["signup_reminder_from_email"] || "noreply@wisefamilies.com";
      const courseName = settingsMap["course_name"] || "Wise Families";

      // Generate recovery link
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: "https://wisefamiliesapp.lovable.app/reset-password",
        },
      });

      if (linkError) {
        console.error("Error generating recovery link:", linkError);
      }

      const setupUrl = linkData?.properties?.action_link;

      if (setupUrl) {
        const resend = new Resend(resendApiKey);
        try {
          await resend.emails.send({
            from: `${courseName} <${fromEmail}>`,
            to: [email],
            subject: `Welcome to ${courseName} — Set Your Password`,
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
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Welcome to ${courseName}!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">Great news — you've been given access to <strong style="color: #003400;">${courseName}</strong>!</p>
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">To get started, click the button below to set your password and sign in:</p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${setupUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" fillcolor="#f2ba3f" strokecolor="#f2ba3f">
                      <w:anchorlock/>
                      <center style="color:#003400;font-family:sans-serif;font-size:16px;font-weight:bold;">Set My Password</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${setupUrl}" style="display: inline-block; background-color: #f2ba3f; color: #003400; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; mso-hide: all;">Set My Password</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.6;">Once you've set your password, you can sign in and start the course right away.</p>
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">This link will expire in 24 hours. If it expires, you can use the "Forgot Password" option on the sign-in page.</p>
              
              <!-- Fallback link -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 4px 0 0; word-break: break-all; color: #999999; font-size: 12px;">${setupUrl}</p>
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
          console.log("Welcome email sent to:", email);
        } catch (emailErr) {
          console.error("Error sending welcome email:", emailErr);
          // Don't fail the operation
        }
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping welcome email");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName,
        lastName,
        isAdmin: !!isAdmin,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
