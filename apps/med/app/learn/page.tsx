'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight, BookOpen, Flame, CheckCircle2, Lock, Play, ArrowRight,
} from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { COURSE_ICONS } from './courses/page'

const LEVEL_BADGE: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-amber-100 text-amber-700',
  B2: 'bg-rose-100 text-rose-700',
}

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

const COURSE_COLOR: Record<string, { bg: string; text: string; ring: string }> = {
  'Foundations of Nursing English':           { bg: 'bg-emerald-50',  text: 'text-emerald-600', ring: 'ring-emerald-200' },
  'Emergency Nursing Communication':          { bg: 'bg-red-50',      text: 'text-red-500',     ring: 'ring-red-200' },
  'Ward and Inpatient Communication':         { bg: 'bg-blue-50',     text: 'text-blue-600',    ring: 'ring-blue-200' },
  'International Patient Communication':      { bg: 'bg-violet-50',   text: 'text-violet-600',  ring: 'ring-violet-200' },
  'Clinical Handover and Team Communication': { bg: 'bg-amber-50',    text: 'text-amber-600',   ring: 'ring-amber-200' },
  'Career English for Nurses':               { bg: 'bg-indigo-50',   text: 'text-indigo-600',  ring: 'ring-indigo-200' },
}

function sortCourses(data: NursedCourse[]) {
  return [...data].sort((a, b) => {
    const ai = COURSE_ORDER.indexOf(a.title)
    const bi = COURSE_ORDER.indexOf(b.title)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LearnDashboard() {
  const { t } = useLang()
  const [allCourses, setAllCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastLesson, setLastLesson] = useState<{
    lessonId: string; courseId: string; title: string
  } | null>(null)
  const streak = 3
  const lessonsCompleted = 4

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => setAllCourses(sortCourses(j.data ?? [])))
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
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B5FFF] to-[#3B82F6] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 shadow-lg">
        <div className="flex-1">
          <p className="text-blue-200 text-sm font-medium mb-1 tracking-wide uppercase">NurseEd</p>
          <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2">
            {t.learnWelcomeTitle}
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-md">{t.learnWelcomeSubtitle}</p>
        </div>

        {/* Stats pills */}
        <div className="flex sm:flex-col gap-3 flex-wrap">
          <StatPill icon="🔥" value={streak} label={t.statsDaysStreak} color="bg-orange-400/20 text-white border-orange-300/30" />
          <StatPill icon="✓" value={lessonsCompleted} label={t.statsLessonsCompleted} color="bg-white/10 text-white border-white/20" />
          <StatPill icon="📚" value={allCourses.filter(c => c.published).length} label={t.statsCoursesEnrolled} color="bg-white/10 text-white border-white/20" />
        </div>
      </div>

      {/* ── CONTINUE LEARNING ────────────────────────────────────── */}
      {lastLesson && (
        <section>
          <SectionHeading title={t.continueLearningTitle} />
          <ContinueLearningCard lesson={lastLesson} course={activeCourse} />
        </section>
      )}

      {/* ── LEARNING PATH ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <SectionHeading title={t.learningPathTitle} className="mb-0" />
            <p className="text-sm text-[var(--text-muted)] mt-1">{t.learningPathDesc}</p>
          </div>
          <Link
            href="/learn/courses"
            className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1 flex-shrink-0 ml-4"
          >
            {t.linkViewAll} <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-40 h-52 rounded-2xl bg-[var(--surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <LearningPathRow courses={allCourses} />
        )}
      </section>

      {/* ── DAILY GOAL + STREAK ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily goal — takes 2 cols */}
        <div className="sm:col-span-2 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <BookOpen size={14} className="text-[var(--primary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">{t.todayMissionTitle}</h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">{t.missionDesc}</p>

          <div className="relative h-2 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--primary)] rounded-full transition-all duration-700"
              style={{ width: lessonsCompleted > 0 ? '40%' : '0%' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">{t.missionProgressTodo}</span>
            <span className="text-xs font-medium text-[var(--primary)]">40%</span>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-3xl mb-1">🔥</span>
          <p className="text-4xl font-bold text-orange-500 leading-none">{streak}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.streakDays}</p>
          <p className="text-xs text-[var(--text-muted)]">{t.streakNudge}</p>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ title, className = '' }: { title: string; className?: string }) {
  return (
    <h2 className={`text-base font-semibold text-[var(--text)] mb-4 ${className}`}>{title}</h2>
  )
}

function StatPill({
  icon, value, label, color,
}: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${color} text-sm`}>
      <span className="text-base leading-none">{icon}</span>
      <div>
        <p className="font-bold text-base leading-none">{value}</p>
        <p className="text-xs opacity-80 leading-none mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function ContinueLearningCard({
  lesson,
  course,
}: {
  lesson: { lessonId: string; courseId: string; title: string }
  course: NursedCourse | null
}) {
  const { t } = useLang()
  const colors = course ? (COURSE_COLOR[course.title] ?? { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' }) : { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' }
  const icon = course ? (COURSE_ICONS[course.title] ?? '📖') : '📖'

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-3xl flex-shrink-0 ring-2 ${colors.ring}`}>
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {course && (
          <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text} mb-0.5`}>
            {course.title_vi ?? course.title}
          </p>
        )}
        <p className="text-sm font-semibold text-[var(--text)] truncate">{lesson.title}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[var(--primary)] rounded-full" />
          </div>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{t.continueLearningInProgress}</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/learn/courses/${lesson.courseId}/lessons/${lesson.lessonId}`}
        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
      >
        <Play size={14} fill="white" />
        {t.btnContinue}
      </Link>
    </div>
  )
}

function LearningPathRow({ courses }: { courses: NursedCourse[] }) {
  return (
    <div className="relative">
      {/* Horizontal scroll wrapper */}
      <div className="flex items-stretch gap-0 overflow-x-auto pb-2 -mx-1 px-1">
        {courses.map((course, idx) => (
          <div key={course.id} className="flex items-center flex-shrink-0">
            <PathStepCard course={course} index={idx} />
            {/* Connector arrow — not after last */}
            {idx < courses.length - 1 && (
              <div className="flex-shrink-0 px-1">
                <ArrowRight size={16} className={course.published ? 'text-[var(--primary)]' : 'text-[var(--border)]'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PathStepCard({ course, index }: { course: NursedCourse; index: number }) {
  const { t } = useLang()
  const isActive = course.published
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const colors = COURSE_COLOR[course.title] ?? { bg: 'bg-gray-50', text: 'text-gray-400', ring: 'ring-gray-200' }

  const inner = (
    <div
      className={`w-36 rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-3 transition-all duration-200 select-none ${
        isActive
          ? `border-[var(--primary)] bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`
          : `border-[var(--border)] bg-[var(--surface)] opacity-65 cursor-default`
      }`}
    >
      {/* Step number */}
      <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center self-start -mb-1 ${
        isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
      }`}>
        {index + 1}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-3xl ring-2 ${colors.ring}`}>
        {icon}
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-[var(--text)] leading-tight line-clamp-3">
        {course.title_vi ?? course.title}
      </p>

      {/* Status */}
      <div className="mt-auto">
        {isActive ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] bg-[var(--primary-light)] px-2 py-0.5 rounded-full">
            <CheckCircle2 size={9} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
            <Lock size={9} /> {t.courseComingSoon}
          </span>
        )}
      </div>

      {/* Level badge */}
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_BADGE[course.level] ?? 'bg-gray-100 text-gray-500'}`}>
        {course.level}
      </span>
    </div>
  )

  if (isActive) {
    return (
      <Link href={`/learn/courses/${course.id}`}>
        {inner}
      </Link>
    )
  }
  return inner
}
