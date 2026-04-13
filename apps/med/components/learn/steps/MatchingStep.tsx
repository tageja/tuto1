'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, RotateCcw } from 'lucide-react'
import type { NursedLessonStep, MatchingPair } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_PAIRS: MatchingPair[] = [
  { en: 'Good morning, how can I help you?', vi: 'Chào buổi sáng, tôi có thể giúp gì cho bạn?' },
  { en: 'Please take a seat.', vi: 'Mời bạn ngồi xuống.' },
  { en: 'I will check your blood pressure.', vi: 'Tôi sẽ đo huyết áp cho bạn.' },
  { en: 'Do you have any allergies?', vi: 'Bạn có bị dị ứng gì không?' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchingStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const pairs = (step.config?.pairs as MatchingPair[] | undefined) ?? EXAMPLE_PAIRS

  // shuffled index arrays — original pair index at each position
  const leftOrder  = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs])
  const rightOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs])

  const [selectedLeft, setSelectedLeft]   = useState<number | null>(null) // original index
  const [matched, setMatched]             = useState<Set<number>>(new Set())
  const [wrongPair, setWrongPair]         = useState<[number, number] | null>(null) // [leftOrig, rightOrig]
  const [done, setDone]                   = useState(false)

  // Clear wrong flash after 800ms
  useEffect(() => {
    if (!wrongPair) return
    const id = setTimeout(() => setWrongPair(null), 800)
    return () => clearTimeout(id)
  }, [wrongPair])

  function handleLeftTap(origIdx: number) {
    if (matched.has(origIdx)) return
    setSelectedLeft(origIdx === selectedLeft ? null : origIdx)
  }

  function handleRightTap(origIdx: number) {
    if (matched.has(origIdx)) return
    if (selectedLeft === null) return

    if (selectedLeft === origIdx) {
      // correct match (same original index = same pair)
      const next = new Set(matched)
      next.add(origIdx)
      setMatched(next)
      setSelectedLeft(null)
      if (next.size === pairs.length) setDone(true)
    } else {
      setWrongPair([selectedLeft, origIdx])
      setSelectedLeft(null)
    }
  }

  function handleReset() {
    setMatched(new Set())
    setSelectedLeft(null)
    setWrongPair(null)
    setDone(false)
  }

  function cardClass(origIdx: number, side: 'left' | 'right') {
    if (matched.has(origIdx))
      return 'border-success bg-green-50 text-success'
    const isWrong = wrongPair &&
      (side === 'left' ? wrongPair[0] === origIdx : wrongPair[1] === origIdx)
    if (isWrong)
      return 'border-error bg-red-50 text-error'
    if (side === 'left' && selectedLeft === origIdx)
      return 'border-primary bg-primary-light text-primary'
    return 'border-border bg-surface text-text hover:border-primary/60 cursor-pointer'
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          🔗 {step.title ?? t.matchingTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.matchingSubtitle}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {pairs.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                matched.has(i) ? 'bg-success' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-text-muted tabular-nums">
          {matched.size}/{pairs.length}
        </span>
      </div>

      {/* Two-column matching grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left column — English */}
        <div className="space-y-2">
          {leftOrder.map((origIdx) => (
            <motion.button
              key={origIdx}
              onClick={() => handleLeftTap(origIdx)}
              animate={
                wrongPair?.[0] === origIdx
                  ? { x: [-4, 4, -4, 4, 0] }
                  : matched.has(origIdx)
                  ? { scale: [1, 1.04, 1] }
                  : {}
              }
              transition={{ duration: 0.35 }}
              disabled={matched.has(origIdx)}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-colors font-medium leading-snug ${cardClass(origIdx, 'left')}`}
            >
              {matched.has(origIdx) && (
                <CheckCircle size={12} className="inline mr-1 mb-0.5" />
              )}
              {pairs[origIdx].en}
            </motion.button>
          ))}
        </div>

        {/* Right column — Vietnamese */}
        <div className="space-y-2">
          {rightOrder.map((origIdx) => (
            <motion.button
              key={origIdx}
              onClick={() => handleRightTap(origIdx)}
              animate={
                wrongPair?.[1] === origIdx
                  ? { x: [-4, 4, -4, 4, 0] }
                  : matched.has(origIdx)
                  ? { scale: [1, 1.04, 1] }
                  : {}
              }
              transition={{ duration: 0.35 }}
              disabled={matched.has(origIdx)}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-colors leading-snug ${cardClass(origIdx, 'right')}`}
            >
              {matched.has(origIdx) && (
                <CheckCircle size={12} className="inline mr-1 mb-0.5" />
              )}
              {pairs[origIdx].vi}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instruction hint */}
      {!done && matched.size === 0 && (
        <p className="text-xs text-text-muted text-center">{t.matchingHint}</p>
      )}

      {/* Completion banner */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 flex items-center gap-3 bg-green-50 border-success"
          >
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-text">
                {t.matchingAllMatched}
              </p>
              <p className="text-sm text-text-muted">
                {t.matchingScore
                  .replace('{matched}', String(matched.size))
                  .replace('{total}', String(pairs.length))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
          <RotateCcw size={15} />
          {t.btnRetry}
        </button>
        <button
          onClick={onComplete}
          disabled={!done}
          className="btn-primary flex-1 justify-center flex items-center gap-2 disabled:opacity-40"
        >
          {t.btnNext} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
