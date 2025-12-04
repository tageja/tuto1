/**
 * Authentication Context for Tuto Dashboard
 * 
 * Provides authentication state and methods throughout the app.
 * Uses Supabase Auth for user authentication.
 * 
 * @example
 * ```tsx
 * const { user, loading, signIn, signOut } = useAuth();
 * ```
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signInWithGoogle as supabaseSignInWithGoogle, signOut as supabaseSignOut, signUpWithEmail } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../lib/types';

interface AuthContextType {
  // State
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void;
  updateUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile from Supabase database
   */
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📥 Fetching user profile from Supabase for:', supabaseUser.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', supabaseUser.id)
        .single();
      
      if (profileError || !profile) {
        // User profile doesn't exist, create it
        console.log('📝 User profile not found, creating new profile in database...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
            role: 'parent',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Failed to create profile:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint,
          });
          
          // If profile creation failed due to duplicate, try fetching it again
          if (createError.code === '23505') {
            console.log('🔄 Profile already exists, fetching...');
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', supabaseUser.id)
              .single();
            
            if (existingProfile) {
              setUser({
                id: existingProfile.id,
                firebaseUid: supabaseUser.id,
                email: existingProfile.email,
                name: existingProfile.name || supabaseUser.email?.split('@')[0] || '',
                role: existingProfile.role || 'parent',
                avatar: existingProfile.avatar || supabaseUser.user_metadata?.avatar_url || undefined,
                schoolIds: [],
                createdAt: existingProfile.created_at,
              });
              console.log('✅ Fetched existing profile successfully');
              return;
            }
          }
          
          // If still failed, throw error
          throw new Error(`Profile creation failed: ${createError.message}`);
        }
        
        if (newProfile) {
          console.log('✅ Created new profile successfully:', { id: newProfile.id, email: newProfile.email });
          setUser({
            id: newProfile.id,
            firebaseUid: supabaseUser.id,
            email: supabaseUser.email || '',
            name: newProfile.name || supabaseUser.email?.split('@')[0] || '',
            role: newProfile.role || 'parent',
            avatar: supabaseUser.user_metadata?.avatar_url || undefined,
            schoolIds: [],
            createdAt: newProfile.created_at || new Date().toISOString(),
          });
        }
      } else {
        // Profile exists
        setUser({
          id: profile.id,
          firebaseUid: supabaseUser.id, // Keep for compatibility
          email: profile.email,
          name: profile.name || supabaseUser.email?.split('@')[0] || '',
          role: profile.role || 'parent',
          avatar: profile.avatar || supabaseUser.user_metadata?.avatar_url || undefined,
          schoolIds: [], // Will be populated from school_teachers or school_students
          createdAt: profile.created_at,
        });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    }
  }, []);

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Signing in with Supabase...');
      const { user, session } = await signInWithEmail(email, password);
      
      if (!user) {
        throw new Error('No user returned from sign in');
      }
      
      await fetchUserProfile(user);
      router.push('/home');
      console.log('✅ Sign in successful');
    } catch (err: any) {
      console.error('❌ Sign in failed:', err);
      
      // Handle specific Supabase auth errors
      let errorMessage = 'Failed to sign in';
      const message = err?.message || '';
      
      if (message.includes('Invalid login credentials')) {
        errorMessage = 'Incorrect email or password';
      } else if (message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in';
      } else if (message.includes('User not found')) {
        errorMessage = 'No account found with this email';
      } else if (message.includes('invalid email')) {
        errorMessage = 'Invalid email address';
      } else if (message) {
        errorMessage = `Authentication error: ${message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   * 
   * The user profile is automatically created by a database trigger.
   * If email confirmation is enabled, the user must confirm their email before signing in.
   */
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Creating account with Supabase...');
      const result = await signUpWithEmail(email, password, {
        full_name: name,
        role: role,
      });
      
      // Handle rate limiting (signup likely already succeeded)
      if (result.rateLimited) {
        console.log('⏳ Rate limited - signup may have already succeeded');
        setError('A confirmation email was already sent. Please check your inbox or wait 40 seconds to try again.');
        return; // Don't throw - this isn't a fatal error
      }
      
      // Handle email confirmation required
      if (result.emailConfirmationRequired) {
        console.log('📧 Email confirmation required');
        // Don't throw an error - this is a success state
        // The UI should show a success message
        return;
      }
      
      // If we have a session, user is fully signed up (email confirmation disabled)
      if (result.user && result.session) {
        console.log('✅ Account created and signed in');
        await fetchUserProfile(result.user);
        router.push('/home');
      }
      
      console.log('✅ Sign up successful');
    } catch (err: any) {
      console.error('❌ Sign up failed:', err);
      
      let errorMessage = 'Failed to create account';
      const message = err?.message || '';
      
      if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (message.includes('weak password') || message.includes('at least 6 characters')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters';
      } else if (message.includes('invalid email')) {
        errorMessage = 'Invalid email address';
      } else if (message.includes('security purposes') || message.includes('after')) {
        errorMessage = 'Please wait a moment before trying again';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setError(null);
      console.log('👋 Signing out from Supabase...');
      await supabaseSignOut();
      setUser(null);
      setSupabaseUser(null);
      console.log('✅ Sign out successful');
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      setError('Failed to sign out');
      throw err;
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      console.log('📧 Sending password reset email via Supabase...');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('✅ Password reset email sent');
    } catch (err: any) {
      console.error('❌ Password reset failed:', err);
      
      let errorMessage = 'Failed to send password reset email';
      const message = err?.message || '';
      
      if (message.includes('User not found')) {
        errorMessage = 'No account found with this email';
      } else if (message.includes('invalid email')) {
        errorMessage = 'Invalid email address';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refresh user profile from database
   */
  const refreshUser = async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser);
    }
  };

  /**
   * Update user avatar locally (for immediate UI update)
   */
  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: avatarUrl });
    }
  };

  /**
   * Update user name locally (for immediate UI update)
   */
  const updateUserName = (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  /**
   * Google Sign-In (OAuth)
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔐 Signing in with Google via Supabase...');
      
      const { data, error } = await supabaseSignInWithGoogle();
      
      if (error) throw error;
      
      // Supabase will handle the redirect and callback
      // User will be signed in when they return
      console.log('✅ Google sign-in initiated');
    } catch (err: any) {
      let msg = 'Google sign-in failed';
      const message = err?.message || '';
      
      if (message.includes('popup') || message.includes('cancelled')) {
        msg = 'Sign-in cancelled';
      } else if (message) {
        msg = `${msg}: ${message}`;
      }
      
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    signInWithGoogle,
    refreshUser,
    updateUserAvatar,
    updateUserName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * 
 * Access authentication state and methods from any component
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

