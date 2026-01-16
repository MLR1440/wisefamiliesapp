import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Extract memories request from user: ${userId}`);

    const { userMessage, assistantResponse } = await req.json();

    if (!userMessage || !assistantResponse) {
      return new Response(
        JSON.stringify({ memories: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ memories: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a memory extraction assistant for a parenting coaching platform. 
Your job is to identify specific, factual information about the user's child or family situation that would be valuable to remember for future conversations.

Extract ONLY concrete, specific facts - NOT general statements or opinions. Focus on:
- Child's exact age (if more specific than an age range, e.g., "7 years and 3 months", "just turned 5")
- Child's name
- Sibling names/ages
- Specific fears or anxieties mentioned
- Specific interests, hobbies, or favorite things
- School/grade information
- Family structure details (single parent, divorced, etc.)
- Specific strategies already tried
- Medical or developmental information shared

DO NOT extract:
- Vague statements like "my child likes games"
- The user's emotions or feelings
- General advice given by the assistant
- Anything already captured in previous memories`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this conversation exchange and extract any specific, memorable facts:\n\nUser said: "${userMessage}"\n\nAssistant replied: "${assistantResponse}"` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_memories",
              description: "Save extracted memories as key-value pairs",
              parameters: {
                type: "object",
                properties: {
                  memories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { 
                          type: "string", 
                          description: "A clear, descriptive key like 'child_exact_age', 'child_name', 'sibling_info', 'specific_fear', 'favorite_activity'" 
                        },
                        value: { 
                          type: "string", 
                          description: "The specific factual value to remember" 
                        }
                      },
                      required: ["key", "value"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["memories"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "save_memories" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ memories: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Extract memories from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        console.log(`Extracted memories for user ${userId}:`, parsed.memories);
        return new Response(
          JSON.stringify({ memories: parsed.memories || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error('Failed to parse tool arguments:', e);
      }
    }

    return new Response(
      JSON.stringify({ memories: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Extract memories error:", error);
    return new Response(
      JSON.stringify({ memories: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
