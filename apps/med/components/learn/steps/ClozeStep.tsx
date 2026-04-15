'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const EXAMPLE_TEXT =
  "Hello, I'm [Nurse Lan]. How can I [help] you today? Please take a [seat] and I'll be right with you."

// ─── Word-Bank Mode ───────────────────────────────────────────────────────────

interface WordBankProps {
  tokens: ClozeToken[]
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
  step: NursedLessonStep
}

function WordBankCloze({ tokens, onComplete, contextAudio, step }: WordBankProps) {
  const { t } = useLang()

  const blanks = tokens.filter((tk) => tk.isBlank)
  const blankCount = blanks.length

  // Shuffled chip pool (answers + optional decoys from config)
  const chipPool = useMemo(() => {
    const answers = blanks.map((b) => b.answer ?? '')
    const decoys = (step.config?.decoys as string[] | undefined) ?? []
    return shuffle([...answers, ...decoys])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // placed[i] = chip text placed in blank i, or null if empty
  const [placed, setPlaced] = useState<(string | null)[]>(Array(blankCount).fill(null))
  // bank: chips still available (not placed)
  const [bank, setBank] = useState<string[]>(chipPool)

  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})

  function handleChipTap(chip: string) {
    // Place chip into the first empty blank
    const emptyIdx = placed.findIndex((p) => p === null)
    if (emptyIdx === -1) return
    setPlaced((prev) => {
      const next = [...prev]
      next[emptyIdx] = chip
      return next
    })
    setBank((prev) => {
      const idx = prev.indexOf(chip)
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }

  function handleSlotTap(blankIdx: number) {
    const chip = placed[blankIdx]
    if (!chip || checked) return
    // Return chip to bank
    setPlaced((prev) => {
      const next = [...prev]
      next[blankIdx] = null
      return next
    })
    setBank((prev) => [...prev, chip])
  }

  function handleCheck() {
    const res: Record<number, boolean> = {}
    blanks.forEach((token, bi) => {
      res[bi] = (placed[bi] ?? '').trim().toLowerCase() === (token.answer ?? '').trim().toLowerCase()
    })
    setResults(res)
    setChecked(true)
  }

  function handleReset() {
    setPlaced(Array(blankCount).fill(null))
    setBank(chipPool)
    setChecked(false)
    setResults({})
  }

  const score = Object.values(results).filter(Boolean).length
  const allFilled = placed.every((p) => p !== null)

  let bi = 0

  return (
    <div className="space-y-5">
      {contextAudio?.url && (
        <AudioReplayBar
          audioUrl={contextAudio.url}
          transcript={contextAudio.transcript}
          label="Replay audio from previous step"
        />
      )}

      <div>
        <h3 className="text-base font-semibold text-text">✏️ {step.title ?? t.clozeTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.clozeWordBankSubtitle}</p>
      </div>

      {/* Cloze text with tap-to-remove slots */}
      <div className="card p-5 bg-surface">
        <p className="text-sm leading-loose text-text">
          {tokens.map((token, idx) => {
            if (!token.isBlank) return <span key={idx}>{token.text}</span>
            const currentBi = bi++
            const value = placed[currentBi]
            const isCorrect = results[currentBi] === true
            const isWrong = results[currentBi] === false

            return (
              <span key={idx} className="inline-block mx-1 align-middle">
                <motion.button
                  layout
                  onClick={() => handleSlotTap(currentBi)}
                  className={`min-w-[5rem] px-2.5 py-0.5 rounded-lg border text-sm font-medium transition-colors ${
                    checked
                      ? isCorrect
                        ? 'border-success bg-green-50 text-success cursor-default'
                        : 'border-error bg-red-50 text-error cursor-default'
                      : value
                      ? 'border-primary bg-primary-light text-primary cursor-pointer hover:bg-primary/10'
                      : 'border-dashed border-border text-text-muted cursor-default'
                  }`}
                >
                  {value ?? '___'}
                </motion.button>
                {checked && isCorrect && <CheckCircle size={14} className="inline ml-1 text-success" />}
                {checked && isWrong && (
                  <span className="inline-flex items-center gap-1">
                    <XCircle size={14} className="inline ml-1 text-error" />
                    <span className="text-xs text-success font-medium">({token.answer})</span>
                  </span>
                )}
              </span>
            )
          })}
        </p>
      </div>

      {/* Word bank */}
      {!checked && (
        <div>
          <p className="text-xs text-text-muted mb-2">{t.clozeWordBankLabel}</p>
          <div className="flex flex-wrap gap-2">
            {bank.map((chip, i) => (
              <motion.button
                layout
                key={`${chip}-${i}`}
                onClick={() => handleChipTap(chip)}
                className="px-3 py-1.5 rounded-xl border border-border bg-bg text-sm text-text hover:border-primary hover:bg-primary-light hover:text-primary transition-colors"
              >
                {chip}
              </motion.button>
            ))}
            {bank.length === 0 && (
              <span className="text-xs text-text-muted italic">{t.clozeWordBankEmpty}</span>
            )}
          </div>
        </div>
      )}

      {/* Score */}
      {checked && (
        <div className={`card p-4 flex items-center gap-3 ${score === blankCount ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}>
          <span className="text-2xl">{score === blankCount ? '🎉' : '💪'}</span>
          <div>
            <p className="font-semibold text-text">
              {score}/{blankCount} {t.btnCheckQuiz}
            </p>
            <p className="text-sm text-text-muted">
              {score === blankCount ? t.scorePerfectDesc : t.scoreRetryDesc}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {t.btnCheck}
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="btn-secondary flex-1 justify-center">
              {t.btnRetry}
            </button>
            <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
              {t.btnNextCloze} <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Text-Input Mode (original, unchanged) ────────────────────────────────────

function TextInputCloze({ tokens, onComplete, contextAudio, step }: WordBankProps) {
  const { t } = useLang()
  const blanks = tokens.filter((tk) => tk.isBlank)

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

  let bi = 0

  return (
    <div className="space-y-5">
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

      <div className="card p-5 bg-surface">
        <p className="text-sm leading-loose text-text">
          {tokens.map((token, idx) => {
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
          })}
        </p>
      </div>

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
            <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
              {t.btnNextCloze} <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Root export — routes to word-bank or text-input mode ────────────────────

export default function ClozeStep({ step, onComplete, contextAudio }: Props) {
  const rawText = step.config?.clozeText as string | undefined
  const tokens = parseClozeText(rawText ?? EXAMPLE_TEXT)
  const wordBank = step.config?.wordBank === true

  const sharedProps: WordBankProps = { tokens, onComplete, contextAudio, step }

  return wordBank
    ? <WordBankCloze {...sharedProps} />
    : <TextInputCloze {...sharedProps} />
}
