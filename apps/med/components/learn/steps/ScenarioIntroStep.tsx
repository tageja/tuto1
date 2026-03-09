'use client'

import { useState } from 'react'
import { ChevronRight, Volume2 } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface KeyPhrase {
  en: string
  vi: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

export default function ScenarioIntroStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const [audioPlayed, setAudioPlayed] = useState(false)

  const context =
    lang === 'vi'
      ? ((step.config?.context_vi as string) ?? (step.config?.context_en as string) ?? '')
      : ((step.config?.context_en as string) ?? '')

  const setting =
    lang === 'vi'
      ? ((step.config?.setting_vi as string) ?? (step.config?.setting_en as string) ?? '')
      : ((step.config?.setting_en as string) ?? '')

  const keyPhrases = (step.config?.key_phrases as KeyPhrase[]) ?? []
  const audioUrl = step.config?.audio_url as string | undefined
  const hasRealAudio = audioUrl && audioUrl !== 'PLACEHOLDER'

  const handleAudioPlay = () => {
    if (hasRealAudio) {
      const audio = new Audio(audioUrl)
      audio.play().catch(() => null)
    }
    setAudioPlayed(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text">
          🏥 {step.title ?? t.scenarioIntroTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.scenarioIntroSubtitle}</p>
      </div>

      {/* Setting badge */}
      {setting && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-sm font-medium">
          <span>📍</span>
          <span>{setting}</span>
        </div>
      )}

      {/* Scenario context card */}
      <div className="card p-5 bg-gradient-to-br from-red-50 via-white to-blue-50 border-red-100">
        <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
          {t.scenarioLabel}
        </p>
        <p className="text-text leading-relaxed text-[15px]">{context}</p>

        {/* Audio preview button */}
        {audioUrl && (
          <button
            onClick={handleAudioPlay}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              audioPlayed
                ? 'border-success bg-green-50 text-success'
                : 'border-primary bg-primary-light text-primary hover:bg-primary hover:text-white'
            }`}
          >
            <Volume2 size={16} />
            {hasRealAudio
              ? audioPlayed
                ? t.audioPlayedLabel
                : t.btnListenScenario
              : t.audioPlaceholderLabel}
          </button>
        )}
      </div>

      {/* Key phrases */}
      {keyPhrases.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text mb-3">{t.keyPhrasesLabel}</p>
          <div className="grid gap-2">
            {keyPhrases.map((phrase, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface border border-border"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-text text-sm">{phrase.en}</p>
                  <p className="text-text-muted text-xs mt-0.5">{phrase.vi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objective note */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-amber-800 text-sm">
          <span className="font-semibold">💡 {t.scenarioObjectiveLabel}: </span>
          {t.scenarioObjectiveHint}
        </p>
      </div>

      {/* CTA */}
      <button onClick={onComplete} className="btn-primary w-full justify-center">
        {t.btnScenarioReady}
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
