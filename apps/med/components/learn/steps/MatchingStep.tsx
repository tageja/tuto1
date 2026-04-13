'use client'

import { ChevronRight } from 'lucide-react'
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

export default function MatchingStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const pairs = (step.config?.pairs as MatchingPair[] | undefined) ?? EXAMPLE_PAIRS

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          🔗 {step.title ?? t.matchingTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.matchingSubtitle}</p>
      </div>

      {/* Coming-soon banner */}
      <div className="rounded-xl border border-primary/30 bg-primary-light px-4 py-3 text-sm text-primary font-medium">
        {t.matchingComingSoon}
      </div>

      {/* Static preview of pairs so admin/content team can verify data */}
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          >
            <span className="text-text font-medium">{pair.en}</span>
            <span className="text-text-muted">{pair.vi}</span>
          </div>
        ))}
      </div>

      <button onClick={onComplete} className="btn-secondary w-full justify-center flex items-center gap-2">
        {t.btnSkipExercise} <ChevronRight size={16} />
      </button>
    </div>
  )
}
