'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import AudioReplayBar from '@/components/learn/AudioReplayBar'

interface ClozeToken {
  text: string
  isBlank: boolean
  answer?: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
}

function parseClozeText(text: string): ClozeToken[] {
  const parts = text.split(/(\[[^\]]+\])/)
  return parts.map((part) => {
    const match = part.match(/^\[(.+)\]$/)
    if (match) return { text: '', isBlank: true, answer: match[1] }
    return { text: part, isBlank: false }
  })
}

const EXAMPLE_TEXT =
  "Hello, I'm [Nurse Lan]. How can I [help] you today? Please take a [seat] and I'll be right with you."

export default function ClozeStep({ step, onComplete, contextAudio }: Props) {
  const { t } = useLang()
  const rawText = step.config?.clozeText as string | undefined
  const tokens = parseClozeText(rawText ?? EXAMPLE_TEXT)
  const blanks = tokens.filter((t) => t.isBlank)

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})

  const handleCheck = () => {
    const res: Record<number, boolean> = {}
    let bi = 0
    tokens.forEach((token) => {
      if (!token.isBlank) return
      const userAnswer = (answers[bi] ?? '').trim().toLowerCase()
      const correct = (token.answer ?? '').trim().toLowerCase()
      res[bi] = userAnswer === correct
      bi++
    })
    setResults(res)
    setChecked(true)
  }

  const handleReset = () => {
    setAnswers({})
    setChecked(false)
    setResults({})
  }

  const score = Object.values(results).filter(Boolean).length
  const total = blanks.length

  return (
    <div className="space-y-5">
      {/* Replay bar from prior audio step */}
      {contextAudio?.url && (
        <AudioReplayBar
          audioUrl={contextAudio.url}
          transcript={contextAudio.transcript}
          label="Replay audio from previous step"
        />
      )}

      <div>
        <h3 className="text-base font-semibold text-text">✏️ {step.title ?? t.clozeTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.clozeSubtitle}</p>
      </div>

      {/* Cloze text */}
      <div className="card p-5 bg-surface">
        <p className="text-sm leading-loose text-text">
          {(() => {
            let bi = 0
            return tokens.map((token, idx) => {
              if (!token.isBlank) return <span key={idx}>{token.text}</span>
              const currentBi = bi++
              const isCorrect = results[currentBi] === true
              const isWrong = results[currentBi] === false
              return (
                <span key={idx} className="inline-block mx-1 align-middle">
                  <input
                    type="text"
                    value={answers[currentBi] ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [currentBi]: e.target.value }))}
                    disabled={checked}
                    placeholder="___"
                    className={`w-28 px-2 py-0.5 rounded-lg border text-sm text-center focus:outline-none focus:ring-2 transition-colors ${
                      checked
                        ? isCorrect
                          ? 'border-success bg-green-50 text-success'
                          : 'border-error bg-red-50 text-error'
                        : 'border-border bg-bg focus:ring-primary/20 focus:border-primary'
                    }`}
                  />
                  {checked && isCorrect && <CheckCircle size={14} className="inline ml-1 text-success" />}
                  {checked && isWrong && (
                    <span className="inline-flex items-center gap-1">
                      <XCircle size={14} className="inline ml-1 text-error" />
                      <span className="text-xs text-success font-medium">({token.answer})</span>
                    </span>
                  )}
                </span>
              )
            })
          })()}
        </p>
      </div>

      {/* Score */}
      {checked && (
        <div className={`card p-4 flex items-center gap-3 ${score === total ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}>
          <span className="text-2xl">{score === total ? '🎉' : '💪'}</span>
          <div>
            <p className="font-semibold text-text">
              {score}/{total} {t.btnCheckQuiz}
            </p>
            <p className="text-sm text-text-muted">
              {score === total ? t.scorePerfectDesc : t.scoreRetryDesc}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={blanks.some((_, i) => !answers[i]?.trim())}
            className="btn-primary flex-1 justify-center"
          >
            {t.btnCheck}
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="btn-secondary flex-1 justify-center">
              {t.btnRetry}
            </button>
            <button onClick={onComplete} className="btn-primary flex-1 justify-center">
              {t.btnNextCloze} <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
