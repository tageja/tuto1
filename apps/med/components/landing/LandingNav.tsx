'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export function LandingNav() {
  const { t, lang, toggleLang } = useLang()

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[var(--border)] z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col">
              <img src="/images/tuto-logo.png" alt="tuto." className="h-8 w-auto" />
              <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide -mt-0.5">{t.logoSub}</span>
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
              <Link href="/become-creator" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {t.navBecomeCreator}
              </Link>
            </div>
            <div className="hidden md:flex items-center">
              <img src="/images/chir-logo.jpg" alt="CHIR" className="h-10 w-auto object-contain" style={{ maxWidth: 80 }} />
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
            <Link href="/studio" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:inline">
              {t.navStudio}
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
