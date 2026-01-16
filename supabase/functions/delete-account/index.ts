import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token to get user info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user token to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data in order (respecting foreign keys)
    // 1. Delete messages (references conversations)
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('user_id', userId);
    
    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      await supabaseAdmin
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);
    }

    // 2. Delete conversations
    await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    // 3. Delete events
    await supabaseAdmin
      .from('events')
      .delete()
      .eq('user_id', userId);

    // 4. Delete user_progress
    await supabaseAdmin
      .from('user_progress')
      .delete()
      .eq('user_id', userId);

    // 5. Delete user_purchases
    await supabaseAdmin
      .from('user_purchases')
      .delete()
      .eq('user_id', userId);

    // 6. Delete user_memories
    await supabaseAdmin
      .from('user_memories')
      .delete()
      .eq('user_id', userId);

    // 7. Delete user_roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // 8. Delete user_profiles
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    // 8. Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
