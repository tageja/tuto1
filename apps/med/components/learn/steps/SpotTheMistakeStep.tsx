'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronRight, RotateCcw } from 'lucide-react'
import type { NursedLessonStep, SpotTheMistakeConfig, SpotTheMistakeQuestion } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

type QuestionPhase = 'idle' | 'selected' | 'revealed'

interface QuestionCardProps {
  question: SpotTheMistakeQuestion
  qIndex: number
  total: number
  isVi: boolean
  onAnswer: (isCorrect: boolean) => void
}

function QuestionCard({ question, qIndex, total, isVi, onAnswer }: QuestionCardProps) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState<QuestionPhase>('idle')
  const [wrongAttemptIdx, setWrongAttemptIdx] = useState<number | null>(null)

  const wrongTokenIdx = question.tokens.findIndex((tk) => tk.is_wrong)
  const correction = isVi ? question.correction_vi || question.correction_en : question.correction_en
  const explanation = isVi ? question.explanation_vi || question.explanation_en : question.explanation_en
  const sentenceVi = question.sentence_vi

  // Guard: no wrong token configured
  if (wrongTokenIdx === -1) {
    return (
      <div className="card p-6 text-center text-text-muted text-sm">
        {t.spotTheMistakeNoWrongToken}
      </div>
    )
  }

  function handleSelect(idx: number) {
    if (phase === 'revealed') return
    setSelectedIdx(idx)
    setPhase('selected')
    setWrongAttemptIdx(null)
  }

  function handleCheck() {
    if (selectedIdx === null) return
    const correct = question.tokens[selectedIdx]?.is_wrong === true
    if (correct) {
      setPhase('revealed')
      onAnswer(true)
    } else {
      // Wrong guess — shake, leave in idle so they can try again
      setWrongAttemptIdx(selectedIdx)
      setSelectedIdx(null)
      setPhase('idle')
    }
  }

  function tokenClass(idx: number): string {
    if (phase === 'revealed') {
      if (question.tokens[idx]?.is_wrong) return 'bg-amber-100 border-warning text-warning line-through'
      return 'border-border text-text'
    }
    if (selectedIdx === idx) return 'border-primary border-b-2 text-primary bg-primary/5'
    return 'border-transparent hover:border-border text-text cursor-pointer'
  }

  return (
    <div className="space-y-5">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < qIndex ? 'w-2 h-2 bg-success' :
                i === qIndex ? 'w-4 h-2 bg-primary' :
                'w-2 h-2 bg-border'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-text-muted ml-1">
          {t.spotTheMistakeQuestionLabel.replace('{n}', String(qIndex + 1)).replace('{total}', String(total))}
        </span>
      </div>

      {/* Instruction */}
      <p className="text-sm font-semibold text-text">{t.spotTheMistakeInstructionEn}</p>

      {/* Token sentence */}
      <div className="card p-4 bg-surface">
        <div className="flex flex-wrap gap-1 items-baseline">
          {question.tokens.map((token, idx) => (
            <div key={idx} className="relative inline-block">
              <motion.button
                onClick={() => handleSelect(idx)}
                animate={
                  wrongAttemptIdx === idx && !shouldReduceMotion
                    ? { x: [0, -4, 4, -4, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                disabled={phase === 'revealed'}
                className={`inline-block px-1.5 py-0.5 rounded border transition-all text-sm font-medium min-h-[32px] ${tokenClass(idx)}`}
              >
                {token.text}
              </motion.button>

              {/* Hint chip on wrong attempt */}
              {wrongAttemptIdx !== idx && phase !== 'revealed' && question.tokens[idx]?.is_wrong && wrongAttemptIdx !== null && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded whitespace-nowrap">
                  {t.spotTheMistakeLookCloserHint}
                </span>
              )}

              {/* Correct replacement slides in */}
              {phase === 'revealed' && question.tokens[idx]?.is_wrong && correction && (
                <motion.span
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="ml-1 inline-block px-1.5 py-0.5 rounded border border-success bg-green-50 text-success text-sm font-medium"
                >
                  {correction}
                </motion.span>
              )}
            </div>
          ))}
        </div>

        {/* VI translation (only in VI mode) */}
        {isVi && sentenceVi && (
          <p className="text-xs text-text-muted mt-3 italic">↳ {sentenceVi}</p>
        )}
      </div>

      {/* Explanation banner */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className="card p-4 bg-amber-50 border-warning space-y-1"
          >
            <p className="text-xs font-semibold text-warning uppercase tracking-wide">
              {t.spotTheMistakeCorrectionLabel.replace('{correction}', correction ?? '')}
            </p>
            <p className="text-sm text-text">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check button */}
      {phase !== 'revealed' && (
        <button
          onClick={handleCheck}
          disabled={phase === 'idle'}
          className="btn-primary w-full justify-center disabled:opacity-40"
        >
          {t.spotTheMistakeCheckBtn}
        </button>
      )}
    </div>
  )
}

export default function SpotTheMistakeStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const cfg = (step.config ?? {}) as Partial<SpotTheMistakeConfig>
  const questions: SpotTheMistakeQuestion[] = cfg.questions ?? []
  const isVi = lang === 'vi'

  const [currentIdx, setCurrentIdx] = useState(0)
  const [scores, setScores] = useState<boolean[]>([])
  const [showSummary, setShowSummary] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="card p-6 text-center text-text-muted text-sm">
        {t.spotTheMistakeNoWrongToken}
      </div>
    )
  }

  function handleAnswer(isCorrect: boolean) {
    const next = [...scores, isCorrect]
    setScores(next)
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setShowSummary(true)
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  if (showSummary) {
    const correct = scores.filter(Boolean).length
    const total = questions.length
    const allCorrect = correct === total

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <h3 className="text-base font-semibold text-text">{t.stepTypeSpotTheMistake}</h3>
        <div className={`card p-6 text-center space-y-3 ${allCorrect ? 'bg-green-50 border-success' : 'bg-surface'}`}>
          <div className="text-4xl">{allCorrect ? '🎉' : '💪'}</div>
          <p className="font-semibold text-text text-base">
            {t.spotTheMistakeScoreBanner.replace('{correct}', String(correct)).replace('{total}', String(total))}
          </p>
          {!allCorrect && <p className="text-sm text-text-muted">{t.scoreRetryDesc}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrentIdx(0); setScores([]); setShowSummary(false) }}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={15} /> {t.btnRetry}
          </button>
          <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
            {t.btnNext} <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  const answered = scores.length > currentIdx

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-text">{t.stepTypeSpotTheMistake}</h3>

      <QuestionCard
        key={currentIdx}
        question={questions[currentIdx]}
        qIndex={currentIdx}
        total={questions.length}
        isVi={isVi}
        onAnswer={handleAnswer}
      />

      {answered && (
        <button
          onClick={handleNext}
          className="btn-primary w-full justify-center flex items-center gap-2"
        >
          {currentIdx + 1 >= questions.length ? t.btnFinish : t.btnNext} <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
