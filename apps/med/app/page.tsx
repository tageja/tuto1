'use client'

import Link from 'next/link'
import { Volume2, FileText, Mic, Users, Award, BarChart3, ArrowRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingCourseCard, type LandingCourse } from '@/components/landing/LandingCourseCard'
import { useEffect, useState } from 'react'

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

const STATS = { activeNurses: 145, courses: 6, lessonsCompleted: 1247 }

const FEATURES = [
  { icon: Volume2, key: 'featureAudioShadow', descKey: 'featureAudioShadowDesc' as const },
  { icon: FileText, key: 'featureScriptDrills', descKey: 'featureScriptDrillsDesc' as const },
  { icon: Mic, key: 'featureSpeaking', descKey: 'featureSpeakingDesc' as const },
  { icon: Users, key: 'featurePairPractice', descKey: 'featurePairPracticeDesc' as const },
  { icon: Award, key: 'featureStreak', descKey: 'featureStreakDesc' as const },
  { icon: BarChart3, key: 'featureDashboard', descKey: 'featureDashboardDesc' as const },
] as const

function sortCourses(data: LandingCourse[]) {
  return [...data].sort((a, b) => {
    const ai = COURSE_ORDER.indexOf(a.title)
    const bi = COURSE_ORDER.indexOf(b.title)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export default function Home() {
  const { t } = useLang()
  const [courses, setCourses] = useState<LandingCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses?includeCounts=true')
      .then((r) => r.json())
      .then((j) => setCourses(sortCourses((j.data ?? []))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-[var(--primary-light)] border border-[var(--primary)]/20 rounded-full text-sm font-medium text-[var(--primary)] mb-6">
              {t.heroBadge}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t.heroTitleLine1}
              <span className="block bg-gradient-to-r from-[var(--primary)] to-purple-600 bg-clip-text text-transparent">
                {t.heroTitleLine2}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/learn/courses"
                className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--primary-dark)] transition-all hover:scale-105 shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
              >
                {t.heroCtaExplore}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin"
                className="px-8 py-4 bg-white border-2 border-[var(--border)] rounded-xl font-semibold text-lg hover:border-[var(--primary)] transition-colors flex items-center justify-center gap-2"
              >
                {t.heroCtaAdmin}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-1">{STATS.activeNurses}+</div>
                <div className="text-sm text-[var(--text-muted)]">{t.statsActiveNurses}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-1">{STATS.courses}</div>
                <div className="text-sm text-[var(--text-muted)]">{t.statsCourses}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-1">{STATS.lessonsCompleted.toLocaleString()}</div>
                <div className="text-sm text-[var(--text-muted)]">{t.statsLessonsCompleted}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.featuresSectionTitle}</h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.featuresSectionSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, key, descKey }) => (
              <div
                key={key}
                className="bg-gradient-to-br from-white to-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t[key]}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">{t[descKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-16 md:py-24 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.learningPathTitle}</h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.learningPathSubtitle}</p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.slice(0, 6).map((course) => (
                <LandingCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/learn/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-colors"
            >
              {t.btnViewAllCourses}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.ctaReadyTitle}</h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t.ctaReadySubtitle}</p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--primary)] rounded-xl font-semibold text-lg hover:bg-primary-light transition-all hover:scale-105 shadow-xl"
          >
            {t.btnStartLearningToday}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
