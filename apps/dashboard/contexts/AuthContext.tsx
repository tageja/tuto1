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
   * Helper to add timeout to promises
   */
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutError: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
      )
    ]);
  };

  /**
   * Fetch user profile from Supabase database
   */
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📥 Fetching user profile from Supabase for:', supabaseUser.email);
      
      // Add 10 second timeout to prevent infinite hanging
      const { data: profile, error: profileError } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', supabaseUser.id)
          .single(),
        10000,
        'Profile fetch timed out after 10 seconds'
      );
      
      // Log any error for debugging
      if (profileError) {
        console.error('❌ Profile fetch error:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
      }
      
      if (profileError || !profile) {
        // Check if this is an auth error (expired session)
        // Be more aggressive in detecting auth issues
        if (profileError && (
          profileError.message?.includes('JWT') || 
          profileError.message?.includes('token') || 
          profileError.message?.includes('expired') ||
          profileError.message?.includes('auth') ||
          profileError.message?.includes('unauthorized') ||
          profileError.code === 'PGRST301' ||  // JWT expired
          profileError.code === 'PGRST302' ||  // JWT invalid
          profileError.code === '401'
        )) {
          console.error('❌ Session expired or invalid token detected:', profileError.message);
          // Sign out the user to clear stale session
          console.log('🔄 Signing out user to clear stale session...');
          await supabase.auth.signOut();
          setSupabaseUser(null);
          setUser(null);
          setError('Your session has expired. Please sign in again.');
          return;
        }
        
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
          
          // Check for auth errors
          if (createError.message?.includes('JWT') || createError.message?.includes('token') || createError.message?.includes('expired')) {
            console.error('❌ Session expired during profile creation');
            await supabase.auth.signOut();
            setSupabaseUser(null);
            setUser(null);
            setError('Your session has expired. Please sign in again.');
            return;
          }
          
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
        console.log('✅ User profile loaded successfully:', {
          id: profile.id,
          email: profile.email,
          role: profile.role,
        });
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
    } catch (err: any) {
      console.error('❌ Failed to fetch user profile (catch block):', err);
      console.error('❌ Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
        stack: err?.stack?.substring(0, 200),
      });
      
      // Handle timeout errors
      if (err?.message?.includes('timed out')) {
        console.error('❌ Profile fetch timed out, trying to continue with minimal user data');
        // Set minimal user data so the app doesn't hang
        setUser({
          id: supabaseUser.id,
          firebaseUid: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
          role: 'parent',
          avatar: supabaseUser.user_metadata?.avatar_url || undefined,
          schoolIds: [],
          createdAt: new Date().toISOString(),
        });
        setError('Profile load was slow. Some features may be limited.');
        return; // Don't sign out, just continue with minimal data
      }
      
      // Check if this is an auth error
      if (err?.message?.includes('JWT') || err?.message?.includes('token') || err?.message?.includes('expired') || err?.message?.includes('auth') || err?.message?.includes('unauthorized')) {
        console.error('❌ Session error detected in catch block, signing out');
        await supabase.auth.signOut();
        setSupabaseUser(null);
        setUser(null);
        setError('Your session has expired. Please sign in again.');
      } else {
        console.error('❌ Non-auth error, setting generic error');
        setError('Failed to load user profile');
      }
    }
  }, []);

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    let mounted = true;
    
    // Get initial session and validate it
    const initSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError.message);
          // Clear invalid session
          await supabase.auth.signOut();
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Valid session found, fetching user profile...');
          setSupabaseUser(session.user);
          
          // Validate session is not expired by trying to fetch profile
          await fetchUserProfile(session.user);
        } else {
          console.log('ℹ️ No active session found');
          setSupabaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Error initializing session:', err);
        // On error, clear everything
        await supabase.auth.signOut();
        setSupabaseUser(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', event, session ? `(user: ${session.user?.email})` : '(no session)');
      
      setLoading(true);
      
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out, clearing state');
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully');
      }
      
      if (event === 'USER_UPDATED') {
        console.log('👤 User updated');
      }
      
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('📥 Session user found, fetching profile...');
        await fetchUserProfile(session.user);
        console.log('✅ Profile fetch completed, auth loading finished');
      } else {
        console.log('❌ No session user found');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
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
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error refreshing session:', error);
        // Clear invalid session
        await supabase.auth.signOut();
        setSupabaseUser(null);
        setUser(null);
        setError('Your session has expired. Please sign in again.');
        return;
      }
      
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchUserProfile(session.user);
        console.log('✅ User data refreshed successfully');
      } else {
        console.log('ℹ️ No active session to refresh');
        setSupabaseUser(null);
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Failed to refresh user:', err);
      // On error, clear session
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
      setError('Failed to refresh session. Please sign in again.');
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

