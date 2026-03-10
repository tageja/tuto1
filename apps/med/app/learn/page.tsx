'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, BookOpen, Flame, Clock, CheckCircle2, Lock, Layers, Play } from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { COURSE_ICONS } from './courses/page'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

const LEVEL_GRADIENTS: Record<string, string> = {
  A1: 'from-green-400 to-emerald-600',
  A2: 'from-blue-400 to-primary',
  B1: 'from-yellow-400 to-orange-500',
  B2: 'from-red-400 to-rose-600',
}

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

export default function LearnDashboard() {
  const { t } = useLang()
  const [allCourses, setAllCourses] = useState<NursedCourse[]>([])
  const [featuredCourses, setFeaturedCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastLesson, setLastLesson] = useState<{ lessonId: string; courseId: string; title: string } | null>(null)
  const [streak] = useState(3)
  const [lessonsCompleted] = useState(4)

  useEffect(() => {
    // Fetch all courses for the learning path stepper
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => {
        const data: NursedCourse[] = j.data ?? []
        data.sort((a, b) => {
          const ai = COURSE_ORDER.indexOf(a.title)
          const bi = COURSE_ORDER.indexOf(b.title)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
        setAllCourses(data)
        setFeaturedCourses(data.filter((c) => c.published).slice(0, 3))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('nursed_last_lesson')
      if (raw) setLastLesson(JSON.parse(raw))
    } catch {}
  }, [])

  const activeCourse = lastLesson
    ? allCourses.find((c) => c.id === lastLesson.courseId) ?? null
    : null

  return (
    <div className="space-y-8">

      {/* ── Hero welcome banner ───────────────────────────────── */}
      <div className="card overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="p-6 pb-4">
          <p className="text-primary-light/80 text-sm font-medium mb-1">NurseEd</p>
          <h1 className="text-2xl font-bold mb-1">{t.learnWelcomeTitle}</h1>
          <p className="text-primary-light/90 text-sm max-w-lg">{t.learnWelcomeSubtitle}</p>
        </div>
        {/* Stats strip */}
        <div className="grid grid-cols-3 border-t border-white/20">
          <StatChip icon={<Flame size={16} />} value={streak} label={t.statsDaysStreak} />
          <StatChip icon={<CheckCircle2 size={16} />} value={lessonsCompleted} label={t.statsLessonsCompleted} border />
          <StatChip icon={<BookOpen size={16} />} value={allCourses.filter(c => c.published).length} label={t.statsCoursesEnrolled} border />
        </div>
      </div>

      {/* ── Continue learning ─────────────────────────────────── */}
      {lastLesson && (
        <section>
          <h2 className="section-title">{t.continueLearningTitle}</h2>
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Course icon */}
            <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl bg-gradient-to-br ${activeCourse ? (LEVEL_GRADIENTS[activeCourse.level] ?? 'from-primary to-primary-dark') : 'from-primary to-primary-dark'}`}>
              {activeCourse ? (COURSE_ICONS[activeCourse.title] ?? '📖') : '📖'}
            </div>
            <div className="flex-1 min-w-0">
              {activeCourse && (
                <p className="text-xs text-text-muted mb-0.5 truncate">{activeCourse.title_vi ?? activeCourse.title}</p>
              )}
              <p className="text-sm font-semibold text-text truncate">{lastLesson.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.continueLearningInProgress}</p>
            </div>
            <Link
              href={`/learn/courses/${lastLesson.courseId}/lessons/${lastLesson.lessonId}`}
              className="btn-primary flex-shrink-0 flex items-center gap-1.5"
            >
              <Play size={14} />
              {t.btnContinue}
            </Link>
          </div>
        </section>
      )}

      {/* ── Learning path stepper ─────────────────────────────── */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="section-title mb-0">{t.learningPathTitle}</h2>
            <p className="text-xs text-text-muted mt-1">{t.learningPathDesc}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-44 h-28 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {allCourses.map((course, idx) => (
              <PathCard key={course.id} course={course} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ── Today's mission + streak ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mission card */}
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text">{t.todayMissionTitle}</h2>
          </div>
          <p className="text-sm text-text-muted mb-4">{t.missionDesc}</p>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: lessonsCompleted > 0 ? '40%' : '0%' }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">{t.missionProgressTodo}</p>
        </div>

        {/* Streak card */}
        <div className="card p-5 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">🔥</span>
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-text-muted text-center">{t.streakDays}</p>
          <p className="text-xs text-text-muted text-center">{t.streakNudge}</p>
        </div>
      </div>

      {/* ── Featured courses ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">{t.featuredCoursesTitle}</h2>
          <Link href="/learn/courses" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            {t.linkViewAll} <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-36 rounded-t-xl bg-surface" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t.emptyFeaturedCourses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredCourses.map((course) => (
              <FeaturedCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────

function StatChip({
  icon,
  value,
  label,
  border,
}: {
  icon: React.ReactNode
  value: number
  label: string
  border?: boolean
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-0.5 py-3 ${border ? 'border-l border-white/20' : ''}`}>
      <span className="text-white/70">{icon}</span>
      <span className="text-white text-xl font-bold leading-none">{value}</span>
      <span className="text-white/70 text-xs text-center leading-tight">{label}</span>
    </div>
  )
}

function PathCard({ course, index }: { course: NursedCourse; index: number }) {
  const { t } = useLang()
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const isActive = course.published
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-300 to-gray-400'

  const content = (
    <div
      className={`relative rounded-xl border p-3 flex flex-col items-center text-center gap-2 h-full transition-all duration-200 ${
        isActive
          ? 'border-primary/20 bg-gradient-to-b from-primary-light to-bg hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : 'border-border bg-surface opacity-60 cursor-default'
      }`}
    >
      {/* Number badge */}
      <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
        isActive ? 'bg-primary text-white' : 'bg-border text-text-muted'
      }`}>
        {index + 1}
      </div>

      {/* Icon in mini gradient circle */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${gradient} mt-1`}>
        {icon}
      </div>

      <p className="text-xs font-medium text-text leading-tight line-clamp-2">{course.title_vi ?? course.title}</p>

      {/* Status badge */}
      <div className="mt-auto">
        {isActive ? (
          <span className="text-[10px] text-primary font-semibold">{t.courseNotStarted} →</span>
        ) : (
          <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
            <Lock size={10} /> {t.courseComingSoon}
          </span>
        )}
      </div>
    </div>
  )

  if (isActive) {
    return (
      <Link href={`/learn/courses/${course.id}`} className="block h-full">
        {content}
      </Link>
    )
  }
  return content
}

function FeaturedCourseCard({ course }: { course: NursedCourse }) {
  const { t } = useLang()
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'
  const icon = COURSE_ICONS[course.title] ?? '📖'

  return (
    <div className="card overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <span className="text-5xl drop-shadow">{icon}</span>
        <div className="absolute top-3 left-3">
          <span className={`${LEVEL_COLORS[course.level] ?? 'badge badge-gray'} text-xs`}>
            {course.level}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-text line-clamp-2 leading-snug">{course.title_vi ?? course.title}</h3>
        {course.description_vi && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{course.description_vi}</p>
        )}
        <Link
          href={`/learn/courses/${course.id}`}
          className="btn-primary mt-auto w-full justify-center"
        >
          {t.btnLearnNow}
        </Link>
      </div>
    </div>
  )
}
