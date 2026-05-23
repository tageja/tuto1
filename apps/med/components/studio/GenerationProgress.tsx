'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { CourseSynopsis } from '@/lib/studio/types'

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error'

interface GenerationProgressProps {
  synopsis: CourseSynopsis | null
  status: GenerationStatus
  completedLessons: Set<string>
  currentModuleIndex: number | null
  currentLessonIndex: number | null
  courseId: string | null
  error: string
  startedAt: number | null
  onRetry: () => void
}

function lessonKey(moduleIndex: number, lessonIndex: number) {
  return `${moduleIndex}:${lessonIndex}`
}

function formatEta(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s'
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  return `${Math.ceil(seconds / 60)}m`
}

export function GenerationProgress({
  synopsis,
  status,
  completedLessons,
  currentModuleIndex,
  currentLessonIndex,
  courseId,
  error,
  startedAt,
  onRetry,
}: GenerationProgressProps) {
  const { t } = useLang()

  const totalLessons = (synopsis?.modules.length ?? 0) * 8
  const completedCount = completedLessons.size
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const currentModule = synopsis?.modules.find((module) => module.orderIndex === currentModuleIndex) ?? null

  const eta = useMemo(() => {
    if (!startedAt || completedCount === 0 || status !== 'generating') return t.studioGenerationEtaCalculating
    const elapsedSeconds = (Date.now() - startedAt) / 1000
    const secondsPerLesson = elapsedSeconds / completedCount
    return formatEta(secondsPerLesson * Math.max(totalLessons - completedCount, 0))
  }, [completedCount, startedAt, status, t.studioGenerationEtaCalculating, totalLessons])

  if (!synopsis) {
    return (
      <div className="card p-6">
        <p className="text-sm text-text-muted">{t.studioGenerationMissingSynopsis}</p>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary font-semibold">
            {t.studioGenerationEyebrow}
          </p>
          <h2 className="mt-1">{t.studioGenerationTitle}</h2>
          <p className="text-sm text-text-muted mt-2">
            {status === 'complete'
              ? t.studioGenerationCompleteDesc
              : status === 'error'
                ? t.studioGenerationErrorDesc
                : t.studioGenerationDesc}
          </p>
        </div>
        {status === 'complete' && courseId && (
          <Link className="btn-primary" href={`/studio/${courseId}`}>
            {t.studioGenerationViewCourse}
          </Link>
        )}
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-error/30 bg-red-50 p-4">
          <p className="text-sm font-semibold text-error">{t.studioGenerationFailed}</p>
          <p className="text-sm text-error/80 mt-1">{error}</p>
          <button className="btn-secondary mt-3" onClick={onRetry}>
            {t.studioGenerationTryAgain}
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">
            {t.studioGenerationProgress
              .replace('{done}', String(completedCount))
              .replace('{total}', String(totalLessons))}
          </span>
          <span className="text-text-muted">{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioGenerationCurrentModule}</p>
          <p className="font-semibold mt-1">{currentModule?.title ?? t.studioGenerationWaiting}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioGenerationCurrentLesson}</p>
          <p className="font-semibold mt-1">
            {currentLessonIndex
              ? t.studioGenerationLessonNumber.replace('{n}', String(currentLessonIndex))
              : t.studioGenerationWaiting}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t.studioGenerationEta}</p>
          <p className="font-semibold mt-1">{status === 'complete' ? '0s' : eta}</p>
        </div>
      </div>

      <div className="space-y-4">
        {synopsis.modules.map((module) => (
          <section key={module.orderIndex} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-text-muted">
                  {t.studioSynopsisModuleLabel.replace('{n}', String(module.orderIndex))}
                </p>
                <h3 className="text-base mt-1">{module.title}</h3>
              </div>
              <span className="badge-neutral">
                {module.lessons.filter((lesson) => completedLessons.has(lessonKey(module.orderIndex, lesson.orderIndex))).length}/8
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
              {module.lessons.map((lesson) => {
                const key = lessonKey(module.orderIndex, lesson.orderIndex)
                const isDone = completedLessons.has(key)
                const isGenerating = status === 'generating'
                  && currentModuleIndex === module.orderIndex
                  && currentLessonIndex === lesson.orderIndex

                return (
                  <div key={key} className="rounded-lg border border-border bg-bg p-3 flex gap-2">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        isDone
                          ? 'bg-success text-white'
                          : isGenerating
                            ? 'border-2 border-primary border-t-transparent animate-spin'
                            : 'bg-surface text-text-muted'
                      }`}
                    >
                      {isDone ? '✓' : isGenerating ? '' : '•'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">
                        {t.studioSynopsisLessonLabel.replace('{n}', String(lesson.orderIndex))}
                      </p>
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
