import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function usePushNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const registerDevice = useCallback(async (token: string) => {
    if (!user) return;

    const platform = Capacitor.getPlatform();
    console.log(`Registering device token for platform: ${platform}`);

    try {
      const { error } = await supabase.functions.invoke('register-device', {
        body: { token, platform }
      });

      if (error) {
        console.error('Failed to register device:', error);
      } else {
        console.log('Device registered successfully');
      }
    } catch (err) {
      console.error('Error registering device:', err);
    }
  }, [user]);

  const handleNotificationReceived = useCallback((notification: PushNotificationSchema) => {
    console.log('Push notification received:', notification);
    
    // Show a toast for foreground notifications
    toast(notification.title || 'Notification', {
      description: notification.body
    });
  }, []);

  const handleNotificationAction = useCallback((action: ActionPerformed) => {
    console.log('Push notification action:', action);
    
    const data = action.notification.data;
    
    // Handle deep linking based on notification data
    if (data?.screen) {
      switch (data.screen) {
        case 'journal':
          navigate('/?tab=journal');
          break;
        case 'fooddex':
          navigate('/?tab=fooddex');
          break;
        case 'safety':
          navigate('/?tab=safety');
          break;
        default:
          navigate('/');
      }
    }
  }, [navigate]);

  const initPushNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();
      console.log('Push notification permission status:', permStatus.receive);

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for successful registration
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        registerDevice(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Listen for incoming notifications (foreground)
      PushNotifications.addListener('pushNotificationReceived', handleNotificationReceived);

      // Listen for notification taps (background/terminated)
      PushNotifications.addListener('pushNotificationActionPerformed', handleNotificationAction);

      console.log('Push notification listeners registered');

    } catch (err) {
      console.error('Error initializing push notifications:', err);
    }
  }, [registerDevice, handleNotificationReceived, handleNotificationAction]);

  useEffect(() => {
    if (user) {
      initPushNotifications();
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [user, initPushNotifications]);
}
