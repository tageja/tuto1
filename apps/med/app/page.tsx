'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function Home() {
  const { t, lang, toggleLang } = useLang()

  const features = [
    t.featureAudioShadow,
    t.featureScriptDrills,
    t.featureSpeaking,
    t.featurePairPractice,
    t.featureStreak,
    t.featureDashboard,
  ]

  const modules = [
    { emoji: '👋', title: t.module1Title, level: 'A1', desc: t.module1Desc },
    { emoji: '🩺', title: t.module2Title, level: 'A1', desc: t.module2Desc },
    { emoji: '💊', title: t.module3Title, level: 'A2', desc: t.module3Desc },
    { emoji: '🚨', title: t.module4Title, level: 'A2', desc: t.module4Desc },
    { emoji: '📋', title: t.module5Title, level: 'B1', desc: t.module5Desc },
    { emoji: '🗣️', title: t.module6Title, level: 'B1', desc: t.module6Desc },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-light via-bg to-surface flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg/80 backdrop-blur">
        <div className="flex flex-col">
          <img src="/images/tuto-logo.png" alt="tuto." className="h-8 w-auto" />
          <span className="text-xs font-semibold text-text-muted tracking-wide -mt-0.5">{t.logoSub}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Partner badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border shadow-card">
            <span className="text-xs text-text-muted whitespace-nowrap font-medium">In partnership with</span>
            <img src="/images/chir-logo.jpg" alt="chir" className="h-10 w-auto object-contain" style={{ maxWidth: 80 }} />
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:bg-surface transition-all"
          >
            <span className={lang === 'en' ? 'text-primary font-bold' : ''}>EN</span>
            <span className="text-border">|</span>
            <span className={lang === 'vi' ? 'text-primary font-bold' : ''}>VI</span>
          </button>
          <Link href="/admin" className="btn-ghost">
            {t.navAdmin}
          </Link>
          <Link href="/learn" className="btn-primary">
            {t.navStartLearning}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
          {t.heroBadge}
        </div>
        <h1 className="text-5xl font-bold text-text mb-4 max-w-2xl leading-tight">
          {t.heroTitleLine1}<br />
          <span className="text-primary">{t.heroTitleLine2}</span>
        </h1>
        <p className="text-lg text-text-muted max-w-xl mb-10">
          {t.heroSubtitle}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/learn" className="btn-primary text-base px-6 py-3">
            {t.heroCtaExplore}
          </Link>
          <Link href="/admin" className="btn-secondary text-base px-6 py-3">
            {t.heroCtaAdmin}
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {features.map((feat) => (
            <span key={feat} className="px-4 py-2 rounded-full border border-border bg-bg text-sm text-text-muted shadow-card">
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Partner Strip */}
      <div className="flex items-center justify-center gap-8 py-10 border-y border-border bg-white/70">
        <span className="text-sm text-text-muted tracking-widest uppercase font-semibold">In partnership with</span>
        <img src="/images/chir-logo.jpg" alt="chir — Nghiên cứu cải tiến y tế" className="h-20 w-auto object-contain" style={{ maxWidth: 200 }} />
      </div>

      {/* Modules Preview */}
      <section className="px-8 py-12 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-2xl font-bold mb-8">{t.coursesSectionTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((m) => (
            <div key={m.title} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <span className="badge badge-blue">{m.level}</span>
                  </div>
                  <p className="text-xs text-text-muted">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-text-muted border-t border-border">
        {t.footer}
      </footer>
    </main>
  )
}
