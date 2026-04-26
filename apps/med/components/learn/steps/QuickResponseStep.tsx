'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Star, Check, X, ChevronRight, MessageCircle } from 'lucide-react'
import type { NursedLessonStep, QuickResponseConfig, QuickResponseOption } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

type Phase = 'idle' | 'selected' | 'revealed'

export default function QuickResponseStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const cfg = (step.config ?? {}) as Partial<QuickResponseConfig>

  const options: QuickResponseOption[] = useMemo(() => cfg.options ?? [], [cfg.options])
  const promptEn = cfg.prompt_en ?? ''
  const promptVi = cfg.prompt_vi ?? ''
  const speakerEn = cfg.speaker_label_en ?? t.quickResponseDefaultSpeakerEn
  const speakerVi = cfg.speaker_label_vi ?? t.quickResponseDefaultSpeakerEn
  const questionEn = cfg.question_en ?? t.quickResponseDefaultQuestionEn
  const questionVi = cfg.question_vi ?? t.quickResponseDefaultQuestionEn
  const feedbackEn = cfg.feedback_best_en ?? t.quickResponseDefaultBestFeedback
  const feedbackVi = cfg.feedback_best_vi ?? t.quickResponseDefaultBestFeedback

  const isVi = lang === 'vi'
  const speaker = isVi ? speakerVi : speakerEn
  const prompt = isVi ? promptVi || promptEn : promptEn
  const question = isVi ? questionVi || questionEn : questionEn
  const bestFeedback = isVi ? feedbackVi || feedbackEn : feedbackEn

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')

  if (options.length === 0) {
    return (
      <div className="card p-6 text-center text-text-muted text-sm">
        {t.quickResponseEmptyState}
      </div>
    )
  }

  function handleSelect(id: string) {
    if (phase === 'revealed') return
    setSelectedId(id)
    setPhase('selected')
  }

  function handleConfirm() {
    setPhase('revealed')
  }

  const chosenOption = options.find((o) => o.id === selectedId)
  const bestOptions = options.filter((o) => o.rating === 'best')
  const isCorrect = chosenOption ? chosenOption.rating === 'best' : false

  function optionClass(opt: QuickResponseOption): string {
    if (phase === 'revealed') {
      if (opt.rating === 'best') return 'border-success bg-green-50'
      if (opt.rating === 'acceptable') return 'border-warning bg-orange-50'
      return 'border-border bg-surface opacity-60'
    }
    if (selectedId === opt.id) return 'border-primary bg-primary-light'
    return 'border-border bg-surface hover:border-primary/50 hover:shadow-md cursor-pointer'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text">
          {t.stepTypeQuickResponse}
        </h3>
      </div>

      {/* Chat bubble — patient prompt */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary mb-1">{speaker} says:</p>
          <div className="bg-primary/8 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm font-medium text-text leading-relaxed">
              &ldquo;{prompt}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-text">{question}</p>

      {/* Options */}
      <div className="space-y-2">
        {options.map((opt) => {
          const text = isVi ? opt.text_vi || opt.text_en : opt.text_en
          const explanation = isVi ? opt.explanation_vi || opt.explanation_en : opt.explanation_en
          const isSelected = selectedId === opt.id

          return (
            <motion.div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              animate={
                phase === 'revealed' && opt.rating === 'best' && !shouldReduceMotion
                  ? { scale: [1, 1.02, 1] }
                  : phase === 'revealed' && isSelected && opt.rating !== 'best' && !shouldReduceMotion
                  ? { x: [-3, 3, -3, 3, 0] }
                  : {}
              }
              transition={{ duration: 0.35 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all min-h-[52px] ${optionClass(opt)} ${phase !== 'revealed' ? 'cursor-pointer' : ''}`}
            >
              {/* Radio dot */}
              <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${
                  phase === 'revealed' && opt.rating === 'best' ? 'text-success' :
                  phase === 'revealed' && opt.rating === 'acceptable' ? 'text-warning' :
                  'text-text'
                }`}>{text}</p>
                {phase === 'revealed' && explanation && (
                  <p className="text-xs text-text-muted mt-1 italic">{explanation}</p>
                )}
              </div>

              {/* Rating badge on reveal */}
              {phase === 'revealed' && (
                <div className="shrink-0 flex items-center gap-1">
                  {opt.rating === 'best' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-success">
                      <Star size={13} fill="currentColor" /> {t.quickResponseRatingBest}
                    </span>
                  )}
                  {opt.rating === 'acceptable' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-warning">
                      <Check size={13} /> {t.quickResponseRatingAcceptable}
                    </span>
                  )}
                  {opt.rating === 'incorrect' && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <X size={12} /> {t.quickResponseRatingIncorrect}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Feedback banner on reveal */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className={`card p-4 space-y-1 ${isCorrect ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}
          >
            <p className="font-semibold text-sm text-text">
              {isCorrect ? '🎉 ' : '💪 '}
              {isCorrect
                ? bestFeedback
                : (isVi ? bestOptions[0]?.text_vi || bestOptions[0]?.text_en : bestOptions[0]?.text_en) ?? bestFeedback}
            </p>
            {!isCorrect && chosenOption && (
              <p className="text-xs text-text-muted">
                {isVi ? chosenOption.explanation_vi || chosenOption.explanation_en : chosenOption.explanation_en}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {phase !== 'revealed' ? (
          <button
            onClick={handleConfirm}
            disabled={phase === 'idle'}
            className="btn-primary flex-1 justify-center disabled:opacity-40"
          >
            {t.quickResponseConfirmBtn}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="btn-primary flex-1 justify-center flex items-center gap-2"
          >
            {t.btnNext} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
