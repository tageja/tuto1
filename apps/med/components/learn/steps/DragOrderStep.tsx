'use client'

import { ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_LINES: string[] = [
  'Nurse: Good morning. My name is Lan. How can I help you today?',
  'Patient: Good morning. I have a bad headache and feel dizzy.',
  'Nurse: I see. How long have you had these symptoms?',
  'Patient: Since yesterday evening.',
  'Nurse: Let me check your blood pressure and temperature first.',
]

export default function DragOrderStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const lines = (step.config?.lines as string[] | undefined) ?? EXAMPLE_LINES

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          ↕️ {step.title ?? t.dragOrderTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.dragOrderSubtitle}</p>
      </div>

      {/* Coming-soon banner */}
      <div className="rounded-xl border border-primary/30 bg-primary-light px-4 py-3 text-sm text-primary font-medium">
        {t.dragOrderComingSoon}
      </div>

      {/* Static preview of lines in correct order */}
      <ol className="space-y-2 list-none">
        {lines.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-bold text-text-muted">
              {i + 1}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>

      <button onClick={onComplete} className="btn-secondary w-full justify-center flex items-center gap-2">
        {t.btnSkipExercise} <ChevronRight size={16} />
      </button>
    </div>
  )
}
