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

    // Use service role to list all users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    // Get user roles
    const { data: allRoles } = await adminClient
      .from("user_roles")
      .select("user_id, role");

    const rolesMap: Record<string, string[]> = {};
    allRoles?.forEach((r) => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });

    // Get message counts per user from conversations -> messages
    const { data: conversations } = await adminClient
      .from("conversations")
      .select("user_id");

    const { data: allMessages } = await adminClient
      .from("messages")
      .select("conversation_id, role");

    // Build conversation to user mapping
    const conversationUserMap: Record<string, string> = {};
    conversations?.forEach((c: { user_id: string; id?: string }) => {
      // We need to get conversation IDs - let's query differently
    });

    // Get conversations with their IDs
    const { data: convosWithIds } = await adminClient
      .from("conversations")
      .select("id, user_id");

    convosWithIds?.forEach((c) => {
      conversationUserMap[c.id] = c.user_id;
    });

    // Count user messages (role = 'user') per user
    const messageCountMap: Record<string, number> = {};
    allMessages?.forEach((m) => {
      if (m.role === "user") {
        const userId = conversationUserMap[m.conversation_id];
        if (userId) {
          messageCountMap[userId] = (messageCountMap[userId] || 0) + 1;
        }
      }
    });

    // Format users for response
    const users = usersData.users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.user_metadata?.first_name || "",
      lastName: u.user_metadata?.last_name || "",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      roles: rolesMap[u.id] || [],
      messageCount: messageCountMap[u.id] || 0,
    }));

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing users:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
