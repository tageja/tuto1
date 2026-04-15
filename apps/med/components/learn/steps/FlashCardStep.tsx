'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, ThumbsUp, RefreshCw } from 'lucide-react'
import type { NursedLessonStep, FlashCard } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_CARDS: FlashCard[] = [
  { front_en: 'Good morning, how can I help you?', back_vi: 'Chào buổi sáng, tôi có thể giúp gì cho bạn?' },
  { front_en: 'Please take a seat.', back_vi: 'Mời bạn ngồi xuống.' },
  { front_en: 'I will take your blood pressure now.', back_vi: 'Bây giờ tôi sẽ đo huyết áp cho bạn.' },
  { front_en: 'Do you have any allergies to medication?', back_vi: 'Bạn có bị dị ứng với thuốc nào không?' },
]

type Rating = 'got_it' | 'still_learning'

export default function FlashCardStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const cards = (step.config?.cards as FlashCard[] | undefined) ?? EXAMPLE_CARDS

  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratings, setRatings] = useState<Record<number, Rating>>({})
  const [showSummary, setShowSummary] = useState(false)

  const card = cards[currentIdx]
  const isLast = currentIdx === cards.length - 1

  function handleFlip() {
    setFlipped((f) => !f)
  }

  function handleRate(rating: Rating) {
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
            🃏 {step.title ?? t.flashCardTitleFallback}
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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          🃏 {step.title ?? t.flashCardTitleFallback}
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

      {/* 3D flip card */}
      <div
        style={{ perspective: '1000px' }}
        className="cursor-pointer select-none"
        onClick={handleFlip}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '180px' }}
        >
          {/* Front face — English */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              English
            </span>
            <p className="text-base font-medium text-text leading-relaxed">
              {card.front_en}
            </p>
            <span className="text-xs text-text-muted">{t.flashCardTapToFlip}</span>
          </div>

          {/* Back face — Vietnamese (rotated 180deg, scaleX flips text back to readable) */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-primary-light p-6 text-center"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Tiếng Việt
            </span>
            <p className="text-base font-medium text-text leading-relaxed">
              {card.back_vi}
            </p>
            <span className="text-xs text-text-muted">{t.flashCardTapToFlipBack}</span>
          </div>
        </motion.div>
      </div>

      {/* Self-rating chips — shown after card is flipped */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 justify-center"
          >
            <button
              onClick={() => handleRate('got_it')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                ratings[currentIdx] === 'got_it'
                  ? 'border-success bg-green-50 text-success'
                  : 'border-border bg-surface text-text-muted hover:border-success hover:text-success'
              }`}
            >
              <ThumbsUp size={14} /> {t.flashCardGotIt}
            </button>
            <button
              onClick={() => handleRate('still_learning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                ratings[currentIdx] === 'still_learning'
                  ? 'border-warning bg-orange-50 text-warning'
                  : 'border-border bg-surface text-text-muted hover:border-warning hover:text-warning'
              }`}
            >
              <RefreshCw size={14} /> {t.flashCardStillLearning}
            </button>
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
