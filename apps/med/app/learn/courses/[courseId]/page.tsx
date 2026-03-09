'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Clock, BookOpen, Lock } from 'lucide-react'
import type { NursedCourse, NursedModule, NursedLesson } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

type CourseWithModules = NursedCourse & {
  nursed_modules: (NursedModule & { nursed_lessons: NursedLesson[] })[]
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

export default function CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>()
  const { t } = useLang()
  const [course, setCourse] = useState<CourseWithModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((j) => {
        const c = j.data as CourseWithModules
        setCourse(c)
        if (c?.nursed_modules?.length > 0) {
          setExpandedModules(new Set([c.nursed_modules[0].id]))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-xl bg-surface" />
        <div className="h-6 w-1/2 rounded bg-surface" />
        <div className="h-4 w-3/4 rounded bg-surface" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="card p-12 text-center text-text-muted">
        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
        <p>{t.notFoundCourseLearn}</p>
        <Link href="/learn/courses" className="btn-secondary mt-4 inline-flex">{t.btnBackCourseLearn}</Link>
      </div>
    )
  }

  const modules = [...(course.nursed_modules ?? [])].sort((a, b) => a.order_index - b.order_index)
  const totalLessons = modules.reduce((acc, m) => acc + (m.nursed_lessons?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted flex items-center gap-1">
        <Link href="/learn/courses" className="hover:text-primary">{t.breadcrumbCourses}</Link>
        <ChevronRight size={14} />
        <span className="text-text">{course.title_vi ?? course.title}</span>
      </nav>

      {/* Course header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className={LEVEL_COLORS[course.level] ?? 'badge badge-gray'}>{course.level}</span>
          <span className="badge badge-gray">{t.lessonMinutes.replace('{n}', String(totalLessons))}</span>
        </div>
        <h1 className="mb-1">{course.title}</h1>
        {course.title_vi && <p className="text-text-muted mb-3">{course.title_vi}</p>}
        {course.description_vi && (
          <p className="text-sm text-text-muted">{course.description_vi}</p>
        )}
        {!course.description_vi && course.description && (
          <p className="text-sm text-text-muted">{course.description}</p>
        )}
      </div>

      {/* Module list */}
      <div className="space-y-3">
        <h2>{t.sectionCourseContentLearn}</h2>
        {modules.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            <p>{t.emptyModulesLearn}</p>
          </div>
        ) : (
          modules.map((mod, idx) => {
            const lessons = [...(mod.nursed_lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
            const isExpanded = expandedModules.has(mod.id)
            return (
              <div key={mod.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-text">{mod.title_vi ?? mod.title}</p>
                      <p className="text-xs text-text-muted">{t.lessonCountBadge.replace('{n}', String(lessons.length))}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} className="text-text-muted" /> : <ChevronRight size={18} className="text-text-muted" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {lessons.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-text-muted">{t.emptyLessonsLearn}</p>
                    ) : (
                      lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-muted w-5 text-center">{lIdx + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-text">{lesson.title_vi ?? lesson.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock size={12} className="text-text-muted" />
                                <span className="text-xs text-text-muted">
                                  {t.lessonMinutes.replace('{n}', String(lesson.est_minutes))}
                                </span>
                              </div>
                            </div>
                          </div>
                          {lesson.published ? (
                            <Link
                              href={`/learn/courses/${courseId}/lessons/${lesson.id}`}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              {t.btnLearn}
                            </Link>
                          ) : (
                            <span className="text-text-muted flex items-center gap-1 text-xs">
                              <Lock size={14} /> {t.statusComingSoon}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
