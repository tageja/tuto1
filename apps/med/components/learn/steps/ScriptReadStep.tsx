'use client'

import { ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface ScriptLine {
  role: 'nurse' | 'patient'
  text: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_LINES: ScriptLine[] = [
  { role: 'nurse', text: 'Hello, I\'m Nurse Lan. How can I help you today?' },
  { role: 'patient', text: 'I have a headache and I feel very tired.' },
  { role: 'nurse', text: 'I see. How long have you had these symptoms?' },
  { role: 'patient', text: 'Since yesterday morning.' },
  { role: 'nurse', text: 'Okay, let me take your temperature and blood pressure.' },
]

export default function ScriptReadStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const rawLines = step.config?.lines as ScriptLine[] | undefined
  const lines = rawLines && rawLines.length > 0 ? rawLines : EXAMPLE_LINES

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">📖 {step.title ?? t.scriptTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.scriptSubtitle}</p>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          {t.legendNurse}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-text-muted inline-block" />
          {t.legendPatient}
        </span>
      </div>

      {/* Script */}
      <div className="space-y-3">
        {lines.map((line, idx) => {
          const isNurse = line.role === 'nurse'
          return (
            <div
              key={idx}
              className={`flex ${isNurse ? 'flex-row' : 'flex-row-reverse'} items-start gap-3`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  isNurse ? 'bg-primary' : 'bg-text-muted'
                }`}
              >
                {isNurse ? t.roleNurseShort : t.rolePatientShort}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  isNurse
                    ? 'bg-primary-light text-primary rounded-tl-none'
                    : 'bg-surface text-text rounded-tr-none'
                }`}
              >
                <span className={`text-xs font-semibold block mb-1 ${isNurse ? 'text-primary' : 'text-text-muted'}`}>
                  {isNurse ? t.roleNurseLabel : t.rolePatientLabel}
                </span>
                {line.text}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={onComplete} className="btn-primary w-full justify-center">
        <ChevronRight size={16} />
        {t.btnDoneReading}
      </button>
    </div>
  )
}
