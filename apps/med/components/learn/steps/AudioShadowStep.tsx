'use client'

import { useState, useRef } from 'react'
import { Play, Pause, ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const SPEEDS = [0.75, 1, 1.25] as const

export default function AudioShadowStep({ step, onComplete }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(1)
  const [progress, setProgress] = useState(0)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [activePhase, setActivePhase] = useState<'listen' | 'read' | 'speak' | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const audioUrl = step.config?.audioUrl as string | undefined
  const transcript = (step.config?.transcript ?? step.config?.transcriptEn ?? '') as string

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      setHasPlayed(true)
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = (Number(e.target.value) / 100) * audioRef.current.duration
  }

  const handleSpeedChange = (s: number) => {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">🎧 {step.title ?? 'Nghe & Shadowing'}</h3>
        <p className="text-sm text-text-muted mt-1">Nghe → Đọc theo → Nói cùng</p>
      </div>

      {/* Transcript */}
      {transcript ? (
        <div className="card p-4 bg-surface">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Nội dung</p>
          <p className="text-sm text-text leading-relaxed">{transcript}</p>
        </div>
      ) : null}

      {/* Audio player */}
      {audioUrl ? (
        <div className="card p-4 space-y-3">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); setHasPlayed(true) }}
          />

          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 rounded-full accent-primary cursor-pointer"
          />

          <div className="flex items-center justify-between">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

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
        </div>
      ) : (
        <div className="card p-8 text-center bg-surface">
          <div className="text-4xl mb-3">🎵</div>
          <p className="font-medium text-text">Audio sẽ có sớm</p>
          <p className="text-sm text-text-muted">Nội dung đang được chuẩn bị</p>
        </div>
      )}

      {/* Phase buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'listen' as const, icon: '👂', label: 'Nghe' },
          { key: 'read' as const, icon: '📖', label: 'Đọc theo' },
          { key: 'speak' as const, icon: '🗣️', label: 'Nói cùng' },
        ].map((phase) => (
          <button
            key={phase.key}
            onClick={() => setActivePhase(phase.key)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              activePhase === phase.key
                ? 'border-primary bg-primary-light'
                : 'border-border bg-bg hover:bg-surface'
            }`}
          >
            <span className="text-2xl">{phase.icon}</span>
            <span className="text-xs font-medium text-text">{phase.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={!hasPlayed && !!audioUrl}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        Tiếp theo <ChevronRight size={16} />
      </button>
      {!hasPlayed && audioUrl && (
        <p className="text-xs text-center text-text-muted">Nghe audio ít nhất một lần để tiếp tục</p>
      )}
    </div>
  )
}
