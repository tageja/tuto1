import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import Constants from 'expo-constants';

// Get config from either process.env or app.config.js extra
const getEnvVar = (key: string) => {
  return (Constants.expoConfig?.extra?.[key] as string) || process.env[`EXPO_PUBLIC_${key.toUpperCase()}`] || '';
};

// Using provided config (ok to add new entries per user instruction)
export const firebaseConfig = {
  apiKey: getEnvVar('firebaseApiKey') || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: getEnvVar('firebaseAuthDomain') || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: getEnvVar('firebaseProjectId') || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: getEnvVar('firebaseStorageBucket') || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: getEnvVar('firebaseMessagingSenderId') || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: getEnvVar('firebaseAppId') || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: getEnvVar('firebaseMeasurementId') || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

let app: FirebaseApp | null = null;
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
};

// Lazy initializer to avoid Hermes race conditions
let cachedAuth: ReturnType<typeof getAuth> | null = null;
export const getAuthSafe = () => {
  if (cachedAuth) return cachedAuth;
  try {
    // Try to use React Native persistence if available without creating a hard import
    const authModule: any = require('firebase/auth');
    const persistence = authModule?.getReactNativePersistence
      ? authModule.getReactNativePersistence(AsyncStorage)
      : undefined;
    cachedAuth = initializeAuth(getFirebaseApp(), persistence ? { persistence } : undefined as any);
  } catch (_e) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
};
export const storage = getStorage(getFirebaseApp());
export const functions = getFunctions(getFirebaseApp());

// Analytics optional: provide a safe no-op if analytics module isn't installed
export const analytics = {
  logEvent: async (_name?: string, _params?: Record<string, any>) => undefined,
};


