'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import type { NursedLessonStep, OddOneOutConfig, OddOneOutQuestion } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

type QuestionPhase = 'idle' | 'selected' | 'revealed'

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

interface QuestionCardProps {
  question: OddOneOutQuestion
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

  const prompt = isVi ? question.prompt_vi || question.prompt_en || t.oddOneOutDefaultPromptEn : question.prompt_en || t.oddOneOutDefaultPromptEn
  const explanation = isVi
    ? question.category_explanation_vi || question.category_explanation_en
    : question.category_explanation_en

  const seed = hashStr(question.id)
  const shuffledIndices = useMemo(() => shuffle(question.words.map((_, i) => i), seed), [question.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(origIdx: number) {
    if (phase === 'revealed') return
    setSelectedIdx(origIdx)
    setPhase('selected')
  }

  function handleConfirm() {
    if (selectedIdx === null) return
    const correct = question.words[selectedIdx]?.is_odd === true
    setPhase('revealed')
    onAnswer(correct)
  }

  function cardClass(origIdx: number): string {
    const w = question.words[origIdx]
    if (phase === 'revealed') {
      if (w?.is_odd) return 'border-success bg-green-50'
      if (origIdx === selectedIdx && !w?.is_odd) return 'border-error bg-red-50'
      return 'border-border bg-surface opacity-50'
    }
    if (selectedIdx === origIdx) return 'border-primary bg-primary-light'
    return 'border-border bg-surface hover:border-primary/50 hover:shadow-md cursor-pointer'
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
          {t.oddOneOutQuestionLabel.replace('{n}', String(qIndex + 1)).replace('{total}', String(total))}
        </span>
      </div>

      {/* Prompt */}
      <p className="text-sm font-semibold text-text">{prompt}</p>

      {/* 2×2 word grid */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledIndices.map((origIdx) => {
          const w = question.words[origIdx]
          const text = isVi ? w?.text_vi || w?.text_en : w?.text_en

          return (
            <motion.button
              key={origIdx}
              onClick={() => handleSelect(origIdx)}
              animate={
                phase === 'revealed' && w?.is_odd && !shouldReduceMotion
                  ? { scale: [1, 1.04, 1] }
                  : phase === 'revealed' && origIdx === selectedIdx && !w?.is_odd && !shouldReduceMotion
                  ? { x: [-4, 4, -4, 4, 0] }
                  : {}
              }
              transition={{ duration: 0.35 }}
              disabled={phase === 'revealed'}
              className={`relative flex flex-col items-center justify-center min-h-[80px] px-3 py-4 rounded-2xl border transition-all font-medium text-sm leading-snug text-center ${cardClass(origIdx)}`}
            >
              {/* Selection dot */}
              {selectedIdx === origIdx && phase !== 'revealed' && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              )}
              {phase === 'revealed' && w?.is_odd && (
                <CheckCircle size={14} className="absolute top-2 right-2 text-success" />
              )}
              {phase === 'revealed' && origIdx === selectedIdx && !w?.is_odd && (
                <XCircle size={14} className="absolute top-2 right-2 text-error" />
              )}
              <span>{text}</span>
              {isVi && w?.text_vi && w?.text_en && (
                <span className="text-[10px] text-text-muted mt-0.5">{w.text_en}</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Explanation banner */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className={`card p-4 text-sm ${
              question.words[selectedIdx ?? -1]?.is_odd ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'
            }`}
          >
            <p className="font-semibold text-text">
              {question.words[selectedIdx ?? -1]?.is_odd
                ? t.oddOneOutCorrectBanner.replace('{explanation}', explanation)
                : t.oddOneOutWrongBanner.replace('{explanation}', explanation)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm button (only shown before reveal) */}
      {phase !== 'revealed' && (
        <button
          onClick={handleConfirm}
          disabled={phase === 'idle'}
          className="btn-primary w-full justify-center disabled:opacity-40"
        >
          {t.quickResponseConfirmBtn}
        </button>
      )}
    </div>
  )
}

export default function OddOneOutStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const cfg = (step.config ?? {}) as Partial<OddOneOutConfig>
  const questions: OddOneOutQuestion[] = cfg.questions ?? []
  const isVi = lang === 'vi'

  const [currentIdx, setCurrentIdx] = useState(0)
  const [scores, setScores] = useState<boolean[]>([])
  const [showSummary, setShowSummary] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="card p-6 text-center text-text-muted text-sm">
        {t.quickResponseEmptyState}
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
        <h3 className="text-base font-semibold text-text">{t.stepTypeOddOneOut}</h3>
        <div className={`card p-6 text-center space-y-3 ${allCorrect ? 'bg-green-50 border-success' : 'bg-surface'}`}>
          <div className="text-4xl">{allCorrect ? '🎉' : '💪'}</div>
          <p className="font-semibold text-text text-base">
            {t.oddOneOutScoreBanner.replace('{correct}', String(correct)).replace('{total}', String(total))}
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
      <h3 className="text-base font-semibold text-text">{t.stepTypeOddOneOut}</h3>

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
