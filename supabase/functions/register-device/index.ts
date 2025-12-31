import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token, platform } = await req.json();

    if (!token || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing token or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Registering device for user ${user.id}, platform: ${platform}`);

    // Upsert device token
    const { error: tokenError } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: user.id,
          token,
          platform,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,token' }
      );

    if (tokenError) {
      console.error('Error saving device token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to save device token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if notification preferences exist, create defaults if not
    const { data: existingPrefs } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingPrefs) {
      const { error: prefsError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          allergen_maintenance: true,
          allergen_progress: true,
          daily_reminder: true,
          daily_reminder_time: '18:00:00',
          milestones: true,
          reaction_followup: true
        });

      if (prefsError) {
        console.log('Note: Could not create default preferences:', prefsError.message);
      }
    }

    console.log('Device registered successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in register-device:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
