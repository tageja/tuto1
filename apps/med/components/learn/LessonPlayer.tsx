'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { NursedLesson, NursedLessonStep, LessonStage } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

import VideoStep from './steps/VideoStep'
import AudioShadowStep from './steps/AudioShadowStep'
import ScriptReadStep from './steps/ScriptReadStep'
import ClozeStep from './steps/ClozeStep'
import NoScriptStep from './steps/NoScriptStep'
import RecordingStep from './steps/RecordingStep'
import QuizStep from './steps/QuizStep'
import MissionStep from './steps/MissionStep'
import ScenarioIntroStep from './steps/ScenarioIntroStep'
import SelfReflectionStep from './steps/SelfReflectionStep'

interface Props {
  lesson: NursedLesson & { nursed_lesson_steps?: NursedLessonStep[] }
  courseId?: string
}

const STAGE_CONFIG: Record<LessonStage, { label_en: string; label_vi: string; color: string }> = {
  heads_up: {
    label_en: 'Heads Up',
    label_vi: 'Làm quen',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
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

export default function LessonPlayer({ lesson, courseId }: Props) {
  const params = useParams<{ courseId?: string }>()
  const resolvedCourseId = courseId ?? params?.courseId ?? ''
  const { t, lang } = useLang()

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
  }

  const stage = lesson?.stage as LessonStage | null
  const stageConfig = stage ? STAGE_CONFIG[stage] : null

  const rawSteps: NursedLessonStep[] = lesson?.nursed_lesson_steps ?? []
  const steps = [...rawSteps].sort((a, b) => a.order_index - b.order_index)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(false)

  if (steps.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-text mb-2">{t.emptyLessonTitle}</h3>
        <p className="text-sm text-text-muted">{t.emptyLessonDesc}</p>
        {resolvedCourseId && (
          <Link href={`/learn/courses/${resolvedCourseId}`} className="btn-secondary mt-4 inline-flex">
            {t.btnBackToCourse}
          </Link>
        )}
      </div>
    )
  }

  const handleStepComplete = () => {
    if (currentIdx + 1 >= steps.length) {
      setCompleted(true)
    } else {
      setCurrentIdx(currentIdx + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (completed) {
    return (
      <div className="card p-12 text-center space-y-4">
        <div className="text-7xl mb-2 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-text">{t.completedTitle}</h2>
        <p className="text-text-muted">{t.completedDesc}</p>

        {/* XP animation */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-50 border border-yellow-200">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-700">+{steps.length * 10} XP</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {resolvedCourseId && (
            <Link href={`/learn/courses/${resolvedCourseId}`} className="btn-secondary justify-center">
              {t.btnBackToCourse}
            </Link>
          )}
          <Link href="/learn" className="btn-primary justify-center">
            {t.btnHome}
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = steps[currentIdx]
  const stepLabel = STEP_TYPE_LABELS[currentStep.type] ?? currentStep.type

  const renderStep = () => {
    switch (currentStep.type) {
      case 'video':
        return <VideoStep step={currentStep} onComplete={handleStepComplete} />
      case 'audio_shadow':
        return <AudioShadowStep step={currentStep} onComplete={handleStepComplete} />
      case 'script_read':
        return <ScriptReadStep step={currentStep} onComplete={handleStepComplete} />
      case 'cloze':
        return <ClozeStep step={currentStep} onComplete={handleStepComplete} />
      case 'no_script':
        return <NoScriptStep step={currentStep} onComplete={handleStepComplete} />
      case 'recording_submit':
        return <RecordingStep step={currentStep} onComplete={handleStepComplete} />
      case 'quiz':
        return <QuizStep step={currentStep} onComplete={handleStepComplete} />
      case 'mission':
        return <MissionStep step={currentStep} onComplete={handleStepComplete} />
      case 'scenario_intro':
        return <ScenarioIntroStep step={currentStep} onComplete={handleStepComplete} />
      case 'self_reflection':
        return <SelfReflectionStep step={currentStep} onComplete={handleStepComplete} />
      default:
        return (
          <div className="card p-8 text-center text-text-muted">
            <p>{t.unsupportedStep.replace('{type}', currentStep.type)}</p>
            <button onClick={handleStepComplete} className="btn-secondary mt-4">
              {t.btnSkip}
            </button>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Lesson stage banner */}
      {stageConfig && (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium ${stageConfig.color}`}>
          <span>
            {lang === 'vi' ? stageConfig.label_vi : stageConfig.label_en}
          </span>
          {lesson.objective && (
            <span className="text-xs font-normal opacity-80 max-w-[60%] text-right truncate">
              {lesson.objective}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {t.progressLabel
              .replace('{current}', String(currentIdx + 1))
              .replace('{total}', String(steps.length))}
          </span>
          <span className="badge badge-blue">{stepLabel}</span>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx < currentIdx
                  ? 'bg-success'
                  : idx === currentIdx
                  ? 'bg-primary'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step title */}
        {(currentStep.title_vi ?? currentStep.title) && (
          <p className="text-xs text-text-muted">
            {lang === 'vi' ? (currentStep.title_vi ?? currentStep.title) : currentStep.title}
          </p>
        )}
      </div>

      {/* Step content */}
      <div className="card p-6">
        {renderStep()}
      </div>
    </div>
  )
}
