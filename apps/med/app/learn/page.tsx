'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, BookOpen, Flame } from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

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

export default function LearnDashboard() {
  const { t } = useLang()
  const [courses, setCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastLesson, setLastLesson] = useState<{ lessonId: string; courseId: string; title: string } | null>(null)
  const [streak] = useState(3)
  const [todayDone] = useState(false)

  useEffect(() => {
    fetch('/api/courses?published=true')
      .then((r) => r.json())
      .then((j) => setCourses((j.data ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('nursed_last_lesson')
      if (raw) setLastLesson(JSON.parse(raw))
    } catch {}
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="card p-6 bg-gradient-to-br from-primary to-primary-dark text-white">
        <h1 className="text-2xl font-bold mb-1">{t.learnWelcomeTitle}</h1>
        <p className="text-primary-light/90 text-sm">{t.learnWelcomeSubtitle}</p>
      </div>

      {/* Today's mission + streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mission card */}
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text">{t.todayMissionTitle}</h2>
            {todayDone && <span className="badge badge-green">✅ {t.missionProgressDone}</span>}
          </div>
          <p className="text-sm text-text-muted mb-4">{t.missionDesc}</p>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: todayDone ? '100%' : '0%' }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">{todayDone ? t.missionProgressDone : t.missionProgressTodo}</p>
        </div>

        {/* Streak card */}
        <div className="card p-5 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">🔥</span>
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-text-muted text-center">{t.streakDays}</p>
          <p className="text-xs text-text-muted text-center">{t.streakNudge}</p>
        </div>
      </div>

      {/* Continue learning */}
      {lastLesson && (
        <section>
          <h2 className="section-title">{t.continueLearningTitle}</h2>
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{lastLesson.title}</p>
                <p className="text-xs text-text-muted">{t.continueLearningInProgress}</p>
              </div>
            </div>
            <Link
              href={`/learn/courses/${lastLesson.courseId}/lessons/${lastLesson.lessonId}`}
              className="btn-primary"
            >
              {t.btnContinue} <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Featured courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">{t.featuredCoursesTitle}</h2>
          <Link href="/learn/courses" className="text-sm text-primary font-medium hover:underline">
            {t.linkViewAll}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 rounded-t-xl bg-surface" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t.emptyFeaturedCourses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function CourseCard({ course }: { course: NursedCourse }) {
  const { t } = useLang()
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-5xl">📚</span>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={LEVEL_COLORS[course.level] ?? 'badge badge-gray'}>{course.level}</span>
        <h3 className="text-sm font-semibold text-text line-clamp-2">{course.title_vi ?? course.title}</h3>
        {course.description_vi && (
          <p className="text-xs text-text-muted line-clamp-2">{course.description_vi}</p>
        )}
        <Link
          href={`/learn/courses/${course.id}`}
          className="btn-primary mt-auto w-full justify-center"
        >
          {t.btnLearnNow}
        </Link>
      </div>
    </div>
  )
}
