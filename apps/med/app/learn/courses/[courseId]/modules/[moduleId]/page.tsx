'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, BookOpen, Lock, CheckCircle, Layers } from 'lucide-react'
import type { LessonStage } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/learn/Breadcrumb'
import ModuleGateBanner from '@/components/learn/ModuleGateBanner'
import {
  buildPublishedLessonOrder,
  getLessonLearnStatus,
  getModuleForLesson,
  type CourseWithModules,
} from '@/lib/learn/lessonAccess'
import { isUuid } from '@/lib/utils/slug'

const STAGE_LABELS: Record<LessonStage, { en: string; vi: string }> = {
  heads_up: { en: 'Heads Up', vi: 'Làm quen' },
  heads_down: { en: 'Heads Down', vi: 'Luyện tập' },
  heads_together: { en: 'Heads Together', vi: 'Cùng nhau' },
  assessment: { en: 'Assessment', vi: 'Kiểm tra' },
}

export default function ModuleDetailPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const { t, lang } = useLang()
  const { user, role } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<CourseWithModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [moduleGates, setModuleGates] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    if (!courseId) return
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((j) => {
        const c = j.data as CourseWithModules
        setCourse(c)
        if (c?.slug && isUuid(courseId)) {
          const targetMod = (c.nursed_modules ?? []).find((m: any) => m.id === moduleId || m.slug === moduleId)
          router.replace(`/learn/courses/${c.slug}/modules/${targetMod?.slug ?? moduleId}`)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId, moduleId, router])

  useEffect(() => {
    if (!user || !course) return
    fetch(`/api/progress/course?courseId=${course.id}`)
      .then((r) => r.json())
      .then((j) => {
        const completed = new Set<string>()
        for (const p of j.data ?? []) {
          if (p.completed) completed.add(p.lesson_id)
        }
        setCompletedLessons(completed)
      })
      .catch(() => {})
  }, [user, course])

  useEffect(() => {
    if (!user || !course) return
    const modules = course.nursed_modules ?? []
    if (modules.length === 0) return

    Promise.all(
      modules.map((mod) =>
        fetch(`/api/module-progress?moduleId=${mod.id}`)
          .then((r) => r.json())
          .then((j) => ({ moduleId: mod.id, gateOpen: j.data?.gateOpen ?? true }))
          .catch(() => ({ moduleId: mod.id, gateOpen: true })),
      ),
    ).then((results) => {
      const gates = new Map<string, boolean>()
      for (const r of results) gates.set(r.moduleId, r.gateOpen)
      setModuleGates(gates)
    })
  }, [user, course])

  const mod = useMemo(() => getModuleForLesson(course, moduleId), [course, moduleId])

  const { allLessonIds, lessonToModule } = useMemo(() => buildPublishedLessonOrder(course), [course])

  const lessonsSorted = useMemo(() => {
    if (!mod) return []
    return [...(mod.nursed_lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
  }, [mod])

  const publishedInModule = useMemo(() => lessonsSorted.filter((l) => l.published), [lessonsSorted])

  const completionCounts = useMemo(() => {
    const done = publishedInModule.filter((l) => completedLessons.has(l.id)).length
    return { done, total: publishedInModule.length }
  }, [publishedInModule, completedLessons])

  const stageGroups = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of publishedInModule) {
      const key = l.stage ?? 'other'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [publishedInModule])

  function getStatus(lessonId: string, lessonPublished: boolean): 'completed' | 'unlocked' | 'locked' | 'coming_soon' {
    // super_admin previews all published lessons without sequential locks
    if (role === 'super_admin' && lessonPublished) return 'unlocked'
    return getLessonLearnStatus(lessonId, lessonPublished, {
      completedLessons,
      isLoggedIn: Boolean(user),
      allLessonIds,
      lessonToModule,
      moduleGates,
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-surface" />
        <div className="h-8 w-2/3 rounded bg-surface" />
        <div className="h-64 rounded-xl bg-surface" />
      </div>
    )
  }

  if (!course || !mod) {
    return (
      <div className="card p-12 text-center text-text-muted">
        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
        <p>{t.notFoundCourseLearn}</p>
        <Link href="/learn/courses" className="btn-secondary mt-4 inline-flex">
          {t.btnBackCourseLearn}
        </Link>
      </div>
    )
  }

  const courseTitle = course.title_vi || course.title
  const moduleTitle = lang === 'vi' ? (mod.title_vi || mod.title) : mod.title
  const moduleDesc = lang === 'vi' ? (mod.description_vi || mod.description) : mod.description
  const courseSlug = course.slug ?? courseId

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.breadcrumbCourses, href: '/learn/courses' },
          { label: courseTitle, href: `/learn/courses/${courseSlug}`, truncate: true },
          { label: moduleTitle, truncate: true },
        ]}
      />

      <div className="card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-text">{moduleTitle}</h1>
            {moduleDesc && <p className="text-sm text-text-muted mt-2 leading-relaxed">{moduleDesc}</p>}
            <p className="text-sm font-medium text-primary mt-3">
              {t.moduleCompletionLabel.replace('{n}', String(completionCounts.done)).replace('{total}', String(completionCounts.total))}
            </p>
          </div>
        </div>

        {user && moduleGates.get(mod.id) === false && (
          <ModuleGateBanner moduleId={mod.id} />
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-base font-bold text-text mb-3">{t.moduleStagesTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STAGE_LABELS) as LessonStage[]).map((stage) => {
            const n = stageGroups.get(stage) ?? 0
            if (n === 0) return null
            const lab = lang === 'vi' ? STAGE_LABELS[stage].vi : STAGE_LABELS[stage].en
            return (
              <span key={stage} className="badge badge-blue text-xs">
                {lab} · {n}
              </span>
            )
          })}
          {(stageGroups.get('other') ?? 0) > 0 && (
            <span className="badge badge-gray text-xs">
              {t.moduleStagesOther} · {stageGroups.get('other')}
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-text mb-3">{t.moduleLessonsTitle}</h2>
        <div className="card overflow-hidden divide-y divide-border">
          {publishedInModule.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">{t.emptyLessonsLearn}</p>
          ) : (
            lessonsSorted.map((lesson, lIdx) => {
              if (!lesson.published) {
                return (
                  <div key={lesson.id} className="flex items-center justify-between px-4 py-3 opacity-60">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-text-muted w-5 text-center">{lIdx + 1}</span>
                      <p className="text-sm font-medium text-text truncate">{lesson.title_vi || lesson.title}</p>
                    </div>
                    <span className="text-text-muted flex items-center gap-1 text-xs flex-shrink-0">
                      <Lock size={14} /> {t.statusComingSoon}
                    </span>
                  </div>
                )
              }
              const status = getStatus(lesson.id, lesson.published)
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    status === 'locked' ? 'opacity-60' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center flex-shrink-0">
                      {status === 'completed' ? (
                        <CheckCircle size={16} className="text-success mx-auto" />
                      ) : (
                        <span className="text-xs text-text-muted">{lIdx + 1}</span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{lesson.title_vi || lesson.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-text-muted flex-shrink-0" />
                        <span className="text-xs text-text-muted">{t.lessonMinutes.replace('{n}', String(lesson.est_minutes))}</span>
                      </div>
                    </div>
                  </div>
                  {status === 'completed' && (
                    <Link
                      href={`/learn/courses/${courseSlug}/lessons/${lesson.slug ?? lesson.id}`}
                      className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
                    >
                      {t.btnContinue}
                    </Link>
                  )}
                  {status === 'unlocked' && (
                    <Link href={`/learn/courses/${courseSlug}/lessons/${lesson.slug ?? lesson.id}`} className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">
                      {t.btnLearn}
                    </Link>
                  )}
                  {status === 'locked' && (
                    <span className="text-text-muted flex items-center gap-1 text-xs flex-shrink-0">
                      <Lock size={14} /> {t.statusLocked}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
