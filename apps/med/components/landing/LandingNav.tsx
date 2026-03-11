'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LanguageContext'

export function LandingNav() {
  const { t, lang, toggleLang } = useLang()

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[var(--border)] z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col">
              <span className="font-bold text-xl text-[var(--primary)]">tuto.</span>
              <span className="text-xs text-[var(--text-muted)] -mt-0.5">{t.logoSub}</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/learn/courses" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {t.navCourses}
              </Link>
              <Link href="/learn" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {t.navDashboard}
              </Link>
              <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {t.navAbout}
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] rounded-full border border-[var(--border)]">
              <Image src="/images/chir-logo.jpg" alt="CHIR" width={24} height={24} className="rounded-full object-cover w-6 h-6" />
              <span className="text-xs text-[var(--text-muted)]">{t.navPartnerChir}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors"
            >
              <span className={lang === 'en' ? 'text-[var(--primary)] font-bold' : ''}>EN</span>
              <span className="text-[var(--border)]">|</span>
              <span className={lang === 'vi' ? 'text-[var(--primary)] font-bold' : ''}>VI</span>
            </button>
            <Link href="/admin" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:inline">
              {t.navAdmin}
            </Link>
            <Link
              href="/learn"
              className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm"
            >
              {t.navStartLearning}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
