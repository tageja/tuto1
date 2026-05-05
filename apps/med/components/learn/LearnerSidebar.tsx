'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Users, X, LogOut, MessageCircle, Star, User } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePrefetchRoute } from '@/lib/hooks/usePrefetchRoute'

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

const NAV_HREFS = [
  { icon: Home,     href: '/learn',          tKey: 'learnNavDashboard'      as const, tourTarget: undefined },
  { icon: BookOpen, href: '/learn/courses',  tKey: 'learnNavMyCourses'      as const, tourTarget: 'my-courses' },
  { icon: Users,    href: '/learn/pairs',    tKey: 'learnNavPracticeGroups' as const, tourTarget: 'practice-groups' },
  { icon: Star,     href: '/learn/rewards',  tKey: 'learnNavRewards'        as const, tourTarget: 'rewards' },
  { icon: User,     href: '/learn/profile',  tKey: 'learnNavProfile'        as const, tourTarget: undefined },
]

export default function LearnerSidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname()
  const { t, lang, toggleLang } = useLang()
  const { profile, signOut } = useAuth()
  const prefetch = usePrefetchRoute()
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/rewards/balance')
      .then(r => r.json())
      .then(j => { if (j.success) setStreak(j.data.streak ?? 0) })
      .catch(() => {})
  }, [])

  const isActive = (href: string) => {
    if (href === '/learn') return pathname === '/learn'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={[
        'fixed left-0 top-0 h-screen w-64 bg-bg border-r border-border flex flex-col z-50',
        'transition-transform duration-200 ease-in-out',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex items-center justify-between">
        <Link href="/learn" className="block" onClick={onClose}>
          <img src="/images/tuto-logo.png" alt="tuto." className="h-9 w-auto" />
          <span className="text-xs font-semibold text-text-muted tracking-wide mt-1 block">{t.logoSub}</span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-surface text-text-muted"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* User greeting */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-sm font-medium text-text">
          {profile?.full_name ? `Xin chào, ${profile.full_name.split(' ').pop()}` : t.greeting}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{t.greetingSub}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_HREFS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              onMouseEnter={() => prefetch(item.href)}
              className={active ? 'sidebar-item-active' : 'sidebar-item-inactive'}
              {...(item.tourTarget ? { 'data-tour-target': item.tourTarget } : {})}
            >
              <Icon size={18} />
              <span>{t[item.tKey]}</span>
            </Link>
          )
        })}
      </nav>

      {/* Streak badge */}
      <div className="px-4 py-4 border-t border-border">
        <Link
          href="/learn/rewards"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors"
        >
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-orange-700">
              {streak !== null
                ? t.streakLabel.replace('{n}', String(streak))
                : t.streakLabel.replace('{n}', '–')}
            </p>
            <p className="text-xs text-orange-500">{t.streakEncouragement}</p>
          </div>
        </Link>
      </div>

      {/* My Feedback link — navigates to /learn/feedback (history view).
          New feedback is filed via the floating button in /learn layout. */}
      <div className="px-4 pb-1">
        <Link
          href="/learn/feedback"
          onClick={onClose}
          onMouseEnter={() => prefetch('/learn/feedback')}
          className={[
            'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            isActive('/learn/feedback')
              ? 'bg-primary/10 border border-primary/30 text-primary'
              : 'bg-primary/5 border border-primary/15 text-primary hover:bg-primary/10',
          ].join(' ')}
        >
          <MessageCircle size={16} />
          <span>{t.feedbackHistoryTitle}</span>
        </Link>
      </div>

      {/* Partner logo + language toggle + logout */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        <div className="rounded-lg bg-white border border-border px-3 py-3 flex flex-col items-center gap-1">
          <span className="text-[10px] text-text-muted tracking-widest uppercase font-semibold">In partnership with</span>
          <img src="/images/chir-logo.jpg" alt="chir" className="h-14 w-auto object-contain" style={{ maxWidth: 120 }} />
        </div>
        <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:bg-surface transition-all w-full justify-center">
          <span className={lang === 'en' ? 'text-primary font-bold' : ''}>{t.langToggleEn}</span>
          <span className="text-border mx-1">|</span>
          <span className={lang === 'vi' ? 'text-primary font-bold' : ''}>{t.langToggleVi}</span>
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all w-full justify-center"
        >
          <LogOut size={13} />
          Đăng xuất / Sign out
        </button>
      </div>
    </aside>
  )
}
