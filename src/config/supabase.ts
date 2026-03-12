/**
 * Supabase Configuration for Mobile App
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase configuration from environment
const getSupabaseConfig = () => {
  const supabaseUrl = 
    (Constants.expoConfig?.extra?.supabaseUrl as string) ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    '';
    
  const supabaseAnonKey = 
    (Constants.expoConfig?.extra?.supabaseAnonKey as string) ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️  Supabase configuration missing');
    console.error('Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper to get current session
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign in with Apple (native iOS only)
 * Uses expo-apple-authentication + signInWithIdToken.
 * Caller must pass the identityToken from AppleAuthentication.signInAsync().
 */
export async function signInWithApple(identityToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  console.log('🔧 Supabase signInWithOAuth called with:', {
    provider: 'google',
    redirectTo: 'tuto://auth/callback',
  });
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'tuto://auth/callback',
    },
  });
  
  console.log('🔧 Supabase OAuth raw response:', {
    data,
    error,
    hasProvider: !!data?.provider,
    hasUrl: !!data?.url,
  });
  
  if (error) {
    console.error('🔧 Supabase OAuth error:', error);
    throw error;
  }
  
  // Return the full response object for destructuring
  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'tuto://auth/reset-password',
  });
  
  if (error) throw error;
}

// Export database helpers
export const db = {
  from: (table: string) => supabase.from(table),
  rpc: (fn: string, params?: any) => supabase.rpc(fn, params),
  storage: supabase.storage,
};

export default supabase;










