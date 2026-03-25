require('dotenv').config();

module.exports = {
  expo: {
    name: 'Tuto',
    slug: 'tuto',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.tutoapp.mobile',
      buildNumber: '18',
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'We need access to your photo library to let you attach images to posts.',
        NSCameraUsageDescription: 'We need access to your camera to let you capture photos and videos for posts.',
        NSLocationWhenInUseUsageDescription: 'We use your location to show nearby teachers and map distance.',
        PHPhotoLibraryPreventAutomaticLimitedAccessAlert: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      softwareKeyboardLayoutMode: 'resize',
      package: 'com.tutoapp.mobile',
      permissions: [
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.CAMERA',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ],
    },
    scheme: 'tuto',
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-image-picker',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#0B5FFF',
          sounds: [],
        },
      ],
    ],
    extra: {
      // EAS Project ID
      eas: {
        projectId: '733e177d-32fa-4332-8f08-c29d11955816',
      },
      
      // Firebase Config
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      
      // Google OAuth
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      
      // Airtable
      airtableApiKey: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY,
      airtableBaseId: process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID,

        // Add Supabase
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};











