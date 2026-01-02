import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  notification_type: string;
  reference_id?: string;
}

// Generate OAuth2 access token from service account
async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  
  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // Create JWT claims
  const claims = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  };

  // Base64url encode
  const base64urlEncode = (obj: unknown) => {
    const str = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const headerEncoded = base64urlEncode(header);
  const claimsEncoded = base64urlEncode(claims);
  const signatureInput = `${headerEncoded}.${claimsEncoded}`;

  // Import the private key
  const pemContent = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the JWT
  const signatureInputBytes = new TextEncoder().encode(signatureInput);
  const signatureBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signatureInputBytes
  );

  let signatureBinary = '';
  for (const byte of new Uint8Array(signatureBytes)) {
    signatureBinary += String.fromCharCode(byte);
  }
  const signature = btoa(signatureBinary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Send notification via FCM v1 API
async function sendFCMNotification(
  accessToken: string,
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  platform?: string
): Promise<boolean> {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID not configured');
  }

  const message: Record<string, unknown> = {
    token: deviceToken,
    notification: { title, body },
    data: data || {}
  };

  // Add platform-specific options
  if (platform === 'ios') {
    message.apns = {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      }
    };
  } else if (platform === 'android') {
    message.android = {
      notification: {
        sound: 'default',
        channelId: 'default'
      }
    };
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('FCM send failed:', errorText);
    return false;
  }

  console.log('FCM notification sent successfully');
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate internal API key for function-to-function auth
    const internalApiKey = Deno.env.get('INTERNAL_API_KEY');
    const providedKey = req.headers.get('x-internal-api-key');
    
    if (!internalApiKey || providedKey !== internalApiKey) {
      console.error('Unauthorized: Invalid or missing internal API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: NotificationPayload = await req.json();
    const { user_id, title, body, data, notification_type, reference_id } = payload;

    if (!user_id || !title || !body || !notification_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending ${notification_type} notification to user ${user_id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check user's notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Map notification type to preference field
    const prefMap: Record<string, string> = {
      'allergen_maintenance': 'allergen_maintenance',
      'allergen_progress': 'allergen_progress',
      'daily_reminder': 'daily_reminder',
      'milestone': 'milestones',
      'reaction_followup': 'reaction_followup'
    };

    const prefField = prefMap[notification_type];
    if (prefs && prefField && !prefs[prefField]) {
      console.log(`User has disabled ${notification_type} notifications`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'disabled_by_user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's device tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', user_id);

    if (tokensError || !tokens || tokens.length === 0) {
      console.log('No device tokens found for user');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'no_tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get FCM access token
    const accessToken = await getAccessToken();

    // Send to all devices
    let successCount = 0;
    for (const { token, platform } of tokens) {
      try {
        const success = await sendFCMNotification(accessToken, token, title, body, data, platform);
        if (success) successCount++;
      } catch (err) {
        console.error(`Failed to send to token ${token}:`, err);
      }
    }

    // Log the notification
    if (successCount > 0) {
      await supabase.from('notification_log').insert({
        user_id,
        notification_type,
        reference_id
      });
    }

    console.log(`Sent to ${successCount}/${tokens.length} devices`);

    return new Response(
      JSON.stringify({ success: true, sent_count: successCount, total_tokens: tokens.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-notification:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
