import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizSubmission {
  email: string;
  answers: Record<string, string>;
  score: number;
  source: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, answers, score, source }: QuizSubmission = await req.json();

    // Validate required fields
    if (!email || !answers) {
      return new Response(
        JSON.stringify({ error: 'Email and answers are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert quiz lead into database
    const { data: quizLead, error: insertError } = await supabase
      .from('quiz_leads')
      .insert({
        email,
        answers,
        score,
        source: source || 'hero',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save quiz response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Kit.com API key and form ID from secrets/settings
    const kitApiKey = Deno.env.get('KIT_API_KEY');
    const kitQuizFormId = Deno.env.get('KIT_QUIZ_FORM_ID');

    let kitSubscriberId: string | null = null;

    // Sync to Kit.com if configured
    if (kitApiKey && kitQuizFormId) {
      try {
        // Build tags based on quiz answers
        const tags: string[] = [];
        
        if (answers.childAge) {
          tags.push(`age:${answers.childAge}`);
        }
        if (answers.biggestConcern) {
          tags.push(`concern:${answers.biggestConcern}`);
        }
        if (answers.currentApproach) {
          tags.push(`approach:${answers.currentApproach}`);
        }
        
        // Determine category tag
        if (score >= 7) {
          tags.push('quiz:ai-ready');
        } else if (score >= 4) {
          tags.push('quiz:growing');
        } else {
          tags.push('quiz:early');
        }

        // Step 1: Create/update subscriber to get subscriber ID
        const subscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${kitApiKey}`,
          },
          body: JSON.stringify({
            email_address: email,
            tags,
          }),
        });

        if (subscriberResponse.ok) {
          const subscriberData = await subscriberResponse.json();
          kitSubscriberId = subscriberData.subscriber?.id?.toString() || null;

          // Step 2: Add subscriber to the quiz-specific form
          if (kitSubscriberId) {
            await fetch(`https://api.kit.com/v4/forms/${kitQuizFormId}/subscribers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${kitApiKey}`,
              },
              body: JSON.stringify({
                email_address: email,
              }),
            });

            // Update quiz_lead with Kit subscriber ID
            await supabase
              .from('quiz_leads')
              .update({ kit_subscriber_id: kitSubscriberId })
              .eq('id', quizLead.id);
          }
        } else {
          console.error('Kit API error:', await subscriberResponse.text());
        }
      } catch (kitError) {
        console.error('Kit.com sync error:', kitError);
        // Don't fail the request if Kit sync fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadId: quizLead.id,
        kitSubscriberId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
