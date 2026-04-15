'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'

const QUESTION_KEYS = [
  'q1_animation',
  'q2_variety',
  'q3_usefulness',
  'q4_confidence',
  'q5_continue',
] as const

type QuestionKey = (typeof QUESTION_KEYS)[number]

type Answers = Partial<Record<QuestionKey, number>>

interface Props {
  lessonId: string
  onDone: () => void
}

export default function LessonFeedbackScreen({ lessonId, onDone }: Props) {
  const { t } = useLang()
  const { user } = useAuth()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)

  const questions: { key: QuestionKey; label: string }[] = [
    { key: 'q1_animation', label: t.feedbackQ1 },
    { key: 'q2_variety', label: t.feedbackQ2 },
    { key: 'q3_usefulness', label: t.feedbackQ3 },
    { key: 'q4_confidence', label: t.feedbackQ4 },
    { key: 'q5_continue', label: t.feedbackQ5 },
  ]

  const scale = [
    { v: 1, label: t.feedbackScale1 },
    { v: 2, label: t.feedbackScale2 },
    { v: 3, label: t.feedbackScale3 },
    { v: 4, label: t.feedbackScale4 },
    { v: 5, label: t.feedbackScale5 },
  ]

  const current = questions[idx]
  const selected = current ? answers[current.key] : undefined
  const isLast = idx >= questions.length - 1

  function select(v: number) {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.key]: v }))
  }

  async function handlePrimary() {
    if (!current || selected === undefined) return
    if (!isLast) {
      setIdx((i) => i + 1)
      return
    }
    if (!user) {
      onDone()
      return
    }
    setSubmitting(true)
    try {
      const final = { ...answers, [current.key]: selected } as Required<Answers>
      const payload = {
        lessonId,
        q1_animation: final.q1_animation,
        q2_variety: final.q2_variety,
        q3_usefulness: final.q3_usefulness,
        q4_confidence: final.q4_confidence,
        q5_continue: final.q5_continue,
      }
      await fetch('/api/lesson-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Still complete lesson flow if save fails
    } finally {
      setSubmitting(false)
      onDone()
    }
  }

  function handleSkipAll() {
    onDone()
  }

  return (
    <div className="card p-6 sm:p-8 space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-text">{t.feedbackTitle}</h2>
        <p className="text-sm text-text-muted mt-1">{t.feedbackThanks}</p>
      </div>

      <div className="flex justify-center gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i === idx ? 'bg-primary' : i < idx ? 'bg-success' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-text leading-snug">
          <span className="text-text-muted mr-2">
            {t.feedbackProgress.replace('{n}', String(idx + 1))}
          </span>
          {current?.label}
        </p>

        <div className="grid grid-cols-5 gap-2">
          {scale.map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => select(v)}
              className={`flex flex-col items-center justify-center rounded-xl border px-1 py-3 text-center transition-colors min-h-[4.5rem] ${
                selected === v
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border bg-bg hover:bg-surface text-text text-xs'
              }`}
            >
              <span className="text-lg font-bold tabular-nums">{v}</span>
              <span className="text-[10px] leading-tight mt-1 opacity-90">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrimary}
          disabled={selected === undefined || submitting}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {submitting ? '…' : isLast ? t.feedbackSubmit : t.feedbackNext}
        </button>
        <button type="button" onClick={handleSkipAll} className="text-sm text-text-muted hover:text-primary text-center">
          {t.feedbackSkip}
        </button>
      </div>
    </div>
  )
}
