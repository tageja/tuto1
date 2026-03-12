'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { CourseIcon } from '@/components/learn/CourseIcon'

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
  const modulesCount = course.modules_count ?? 0
  const lessonsCount = course.lessons_count ?? 0
  const hours = Math.round((course.total_minutes ?? 0) / 60 * 10) / 10

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <CourseIcon courseTitle={course.title} size={40} isComingSoon={isDraft} />
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${LEVEL_BADGE[course.level] ?? 'bg-surface text-text border-border'}`}>
          {course.level}
        </span>
      </div>

      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {course.title_vi ?? course.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
        {course.description_vi ?? course.description ?? ''}
      </p>

      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
        <span>{modulesCount} modules</span>
        <span>•</span>
        <span>{lessonsCount} lessons</span>
        {hours > 0 && (
          <>
            <span>•</span>
            <span>{hours}h</span>
          </>
        )}
      </div>

      {isDraft ? (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] font-medium text-sm flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          {t.courseComingSoonBadge}
        </button>
      ) : (
        <Link
          href={`/learn/courses/${course.id}`}
          className="w-full py-2.5 px-4 rounded-lg bg-[var(--primary)] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary-dark)] transition-colors group-hover:gap-3"
        >
          {t.btnStartCourse}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
