'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

const COURSE_ICONS: Record<string, string> = {
  'Foundations of Nursing English': '🩺',
  'Emergency Nursing Communication': '🚨',
  'Ward and Inpatient Communication': '🛏️',
  'International Patient Communication': '🌍',
  'Clinical Handover and Team Communication': '📋',
  'Career English for Nurses': '💼',
}

const LEVEL_BADGE: Record<string, string> = {
  A1: 'bg-green-100 text-green-700 border-green-200',
  A2: 'bg-blue-100 text-blue-700 border-blue-200',
  B1: 'bg-purple-100 text-purple-700 border-purple-200',
  B2: 'bg-orange-100 text-orange-700 border-orange-200',
}

export type LandingCourse = {
  id: string
  title: string
  title_vi: string | null
  description: string | null
  description_vi: string | null
  level: string
  published: boolean
  modules_count?: number
  lessons_count?: number
  total_minutes?: number
}

interface LandingCourseCardProps {
  course: LandingCourse
}

export function LandingCourseCard({ course }: LandingCourseCardProps) {
  const { t } = useLang()
  const isDraft = !course.published
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const modulesCount = course.modules_count ?? 0
  const lessonsCount = course.lessons_count ?? 0
  const isReady = lessonsCount > 0

  return (
    <div className={`relative bg-white border rounded-2xl p-5 transition-all duration-300 group overflow-hidden flex flex-col ${
      isDraft
        ? 'border-[var(--border)] opacity-70'
        : 'border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5'
    }`}>
      {/* Ready badge */}
      {!isDraft && isReady && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-700">Ready</span>
        </div>
      )}
      {isDraft && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-full">
          <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">Soon</span>
        </div>
      )}

      {/* Icon + level */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${LEVEL_BADGE[course.level] ?? 'bg-surface text-text-muted border-border'}`}>
          {course.level}
        </span>
      </div>

      <h3 className="font-semibold text-base mb-1.5 line-clamp-2 leading-snug">
        {course.title_vi ?? course.title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed flex-1">
        {course.description_vi ?? course.description ?? ''}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-4 pb-4 border-b border-[var(--border)]">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[var(--text)]">{modulesCount}</span> modules
        </span>
        <span className="text-[var(--border)]">·</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-[var(--text)]">{lessonsCount}</span> lessons
        </span>
        {!isReady && lessonsCount === 0 && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span className="text-amber-600 font-medium">Content coming</span>
          </>
        )}
      </div>

      {isDraft ? (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface)] text-[var(--text-muted)] font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" />
          {t.courseComingSoonBadge}
        </button>
      ) : (
        <Link
          href={`/learn/courses/${course.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary-dark)] transition-all group-hover:gap-3"
        >
          {t.btnStartCourse}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
