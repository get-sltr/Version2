import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sltrdigital.primal',
  appName: 'Primal Men',
  webDir: 'out',
  server: {
    url: 'https://primalgay.com',
    hostname: 'primalgay.com',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['primalgay.com', '*.primalgay.com', '*.supabase.co', '*.google.com', 'accounts.google.com', '*.daily.co', '*.livekit.cloud'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#050508',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#050508',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#050508',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
