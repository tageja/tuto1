'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import { X } from 'lucide-react'
import type { NursedLesson, NursedLessonStep, LessonStage } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

import { renderLessonStep } from './renderLessonStep'
import LessonFeedbackScreen from './LessonFeedbackScreen'
import ModuleGateBanner from './ModuleGateBanner'
import { getModuleForLesson, getNextLessonAfterCompletion, type CourseWithModules } from '@/lib/learn/lessonAccess'

interface Props {
  lesson: NursedLesson & { nursed_lesson_steps?: NursedLessonStep[] }
  courseId?: string
  course?: CourseWithModules | null
  completedLessonIds?: string[]
  moduleGateMap?: Record<string, boolean>
}

const STAGE_CONFIG: Record<LessonStage, { label_en: string; label_vi: string; color: string }> = {
  heads_up: {
    label_en: 'Heads Up',
    label_vi: 'Làm quen',
    color: 'bg-primary-light text-primary border-primary/30',
  },
  heads_down: {
    label_en: 'Heads Down',
    label_vi: 'Luyện tập',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  heads_together: {
    label_en: 'Heads Together',
    label_vi: 'Cùng nhau',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  assessment: {
    label_en: 'Assessment',
    label_vi: 'Kiểm tra',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
}

export default function LessonPlayer({
  lesson,
  courseId,
  course,
  completedLessonIds = [],
  moduleGateMap = {},
}: Props) {
  const params = useParams<{ courseId?: string }>()
  const router = useRouter()
  const resolvedCourseId = courseId ?? params?.courseId ?? ''
  const resolvedCourseSlug = course?.slug ?? resolvedCourseId
  const { t, lang } = useLang()
  const { user, role } = useAuth()
  const stepKey = useRef(0)
  const highWaterMark = useRef(0)
  const exitDialogRef = useRef<HTMLDivElement>(null)
  const exitTriggerRef = useRef<HTMLButtonElement>(null)

  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (!showExitConfirm) return
    const dialog = exitDialogRef.current
    if (!dialog) return
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowExitConfirm(false)
        exitTriggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      if (focusable.length === 0) return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showExitConfirm])

  const STEP_TYPE_LABELS: Record<string, string> = {
    video: t.stepTypeVideoLabel,
    audio_shadow: t.stepTypeAudioShadowLabel,
    script_read: t.stepTypeScriptReadLabel,
    cloze: t.stepTypeClozeLabel,
    no_script: t.stepTypeNoScriptLabel,
    recording_submit: t.stepTypeRecordingLabel,
    quiz: t.stepTypeQuizLabel,
    mission: t.stepTypeMissionLabel,
    scenario_intro: t.stepTypeScenarioIntroLabel,
    self_reflection: t.stepTypeSelfReflectionLabel,
    conversation_animation: t.stepTypeConversationAnimation,
    matching: t.stepTypeMatchingLabel,
    drag_order: t.stepTypeDragOrderLabel,
    flash_card: t.stepTypeFlashCardLabel,
  }

  const stage = lesson?.stage as LessonStage | null
  const stageConfig = stage ? STAGE_CONFIG[stage] : null

  const rawSteps: NursedLessonStep[] = lesson?.nursed_lesson_steps ?? []
  const steps = [...rawSteps].sort((a, b) => a.order_index - b.order_index)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [contextAudio, setContextAudio] = useState<{ url: string; transcript: string } | null>(null)
  const [justEarned, setJustEarned] = useState<{ name: string; name_vi?: string | null; icon: string | null; points: number }[]>([])
  const [showRewardToast, setShowRewardToast] = useState(false)

  const moduleMeta = useMemo(
    () => getModuleForLesson(course, lesson.module_id),
    [course, lesson.module_id],
  )
  const moduleTitle =
    moduleMeta != null ? (lang === 'vi' ? (moduleMeta.title_vi || moduleMeta.title) : moduleMeta.title) : ''
  const lessonTitleDisplay = lang === 'vi' ? (lesson.title_vi || lesson.title) : lesson.title

  const moduleGatesMap = useMemo(() => new Map(Object.entries(moduleGateMap)), [moduleGateMap])

  const completionMeta = useMemo(() => {
    if (!completed) {
      return { nextLesson: null, nextLessonModuleId: null, moduleFullyComplete: false }
    }
    const completedSet = new Set(completedLessonIds)
    completedSet.add(lesson.id)
    return getNextLessonAfterCompletion({
      course: course ?? null,
      currentLessonId: lesson.id,
      completedLessons: completedSet,
      isLoggedIn: Boolean(user),
      moduleGates: moduleGatesMap,
    })
  }, [completed, completedLessonIds, course, lesson.id, user, moduleGatesMap])

  useEffect(() => {
    setCurrentIdx(0)
    setCompleted(false)
    setFeedbackDone(false)
    setContextAudio(null)
    stepKey.current = 0
    highWaterMark.current = 0
  }, [lesson.id])

  if (steps.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-text mb-2">{t.emptyLessonTitle}</h3>
        <p className="text-sm text-text-muted">{t.emptyLessonDesc}</p>
        {resolvedCourseId && (
          <Link href={`/learn/courses/${resolvedCourseSlug}`} className="btn-secondary mt-4 inline-flex">
            {t.btnBackToCourse}
          </Link>
        )}
      </div>
    )
  }

  const handleStepComplete = () => {
    const finishedStep = steps[currentIdx]
    if (finishedStep.type === 'audio_shadow') {
      const url = (finishedStep.config?.audioUrl ?? finishedStep.config?.audio_url) as string | undefined
      const transcript = (finishedStep.config?.transcript ?? finishedStep.config?.transcriptEn ?? '') as string
      if (url) setContextAudio({ url, transcript })
    }

    const nextIdx = currentIdx + 1
    const total = steps.length
    const isLessonComplete = nextIdx >= total

    if (user) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          current_step_index: nextIdx,
          completion_pct: Math.round((nextIdx / total) * 100),
          completed: isLessonComplete,
          last_active: new Date().toISOString(),
        }),
      }).catch((err) => console.error('[progress] failed to save step progress:', err))
    }

    if (isLessonComplete && user) {
      fetch('/api/rewards/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lesson_complete', lessonId: lesson.id }),
      })
        .then(r => r.json())
        .then(j => {
          if (j.success && j.data.justEarned?.length > 0) {
            setJustEarned(j.data.justEarned)
            setShowRewardToast(true)
            setTimeout(() => setShowRewardToast(false), 4000)
          }
        })
        .catch(() => {})
      setCompleted(true)
    } else if (isLessonComplete) {
      setCompleted(true)
    } else {
      highWaterMark.current = Math.max(highWaterMark.current, nextIdx)
      stepKey.current += 1
      setCurrentIdx(nextIdx)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentIdx <= 0) return
    setCurrentIdx((i) => Math.max(0, i - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isAdminMode = role === 'super_admin'

  const handleJumpToStep = (idx: number) => {
    if (idx >= currentIdx && !isAdminMode) return
    if (idx >= currentIdx) {
      highWaterMark.current = Math.max(highWaterMark.current, idx)
    }
    setCurrentIdx(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExit = () => {
    if (resolvedCourseId) {
      router.push(`/learn/courses/${resolvedCourseSlug}`)
    }
    setShowExitConfirm(false)
  }

  if (completed && !feedbackDone) {
    return <LessonFeedbackScreen lessonId={lesson.id} onDone={() => setFeedbackDone(true)} />
  }

  if (completed && feedbackDone) {
    const { nextLesson, nextLessonModuleId, moduleFullyComplete } = completionMeta
    const nextHref =
      nextLesson && resolvedCourseId
        ? `/learn/courses/${resolvedCourseSlug}/lessons/${nextLesson.slug ?? nextLesson.id}`
        : null
    const nextTitle =
      nextLesson != null ? (lang === 'vi' ? (nextLesson.title_vi || nextLesson.title) : nextLesson.title) : ''
    const moduleSlug = moduleMeta?.slug ?? lesson.module_id
    const moduleHref =
      lesson.module_id && resolvedCourseId
        ? `/learn/courses/${resolvedCourseSlug}/modules/${moduleSlug}`
        : null
    const showCrossModuleHint =
      Boolean(nextLesson && nextLessonModuleId && lesson.module_id && nextLessonModuleId !== lesson.module_id)
    const nextMod = showCrossModuleHint ? getModuleForLesson(course, nextLessonModuleId) : undefined
    const nextModTitle =
      nextMod != null ? (lang === 'vi' ? (nextMod.title_vi || nextMod.title) : nextMod.title) : ''

    return (
      <div className="space-y-4">
        <div className="card p-12 text-center space-y-5">
          <div className="text-7xl mb-2 confetti-burst">🎉</div>
          <h2 className="text-2xl font-bold text-text animate-step-enter">{t.completedTitle}</h2>
          <p className="text-text-muted animate-stagger-1">{t.completedDesc}</p>

          <div className="animate-stagger-2 space-y-2">
            {justEarned.length > 0 ? (
              justEarned.map((reward, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-50 border border-yellow-200 mx-1">
                  <span className="text-2xl">{reward.icon ?? '⭐'}</span>
                  <span className="text-xl font-bold text-yellow-700">+{reward.points} ⭐</span>
                  <span className="text-sm text-yellow-600">{lang === 'vi' ? (reward.name_vi || reward.name) : reward.name}</span>
                </div>
              ))
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-50 border border-yellow-200">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold text-yellow-700">+10 ⭐</span>
              </div>
            )}
          </div>

          {moduleFullyComplete && (
            <p className="text-sm font-semibold text-success animate-stagger-2">{t.moduleCompleteTitle}</p>
          )}

          {showCrossModuleHint && nextModTitle && (
            <p className="text-xs text-text-muted max-w-md mx-auto">{t.nextLessonDifferentModule.replace('{module}', nextModTitle)}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 animate-stagger-3 flex-wrap">
            {nextHref && nextLesson && (
              <Link href={nextHref} className="btn-primary justify-center order-first">
                {t.btnNextLessonWithTitle.replace('{title}', nextTitle)}
              </Link>
            )}
            {moduleHref && (
              <Link href={moduleHref} className="btn-secondary justify-center">
                {t.btnBackToModule}
              </Link>
            )}
            {resolvedCourseId && (
              <Link href={`/learn/courses/${resolvedCourseSlug}`} className="btn-secondary justify-center">
                {t.btnBackToCourse}
              </Link>
            )}
            <Link href="/learn" className="btn-secondary justify-center">
              {t.btnHome}
            </Link>
          </div>
        </div>

        {lesson.module_id && <ModuleGateBanner moduleId={lesson.module_id} />}
      </div>
    )
  }

  const currentStep = steps[currentIdx]
  const stepLabel = STEP_TYPE_LABELS[currentStep.type] ?? currentStep.type

  const stickySummary = t.progressLabel.replace('{current}', String(currentIdx + 1)).replace('{total}', String(steps.length))

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-4">
        {/* Sticky lesson header */}
        <div className="sticky top-[49px] z-20 -mx-1 px-1 py-2 bg-surface/95 backdrop-blur border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              {moduleTitle && <p className="text-xs font-medium text-text-muted truncate">{moduleTitle}</p>}
              <p className="text-sm font-semibold text-text truncate">{lessonTitleDisplay}</p>
              <p className="text-xs text-text-muted tabular-nums">{stickySummary}</p>
            </div>
            <button
              ref={exitTriggerRef}
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="flex-shrink-0 p-2.5 rounded-lg border border-border bg-bg hover:bg-surface text-text-muted"
              aria-label={t.a11yExitLesson}
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        {showExitConfirm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
            role="presentation"
            onClick={() => setShowExitConfirm(false)}
          >
            <div
              ref={exitDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-lesson-title"
              className="card p-6 max-w-sm w-full space-y-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="exit-lesson-title" className="text-lg font-bold text-text">
                {t.exitLessonConfirmTitle}
              </h2>
              <p className="text-sm text-text-muted">{t.exitLessonConfirmDesc}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button type="button" className="btn-secondary justify-center" onClick={() => setShowExitConfirm(false)}>
                  {t.exitLessonConfirmNo}
                </button>
                <button type="button" className="btn-primary justify-center" onClick={handleExit}>
                  {t.exitLessonConfirmYes}
                </button>
              </div>
            </div>
          </div>
        )}

        {stageConfig && (
          <div
            className={`stage-bar flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium ${stageConfig.color}`}
          >
            <span className="font-semibold">{lang === 'vi' ? stageConfig.label_vi : stageConfig.label_en}</span>
            {lesson.objective && (
              <span className="text-xs font-normal opacity-70 max-w-[60%] text-right truncate">{lesson.objective}</span>
            )}
          </div>
        )}

        <div className="card p-4 space-y-3" data-tour-target="lesson-step-counter">
          <div className="flex items-center justify-between text-sm gap-2 flex-wrap">
            <span className="text-text-muted font-medium">
              {t.progressLabel.replace('{current}', String(currentIdx + 1)).replace('{total}', String(steps.length))}
            </span>
            <span className="badge badge-blue">{stepLabel}</span>
          </div>

          <div className="flex gap-1 items-stretch" role="group" aria-label={stickySummary}>
            {steps.map((s, idx) => {
              const segLabel = STEP_TYPE_LABELS[s.type] ?? s.type
              const titleAttr = segLabel
              const isDone = idx < currentIdx
              const isCurrent = idx === currentIdx
              const a11y = t.a11yGoToStep.replace('{current}', String(idx + 1)).replace('{total}', String(steps.length))

              if (isDone) {
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={titleAttr}
                    onClick={() => handleJumpToStep(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleJumpToStep(idx)
                      }
                    }}
                    className="flex-1 min-h-[44px] sm:min-h-[10px] flex items-center justify-center px-0.5 cursor-pointer rounded-full bg-success hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    aria-label={a11y}
                  >
                    <span className="w-full h-1.5 rounded-full bg-success" />
                  </button>
                )
              }

              if (isAdminMode) {
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={titleAttr}
                    onClick={() => handleJumpToStep(idx)}
                    className={`flex-1 min-h-[44px] sm:min-h-[10px] flex items-center justify-center px-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${isCurrent ? 'cursor-default' : 'cursor-pointer opacity-50 hover:opacity-80'}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${isCurrent ? 'bg-primary' : 'bg-border'}`} />
                  </button>
                )
              }

              return (
                <div
                  key={s.id}
                  title={titleAttr}
                  className="flex-1 min-h-[44px] sm:min-h-0 flex items-center px-0.5"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                      isCurrent ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          {(currentStep.title_vi || currentStep.title) && (
            <p className="text-xs text-text-muted">
              {lang === 'vi' ? (currentStep.title_vi || currentStep.title) : currentStep.title}
            </p>
          )}
        </div>

        {isAdminMode && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <span className="font-medium">Admin preview — steps unlocked</span>
            <button
              type="button"
              onClick={handleStepComplete}
              className="font-semibold underline hover:text-amber-900"
            >
              Skip step →
            </button>
          </div>
        )}

        {steps.map((step, idx) => {
          if (idx > highWaterMark.current) return null
          const isVisible = idx === currentIdx
          return (
            <div
              key={`${step.id}-${idx}`}
              className={`card p-6 ${isVisible ? 'step-enter' : 'hidden'}`}
              aria-hidden={!isVisible}
              {...(isVisible ? { 'data-tour-target': 'lesson-next-button' } : {})}
            >
              {renderLessonStep(step, handleStepComplete, {
                contextAudio: contextAudio ?? undefined,
                allSteps: steps,
                currentIdx: idx,
                lessonId: lesson.id,
                fallback: (
                  <div className="card p-8 text-center text-text-muted">
                    <p>{t.unsupportedStep.replace('{type}', step.type)}</p>
                    <button type="button" onClick={handleStepComplete} className="btn-secondary mt-4">
                      {t.btnSkip}
                    </button>
                  </div>
                ),
              })}
            </div>
          )
        })}

        {currentIdx > 0 && (
          <div className="flex justify-start">
            <button type="button" onClick={handlePrevious} className="btn-secondary">
              {t.btnPreviousStep}
            </button>
          </div>
        )}
      </div>

      {/* Reward toast */}
      {showRewardToast && justEarned.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
          {justEarned.map((reward, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white border border-yellow-200 shadow-lg rounded-2xl px-4 py-3 animate-step-enter"
            >
              <span className="text-2xl">{reward.icon ?? '⭐'}</span>
              <div>
                <p className="text-sm font-bold text-yellow-700">+{reward.points} stars earned!</p>
                <p className="text-xs text-text-muted">{lang === 'vi' ? (reward.name_vi || reward.name) : reward.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </MotionConfig>
  )
}
