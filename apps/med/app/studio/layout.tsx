'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, LogOut, PlusCircle } from 'lucide-react'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'

const STUDIO_ROLES = ['course_creator', 'super_admin'] as const
const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang()
  const { role, loading, profile, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (AUTH_DISABLED || loading) return
    if (!role) {
      router.replace('/auth/login?next=/studio')
      return
    }
    if (!(STUDIO_ROLES as readonly string[]).includes(role)) {
      router.replace('/become-creator')
    }
  }, [role, loading, router])

  if (!AUTH_DISABLED && (loading || !role || !(STUDIO_ROLES as readonly string[]).includes(role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface">
        <header className="bg-bg border-b border-border sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/studio" className="flex items-center gap-3 min-w-0">
              <img src="/images/tuto-logo.png" alt="tuto." className="h-8 w-auto" />
              <span className="hidden sm:inline text-sm font-semibold text-text-muted">{t.navStudio}</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/studio" className="btn-ghost">
                <BookOpen size={16} />
                <span className="hidden sm:inline">{t.studioDraftsTitle}</span>
              </Link>
              <Link href="/studio/new" className="btn-primary">
                <PlusCircle size={16} />
                <span className="hidden sm:inline">{t.studioCreateCourse}</span>
              </Link>
              <button onClick={signOut} className="btn-ghost">
                <LogOut size={16} />
              </button>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {profile && (
            <p className="text-xs text-text-muted mb-4">
              {profile.full_name ?? 'Creator'} · {profile.role.replace('_', ' ')}
            </p>
          )}
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
