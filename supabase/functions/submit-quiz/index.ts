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

// Helper: create-or-get a tag by name, returns the tag ID
async function getOrCreateTag(tagName: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.kit.com/v4/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': apiKey,
      },
      body: JSON.stringify({ name: tagName }),
    });

    if (!res.ok) {
      console.error(`Failed to create/get tag "${tagName}":`, await res.text());
      return null;
    }

    const data = await res.json();
    return data.tag?.id?.toString() || null;
  } catch (err) {
    console.error(`Error creating/getting tag "${tagName}":`, err);
    return null;
  }
}

// Helper: apply a tag to a subscriber by email
async function applyTagToSubscriber(tagId: string, email: string, apiKey: string): Promise<void> {
  try {
    const res = await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': apiKey,
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (!res.ok) {
      console.error(`Failed to apply tag ${tagId} to ${email}:`, await res.text());
    }
  } catch (err) {
    console.error(`Error applying tag ${tagId}:`, err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, answers, score, source }: QuizSubmission = await req.json();

    if (!email || !answers) {
      return new Response(
        JSON.stringify({ error: 'Email and answers are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const kitApiKey = Deno.env.get('KIT_API_KEY');
    const kitQuizFormId = Deno.env.get('KIT_QUIZ_FORM_ID');

    let kitSubscriberId: string | null = null;

    if (kitApiKey && kitQuizFormId) {
      try {
        // Build tag names based on quiz answers
        const tagNames: string[] = [];

        if (answers.motivationLevel) {
          tagNames.push(`motivation:${answers.motivationLevel}`);
        }
        if (answers.biggestConcern) {
          tagNames.push(`concern:${answers.biggestConcern}`);
        }
        if (answers.currentApproach) {
          tagNames.push(`approach:${answers.currentApproach}`);
        }

        // Score category tag
        if (score >= 7) {
          tagNames.push('quiz:ai-ready');
        } else if (score >= 4) {
          tagNames.push('quiz:growing');
        } else {
          tagNames.push('quiz:early');
        }

        // Step 1: Create/update subscriber (without tags - V4 ignores them)
        const subscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Kit-Api-Key': kitApiKey,
          },
          body: JSON.stringify({ email_address: email }),
        });

        if (subscriberResponse.ok) {
          const subscriberData = await subscriberResponse.json();
          kitSubscriberId = subscriberData.subscriber?.id?.toString() || null;

          // Step 2: Create/get each tag and apply to subscriber
          for (const tagName of tagNames) {
            const tagId = await getOrCreateTag(tagName, kitApiKey);
            if (tagId) {
              await applyTagToSubscriber(tagId, email, kitApiKey);
            }
          }

          // Step 3: Add subscriber to the quiz-specific form
          if (kitSubscriberId) {
            await fetch(`https://api.kit.com/v4/forms/${kitQuizFormId}/subscribers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Kit-Api-Key': kitApiKey,
              },
              body: JSON.stringify({ email_address: email }),
            });

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
