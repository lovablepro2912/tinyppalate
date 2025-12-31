import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d28991905c454dcf80e3079d6c336c50',
  appName: 'TinyPalate',
  webDir: 'dist',
  // Comment out for local iOS/Android testing - use local dist folder instead of remote URL
  // server: {
  //   url: 'https://d2899190-5c45-4dcf-80e3-079d6c336c50.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#f8fafc',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc',
  },
  android: {
    backgroundColor: '#f8fafc',
  }
};

export default config;
