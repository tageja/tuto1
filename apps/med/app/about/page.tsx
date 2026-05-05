'use client'

import { useLang } from '@/contexts/LanguageContext'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { BookOpen, Users } from 'lucide-react'
import Image from 'next/image'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

export default function AboutPage() {
  const { t, lang } = useLang()
  useDocumentTitle(t.aboutTitle)

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">{t.aboutTitle}</h1>
          <p className="text-xl text-[var(--text-muted)]">{t.aboutSubtitle}</p>
        </div>

        <div className="space-y-12">
          {/* Mission */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-3">{t.aboutMissionTitle}</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {lang === 'vi' ? t.aboutMissionDescVi : t.aboutMissionDesc}
              </p>
            </div>
          </section>

          {/* Who it's for */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-3">{t.aboutWhoTitle}</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {lang === 'vi' ? t.aboutWhoDescVi : t.aboutWhoDesc}
              </p>
            </div>
          </section>

          {/* CHIR partnership */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center overflow-hidden">
              <Image src="/images/chir-logo.jpg" alt="CHIR" width={56} height={56} className="object-cover w-full h-full" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-3">{t.aboutChirTitle}</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {lang === 'vi' ? t.aboutChirDescVi : t.aboutChirDesc}
              </p>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
