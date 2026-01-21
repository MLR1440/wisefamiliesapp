import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute

// In-memory rate limit store (per isolate)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  userLimit.count++;
  return { allowed: true };
}

// Input validation
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;
const VALID_ROLES = ['user', 'assistant'];

function validateUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "messages cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum is ${MAX_MESSAGES}` };
  }

  const sanitized: Array<{ role: string; content: string }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (typeof msg !== 'object' || msg === null) {
      return { valid: false, error: `Invalid message at index ${i}` };
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    if (typeof role !== 'string' || !VALID_ROLES.includes(role)) {
      return { valid: false, error: `Invalid role at index ${i}. Must be 'user' or 'assistant'` };
    }

    if (typeof content !== 'string') {
      return { valid: false, error: `Invalid content at index ${i}. Must be a string` };
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    // Sanitize content - trim whitespace
    sanitized.push({ role, content: content.trim() });
  }

  return { valid: true, sanitized };
}

// Document JSON output instructions - appended to module prompt, not replacing it
const DOCUMENT_JSON_INSTRUCTIONS: Record<string, string> = {
  family_agreement: `

=== DOCUMENT GENERATION MODE ===

When the parent is ready to generate their complete Family Technology Agreement document (they explicitly ask you to generate, create, or download it), output ONLY a JSON code block in exactly this format (no text before or after):

\`\`\`json
{
  "type": "family_agreement",
  "sections": {
    "familyValues": ["value1", "value2", "value3"],
    "screenTimeRules": [{"rule": "rule text", "details": "optional details"}],
    "deviceRules": [{"device": "device name", "rules": ["rule1", "rule2"]}],
    "aiUsageGuidelines": ["guideline1", "guideline2"],
    "consequences": ["consequence1", "consequence2"],
    "rewards": ["reward1", "reward2"],
    "exceptions": ["exception1", "exception2"],
    "reviewSchedule": "When to review this agreement"
  }
}
\`\`\`

IMPORTANT: 
- Continue your normal conversation helping them build the agreement section by section following your module instructions
- Only output the JSON when they explicitly ask you to generate/download/create the final document
- When outputting JSON, output ONLY the code block with no additional text before or after
- The user will see a "Download as Word Document" button appear automatically`,

  '30_day_plan': `

=== DOCUMENT GENERATION MODE ===

When the parent is ready to generate their complete 30-Day Action Plan document (they explicitly ask you to generate, create, or download it), output ONLY a JSON code block in exactly this format (no text before or after):

\`\`\`json
{
  "type": "30_day_plan",
  "mainGoal": "The primary goal for this plan",
  "overview": "Brief overview of the approach",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Week theme",
      "goals": ["goal1", "goal2"],
      "dailyActions": [
        {"day": "Monday", "action": "Specific action"},
        {"day": "Tuesday", "action": "Specific action"},
        {"day": "Wednesday", "action": "Specific action"},
        {"day": "Thursday", "action": "Specific action"},
        {"day": "Friday", "action": "Specific action"},
        {"day": "Weekend", "action": "Weekend activities"}
      ],
      "tips": ["tip1", "tip2"]
    }
  ],
  "successMetrics": ["How to measure success"],
  "troubleshooting": [
    {"challenge": "Common challenge", "solution": "How to handle it"}
  ]
}
\`\`\`

Include all 4 weeks. IMPORTANT: Only output JSON when they explicitly ask to generate/download/create the final document - continue normal conversation until then.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract user ID from JWT for rate limiting
  const authHeader = req.headers.get('authorization');
  let userId = 'anonymous';
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || 'anonymous';
    } catch {
      console.warn('Failed to extract user ID from token');
    }
  }

  // Check rate limit
  const rateLimitResult = checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for user: ${userId}`);
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rateLimitResult.retryAfter || 60),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { messages, module_id, document_type } = body;

    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.error("Validation error:", validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate module_id if provided
    if (module_id !== undefined && module_id !== null) {
      if (typeof module_id !== 'string' || !validateUUID(module_id)) {
        return new Response(JSON.stringify({ error: "Invalid module_id format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate document_type if provided
    const validDocumentTypes = ['family_agreement', '30_day_plan'];
    if (document_type && !validDocumentTypes.includes(document_type)) {
      return new Response(JSON.stringify({ error: "Invalid document_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Chat request received:', { module_id, document_type, messageCount: validation.sanitized?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has course access (must have purchased or be admin)
    if (userId === 'anonymous') {
      console.warn('Unauthorized chat attempt: no user authenticated');
      return new Response(
        JSON.stringify({ error: "Authentication required to access chat" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: hasAccess, error: accessError } = await supabase
      .rpc('user_has_course_access', { _user_id: userId });

    if (accessError) {
      console.error('Access check error:', accessError);
      return new Response(
        JSON.stringify({ error: "Failed to verify course access" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasAccess) {
      console.warn(`Access denied for user ${userId}: no course access`);
      return new Response(
        JSON.stringify({ error: "Course access required. Please purchase the course to use the AI assistant." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Access verified for user ${userId}`);

    // Get guardrail appendix from course_settings
    let guardrailAppendix = '';
    const { data: guardrailSetting } = await supabase
      .from('course_settings')
      .select('value')
      .eq('key', 'guardrail_appendix')
      .single();
    
    if (guardrailSetting?.value) {
      guardrailAppendix = guardrailSetting.value;
      console.log('Guardrail appendix loaded');
    }

    // Get user profile for personalization context
    let userContext = '';
    if (userId !== 'anonymous') {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('child_age, child_gender, child_likes, child_dislikes, current_issues')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (userProfile) {
        const contextParts: string[] = [];
        if (userProfile.child_age) contextParts.push(`Child's age range: ${userProfile.child_age}`);
        if (userProfile.child_gender) contextParts.push(`Child's gender: ${userProfile.child_gender}`);
        if (userProfile.child_likes) contextParts.push(`Child's interests/likes: ${userProfile.child_likes}`);
        if (userProfile.child_dislikes) contextParts.push(`Child's dislikes/struggles: ${userProfile.child_dislikes}`);
        if (userProfile.current_issues) contextParts.push(`Current parenting challenges: ${userProfile.current_issues}`);
        
        if (contextParts.length > 0) {
          userContext = `\n\n--- PERSONALIZED CONTEXT FOR THIS PARENT ---\nUse this information to tailor your advice and any documents you generate:\n${contextParts.join('\n')}\n--- END PERSONALIZED CONTEXT ---`;
          console.log('User profile context loaded');
        }
      }

      // Fetch user memories for enhanced personalization
      const { data: userMemories } = await supabase
        .from('user_memories')
        .select('memory_key, memory_value')
        .eq('user_id', userId);
      
      if (userMemories && userMemories.length > 0) {
        const memoryContext = userMemories.map(m => 
          `- ${m.memory_key.replace(/_/g, ' ')}: ${m.memory_value}`
        ).join('\n');
        
        userContext += `\n\n--- REMEMBERED DETAILS FROM PREVIOUS CONVERSATIONS ---\nThese are specific facts the parent shared in earlier conversations. Reference these naturally when relevant:\n${memoryContext}\n--- END REMEMBERED DETAILS ---`;
        console.log(`Loaded ${userMemories.length} user memories`);
      }
    }

    // Determine the system prompt to use
    let systemPrompt = "You are a helpful and empathetic parenting coach for the WiseFamilies platform. Help parents navigate challenges with technology and screen time for their children. Provide practical, actionable advice while being supportive and non-judgmental. Keep responses conversational and warm.";
    
    // First, always try to get the module's system prompt if module_id is provided
    if (module_id) {
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('system_prompt, title, status')
        .eq('id', module_id)
        .single();
      
      if (moduleError) {
        console.error('Module lookup error:', moduleError);
        return new Response(JSON.stringify({ error: "Module not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (moduleData.status !== 'published') {
        return new Response(JSON.stringify({ error: "Module is not available" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (moduleData?.system_prompt) {
        systemPrompt = moduleData.system_prompt;
        console.log('Using module system prompt for:', moduleData.title);
      }
    }

    // If document_type is provided, APPEND JSON output instructions to the module prompt
    if (document_type && DOCUMENT_JSON_INSTRUCTIONS[document_type]) {
      systemPrompt += DOCUMENT_JSON_INSTRUCTIONS[document_type];
      console.log(`Appended document JSON instructions for: ${document_type}`);
    }

    // Combine system prompt with user context and guardrail appendix
    let fullSystemPrompt = systemPrompt;
    if (userContext) {
      fullSystemPrompt += userContext;
    }
    if (guardrailAppendix) {
      fullSystemPrompt += `\n\n---\n\n${guardrailAppendix}`;
    }

    console.log('System prompt length:', fullSystemPrompt.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...validation.sanitized!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Streaming response started');
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
