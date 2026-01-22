import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS for public access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: settings, error } = await supabaseClient
      .from('course_settings')
      .select('key, value')
      .in('key', ['payment_link_core', 'payment_link_core_installments', 'payment_link_premium']);

    if (error) {
      console.error('Error fetching payment links:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment links' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const links = {
      coreLink: settings?.find(s => s.key === 'payment_link_core')?.value || null,
      coreInstallmentsLink: settings?.find(s => s.key === 'payment_link_core_installments')?.value || null,
      premiumLink: settings?.find(s => s.key === 'payment_link_premium')?.value || null,
    };

    return new Response(JSON.stringify(links), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in get-payment-links:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
