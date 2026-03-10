'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Clock, BookOpen, Lock,
  Layers, CheckCircle, Award, Bell,
} from 'lucide-react'
import type { NursedCourse, NursedModule, NursedLesson } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { COURSE_ICONS } from '../page'

type CourseWithModules = NursedCourse & {
  nursed_modules: (NursedModule & { nursed_lessons: NursedLesson[] })[]
}

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
        <div className="h-6 w-1/3 rounded bg-surface" />
        <div className="h-56 rounded-xl bg-surface" />
        <div className="h-32 rounded-xl bg-surface" />
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
  const totalMinutes = modules.reduce((acc, m) => {
    return acc + (m.nursed_lessons ?? []).reduce((s, l) => s + (l.est_minutes ?? 0), 0)
  }, 0)
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="text-sm text-text-muted flex items-center gap-1">
        <Link href="/learn/courses" className="hover:text-primary">{t.breadcrumbCourses}</Link>
        <ChevronRight size={14} />
        <span className="text-text">{course.title_vi ?? course.title}</span>
      </nav>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <div className={`card overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Large icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 flex items-center justify-center text-5xl sm:text-6xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={LEVEL_COLORS[course.level] ?? 'badge badge-gray'}>{course.level}</span>
              {!course.published && (
                <span className="badge badge-gray flex items-center gap-1">
                  <Lock size={11} /> {t.courseComingSoonBadge}
                </span>
              )}
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-1">{course.title}</h1>
            {course.title_vi && (
              <p className="text-white/80 text-base mb-3">{course.title_vi}</p>
            )}
            {/* Quick stats */}
            {course.published && (
              <div className="flex flex-wrap gap-4 mt-3">
                <QuickStat icon={<Layers size={14} />} label={t.courseStatsModules.replace('{n}', String(modules.length))} />
                <QuickStat icon={<BookOpen size={14} />} label={t.courseStatsLessons.replace('{n}', String(totalLessons))} />
                {totalHours > 0 && <QuickStat icon={<Clock size={14} />} label={t.courseStatsHours.replace('{n}', String(totalHours))} />}
                <QuickStat icon={<Award size={14} />} label={`${t.courseStatsLevel} ${course.level}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Coming soon state ─────────────────────────────────── */}
      {!course.published && (
        <div className="card p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-3xl">🔜</div>
          <div>
            <h2 className="text-xl font-bold text-text mb-2">{t.comingSoonCourseTitle}</h2>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">{t.comingSoonCourseDesc}</p>
          </div>
          {/* About the course even for coming-soon */}
          {(course.description_vi || course.description) && (
            <div className="w-full max-w-xl text-left bg-surface rounded-xl p-5 mt-2">
              <h3 className="font-semibold text-text mb-2">{t.aboutCourseTitle}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {course.description_vi ?? course.description}
              </p>
            </div>
          )}
          <button className="btn-secondary flex items-center gap-2 mt-2">
            <Bell size={15} />
            {t.comingSoonInterestBtn}
          </button>
          <Link href="/learn/courses" className="text-sm text-text-muted hover:text-primary">
            ← {t.breadcrumbCourses}
          </Link>
        </div>
      )}

      {/* ── Published course content ──────────────────────────── */}
      {course.published && (
        <>
          {/* About + What you'll learn — two-column on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* About this course */}
            {(course.description_vi || course.description) && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-text mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  {t.aboutCourseTitle}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  {course.description_vi ?? course.description}
                </p>
                {course.description_vi && course.description && course.description !== course.description_vi && (
                  <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
            )}

            {/* What you will learn — auto-generated from module titles */}
            {modules.length > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-text mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  {t.whatYouLearnTitle}
                </h2>
                <ul className="space-y-2">
                  {modules.map((mod) => (
                    <li key={mod.id} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{mod.title_vi ?? mod.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Course content accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text">{t.allModulesTitle}</h2>
              <p className="text-xs text-text-muted">
                {t.moduleCountLabel
                  .replace('{m}', String(modules.length))
                  .replace('{l}', String(totalLessons))
                  .replace('{h}', String(totalHours))}
              </p>
            </div>

            {modules.length === 0 ? (
              <div className="card p-8 text-center text-text-muted">
                <p>{t.emptyModulesLearn}</p>
              </div>
            ) : (
              modules.map((mod, idx) => {
                const lessons = [...(mod.nursed_lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
                const isExpanded = expandedModules.has(mod.id)
                const modMinutes = lessons.reduce((s, l) => s + (l.est_minutes ?? 0), 0)
                return (
                  <div key={mod.id} className="card overflow-hidden">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-text">{mod.title_vi ?? mod.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-text-muted">{t.lessonCountBadge.replace('{n}', String(lessons.length))}</span>
                            {modMinutes > 0 && (
                              <span className="text-xs text-text-muted flex items-center gap-0.5">
                                <Clock size={11} /> {t.lessonMinutes.replace('{n}', String(modMinutes))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={18} className="text-text-muted flex-shrink-0" /> : <ChevronRight size={18} className="text-text-muted flex-shrink-0" />}
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
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs text-text-muted w-5 text-center flex-shrink-0">{lIdx + 1}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text truncate">{lesson.title_vi ?? lesson.title}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Clock size={11} className="text-text-muted flex-shrink-0" />
                                    <span className="text-xs text-text-muted">
                                      {t.lessonMinutes.replace('{n}', String(lesson.est_minutes))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {lesson.published ? (
                                <Link
                                  href={`/learn/courses/${courseId}/lessons/${lesson.id}`}
                                  className="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
                                >
                                  {t.btnLearn}
                                </Link>
                              ) : (
                                <span className="text-text-muted flex items-center gap-1 text-xs flex-shrink-0">
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
        </>
      )}
    </div>
  )
}

function QuickStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/90 text-sm">
      <span className="text-white/70">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
