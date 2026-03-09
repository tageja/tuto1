'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

type Level = 'all' | 'A1' | 'A2' | 'B1'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

const LEVEL_GRADIENTS: Record<string, string> = {
  A1: 'from-green-400 to-emerald-500',
  A2: 'from-blue-400 to-primary',
  B1: 'from-yellow-400 to-orange-500',
  B2: 'from-red-400 to-rose-500',
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
  ]

  useEffect(() => {
    fetch('/api/courses?published=true')
      .then((r) => r.json())
      .then((j) => setCourses(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeLevel === 'all' ? courses : courses.filter((c) => c.level === activeLevel)

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
              <div className="h-36 rounded-t-xl bg-surface" />
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
          {courses.length === 0 ? (
            <>
              <p className="text-lg font-semibold text-text">{t.emptyNoCoursesTitle}</p>
              <p className="text-sm text-text-muted max-w-xs">{t.emptyNoCoursesDesc}</p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-text">
                {t.emptyLevelFiltered.replace('{level}', activeLevel)}
              </p>
              <button onClick={() => setActiveLevel('all')} className="btn-secondary text-sm">
                {t.btnViewAllCourses}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: NursedCourse }) {
  const { t } = useLang()
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-6xl">📚</span>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-2">
          <span className={LEVEL_COLORS[course.level] ?? 'badge badge-gray'}>{course.level}</span>
        </div>
        <h3 className="font-semibold text-text">{course.title}</h3>
        {course.title_vi && (
          <p className="text-sm text-text-muted">{course.title_vi}</p>
        )}
        {course.description_vi && (
          <p className="text-xs text-text-muted line-clamp-2">{course.description_vi}</p>
        )}
        <div className="mt-auto pt-3">
          <Link
            href={`/learn/courses/${course.id}`}
            className="btn-primary w-full justify-center"
          >
            {t.btnStart}
          </Link>
        </div>
      </div>
    </div>
  )
}
