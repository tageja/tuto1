'use client'

import { useState } from 'react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

export default function MissionStep({ step, onComplete }: Props) {
  const { t } = useLang()

  const RESPONSES = [
    { icon: '✅', label: t.responseDone, color: 'border-success bg-green-50 text-success' },
    { icon: '📅', label: t.responseLater, color: 'border-warning bg-yellow-50 text-yellow-700' },
    { icon: '❌', label: t.responseCannot, color: 'border-border bg-surface text-text-muted' },
  ]

  const mission =
    (step.config?.missionVi as string) ??
    (step.config?.missionEn as string) ??
    t.exampleMission

  const [notes, setNotes] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (label: string) => {
    setSelected(label)
    setTimeout(() => onComplete(), 600)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">🎯 {step.title ?? t.missionTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.missionSubtitle}</p>
      </div>

      {/* Mission card */}
      <div className="card p-6 bg-gradient-to-br from-primary-light to-white border-primary/20">
        <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">{t.missionCardLabel}</p>
        <p className="text-text leading-relaxed">{mission}</p>
      </div>

      {/* Response buttons */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-text">{t.questionDone}</p>
        <div className="grid grid-cols-1 gap-2">
          {RESPONSES.map((res) => (
            <button
              key={res.label}
              onClick={() => handleSelect(res.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left font-medium ${
                selected === res.label ? res.color : 'border-border bg-bg text-text hover:bg-surface'
              }`}
            >
              <span className="text-xl">{res.icon}</span>
              <span>{res.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">{t.labelNotes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className="input resize-none"
        />
      </div>

      {selected && (
        <div className="badge badge-green text-sm px-3 py-1.5 w-full justify-center">
          {t.feedbackRecorded}
        </div>
      )}
    </div>
  )
}
