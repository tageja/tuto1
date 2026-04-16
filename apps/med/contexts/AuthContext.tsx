'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase'
import type { NursedProfile, UserRole } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: NursedProfile | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<NursedProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getBrowserClient()
    const { data, error } = await supabase
      .from('nursed_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    // #region agent log H3 - profile fetch result
    fetch('http://127.0.0.1:7456/ingest/e0d134c7-1f40-43e7-9e5c-a671c022ab02',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'54a064'},body:JSON.stringify({sessionId:'54a064',location:'AuthContext.tsx:fetchProfile',message:'profile fetch result',data:{userId,profileRole:data?.role??null,profileExists:!!data,errorCode:error?.code??null},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    const supabase = getBrowserClient()

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) fetchProfile(u.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/auth/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, profile, role: profile?.role ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
