'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { ReviewStatusPanel } from '@/components/studio/ReviewStatusPanel'
import { VideoRequestCard } from '@/components/studio/VideoRequestCard'
import type { StudioVideoQueueItem } from '@/app/api/studio/courses/[courseId]/route'
import type { NursedCourse, NursedLesson, NursedModule } from '@/lib/supabase'

type TabId = 'overview' | 'media'

type ModuleWithLessons = NursedModule & { nursed_lessons: NursedLesson[] }

type CoursePayload = {
  course: NursedCourse & { nursed_modules: ModuleWithLessons[] }
  stats: { totalModules: number; totalLessons: number; totalSteps: number }
  videoItems: StudioVideoQueueItem[]
  statusCounts: { pending: number; submitted: number; complete: number }
}

export default function StudioCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { t } = useLang()
  const [tab, setTab] = useState<TabId>('overview')
  const [payload, setPayload] = useState<CoursePayload | null>(null)
  const [videoItems, setVideoItems] = useState<StudioVideoQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  async function loadCourse() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/studio/courses/${courseId}`)
        const json = await res.json()
        if (!res.ok) {
          setError(json.error ?? 'Could not load course.')
          return
        }
        const data = json.data as CoursePayload
        setPayload(data)
        setVideoItems(data.videoItems)
        const expanded: Record<string, boolean> = {}
        data.course.nursed_modules.forEach((mod) => {
          expanded[mod.id] = true
        })
        setExpandedModules(expanded)
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    loadCourse()
  }, [courseId])

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="card p-6">
        <p className="text-sm text-error">{error || 'Course not found.'}</p>
        <Link href="/studio" className="btn-secondary mt-4 inline-flex">
          {t.studioCourseBack}
        </Link>
      </div>
    )
  }

  const { course, stats, statusCounts, videoItems: queueItems } = payload
  const mediaSubmitted =
    statusCounts.submitted + statusCounts.complete
  const mediaTotal = queueItems.length

  return (
    <div>
      <div className="mb-6">
        <Link href="/studio" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-3">
          <ArrowLeft size={16} />
          {t.studioCourseBack}
        </Link>
        <h1>{course.title}</h1>
      </div>

      <div className="flex gap-2 border-b border-border mb-6">
        {(['overview', 'media'] as const).map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === tabId
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text',
            ].join(' ')}
          >
            {tabId === 'overview'
              ? t.studioCourseTabs.overview
              : t.studioCourseTabs.mediaProduction}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioCourseStatsModules}</p>
              <p className="text-2xl font-bold mt-1">{stats.totalModules}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioCourseStatsLessons}</p>
              <p className="text-2xl font-bold mt-1">{stats.totalLessons}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioCourseStatsSteps}</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSteps}</p>
            </div>
          </div>

          <div className="space-y-3">
            {course.nursed_modules.map((mod) => {
              const expanded = expandedModules[mod.id] ?? true
              return (
                <section key={mod.id} className="card overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-surface/50"
                    onClick={() => toggleModule(mod.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <div className="min-w-0">
                        <p className="text-xs text-text-muted">
                          {t.studioSynopsisModuleLabel.replace('{n}', String(mod.order_index))}
                        </p>
                        <h3 className="font-semibold truncate">{mod.title}</h3>
                      </div>
                    </div>
                    <span className="badge-neutral shrink-0">
                      {(mod.nursed_lessons ?? []).length} lessons
                    </span>
                  </button>
                  {expanded && (
                    <ul className="divide-y divide-border border-t border-border">
                      {(mod.nursed_lessons ?? []).map((lesson) => (
                        <li
                          key={lesson.id}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <p className="text-xs text-text-muted">
                              {t.studioSynopsisLessonLabel.replace('{n}', String(lesson.order_index))}
                            </p>
                            <p className="text-sm font-medium">{lesson.title}</p>
                          </div>
                          <Link
                            href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                            className="btn-secondary text-xs shrink-0"
                          >
                            {t.studioCourseEditLesson}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="badge-yellow">
              {t.studioMediaStatsPending.replace('{n}', String(statusCounts.pending))}
            </span>
            <span className="badge-green">
              {t.studioMediaStatsSubmitted.replace('{n}', String(statusCounts.submitted))}
            </span>
            <span className="badge-blue">
              {t.studioMediaStatsComplete.replace('{n}', String(statusCounts.complete))}
            </span>
          </div>

          {videoItems.length === 0 ? (
            <div className="card p-6 text-sm text-text-muted text-center">
              No video requests for this course.
            </div>
          ) : (
            <div className="space-y-4">
              {videoItems.map((item) => (
                <VideoRequestCard
                  key={item.id}
                  item={item}
                  onSubmitted={(updated) => {
                    setVideoItems((prev) =>
                      prev.map((row) => (row.id === updated.id ? updated : row)),
                    )
                    setPayload((prev) => {
                      if (!prev) return prev
                      const nextItems = prev.videoItems.map((row) =>
                        row.id === updated.id ? updated : row,
                      )
                      return {
                        ...prev,
                        videoItems: nextItems,
                        statusCounts: {
                          pending: nextItems.filter((r) => r.status === 'pending').length,
                          submitted: nextItems.filter((r) => r.status === 'submitted').length,
                          complete: nextItems.filter((r) => r.status === 'complete').length,
                        },
                      }
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <ReviewStatusPanel
          course={course}
          counts={{ mediaSubmitted, mediaTotal }}
          t={t as unknown as Record<string, string>}
          onRefresh={loadCourse}
        />
      </div>
    </div>
  )
}
