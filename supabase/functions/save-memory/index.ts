import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's auth header to validate token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the token cryptographically using Supabase auth
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    const { memories, moduleId } = await req.json();

    if (!memories || !Array.isArray(memories) || memories.length === 0) {
      return new Response(
        JSON.stringify({ success: true, saved: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let savedCount = 0;

    for (const memory of memories) {
      if (!memory.key || !memory.value) continue;

      // Upsert memory (update if key exists for this user)
      const { error } = await supabase
        .from('user_memories')
        .upsert(
          {
            user_id: userId,
            memory_key: memory.key,
            memory_value: memory.value,
            source_module_id: moduleId || null,
          },
          { 
            onConflict: 'user_id,memory_key',
          }
        );

      if (error) {
        console.error('Error saving memory:', error);
      } else {
        savedCount++;
        console.log(`Saved memory for user ${userId}: ${memory.key}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, saved: savedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Save memory error:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to save memories' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
