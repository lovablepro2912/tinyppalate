import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendNotification(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  title: string,
  body: string,
  notificationType: string,
  referenceId?: string
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      title,
      body,
      notification_type: notificationType,
      reference_id: referenceId
    })
  });
  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const today = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Running notification scheduler at ${now.toISOString()}, hour: ${currentHour}`);

    // Get all users with device tokens
    const { data: users } = await supabase
      .from('device_tokens')
      .select('user_id')
      .order('user_id');

    if (!users || users.length === 0) {
      console.log('No users with device tokens');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uniqueUserIds = [...new Set(users.map(u => u.user_id))];
    console.log(`Processing ${uniqueUserIds.length} users`);

    let notificationsSent = 0;

    for (const userId of uniqueUserIds) {
      // Get user preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('baby_name')
        .eq('id', userId)
        .single();

      const babyName = profile?.baby_name || 'your baby';

      // Check what notifications were already sent today
      const { data: sentToday } = await supabase
        .from('notification_log')
        .select('notification_type, reference_id')
        .eq('user_id', userId)
        .gte('sent_at', `${today}T00:00:00Z`);

      const sentTypes = new Set(sentToday?.map(n => `${n.notification_type}:${n.reference_id || ''}`) || []);

      // 1. Allergen Maintenance - SAFE allergens not eaten in 7+ days
      if (prefs?.allergen_maintenance !== false) {
        const { data: staleAllergens } = await supabase
          .from('user_food_states')
          .select('id, food_id, last_eaten, ref_foods!inner(name, emoji, is_allergen)')
          .eq('user_id', userId)
          .eq('status', 'SAFE')
          .eq('ref_foods.is_allergen', true)
          .lt('last_eaten', sevenDaysAgo);

        if (staleAllergens && staleAllergens.length > 0) {
          for (const allergen of staleAllergens) {
            const key = `allergen_maintenance:${allergen.food_id}`;
            if (!sentTypes.has(key)) {
              const food = allergen.ref_foods as unknown as { name: string; emoji: string };
              await sendNotification(
                supabaseUrl,
                supabaseServiceKey,
                userId,
                `Time for ${food.emoji} ${food.name}!`,
                `It's been over a week since ${babyName} had ${food.name}. Regular exposure helps maintain tolerance.`,
                'allergen_maintenance',
                String(allergen.food_id)
              );
              notificationsSent++;
              break; // Only one allergen maintenance per run
            }
          }
        }
      }

      // 2. Allergen Progress - TRYING allergens needing more exposures
      if (prefs?.allergen_progress !== false) {
        const { data: tryingAllergens } = await supabase
          .from('user_food_states')
          .select('id, food_id, exposure_count, ref_foods!inner(name, emoji, is_allergen)')
          .eq('user_id', userId)
          .eq('status', 'TRYING')
          .eq('ref_foods.is_allergen', true)
          .lt('exposure_count', 3);

        if (tryingAllergens && tryingAllergens.length > 0) {
          for (const allergen of tryingAllergens) {
            const key = `allergen_progress:${allergen.food_id}`;
            if (!sentTypes.has(key)) {
              const food = allergen.ref_foods as unknown as { name: string; emoji: string };
              const remaining = 3 - allergen.exposure_count;
              await sendNotification(
                supabaseUrl,
                supabaseServiceKey,
                userId,
                `Keep going with ${food.emoji} ${food.name}!`,
                `${remaining} more exposure${remaining > 1 ? 's' : ''} to mark ${food.name} as safe for ${babyName}.`,
                'allergen_progress',
                String(allergen.food_id)
              );
              notificationsSent++;
              break; // Only one progress notification per run
            }
          }
        }
      }

      // 3. Allergen Reminder - daily reminder to introduce allergens
      if (prefs?.allergen_reminder !== false) {
        const reminderTime = prefs?.allergen_reminder_time || '10:00:00';
        const reminderHour = parseInt(reminderTime.split(':')[0], 10);

        if (currentHour === reminderHour && !sentTypes.has('allergen_reminder:')) {
          // Check if user has allergens in TO_TRY or TRYING status
          const { data: pendingAllergens } = await supabase
            .from('user_food_states')
            .select('id, ref_foods!inner(is_allergen)')
            .eq('user_id', userId)
            .in('status', ['TO_TRY', 'TRYING'])
            .eq('ref_foods.is_allergen', true)
            .limit(1);

          // Also check if there are allergens not yet started
          const { data: allAllergens } = await supabase
            .from('ref_foods')
            .select('id')
            .eq('is_allergen', true);

          const { data: userStates } = await supabase
            .from('user_food_states')
            .select('food_id')
            .eq('user_id', userId);

          const startedFoodIds = new Set(userStates?.map(s => s.food_id) || []);
          const unstartedAllergens = allAllergens?.filter(a => !startedFoodIds.has(a.id)) || [];

          if ((pendingAllergens && pendingAllergens.length > 0) || unstartedAllergens.length > 0) {
            await sendNotification(
              supabaseUrl,
              supabaseServiceKey,
              userId,
              `Allergen time for ${babyName}! 🥜`,
              `Remember to introduce or continue an allergen today. Early introduction helps build tolerance.`,
              'allergen_reminder'
            );
            notificationsSent++;
          }
        }
      }

      // 4. Daily Reminder - at user's preferred time
      if (prefs?.daily_reminder !== false) {
        const reminderTime = prefs?.daily_reminder_time || '18:00:00';
        const reminderHour = parseInt(reminderTime.split(':')[0], 10);

        if (currentHour === reminderHour && !sentTypes.has('daily_reminder:')) {
          // Check if user logged today
          const { data: todayLogs } = await supabase
            .from('food_logs')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00Z`)
            .limit(1);

          if (!todayLogs || todayLogs.length === 0) {
            await sendNotification(
              supabaseUrl,
              supabaseServiceKey,
              userId,
              `Log ${babyName}'s meals!`,
              `Don't forget to log what ${babyName} tried today. Every food counts!`,
              'daily_reminder'
            );
            notificationsSent++;
          }
        }
      }

      // 5. Reaction Follow-up - day after a reaction
      if (prefs?.reaction_followup !== false) {
        const { data: yesterdayReactions } = await supabase
          .from('food_logs')
          .select('id, user_food_state_id, reaction_severity, user_food_states!inner(food_id, ref_foods!inner(name, emoji))')
          .eq('user_id', userId)
          .gte('created_at', `${yesterday}T00:00:00Z`)
          .lt('created_at', `${today}T00:00:00Z`)
          .gt('reaction_severity', 0);

        if (yesterdayReactions && yesterdayReactions.length > 0) {
          for (const reaction of yesterdayReactions) {
            const key = `reaction_followup:${reaction.id}`;
            if (!sentTypes.has(key)) {
              const foodState = reaction.user_food_states as unknown as { ref_foods: { name: string; emoji: string } };
              await sendNotification(
                supabaseUrl,
                supabaseServiceKey,
                userId,
                `How is ${babyName} feeling?`,
                `Following up on yesterday's reaction to ${foodState.ref_foods.emoji} ${foodState.ref_foods.name}. How is ${babyName} doing today?`,
                'reaction_followup',
                reaction.id
              );
              notificationsSent++;
              break; // Only one follow-up per run
            }
          }
        }
      }
    }

    console.log(`Scheduler complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notificationsSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notification-scheduler:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
