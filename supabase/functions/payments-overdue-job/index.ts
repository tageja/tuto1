// Supabase Edge Function: Payments Overdue Job
// Runs daily to mark overdue payments and apply late fees

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to process overdue payments
    const { data, error } = await supabase.rpc('process_overdue_payments');

    if (error) {
      console.error('Error processing overdue payments:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;

    console.log('Overdue payments processed:', {
      overdue_count: result?.overdue_count || 0,
      late_fees_created: result?.late_fees_created || 0,
      errors: result?.errors || [],
    });

    return new Response(
      JSON.stringify({
        success: true,
        overdue_count: result?.overdue_count || 0,
        late_fees_created: result?.late_fees_created || 0,
        errors: result?.errors || [],
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

