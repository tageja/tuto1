'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronRight, ChevronLeft, ThumbsUp, RefreshCw } from 'lucide-react'
import type { NursedLessonStep, FlashCard } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import SpeakerButton from '@/components/learn/SpeakerButton'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

interface FlashCardConfig {
  cards?: FlashCard[]
  mode?: 'study' | 'sprint'
  sprint_seconds?: number
}

const EXAMPLE_CARDS: FlashCard[] = [
  { front_en: 'Good morning, how can I help you?', back_vi: 'Chào buổi sáng, tôi có thể giúp gì cho bạn?' },
  { front_en: 'Please take a seat.', back_vi: 'Mời bạn ngồi xuống.' },
  { front_en: 'I will take your blood pressure now.', back_vi: 'Bây giờ tôi sẽ đo huyết áp cho bạn.' },
  { front_en: 'Do you have any allergies to medication?', back_vi: 'Bạn có bị dị ứng với thuốc nào không?' },
]

type Rating = 'got_it' | 'still_learning'

// ─── Sprint Mode Component ────────────────────────────────────────────────────

interface SprintProps {
  cards: FlashCard[]
  sprintSeconds: number
  onComplete: () => void
}

function SprintFlashCard({ cards, sprintSeconds, onComplete }: SprintProps) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const [currentIdx, setCurrentIdx]       = useState(0)
  const [timeLeft, setTimeLeft]           = useState(sprintSeconds)
  const [ratings, setRatings]             = useState<Record<number, 'got_it' | 'missed'>>({})
  const [earlyFinish, setEarlyFinish]     = useState(false)
  const [earlySecsLeft, setEarlySecsLeft] = useState(0)
  const [showSummary, setShowSummary]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer
  useEffect(() => {
    if (showSummary || earlyFinish) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setShowSummary(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [showSummary, earlyFinish])

  function handleRate(result: 'got_it' | 'missed') {
    const next = { ...ratings, [currentIdx]: result }
    setRatings(next)
    const nextIdx = currentIdx + 1
    if (nextIdx >= cards.length) {
      clearInterval(intervalRef.current!)
      setEarlySecsLeft(timeLeft)
      setEarlyFinish(true)
    } else {
      setCurrentIdx(nextIdx)
    }
  }

  function handleReset() {
    setCurrentIdx(0)
    setTimeLeft(sprintSeconds)
    setRatings({})
    setEarlyFinish(false)
    setEarlySecsLeft(0)
    setShowSummary(false)
  }

  const seen    = Object.keys(ratings).length
  const gotIt   = Object.values(ratings).filter((r) => r === 'got_it').length
  const timeElapsed = sprintSeconds - timeLeft

  // Countdown ring
  const radius     = 22
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (timeLeft / sprintSeconds)
  const ringColor  = timeLeft <= 5 ? 'text-error' : timeLeft <= 10 ? 'text-warning' : 'text-primary'

  if (earlyFinish || showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="card p-6 text-center space-y-3 bg-green-50 border-success">
          <div className="text-4xl">{earlyFinish ? '🎉' : '⏱️'}</div>
          {earlyFinish && (
            <p className="font-semibold text-text text-base">
              {t.flashCardSprintEarlyFinish.replace('{n}', String(earlySecsLeft))}
            </p>
          )}
          <p className="font-semibold text-text">
            {t.flashCardSprintSummary
              .replace('{got}',  String(gotIt))
              .replace('{seen}', String(Math.max(seen, 1)))
              .replace('{sec}',  String(earlyFinish ? timeElapsed : sprintSeconds))}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} /> {t.flashCardSprintTryAgain}
          </button>
          <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
            {t.flashCardSprintContinue} <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  const card = cards[currentIdx]

  return (
    <div className="space-y-5">
      {/* Timer + progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">
          {currentIdx + 1} / {cards.length}
        </p>
        <div className="flex items-center gap-2">
          <svg width={54} height={54} className="-rotate-90">
            <circle cx={27} cy={27} r={radius} fill="none" stroke="var(--color-border, #e5e7eb)" strokeWidth={4} />
            <circle
              cx={27} cy={27} r={radius}
              fill="none"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={`transition-all ${ringColor}`}
              style={{ stroke: 'currentColor' }}
            />
          </svg>
          <span className={`text-xl font-bold tabular-nums ${ringColor}`}>{timeLeft}</span>
        </div>
      </div>

      {/* Side-by-side card (no flip in sprint) */}
      <div className="card p-5 bg-surface grid grid-cols-2 gap-4 rounded-2xl min-h-[120px]">
        <div className="space-y-1 border-r border-border pr-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">EN</p>
          <p className="text-sm font-medium text-text leading-snug">{card.front_en ?? card.front ?? ''}</p>
          {(card as FlashCard & { audio_url?: string }).audio_url && (
            <SpeakerButton audioUrl={(card as FlashCard & { audio_url?: string }).audio_url} size={14} />
                     )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">VI</p>
          <p className="text-sm font-medium text-text leading-snug">{card.back_vi ?? card.back ?? ''}</p>
        </div>
      </div>

      {/* Knew it / Didn't buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleRate('got_it')}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-success bg-green-50 text-success font-semibold text-sm hover:bg-green-100 transition-colors min-h-[52px]"
        >
          {t.flashCardSprintKnewIt}
        </button>
        <button
          onClick={() => handleRate('missed')}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-warning bg-orange-50 text-warning font-semibold text-sm hover:bg-orange-100 transition-colors min-h-[52px]"
        >
          {t.flashCardSprintDidnt}
        </button>
      </div>
    </div>
  )
}

// ─── Study Mode Component (polished) ─────────────────────────────────────────

interface StudyProps {
  cards: FlashCard[]
  onComplete: () => void
}

function StudyFlashCard({ cards, onComplete }: StudyProps) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped]       = useState(false)
  const [ratings, setRatings]       = useState<Record<number, Rating>>({})
  const [showSummary, setShowSummary] = useState(false)
  const [ratingPulse, setRatingPulse] = useState<Rating | null>(null)
  const dragStarted = useRef(false)

  const card   = cards[currentIdx]
  const isLast = currentIdx === cards.length - 1

  function handleFlip() {
    if (!dragStarted.current) setFlipped((f) => !f)
  }

  function handleRate(rating: Rating) {
    setRatingPulse(rating)
    setTimeout(() => setRatingPulse(null), 300)
    setRatings((prev) => ({ ...prev, [currentIdx]: rating }))
  }

  function handleNext() {
    if (isLast) {
      setShowSummary(true)
    } else {
      setFlipped(false)
      setCurrentIdx((i) => i + 1)
    }
  }

  function handlePrev() {
    setFlipped(false)
    setCurrentIdx((i) => Math.max(0, i - 1))
  }

  function handleRestart() {
    setCurrentIdx(0)
    setFlipped(false)
    setRatings({})
    setShowSummary(false)
  }

  if (showSummary) {
    const gotItCount = Object.values(ratings).filter((r) => r === 'got_it').length
    const total = cards.length
    const allGood = gotItCount === total

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div>
          <h3 className="text-base font-semibold text-text">
            🃏 {t.flashCardTitleFallback}
          </h3>
        </div>
        <div className={`card p-6 text-center space-y-3 ${allGood ? 'bg-green-50 border-success' : 'bg-surface'}`}>
          <div className="text-4xl">{allGood ? '🎉' : '💪'}</div>
          <p className="font-semibold text-text text-base">
            {t.flashCardSummary
              .replace('{got}', String(gotItCount))
              .replace('{total}', String(total))}
          </p>
          {!allGood && (
            <p className="text-sm text-text-muted">{t.scoreRetryDesc}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={handleRestart} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} /> {t.btnRetry}
          </button>
          <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
            {t.btnFinish} <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  const nextCard = currentIdx < cards.length - 1 ? cards[currentIdx + 1] : null
  const cardAudioUrl = (card as FlashCard & { audio_url?: string }).audio_url

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          🃏 {t.flashCardTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.flashCardSubtitle}</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {cards.map((_, i) => {
          const rated = ratings[i]
          return (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? 'w-6 bg-primary'
                  : rated === 'got_it'
                  ? 'w-1.5 bg-success'
                  : rated === 'still_learning'
                  ? 'w-1.5 bg-warning'
                  : 'w-1.5 bg-border'
              }`}
            />
          )
        })}
      </div>

      {/* Card stack + 3D flip */}
      <div className="relative" style={{ minHeight: '280px' }}>
        {/* Next card peeking behind (visual depth) */}
        {nextCard && (
          <div
            className="absolute inset-x-0 rounded-3xl border border-border bg-surface"
            style={{
              top: 8,
              bottom: -8,
              transform: 'scaleX(0.96)',
              opacity: 0.45,
              zIndex: 0,
            }}
          />
        )}

        {/* Flip area — drag to swipe, click to flip */}
        <motion.div
          drag={shouldReduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.05, right: 0.05 }}
          onDragStart={() => { dragStarted.current = true }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) handleNext()
            else if (info.offset.x > 80) handlePrev()
            // Reset after the synthetic click event fires
            setTimeout(() => { dragStarted.current = false }, 50)
          }}
          onClick={handleFlip}
          style={{ perspective: '1000px', position: 'relative', zIndex: 1 }}
          className="cursor-pointer select-none"
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '280px' }}
          >
            {/* Front face — English */}
            <div
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface p-6 text-center shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                English
              </span>
              <p className="text-base font-medium text-text leading-relaxed">
                {card.front_en ?? card.front ?? ''}
              </p>
              <span className="text-xs text-text-muted">{t.flashCardTapToFlip}</span>

              {/* Speaker icon — stop propagation so it doesn't flip the card */}
              {cardAudioUrl && (
                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                  <SpeakerButton audioUrl={cardAudioUrl} size={18} />
                </div>
              )}
            </div>

            {/* Back face — Vietnamese */}
            <div
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-light to-primary/5 p-6 text-center shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Tiếng Việt
              </span>
              <p className="text-base font-medium text-text leading-relaxed">
                {card.back_vi ?? card.back ?? ''}
              </p>
              <span className="text-xs text-text-muted">{t.flashCardTapToFlipBack}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Self-rating chips — shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 justify-center"
          >
            <motion.button
              onClick={() => handleRate('got_it')}
              animate={
                ratingPulse === 'got_it' && !shouldReduceMotion
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors min-h-[44px] ${
                ratings[currentIdx] === 'got_it'
                  ? 'border-success bg-green-50 text-success'
                  : 'border-border bg-surface text-text-muted hover:border-success hover:text-success'
              }`}
            >
              <ThumbsUp size={14} /> {t.flashCardGotIt}
            </motion.button>
            <motion.button
              onClick={() => handleRate('still_learning')}
              animate={
                ratingPulse === 'still_learning' && !shouldReduceMotion
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors min-h-[44px] ${
                ratings[currentIdx] === 'still_learning'
                  ? 'border-warning bg-orange-50 text-warning'
                  : 'border-border bg-surface text-text-muted hover:border-warning hover:text-warning'
              }`}
            >
              <RefreshCw size={14} /> {t.flashCardStillLearning}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> {t.btnPrev}
        </button>
        <button
          onClick={handleNext}
          className="btn-primary flex-1 justify-center flex items-center gap-2"
        >
          {isLast ? t.btnFinish : t.btnNext} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Root export — branches on mode ──────────────────────────────────────────

export default function FlashCardStep({ step, onComplete }: Props) {
  const config = (step.config ?? {}) as FlashCardConfig
  const cards  = config.cards ?? EXAMPLE_CARDS
  const mode   = config.mode ?? 'study'

  if (mode === 'sprint') {
    const sprintSeconds = config.sprint_seconds ?? 30
    return <SprintFlashCard cards={cards} sprintSeconds={sprintSeconds} onComplete={onComplete} />
  }

  return <StudyFlashCard cards={cards} onComplete={onComplete} />
}
