'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import LessonPlayer from '@/components/learn/LessonPlayer'
import { useLang } from '@/contexts/LanguageContext'

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { t } = useLang()
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((j) => setLesson(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lessonId])

  useEffect(() => {
    if (lesson && typeof window !== 'undefined') {
      localStorage.setItem(
        'nursed_last_lesson',
        JSON.stringify({ lessonId, courseId, title: lesson.title_vi ?? lesson.title })
      )
    }
  }, [lesson, lessonId, courseId])

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
        <Link href={`/learn/courses/${courseId}`} className="btn-secondary mt-4 inline-flex">
          {t.btnBackToCourse}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted flex items-center gap-1 flex-wrap">
        <Link href="/learn/courses" className="hover:text-primary">{t.breadcrumbCoursesLesson}</Link>
        <ChevronRight size={14} />
        <Link href={`/learn/courses/${courseId}`} className="hover:text-primary">{t.breadcrumbCoursesLesson}</Link>
        <ChevronRight size={14} />
        <span className="text-text">{lesson.title_vi ?? lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <div>
        <h1 className="mb-1">{lesson.title_vi ?? lesson.title}</h1>
        {lesson.description && (
          <p className="text-sm text-text-muted">{lesson.description}</p>
        )}
      </div>

      {/* Lesson player */}
      <LessonPlayer lesson={lesson} courseId={courseId} />
    </div>
  )
}
