'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface ReflectionPrompt {
  key: string
  label_en: string
  label_vi: string
  type: 'slider' | 'text'
}

const DEFAULT_PROMPTS: ReflectionPrompt[] = [
  {
    key: 'confidence',
    label_en: 'How confident do you feel using this language with a foreign patient now?',
    label_vi: 'Bạn cảm thấy tự tin sử dụng ngôn ngữ này với bệnh nhân nước ngoài chưa?',
    type: 'slider',
  },
  {
    key: 'usefulness',
    label_en: 'How useful was this module for your real work?',
    label_vi: 'Module này có hữu ích cho công việc thực tế của bạn không?',
    type: 'slider',
  },
  {
    key: 'difficulty',
    label_en: 'How difficult was this module overall?',
    label_vi: 'Module này khó ở mức độ nào?',
    type: 'slider',
  },
  {
    key: 'pair_helped',
    label_en: 'Did the pair practice help you speak more naturally?',
    label_vi: 'Luyện tập cặp đôi có giúp bạn nói tự nhiên hơn không?',
    type: 'slider',
  },
  {
    key: 'open_feedback',
    label_en: 'Which task in this module felt most useful for your real work?',
    label_vi: 'Bài tập nào trong module này bạn thấy hữu ích nhất cho công việc thực tế?',
    type: 'text',
  },
]

const EMOJI_SCALE = ['😰', '😕', '😐', '🙂', '😊']
const LABELS_EN = ['Very Hard', 'Hard', 'OK', 'Good', 'Easy']
const LABELS_VI = ['Rất khó', 'Khó', 'Bình thường', 'Tốt', 'Dễ']

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

export default function SelfReflectionStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()

  const prompts = (step.config?.prompts as ReflectionPrompt[]) ?? DEFAULT_PROMPTS
  const sliderPrompts = prompts.filter((p) => p.type === 'slider')
  const textPrompts = prompts.filter((p) => p.type === 'text')

  const [sliderValues, setSliderValues] = useState<Record<string, number>>(
    Object.fromEntries(sliderPrompts.map((p) => [p.key, 3])),
  )
  const [textValues, setTextValues] = useState<Record<string, string>>(
    Object.fromEntries(textPrompts.map((p) => [p.key, ''])),
  )
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => onComplete(), 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <CheckCircle className="text-success" size={56} />
        <h3 className="text-lg font-semibold text-text">{t.reflectionSubmittedTitle}</h3>
        <p className="text-text-muted text-sm max-w-xs">{t.reflectionSubmittedDesc}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text">
          💭 {step.title ?? t.reflectionTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.reflectionSubtitle}</p>
      </div>

      {/* Slider prompts */}
      {sliderPrompts.map((prompt) => {
        const val = sliderValues[prompt.key] ?? 3
        return (
          <div key={prompt.key} className="card p-4 space-y-3">
            <p className="text-sm font-medium text-text">
              {lang === 'vi' ? prompt.label_vi : prompt.label_en}
            </p>

            {/* Emoji scale */}
            <div className="flex items-center justify-between gap-1">
              {EMOJI_SCALE.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setSliderValues((prev) => ({ ...prev, [prompt.key]: i + 1 }))}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all text-xl ${
                    val === i + 1
                      ? 'border-primary bg-primary-light scale-110'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] text-text-muted leading-tight text-center">
                    {lang === 'vi' ? LABELS_VI[i] : LABELS_EN[i]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Text prompts */}
      {textPrompts.map((prompt) => (
        <div key={prompt.key} className="space-y-2">
          <label className="label">
            {lang === 'vi' ? prompt.label_vi : prompt.label_en}
          </label>
          <textarea
            value={textValues[prompt.key] ?? ''}
            onChange={(e) =>
              setTextValues((prev) => ({ ...prev, [prompt.key]: e.target.value }))
            }
            placeholder={t.reflectionTextPlaceholder}
            rows={3}
            className="input resize-none"
          />
        </div>
      ))}

      {/* Summary preview */}
      <div className="rounded-xl bg-primary-light border border-primary/20 px-4 py-3 space-y-1">
        <p className="text-primary text-xs font-semibold uppercase tracking-wider">
          {t.reflectionSummaryLabel}
        </p>
        {sliderPrompts.map((p) => (
          <div key={p.key} className="flex items-center justify-between text-sm">
            <span className="text-text-muted text-xs">
              {lang === 'vi' ? p.label_vi.slice(0, 35) + '…' : p.label_en.slice(0, 35) + '…'}
            </span>
            <span className="font-semibold text-primary">
              {EMOJI_SCALE[(sliderValues[p.key] ?? 3) - 1]}{' '}
              {sliderValues[p.key]}/5
            </span>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} className="btn-primary w-full justify-center">
        {t.btnSubmitReflection}
      </button>
    </div>
  )
}
