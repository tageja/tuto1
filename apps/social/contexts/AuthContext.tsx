'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface SocialProfileBasic {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  schoolId?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: SocialProfileBasic | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<SocialProfileBasic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('social_profiles')
        .select('id, username, display_name, avatar_url, role, school_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setProfile({
          id:          data.id,
          username:    data.username,
          displayName: data.display_name ?? '',
          avatarUrl:   data.avatar_url ?? undefined,
          role:        data.role,
          schoolId:    data.school_id ?? undefined,
        });
      }
    } catch (err) {
      console.error('[AuthContext] fetchProfile error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
