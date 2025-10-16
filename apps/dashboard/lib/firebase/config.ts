/**
 * Firebase Configuration for Tuto Web Dashboard
 * 
 * This configuration is for the browser-based dashboard.
 * All Airtable operations go through Firebase Functions (never direct from client).
 * 
 * @see functions/src/index.ts for backend API endpoints
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration:', missing.join(', '));
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}. ` +
      'Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.'
    );
  }
};

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let functions: Functions;
let storage: FirebaseStorage;

/**
 * Get or initialize Firebase App
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    validateConfig();
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
};

/**
 * Get Firebase Auth instance
 */
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    
    // Configure auth settings
    auth.useDeviceLanguage();
  }
  return auth;
};

/**
 * Get Firebase Functions instance
 * Functions are deployed to the asia-southeast1 region
 */
export const getFirebaseFunctions = (): Functions => {
  if (!functions) {
    const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';
    functions = getFunctions(getFirebaseApp(), region);
    
    // Connect to emulator in development if running locally
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Connected to Firebase Functions Emulator');
    }
  }
  return functions;
};

/**
 * Get Firebase Storage instance
 */
export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
};

/**
 * Initialize all Firebase services
 * Call this once on app startup
 */
export const initializeFirebase = () => {
  try {
    getFirebaseApp();
    getFirebaseAuth();
    getFirebaseFunctions();
    getFirebaseStorage();
    console.log('✅ Firebase initialized successfully');
    if (typeof window !== 'undefined') {
      console.log('ℹ️ Functions base:', (process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || '(derived)'));
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    return false;
  }
};

// Export for convenience
export { app, auth, functions, storage };

