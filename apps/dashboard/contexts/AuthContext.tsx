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

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signInWithGoogle as supabaseSignInWithGoogle, signOut as supabaseSignOut, signUpWithEmail } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../lib/types';

/**
 * Clears all client-side auth + per-user caches.
 * Called on signOut and on detected session expiry.
 * Safe to call from anywhere (no-ops on the server).
 */
function clearLocalAuthState() {
  if (typeof window === 'undefined') return;
  try {
    // Clear sessionStorage caches that surface stale per-user state across sign-ins
    sessionStorage.removeItem('parent_has_access');
    // Clear any school context cache the SchoolContext may have written
    sessionStorage.removeItem('selected_school_id');
    sessionStorage.removeItem('available_schools');
  } catch {
    /* sessionStorage may be unavailable in private mode — ignore */
  }
  try {
    // Remove all Supabase auth tokens from localStorage (default + our custom storageKey)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('tuto-dashboard-auth') ||
        key.startsWith('sb-') ||
        key.startsWith('supabase.auth')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

interface AuthContextType {
  // State
  user: User | null;
  supabaseUser: SupabaseUser | null;
  /** Alias for supabaseUser (used by login page / legacy) */
  firebaseUser: SupabaseUser | null;
  /** Current session access token — use for API Authorization headers */
  accessToken: string | null;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set while a manual signIn/signUp is in progress so the auth listener
  // does not double-fetch the profile in parallel (was the #1 cause of stuck "Please wait..." screens).
  const signingInRef = useRef(false);
  // Set while a signOut is in progress so the auth listener does not race.
  const signingOutRef = useRef(false);
  // Cache the last profile-fetched user id so TOKEN_REFRESHED events don't trigger redundant DB calls.
  const lastFetchedUserIdRef = useRef<string | null>(null);

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
   * Uses 20s timeout and retries once on timeout (helps with cold start / slow Supabase)
   */
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📥 Fetching user profile from Supabase for:', supabaseUser.email);
      
      const profileQuery = () =>
        supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', supabaseUser.id)
          .single();

      let result: Awaited<ReturnType<ReturnType<typeof supabase.from>['single']>>;
      try {
        // Single, generous timeout (15s). DO NOT sign out on timeout — that races
        // with in-flight queries on the same page (which then return 406 because
        // the JWT was just nuked) and breaks routes like /tutoadmin that only
        // depend on session.user.email, not the profile row.
        result = await withTimeout(
          profileQuery(),
          15000,
          'Profile fetch timed out'
        );
      } catch (timeoutErr: any) {
        if (timeoutErr?.message?.includes('timed out')) {
          console.warn('⏱️ Profile fetch timed out (15s). Keeping session intact; profile will load on next navigation.');
          // Keep supabaseUser + accessToken so route guards that check session work.
          // Just leave `user` as null — components that strictly need the profile can retry.
          setError('Profile took too long to load. Refresh the page if needed.');
          return;
        }
        throw timeoutErr;
      }

      const { data: profile, error: profileError } = result;
      
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
        // Only sign the user out for *unambiguous* auth errors (specific PostgREST
        // codes). Keyword matching on .message is unreliable — e.g. a 406 error
        // body can contain the word "auth" and falsely trigger sign-out, which
        // then nukes in-flight queries on the same page (causing more 406s) and
        // creates a redirect loop on protected routes.
        if (profileError && (
          profileError.code === 'PGRST301' ||  // JWT expired
          profileError.code === 'PGRST302' ||  // JWT invalid
          profileError.code === '401'
        )) {
          console.error('❌ Session expired or invalid token detected:', profileError.message);
          console.log('🔄 Clearing stale session...');
          clearLocalAuthState();
          supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
          setSupabaseUser(null);
          setUser(null);
          setAccessToken(null);
          lastFetchedUserIdRef.current = null;
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
            clearLocalAuthState();
            supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
            setSupabaseUser(null);
            setUser(null);
            setAccessToken(null);
            lastFetchedUserIdRef.current = null;
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
          lastFetchedUserIdRef.current = supabaseUser.id;
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
        lastFetchedUserIdRef.current = supabaseUser.id;
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch user profile (catch block):', err);
      console.error('❌ Error details:', {
        message: err?.message,
        code: err?.code,
        name: err?.name,
        stack: err?.stack?.substring(0, 200),
      });
      
      // Timeout errors are now handled inside the inner try/catch above (sign out + error message).
      // If we reach here with a timeout-like error, it means the inner handler didn't fire — sign out cleanly.
      if (err?.message?.includes('timed out')) {
        console.error('❌ Profile fetch timed out (outer catch). Signing out for clean retry.');
        clearLocalAuthState();
        supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
        setSupabaseUser(null);
        setUser(null);
        setAccessToken(null);
        lastFetchedUserIdRef.current = null;
        setError('Connection to database timed out. Please sign in again — it should work now.');
        return;
      }
      
      // Check if this is an auth error
      if (err?.message?.includes('JWT') || err?.message?.includes('token') || err?.message?.includes('expired') || err?.message?.includes('auth') || err?.message?.includes('unauthorized')) {
        console.error('❌ Session error detected in catch block, signing out');
        clearLocalAuthState();
        supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
        setSupabaseUser(null);
        setUser(null);
        setAccessToken(null);
        lastFetchedUserIdRef.current = null;
        setError('Your session has expired. Please sign in again.');
      } else {
        console.error('❌ Non-auth error, continuing with minimal user so app is not stuck');
        setError('Failed to load full profile. Some features may be limited.');
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
          console.warn('⚠️ Session error (clearing):', sessionError.message);
          clearLocalAuthState();
          supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
          setSupabaseUser(null);
          setUser(null);
          setAccessToken(null);
          setError(sessionError.message?.includes('Refresh Token') ? null : sessionError.message);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Valid session found, fetching user profile...');
          setSupabaseUser(session.user);
          setAccessToken(session.access_token ?? null);
          
          // Validate session is not expired by trying to fetch profile
          await fetchUserProfile(session.user);
        } else {
          console.log('ℹ️ No active session found');
          setSupabaseUser(null);
          setAccessToken(null);
          setUser(null);
        }
      } catch (err: any) {
        const msg = err?.message ?? '';
        const isRefreshTokenError = msg.includes('Refresh Token') || msg.includes('AuthApiError') || err?.name === 'AuthApiError';
        if (isRefreshTokenError) {
          console.warn('⚠️ Invalid or missing refresh token, clearing session');
        } else {
          console.error('❌ Error initializing session:', err);
        }
        // Clear invalid session so user can sign in again
        clearLocalAuthState();
        supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
        setSupabaseUser(null);
        setUser(null);
        setAccessToken(null);
        setError(isRefreshTokenError ? null : (msg || 'Session expired'));
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
      try {
        console.log('🔄 Auth state changed:', event, session ? `(user: ${session.user?.email})` : '(no session)');
        // Do not set loading=true here: session recovery would grey out the login form
        // while profile is fetched. signIn/signUp set loading themselves when needed.

        // Ignore listener events while a manual sign-out is in progress —
        // signOut() handles state clearing + redirect synchronously.
        if (signingOutRef.current) {
          console.log('⏭️  Ignoring auth event during signOut');
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing state');
          setSupabaseUser(null);
          setAccessToken(null);
          setUser(null);
          lastFetchedUserIdRef.current = null;
          setLoading(false);
          return;
        }

        // TOKEN_REFRESHED fires every ~50min when Supabase silently rotates the JWT.
        // We only need to update the cached access token — NOT re-fetch the profile.
        // (Re-fetching here was a major cause of "screen goes dark" mid-session.)
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed — updating access token only');
          setAccessToken(session?.access_token ?? null);
          return;
        }

        // USER_UPDATED — auth metadata changed (e.g. password). Profile data unchanged.
        if (event === 'USER_UPDATED') {
          console.log('👤 User auth updated — keeping cached profile');
          setSupabaseUser(session?.user ?? null);
          setAccessToken(session?.access_token ?? null);
          return;
        }

        // If a manual signIn/signUp is in progress, that flow handles the profile fetch itself.
        // Skip the listener fetch to avoid a parallel duplicate query that doubles DB load.
        if (signingInRef.current) {
          console.log('⏭️  Skipping listener fetch — manual signIn in progress');
          setSupabaseUser(session?.user ?? null);
          setAccessToken(session?.access_token ?? null);
          return;
        }

        setSupabaseUser(session?.user ?? null);
        setAccessToken(session?.access_token ?? null);

        if (session?.user) {
          // Skip if we already have this user's profile loaded
          if (lastFetchedUserIdRef.current === session.user.id) {
            console.log('⏭️  Profile already loaded for this user — skipping fetch');
            return;
          }
          console.log('📥 Session user found, fetching profile...');
          await fetchUserProfile(session.user);
          console.log('✅ Profile fetch completed, auth loading finished');
        } else {
          setUser(null);
          lastFetchedUserIdRef.current = null;
        }
      } catch (err: any) {
        const msg = err?.message ?? '';
        const isRefreshTokenError = msg.includes('Refresh Token') || msg.includes('AuthApiError') || err?.name === 'AuthApiError';
        if (isRefreshTokenError) {
          console.warn('⚠️ Invalid refresh token in auth callback, clearing session');
        } else {
          console.error('❌ Auth state change error:', err);
        }
        setSupabaseUser(null);
        setUser(null);
        lastFetchedUserIdRef.current = null;
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // When Supabase's internal auto-refresh throws "Invalid Refresh Token", clear session
  // so the error doesn't leave the app stuck and user can sign in again
  useEffect(() => {
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const err = e?.reason;
      const msg = typeof err?.message === 'string' ? err.message : '';
      const isRefreshTokenError =
        msg.includes('Refresh Token') || msg.includes('AuthApiError') || (err && (err as any).name === 'AuthApiError');
      if (isRefreshTokenError) {
        e.preventDefault();
        console.warn('⚠️ Invalid refresh token (from background refresh), clearing session');
        clearLocalAuthState();
        supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
        setSupabaseUser(null);
        setUser(null);
        setAccessToken(null);
        lastFetchedUserIdRef.current = null;
      }
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', onUnhandledRejection);
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    signingInRef.current = true;
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Signing in with Supabase...');
      const { user, session } = await signInWithEmail(email, password);

      if (!user) {
        throw new Error('No user returned from sign in');
      }

      // Set the auth state immediately so login page redirect useEffect can pick it up
      setSupabaseUser(user);
      setAccessToken(session?.access_token ?? null);

      await fetchUserProfile(user);
      // Don't router.push here — login page useEffect handles role-based redirect.
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
      signingInRef.current = false;
    }
  };

  /**
   * Sign up with email and password
   * 
   * The user profile is automatically created by a database trigger.
   * If email confirmation is enabled, the user must confirm their email before signing in.
   */
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    signingInRef.current = true;
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
      signingInRef.current = false;
    }
  };

  /**
   * Sign out — INSTANT, NEVER HANGS.
   *
   * Strategy:
   *   1. Synchronously clear all React + browser storage state
   *   2. Hard-redirect to /login (kills in-flight requests + React tree)
   *   3. Fire-and-forget Supabase signOut() in background (with 3s timeout)
   *
   * This way the user is signed out from the UI's perspective in <50ms,
   * regardless of network conditions to Supabase.
   */
  const signOut = async () => {
    console.log('👋 Signing out (instant)...');
    signingOutRef.current = true;

    // 1. Clear all local state synchronously
    setError(null);
    setUser(null);
    setSupabaseUser(null);
    setAccessToken(null);
    setLoading(false);
    lastFetchedUserIdRef.current = null;

    // 2. Clear browser storage synchronously (auth tokens + per-user caches)
    clearLocalAuthState();

    // 3. Fire-and-forget the Supabase signOut with a hard 3s cap.
    //    Even if it never resolves (slow Vietnam→Supabase link), the user is already signed out locally.
    Promise.race([
      supabaseSignOut(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
      .then(() => console.log('✅ Supabase signOut completed (or timed out — irrelevant, already redirected)'))
      .catch((err) => console.warn('⚠️ Supabase signOut error (ignored, user already signed out locally):', err?.message));

    // 4. Hard navigation to /login.
    //    window.location.replace kills React state, in-flight fetches, and stale layouts.
    //    This is the most reliable way to recover from any auth-related stuck state.
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
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
        const isRefreshTokenError = error.message?.includes('Refresh Token') || (error as any).name === 'AuthApiError';
        console.warn(isRefreshTokenError ? '⚠️ Invalid refresh token, clearing session' : '❌ Error refreshing session:', error.message);
        clearLocalAuthState();
        supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
        setSupabaseUser(null);
        setUser(null);
        setAccessToken(null);
        lastFetchedUserIdRef.current = null;
        setError(isRefreshTokenError ? null : 'Your session has expired. Please sign in again.');
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
    } catch (err: any) {
      const msg = err?.message ?? '';
      const isRefreshTokenError = msg.includes('Refresh Token') || msg.includes('AuthApiError') || err?.name === 'AuthApiError';
      console.warn(isRefreshTokenError ? '⚠️ Invalid refresh token, clearing session' : '❌ Failed to refresh user:', err);
      clearLocalAuthState();
      supabase.auth.signOut().catch(() => { /* fire-and-forget */ });
      setSupabaseUser(null);
      setUser(null);
      setAccessToken(null);
      lastFetchedUserIdRef.current = null;
      setError(isRefreshTokenError ? null : 'Failed to refresh session. Please sign in again.');
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
    firebaseUser: supabaseUser,
    accessToken,
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

