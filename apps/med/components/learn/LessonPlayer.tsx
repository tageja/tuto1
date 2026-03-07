'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { NursedLessonStep } from '@/lib/supabase'

import VideoStep from './steps/VideoStep'
import AudioShadowStep from './steps/AudioShadowStep'
import ScriptReadStep from './steps/ScriptReadStep'
import ClozeStep from './steps/ClozeStep'
import NoScriptStep from './steps/NoScriptStep'
import RecordingStep from './steps/RecordingStep'
import QuizStep from './steps/QuizStep'
import MissionStep from './steps/MissionStep'

const STEP_TYPE_LABELS: Record<string, string> = {
  video: '🎬 Video',
  audio_shadow: '🎧 Nghe & Shadow',
  script_read: '📖 Đọc kịch bản',
  cloze: '✏️ Điền chỗ trống',
  no_script: '🎯 Nói tự do',
  recording_submit: '🎤 Ghi âm',
  quiz: '🧠 Kiểm tra',
  mission: '🎯 Nhiệm vụ',
}

interface Props {
  lesson: any
  courseId?: string
}

export default function LessonPlayer({ lesson, courseId }: Props) {
  const params = useParams<{ courseId?: string }>()
  const resolvedCourseId = courseId ?? params?.courseId ?? ''

  const rawSteps: NursedLessonStep[] = lesson?.nursed_lesson_steps ?? []
  const steps = [...rawSteps].sort((a, b) => a.order_index - b.order_index)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(false)

  if (steps.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-text mb-2">Bài học này chưa có nội dung</h3>
        <p className="text-sm text-text-muted">Nội dung đang được biên soạn, vui lòng quay lại sau.</p>
        {resolvedCourseId && (
          <Link href={`/learn/courses/${resolvedCourseId}`} className="btn-secondary mt-4 inline-flex">
            ← Quay lại khóa học
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
        <h2 className="text-2xl font-bold text-text">Xuất sắc!</h2>
        <p className="text-text-muted">Bạn đã hoàn thành bài học này!</p>

        {/* XP animation */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-50 border border-yellow-200">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-700">+{steps.length * 10} XP</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {resolvedCourseId && (
            <Link href={`/learn/courses/${resolvedCourseId}`} className="btn-secondary justify-center">
              ← Quay lại khóa học
            </Link>
          )}
          <Link href="/learn" className="btn-primary justify-center">
            🏠 Về trang chủ
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
      default:
        return (
          <div className="card p-8 text-center text-text-muted">
            <p>Loại bước chưa được hỗ trợ: {currentStep.type}</p>
            <button onClick={handleStepComplete} className="btn-secondary mt-4">
              Bỏ qua
            </button>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Bước {currentIdx + 1} / {steps.length}</span>
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
        {currentStep.title && (
          <p className="text-xs text-text-muted">{currentStep.title}</p>
        )}
      </div>

      {/* Step content */}
      <div className="card p-6">
        {renderStep()}
      </div>
    </div>
  )
}
