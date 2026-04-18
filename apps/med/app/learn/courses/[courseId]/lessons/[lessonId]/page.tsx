'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Lock } from 'lucide-react'
import LessonPlayer from '@/components/learn/LessonPlayer'
import Breadcrumb from '@/components/learn/Breadcrumb'
import JoinGroupGate from '@/components/learn/JoinGroupGate'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { getModuleForLesson, buildPublishedLessonOrder, type CourseWithModules } from '@/lib/learn/lessonAccess'
import { isUuid } from '@/lib/utils/slug'

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { t, lang } = useLang()
  const { user, role } = useAuth()
  const router = useRouter()
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<CourseWithModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [isGroupMember, setIsGroupMember] = useState<boolean | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [moduleGateMap, setModuleGateMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((j) => setLesson(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lessonId])

  useEffect(() => {
    fetch('/api/pairs/membership')
      .then((r) => r.json())
      .then((j) => setIsGroupMember(j.inGroup ?? false))
      .catch(() => setIsGroupMember(false))
  }, [user])

  useEffect(() => {
    if (!courseId) return
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((j) => {
        const c = j.data as CourseWithModules
        setCourse(c)
        if (c?.slug && isUuid(courseId)) {
          const lessonSlug = lesson?.slug
          router.replace(`/learn/courses/${c.slug}/lessons/${lessonSlug ?? lessonId}`)
        }
      })
      .catch(() => {})
  }, [courseId, lesson, lessonId, router])

  const resolvedLessonId = lesson?.id ?? lessonId

  useEffect(() => {
    if (!user || !courseId || !course || !lesson) return
    // super_admin can preview any lesson regardless of completion state
    if (role === 'super_admin') return

    const { allLessonIds, lessonToModule } = buildPublishedLessonOrder(course)
    const idx = allLessonIds.indexOf(resolvedLessonId)

    const resolvedCourseId = course.id ?? courseId
    fetch(`/api/progress/course?courseId=${resolvedCourseId}`)
      .then((r) => r.json())
      .then(async (j) => {
        const ids: string[] = []
        for (const p of j.data ?? []) {
          if (p.completed) ids.push(p.lesson_id)
        }
        setCompletedLessonIds(ids)

        if (idx <= 0) return
        const completed = new Set(ids)
        const prevId = allLessonIds[idx - 1]
        if (!completed.has(prevId)) {
          setAccessBlocked(true)
          return
        }

        const prevModuleId = lessonToModule.get(prevId)
        const currModuleId = lessonToModule.get(resolvedLessonId)
        if (prevModuleId && currModuleId && prevModuleId !== currModuleId) {
          try {
            const gateRes = await fetch(`/api/module-progress?moduleId=${prevModuleId}`)
            const gateJson = await gateRes.json()
            if (gateJson.data?.gateOpen === false) setAccessBlocked(true)
          } catch {
            /* gate check failed — allow access */
          }
        }
      })
      .catch(() => {})
  }, [user, role, courseId, resolvedLessonId, course, lesson])

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
      const gates: Record<string, boolean> = {}
      for (const r of results) gates[r.moduleId] = r.gateOpen
      setModuleGateMap(gates)
    })
  }, [user, course])

  useEffect(() => {
    if (lesson && typeof window !== 'undefined') {
      localStorage.setItem(
        'nursed_last_lesson',
        JSON.stringify({
          lessonId: lesson.id ?? lessonId,
          courseId: course?.id ?? courseId,
          title: lesson.title_vi || lesson.title,
          courseSlug: course?.slug,
          lessonSlug: lesson.slug,
        }),
      )
    }
  }, [lesson, lessonId, courseId, course])

  const moduleForLesson = useMemo(
    () => getModuleForLesson(course, lesson?.module_id),
    [course, lesson?.module_id],
  )

  const courseSlug = course?.slug ?? courseId

  const breadcrumbItems = useMemo(() => {
    const courseTitle = course ? (course.title_vi || course.title) : '...'
    const moduleTitle =
      moduleForLesson != null
        ? lang === 'vi'
          ? (moduleForLesson.title_vi || moduleForLesson.title)
          : moduleForLesson.title
        : null
    const lessonTitle = lesson ? (lesson.title_vi || lesson.title) : '...'

    const items: { label: string; href?: string; truncate?: boolean }[] = [
      { label: t.breadcrumbCoursesLabel, href: '/learn/courses' },
      { label: courseTitle, href: `/learn/courses/${courseSlug}`, truncate: true },
    ]
    if (moduleForLesson && courseId) {
      items.push({
        label: moduleTitle ?? '',
        href: `/learn/courses/${courseSlug}/modules/${moduleForLesson.slug ?? moduleForLesson.id}`,
        truncate: true,
      })
    }
    items.push({ label: lessonTitle, truncate: true })
    return items
  }, [course, courseId, courseSlug, lesson, moduleForLesson, lang, t.breadcrumbCoursesLabel])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-surface" />
        <div className="h-8 w-2/3 rounded bg-surface" />
        <div className="h-64 rounded-xl bg-surface" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="card p-12 text-center text-text-muted">
        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
        <p>{t.notFoundLesson2}</p>
        <Link href={`/learn/courses/${courseSlug}`} className="btn-secondary mt-4 inline-flex">
          {t.btnBackToCourse}
        </Link>
      </div>
    )
  }

  if (isGroupMember === false) {
    return <JoinGroupGate />
  }

  if (accessBlocked) {
    return (
      <div className="card p-12 text-center space-y-4">
        <Lock size={48} className="mx-auto text-text-muted opacity-40" />
        <h2 className="text-xl font-bold text-text">{t.statusLocked}</h2>
        <p className="text-sm text-text-muted">{t.statusLocked}</p>
        <Link href={`/learn/courses/${courseSlug}`} className="btn-primary inline-flex">
          {t.btnBackToCourse}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="mb-1">{lesson.title_vi || lesson.title}</h1>
        {(lesson.description_vi || lesson.description) && (
          <p className="text-sm text-text-muted">
            {lang === 'vi' ? (lesson.description_vi || lesson.description) : lesson.description}
          </p>
        )}
      </div>

      <LessonPlayer
        lesson={lesson}
        courseId={courseId}
        course={course}
        completedLessonIds={completedLessonIds}
        moduleGateMap={moduleGateMap}
      />
    </div>
  )
}
