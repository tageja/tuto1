'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Lock, Clock } from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

type Level = 'all' | 'A1' | 'A2' | 'B1' | 'B2'

export const COURSE_ICONS: Record<string, string> = {
  'Foundations of Nursing English':           '🩺',
  'Emergency Nursing Communication':          '🚨',
  'Ward and Inpatient Communication':         '🛏️',
  'International Patient Communication':      '🌍',
  'Clinical Handover and Team Communication': '📋',
  'Career English for Nurses':               '💼',
}

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

const LEVEL_BADGE: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-amber-100 text-amber-700',
  B2: 'bg-rose-100 text-rose-700',
}

const COURSE_COLOR: Record<string, { icon: string; bar: string }> = {
  'Foundations of Nursing English':           { icon: 'bg-emerald-50 ring-emerald-200', bar: 'from-emerald-400 to-emerald-600' },
  'Emergency Nursing Communication':          { icon: 'bg-red-50 ring-red-200',         bar: 'from-red-400 to-rose-500' },
  'Ward and Inpatient Communication':         { icon: 'bg-primary-light ring-primary/20', bar: 'from-primary to-primary-dark' },
  'International Patient Communication':      { icon: 'bg-violet-50 ring-violet-200',   bar: 'from-violet-400 to-violet-600' },
  'Clinical Handover and Team Communication': { icon: 'bg-amber-50 ring-amber-200',     bar: 'from-amber-400 to-amber-600' },
  'Career English for Nurses':               { icon: 'bg-indigo-50 ring-indigo-200',   bar: 'from-indigo-400 to-indigo-600' },
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

export default function CourseCatalog() {
  const { t } = useLang()
  const [courses, setCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState<Level>('all')

  const LEVELS: { key: Level; label: string }[] = [
    { key: 'all', label: t.filterAll },
    { key: 'A1', label: 'A1' },
    { key: 'A2', label: 'A2' },
    { key: 'B1', label: 'B1' },
    { key: 'B2', label: 'B2' },
  ]

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => setCourses(sortCourses(j.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeLevel === 'all' ? courses : courses.filter((c) => c.level === activeLevel)
  const published = filtered.filter((c) => c.published)
  const comingSoon = filtered.filter((c) => !c.published)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t.learnCatalogTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.learnCatalogSubtitle}</p>
      </div>

      {/* Level filters */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.key}
            onClick={() => setActiveLevel(lvl.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeLevel === lvl.key
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--surface)] animate-pulse h-72" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] p-12 text-center flex flex-col items-center gap-3">
          <BookOpen size={40} className="text-[var(--text-muted)] opacity-30" />
          <p className="text-sm text-[var(--text-muted)]">
            {t.emptyLevelFiltered.replace('{level}', activeLevel)}
          </p>
          <button
            onClick={() => setActiveLevel('all')}
            className="text-sm text-[var(--primary)] font-medium hover:underline"
          >
            {t.btnViewAllCourses}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active courses */}
          {published.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {published.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={14} className="text-[var(--text-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  {t.courseComingSoon}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {comingSoon.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: NursedCourse }) {
  const { t } = useLang()
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const colors = COURSE_COLOR[course.title] ?? { icon: 'bg-surface ring-border', bar: 'from-primary/30 to-primary' }
  const isComingSoon = !course.published

  return (
    <div className={`group rounded-2xl border bg-white overflow-hidden flex flex-col transition-all duration-200 ${
      isComingSoon
        ? 'border-[var(--border)] opacity-70'
        : 'border-[var(--border)] hover:shadow-lg hover:-translate-y-1 hover:border-[var(--primary)]/30 cursor-pointer'
    }`}>
      {/* Color bar top */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bar} ${isComingSoon ? 'opacity-40' : ''}`} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Icon + level badge row */}
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center text-3xl ring-2 ${isComingSoon ? 'grayscale opacity-60' : ''}`}>
            {icon}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[course.level] ?? 'bg-surface text-text-muted'}`}>
              {course.level}
            </span>
            {isComingSoon && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                <Lock size={9} /> {t.courseComingSoonBadge}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-[var(--text)] text-sm leading-snug">{course.title}</h3>
          {course.title_vi && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{course.title_vi}</p>
          )}
        </div>

        {/* Description */}
        {(course.description_vi || course.description) && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed flex-1">
            {course.description_vi ?? course.description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          {isComingSoon ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <Clock size={12} />
              {t.courseComingSoon}
            </div>
          ) : (
            <Link
              href={`/learn/courses/${course.id}`}
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--primary)] py-2 rounded-xl bg-[var(--primary-light)] hover:bg-[var(--primary)] hover:text-white transition-all"
            >
              {t.btnStart} <Clock size={12} className="opacity-0 group-hover:opacity-100" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
