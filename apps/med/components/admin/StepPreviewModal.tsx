'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { PreviewProvider } from '@/contexts/PreviewContext'
import { renderLessonStep } from '@/components/learn/renderLessonStep'

interface Props {
  step: NursedLessonStep | null
  onClose: () => void
}

export default function StepPreviewModal({ step, onClose }: Props) {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!step) return
    setDone(false)
    triggerRef.current = document.activeElement
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      modalRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = prev
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [step])

  if (!step) return null

  const noop = () => setDone(true)

  const typeLabel =
    {
      video: t.stepTypeVideo,
      audio_shadow: t.stepTypeAudioShadow,
      script_read: t.stepTypeScriptRead,
      cloze: t.stepTypeCloze,
      no_script: t.stepTypeNoScript,
      recording_submit: t.stepTypeRecording,
      quiz: t.stepTypeQuiz,
      mission: t.stepTypeMission,
      scenario_intro: t.stepTypeScenarioIntro,
      self_reflection: t.stepTypeSelfReflection,
      conversation_animation: t.stepTypeConversationAnimation,
      matching: t.stepTypeMatchingLabel,
      drag_order: t.stepTypeDragOrderLabel,
      flash_card: t.stepTypeFlashCardLabel,
    }[step.type] ?? step.type

  return (
    <PreviewProvider>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="step-preview-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="fixed inset-0 z-50 flex flex-col outline-none"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div className="relative z-10 flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-bg px-4 py-3">
            <span className="badge badge-blue truncate max-w-[40%]">{typeLabel}</span>
            <span id="step-preview-title" className="text-sm font-semibold text-text">
              {t.previewBadge}
            </span>
            <button type="button" onClick={onClose} className="btn-ghost !p-2 shrink-0" aria-label="Close">
              <X size={20} />
            </button>
          </header>

          {done && (
            <div className="shrink-0 border-b border-border bg-green-50 px-4 py-2 text-center text-sm text-success">
              {t.previewCompleteNote}
              <button type="button" className="ml-2 font-medium underline" onClick={() => setDone(false)}>
                OK
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-[420px] rounded-2xl border border-border bg-bg p-4 shadow-lg">
              {renderLessonStep(step, noop, {
                fallback: (
                  <div className="card p-8 text-center text-text-muted">
                    <p>{t.unsupportedStepType}</p>
                  </div>
                ),
              })}
            </div>
          </div>
        </div>
      </div>
    </PreviewProvider>
  )
}
