'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Lock, Clock, Layers } from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

type Level = 'all' | 'A1' | 'A2' | 'B1' | 'B2'

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

export const COURSE_ICONS: Record<string, string> = {
  'Foundations of Nursing English': '🩺',
  'Emergency Nursing Communication': '🚨',
  'Ward and Inpatient Communication': '🛏️',
  'International Patient Communication': '🌍',
  'Clinical Handover and Team Communication': '📋',
  'Career English for Nurses': '💼',
}

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

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
    // Fetch all courses — including unpublished (coming soon)
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => {
        const data: NursedCourse[] = j.data ?? []
        // Sort by the defined course order
        data.sort((a, b) => {
          const ai = COURSE_ORDER.indexOf(a.title)
          const bi = COURSE_ORDER.indexOf(b.title)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
        setCourses(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeLevel === 'all' ? courses : courses.filter((c) => c.level === activeLevel)
  const published = filtered.filter((c) => c.published)
  const comingSoon = filtered.filter((c) => !c.published)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>{t.learnCatalogTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.learnCatalogSubtitle}</p>
        </div>
      </div>

      {/* Level filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.key}
            onClick={() => setActiveLevel(lvl.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeLevel === lvl.key
                ? 'bg-primary text-white border-primary'
                : 'bg-bg border-border text-text-muted hover:bg-surface'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 rounded-t-xl bg-surface" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface rounded w-3/4" />
                <div className="h-3 bg-surface rounded w-1/2" />
                <div className="h-8 bg-surface rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <BookOpen size={48} className="text-text-muted opacity-30" />
          <>
            <p className="text-base font-medium text-text">
              {t.emptyLevelFiltered.replace('{level}', activeLevel)}
            </p>
            <button onClick={() => setActiveLevel('all')} className="btn-secondary text-sm">
              {t.btnViewAllCourses}
            </button>
          </>
        </div>
      ) : (
        <>
          {/* Active courses */}
          {published.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {published.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Coming soon courses */}
          {comingSoon.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-text-muted mb-3 flex items-center gap-2">
                <Lock size={15} />
                {t.courseComingSoon}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comingSoon.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: NursedCourse }) {
  const { t } = useLang()
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const isComingSoon = !course.published

  return (
    <div className={`card overflow-hidden flex flex-col transition-all duration-200 ${isComingSoon ? 'opacity-80' : 'hover:shadow-lg hover:-translate-y-0.5'}`}>
      {/* Card header */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-6xl drop-shadow">{icon}</span>
        {isComingSoon && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Lock size={24} className="text-white" />
              <span className="text-white text-xs font-semibold tracking-wider uppercase bg-black/40 px-3 py-1 rounded-full">
                {t.courseComingSoonBadge}
              </span>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`${LEVEL_COLORS[course.level] ?? 'badge badge-gray'} text-xs`}>
            {course.level}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-text leading-snug">{course.title}</h3>
        {course.title_vi && (
          <p className="text-xs text-text-muted">{course.title_vi}</p>
        )}
        {(course.description_vi ?? course.description) && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
            {course.description_vi ?? course.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          {isComingSoon ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-center text-xs text-text-muted bg-surface rounded-xl py-2 px-4 border border-border flex items-center justify-center gap-1">
                <Clock size={13} />
                {t.courseComingSoon}
              </span>
            </div>
          ) : (
            <Link
              href={`/learn/courses/${course.id}`}
              className="btn-primary w-full justify-center"
            >
              {t.btnStart}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
