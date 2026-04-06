'use client'

import { useState } from 'react'
import { ChevronRight, Volume2 } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import TranslatablePhrase from '@/components/learn/TranslatablePhrase'
import SpeakerButton from '@/components/learn/SpeakerButton'


interface KeyPhrase {
  en: string
  vi: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

// Map scene settings to emoji + gradient
function getSceneStyle(setting: string): { emoji: string; grad: string; dot: string } {
  const s = setting.toLowerCase()
  if (s.includes('triage')) return { emoji: '🚨', grad: 'from-red-50 to-orange-50', dot: 'bg-red-500' }
  if (s.includes('trauma') || s.includes('resus')) return { emoji: '⚡', grad: 'from-red-50 to-rose-50', dot: 'bg-rose-500' }
  if (s.includes('icu') || s.includes('intensive')) return { emoji: '🫀', grad: 'from-blue-50 to-indigo-50', dot: 'bg-blue-600' }
  if (s.includes('ward') || s.includes('corridor')) return { emoji: '🏥', grad: 'from-blue-50 to-sky-50', dot: 'bg-blue-500' }
  if (s.includes('a&e') || s.includes('emergency')) return { emoji: '🚑', grad: 'from-amber-50 to-orange-50', dot: 'bg-amber-500' }
  if (s.includes('station') || s.includes('nurse')) return { emoji: '📋', grad: 'from-purple-50 to-violet-50', dot: 'bg-purple-500' }
  if (s.includes('relatives') || s.includes('family') || s.includes('quiet')) return { emoji: '🤝', grad: 'from-emerald-50 to-teal-50', dot: 'bg-emerald-500' }
  if (s.includes('post') || s.includes('recovery')) return { emoji: '💊', grad: 'from-green-50 to-emerald-50', dot: 'bg-green-500' }
  if (s.includes('staff') || s.includes('office')) return { emoji: '☕', grad: 'from-stone-50 to-slate-50', dot: 'bg-stone-500' }
  return { emoji: '🏥', grad: 'from-blue-50 to-indigo-50', dot: 'bg-blue-500' }
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

  const sceneStyle = getSceneStyle(setting)

  const handleAudioPlay = () => {
    if (hasRealAudio) {
      const audio = new Audio(audioUrl)
      audio.play().catch(() => null)
    }
    setAudioPlayed(true)
  }

  return (
    <div className="space-y-4">
      {/* Animated scene card header */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${sceneStyle.grad} border border-white shadow-sm animate-[stepEnter_0.4s_ease_both]`}
      >
        {/* Decorative background pulse */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${sceneStyle.dot} opacity-10 blur-2xl`} />
        <div className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full ${sceneStyle.dot} opacity-10 blur-xl`} />

        <div className="relative px-5 py-4">
          {/* Top row: emoji + label */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{sceneStyle.emoji}</span>
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  {t.scenarioLabel}
                </p>
                <h3 className="text-base font-bold text-text leading-snug">
                  {step.title ?? t.scenarioIntroTitleFallback}
                </h3>
              </div>
            </div>
          </div>

          {/* Setting badge */}
          {setting && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/60 bg-white/50 text-xs font-medium text-text-muted backdrop-blur-sm mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${sceneStyle.dot} animate-pulse`} />
              <span>📍 {setting}</span>
            </div>
          )}

          {/* Context text — hover shows Vietnamese translation */}
          <TranslatablePhrase
            as="p"
            en={step.config?.context_en as string ?? context}
            vi={step.config?.context_vi as string | undefined}
            className="text-sm text-text leading-relaxed"
          />

          {/* Audio button */}
          {audioUrl && (
            <button
              onClick={handleAudioPlay}
              className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                !hasRealAudio
                  ? 'border-border bg-white/60 text-text-muted cursor-default'
                  : audioPlayed
                  ? 'border-success bg-green-50 text-success'
                  : 'border-primary/30 bg-white/70 text-primary hover:bg-primary hover:text-white'
              }`}
            >
              <Volume2 size={15} />
              {hasRealAudio
                ? audioPlayed ? t.audioPlayedLabel : t.btnListenScenario
                : t.audioPlaceholderLabel}
            </button>
          )}
        </div>
      </div>

      {/* Key phrases */}
      {keyPhrases.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text mb-2">{t.keyPhrasesLabel}</p>
          <div className="grid gap-2">
            {keyPhrases.map((phrase, i) => {
              const phraseAudioUrl = (step.config as Record<string, unknown> | null)?.[`key_phrase_${i}_audioUrl`] as string | undefined
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-border shadow-sm"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text text-sm">
                      <TranslatablePhrase en={phrase.en} vi={phrase.vi} />
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">{phrase.vi}</p>
                  </div>
                  {phraseAudioUrl && (
                    <SpeakerButton audioUrl={phraseAudioUrl} size={15} />
                  )}
                </div>
              )
            })}
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
