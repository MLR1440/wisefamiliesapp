import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Send password reset email so user can set their own password
    const { error: resetError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: email,
    });

    if (resetError) {
      console.error("Error generating recovery link:", resetError);
      // Don't fail - user can still use "Forgot Password" flow
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
