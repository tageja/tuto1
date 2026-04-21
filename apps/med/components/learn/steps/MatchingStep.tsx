'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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

interface LineCoords {
  x1: number
  y1: number
  x2: number
  y2: number
}

export default function MatchingStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const pairs = (step.config?.pairs as MatchingPair[] | undefined) ?? EXAMPLE_PAIRS

  const leftOrder  = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs])
  const rightOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs])

  const [selectedLeft, setSelectedLeft]   = useState<number | null>(null)
  const [matched, setMatched]             = useState<Set<number>>(new Set())
  const [wrongPair, setWrongPair]         = useState<[number, number] | null>(null)
  const [done, setDone]                   = useState(false)
  const [, forceUpdate]                   = useState(0)

  // Refs for coordinate computation
  const containerRef = useRef<HTMLDivElement>(null)
  const leftRefs     = useRef<Record<number, HTMLButtonElement | null>>({})
  const rightRefs    = useRef<Record<number, HTMLButtonElement | null>>({})

  // Recompute lines on window resize
  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Clear wrong flash
  useEffect(() => {
    if (!wrongPair) return
    const id = setTimeout(() => setWrongPair(null), 800)
    return () => clearTimeout(id)
  }, [wrongPair])

  function getLineCoords(leftOrigIdx: number, rightOrigIdx: number): LineCoords | null {
    const container = containerRef.current
    const leftEl    = leftRefs.current[leftOrigIdx]
    const rightEl   = rightRefs.current[rightOrigIdx]
    if (!container || !leftEl || !rightEl) return null

    const cr = container.getBoundingClientRect()
    const lr = leftEl.getBoundingClientRect()
    const rr = rightEl.getBoundingClientRect()

    return {
      x1: lr.right  - cr.left,
      y1: lr.top + lr.height / 2 - cr.top,
      x2: rr.left   - cr.left,
      y2: rr.top + rr.height / 2 - cr.top,
    }
  }

  function getStubCoords(): { x1: number; y1: number; x2: number } | null {
    if (selectedLeft === null) return null
    const container = containerRef.current
    const leftEl    = leftRefs.current[selectedLeft]
    if (!container || !leftEl) return null

    const cr = container.getBoundingClientRect()
    const lr = leftEl.getBoundingClientRect()
    return {
      x1: lr.right - cr.left,
      y1: lr.top + lr.height / 2 - cr.top,
      x2: lr.right - cr.left + 32,
    }
  }

  const setLeftRef = useCallback((origIdx: number) => (el: HTMLButtonElement | null) => {
    leftRefs.current[origIdx] = el
  }, [])

  const setRightRef = useCallback((origIdx: number) => (el: HTMLButtonElement | null) => {
    rightRefs.current[origIdx] = el
  }, [])

  function handleLeftTap(origIdx: number) {
    if (matched.has(origIdx)) return
    setSelectedLeft(origIdx === selectedLeft ? null : origIdx)
  }

  function handleRightTap(origIdx: number) {
    if (matched.has(origIdx)) return
    if (selectedLeft === null) return

    if (selectedLeft === origIdx) {
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

  const matchedList = [...matched]
  const stub = getStubCoords()

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

      {/* Two-column matching grid with SVG overlay */}
      <div ref={containerRef} className="relative">
        {/* SVG connector lines — rendered absolutely over the grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible', zIndex: 10 }}
          aria-hidden="true"
        >
          {/* Matched pair lines */}
          {matchedList.map((origIdx) => {
            const coords = getLineCoords(origIdx, origIdx)
            if (!coords) return null
            const { x1, y1, x2, y2 } = coords
            const cx = x1 + (x2 - x1) / 2
            return (
              <motion.path
                key={origIdx}
                d={`M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`}
                stroke="var(--color-success, #22c55e)"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            )
          })}

          {/* Dashed stub when a left card is selected but not yet matched */}
          {stub && !matched.has(selectedLeft!) && (
            <line
              x1={stub.x1}
              y1={stub.y1}
              x2={stub.x2}
              y2={stub.y1}
              stroke="var(--color-primary, #0B5FFF)"
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={0.6}
            />
          )}
        </svg>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Left column — English */}
          <div className="space-y-2">
            {leftOrder.map((origIdx) => (
              <motion.button
                key={origIdx}
                ref={setLeftRef(origIdx)}
                onClick={() => handleLeftTap(origIdx)}
                animate={
                  wrongPair?.[0] === origIdx
                    ? shouldReduceMotion ? {} : { x: [-4, 4, -4, 4, 0] }
                    : matched.has(origIdx)
                    ? shouldReduceMotion ? {} : { scale: [1, 1.04, 1] }
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
                ref={setRightRef(origIdx)}
                onClick={() => handleRightTap(origIdx)}
                animate={
                  wrongPair?.[1] === origIdx
                    ? shouldReduceMotion ? {} : { x: [-4, 4, -4, 4, 0] }
                    : matched.has(origIdx)
                    ? shouldReduceMotion ? {} : { scale: [1, 1.04, 1] }
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
      </div>

      {/* Instruction hint */}
      {!done && (
        <p className="text-xs text-text-muted text-center">
          {selectedLeft !== null ? t.matchingConnectingLine : t.matchingHint}
        </p>
      )}

      {/* Completion banner */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: [1, 1.02, 1] }
            }
            transition={{ duration: 0.4 }}
            className="card p-4 flex items-center gap-3 bg-green-50 border-success"
          >
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-text">{t.matchingAllMatched}</p>
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
