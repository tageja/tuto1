/**
 * Authentication Context for Tuto Dashboard
 * 
 * Provides authentication state and methods throughout the app.
 * Uses Firebase Auth for user authentication.
 * 
 * @example
 * ```tsx
 * const { user, loading, signIn, signOut } = useAuth();
 * ```
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase/config';
import { useRouter } from 'next/navigation';
import { Backend } from '../lib/api/backend';
import { User, UserRole } from '../lib/types';

interface AuthContextType {
  // State
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile from backend
   */
  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const response = await Backend.getUserByUid(firebaseUser.uid);
      
      if (response.ok && response.user) {
        const userData = response.user;
        setUser({
          id: userData.id,
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || userData.fields?.Email || '',
          name: userData.fields?.Name || firebaseUser.displayName || '',
          role: userData.fields?.role || 'parent',
          avatar: userData.fields?.Avatar || firebaseUser.photoURL || undefined,
          schoolIds: userData.fields?.['School IDs'] || [],
          createdAt: userData.createdTime || new Date().toISOString(),
        });
      } else {
        // User doesn't exist in Airtable, create default user object
        setUser({
          id: '',
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          role: 'parent',
          avatar: firebaseUser.photoURL || undefined,
          schoolIds: [],
          createdAt: new Date().toISOString(),
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
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(userCredential.user);
      router.push('/home');
      console.log('✅ Sign in successful');
    } catch (err: any) {
      console.error('❌ Sign in failed:', err);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in';
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password';
      } else if (code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection';
      } else if (code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password sign-in is disabled in Firebase Auth settings';
      } else if (code) {
        errorMessage = `Sign-in error: ${code}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user in backend (Airtable)
      await Backend.upsertUserRole(userCredential.user.uid, role);
      
      await fetchUserProfile(userCredential.user);
      router.push('/home');
      
      console.log('✅ Sign up successful');
    } catch (err: any) {
      console.error('❌ Sign up failed:', err);
      
      let errorMessage = 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
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
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
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
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (err: any) {
      console.error('❌ Password reset failed:', err);
      
      let errorMessage = 'Failed to send password reset email';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/invalid-email') {
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
   * Google Sign-In (Popup)
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await fetchUserProfile(result.user);
      router.push('/(home)');
    } catch (err: any) {
      let msg = 'Google sign-in failed';
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') msg = 'Sign-in cancelled';
      else if (code === 'auth/popup-blocked') msg = 'Popup blocked by browser';
      else if (code) msg = `${msg}: ${code}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    signInWithGoogle,
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

