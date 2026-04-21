'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play, ChevronRight, Languages } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import TranslatableTranscript from '../TranslatableTranscript'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const SPEEDS = [0.75, 1, 1.25] as const
const BAR_COUNT = 40

// ─── Deterministic waveform from URL string ───────────────────────────────────

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function buildWaveform(seed: string): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const h = hashStr(`${seed}-bar-${i}`)
    const norm = (h % 1000) / 1000
    // bell-curve envelope so centre bars are taller
    const env = Math.sin(((i + 0.5) / BAR_COUNT) * Math.PI)
    return 0.15 + norm * 0.65 * env + 0.05
  })
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AudioShadowStep({ step, onComplete }: Props) {
  const { t, phraseTranslationEnabled: translationEnabled, togglePhraseTranslation: toggleTranslation } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed]         = useState<number>(1)
  const [progress, setProgress]   = useState(0)       // 0–100
  const [hasPlayed, setHasPlayed] = useState(false)
  const [activePhase, setActivePhase] = useState<'listen' | 'read' | 'speak' | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const audioUrl = (step.config?.audioUrl ?? step.config?.audio_url) as string | undefined
  const transcript = (step.config?.transcript ?? step.config?.transcriptEn ?? '') as string
  const hasTranscriptSegments = Array.isArray(step.config?.transcriptSegments) && step.config.transcriptSegments.length > 0

  const waveformHeights = useMemo(() => buildWaveform(audioUrl ?? 'default'), [audioUrl])

  const phases = [
    { key: 'listen' as const, icon: '👂', label: t.phaseListen },
    { key: 'read'   as const, icon: '📖', label: t.phaseRead },
    { key: 'speak'  as const, icon: '🗣️', label: t.phaseSpeak },
  ]

  const currentPhaseIdx = phases.findIndex((p) => p.key === activePhase)

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      setHasPlayed(true)
    }
    setIsPlaying(!isPlaying)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
  }

  function handleWaveformClick(barIdx: number) {
    if (!audioRef.current) return
    audioRef.current.currentTime = (barIdx / BAR_COUNT) * (audioRef.current.duration || 0)
  }

  function handleSpeedChange(s: number) {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">🎧 {step.title ?? t.audioTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.audioSubtitle}</p>
      </div>

      {/* Transcript */}
      {transcript ? (
        <div className="card p-4 bg-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t.transcriptLabel}</p>
            {hasTranscriptSegments && (
              <button
                type="button"
                onClick={toggleTranslation}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  translationEnabled
                    ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                    : 'bg-bg text-text-muted border-border hover:bg-surface'
                }`}
                title={t.phraseTranslationToggle}
              >
                <Languages size={14} />
                {translationEnabled ? t.phraseTranslationOn : t.phraseTranslationOff}
              </button>
            )}
          </div>
          <TranslatableTranscript
            text={transcript}
            segments={step.config?.transcriptSegments as { en: string; vi: string }[] | undefined}
            enabled={translationEnabled}
          />
        </div>
      ) : null}

      {/* Audio player */}
      {audioUrl ? (
        <div className="card p-4 space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); setHasPlayed(true) }}
          />

          {/* Phase stepper */}
          <div className="flex border-b border-border">
            {phases.map((phase, i) => (
              <button
                key={phase.key}
                onClick={() => setActivePhase(phase.key)}
                className={`flex-1 flex flex-col items-center gap-1 pb-2.5 pt-1 border-b-2 -mb-px transition-all text-center ${
                  activePhase === phase.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <span className="text-base">{phase.icon}</span>
                <span className="text-xs font-medium">{phase.label}</span>
              </button>
            ))}
          </div>

          {/* Progress stepper underbar */}
          {activePhase && (
            <div className="flex gap-1 -mt-2">
              {phases.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= currentPhaseIdx ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Fake waveform */}
          <div
            className="flex items-end gap-px h-10 w-full rounded-lg overflow-hidden cursor-pointer"
            aria-label={t.audioShadowWaveformLabel}
            role="slider"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {waveformHeights.map((h, i) => {
              const barPct = i / BAR_COUNT
              const isActive = barPct <= progress / 100
              return (
                <div
                  key={i}
                  onClick={() => handleWaveformClick(i)}
                  className={`flex-1 rounded-sm transition-colors ${
                    isActive ? 'bg-primary' : 'bg-border hover:bg-primary/40'
                  }`}
                  style={{ height: `${h * 100}%` }}
                />
              )
            })}
          </div>

          {/* Play button + speed */}
          <div className="flex items-center justify-between">
            {/* Circular play button with pulsing ring */}
            <div className="relative flex items-center justify-center">
              {isPlaying && !shouldReduceMotion && (
                <motion.div
                  className="absolute rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 52, height: 52 }}
                />
              )}
              <button
                onClick={togglePlay}
                className="relative z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors shadow-md"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    speed === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg border-border text-text-muted hover:bg-surface'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* TODO Agent R: pronunciation scoring lands here */}
        </div>
      ) : (
        <div className="card p-8 text-center bg-surface">
          <div className="text-4xl mb-3">🎵</div>
          <p className="font-medium text-text">{t.audioComingSoon}</p>
          <p className="text-sm text-text-muted">{t.audioComingSoonDesc}</p>
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!hasPlayed && !!audioUrl}
        className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-50"
      >
        {t.btnNextAudio} <ChevronRight size={16} />
      </button>
      {!hasPlayed && audioUrl && (
        <p className="text-xs text-center text-text-muted">{t.listenHint}</p>
      )}
    </div>
  )
}
