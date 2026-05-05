'use client'

import Link from 'next/link'
import { Volume2, FileText, Mic, Users, Award, BarChart3, ArrowRight, PlayCircle } from 'lucide-react'
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
  const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/courses?includeCounts=true')
      .then((r) => r.json())
      .then((j) => setCourses(sortCourses((j.data ?? []))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/site-settings/homepage')
      .then((r) => r.json())
      .then((j) => setIntroVideoUrl(j.data?.intro_video_url ?? null))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary)]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left — concise pitch */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-light)] border border-[var(--primary)]/20 rounded-full text-sm font-semibold text-[var(--primary)] mb-6 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                {t.heroBadge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.18] tracking-tight animate-slide-up">
                {t.heroTitleLine1}
                <span className="block bg-gradient-to-r from-[var(--primary)] via-blue-500 to-purple-600 bg-clip-text text-transparent mt-1 pb-2">
                  {t.heroTitleLine2}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 leading-relaxed max-w-xl animate-stagger-1">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 animate-stagger-2">
                <Link
                  href="/learn/courses"
                  className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold text-base hover:bg-[var(--primary-dark)] transition-all hover:scale-105 shadow-lg shadow-[var(--primary)]/25 flex items-center justify-center gap-2"
                >
                  {t.heroCtaExplore}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/admin"
                  className="px-8 py-4 bg-white border-2 border-[var(--border)] rounded-xl font-semibold text-base hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2"
                >
                  {t.heroCtaAdmin}
                </Link>
              </div>
            </div>

            {/* Right — intro video (or fallback mockup) */}
            <div className="flex items-center justify-center animate-stagger-2">
              {introVideoUrl ? (
                <div className="relative w-full max-w-xl">
                  <div className="absolute inset-0 translate-x-3 translate-y-3 bg-purple-200/50 rounded-2xl blur-sm" aria-hidden />
                  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-blue-200/50 rounded-2xl" aria-hidden />
                  <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-[var(--border)] ring-1 ring-black/5">
                    <video
                      src={introVideoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full aspect-video"
                    />
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5" />
                    {t.heroVideoCaption}
                  </p>
                </div>
              ) : (
                <div className="hidden md:block relative w-full max-w-sm">
                  <div className="absolute inset-0 translate-x-4 translate-y-4 bg-purple-100 rounded-2xl opacity-40" />
                  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-100 rounded-2xl opacity-50" />
                  <div className="relative bg-white rounded-2xl shadow-xl border border-[var(--border)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                        <span className="text-xl">💼</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--text)]">Workplace Communication</div>
                        <div className="text-xs text-[var(--text-muted)]">12 modules · 96 lessons</div>
                      </div>
                      <div className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Live</div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {['Vocabulary preview', 'Listen & shadow', 'Speak with confidence'].map((label, i) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i < 2 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>
                            {i < 2 ? '✓' : ''}
                          </div>
                          <span className="text-xs text-[var(--text-muted)] flex-1">{label}</span>
                          {i < 2 && <span className="text-xs text-[var(--primary)] font-medium">Done</span>}
                        </div>
                      ))}
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-[var(--text)] mb-1">Listen & Repeat</div>
                        <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-[var(--primary)] rounded-full" />
                        </div>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">0.75x</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{t.featuresSectionTitle}</h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.featuresSectionSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, key, descKey }, i) => (
              <div
                key={key}
                className="relative bg-white border border-[var(--border)] rounded-2xl p-7 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-[var(--text)]">{t[key]}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t[descKey]}</p>
                </div>
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
