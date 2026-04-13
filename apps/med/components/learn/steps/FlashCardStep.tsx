'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
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

export default function FlashCardStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const cards = (step.config?.cards as FlashCard[] | undefined) ?? EXAMPLE_CARDS

  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = cards[currentIdx]
  const isLast = currentIdx === cards.length - 1

  function handleNext() {
    if (isLast) {
      onComplete()
    } else {
      setFlipped(false)
      setCurrentIdx((i) => i + 1)
    }
  }

  function handlePrev() {
    setFlipped(false)
    setCurrentIdx((i) => Math.max(0, i - 1))
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          🃏 {step.title ?? t.flashCardTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.flashCardSubtitle}</p>
      </div>

      {/* Coming-soon banner */}
      <div className="rounded-xl border border-primary/30 bg-primary-light px-4 py-3 text-sm text-primary font-medium">
        {t.flashCardComingSoon}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIdx ? 'w-6 bg-primary' : 'w-1.5 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Static card preview — flip animation added in Phase 2 */}
      <div
        className="cursor-pointer rounded-2xl border border-border bg-surface min-h-[160px] flex flex-col items-center justify-center p-6 text-center gap-3 select-none"
        onClick={() => setFlipped((f) => !f)}
      >
        {!flipped ? (
          <>
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">English</span>
            <p className="text-base font-medium text-text">{card.front_en}</p>
            <span className="text-xs text-text-muted">{t.flashCardTapToFlip}</span>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Tiếng Việt</span>
            <p className="text-base font-medium text-text">{card.back_vi}</p>
            <span className="text-xs text-text-muted">{t.flashCardTapToFlipBack}</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> {t.btnPrev}
        </button>
        <button onClick={handleNext} className="btn-primary flex-1 justify-center flex items-center gap-2">
          {isLast ? t.btnFinish : t.btnNext} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
