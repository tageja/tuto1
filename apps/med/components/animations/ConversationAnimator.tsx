'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, ChevronRight, Captions, CaptionsOff, SkipForward } from 'lucide-react'
import type { AnimationManifest, AnimationSegment, AvatarState, Speaker } from './types'
import NurseAvatar from './avatars/NurseAvatar'
import PatientAvatar from './avatars/PatientAvatar'
import DoctorAvatar from './avatars/DoctorAvatar'
import FamilyAvatar from './avatars/FamilyAvatar'
import { useLang } from '@/contexts/LanguageContext'

// ── Scene styling ────────────────────────────────────────────────

interface SceneStyle { emoji: string; grad: string; accent: string }

function getSceneStyle(setting: string): SceneStyle {
  const s = setting.toLowerCase()
  if (s.includes('triage'))          return { emoji: '🚨', grad: 'from-red-950 via-red-900 to-slate-900',   accent: '#EF4444' }
  if (s.includes('trauma') || s.includes('resus')) return { emoji: '⚡', grad: 'from-rose-950 via-red-900 to-slate-900', accent: '#F43F5E' }
  if (s.includes('icu') || s.includes('intensive')) return { emoji: '🫀', grad: 'from-blue-950 via-indigo-900 to-slate-900', accent: '#6366F1' }
  if (s.includes('ward') || s.includes('corridor')) return { emoji: '🏥', grad: 'from-blue-950 via-slate-900 to-slate-800', accent: '#3B82F6' }
  if (s.includes('a&e') || s.includes('emergency')) return { emoji: '🚑', grad: 'from-amber-950 via-orange-900 to-slate-900', accent: '#F59E0B' }
  if (s.includes('station') || s.includes('nurse')) return { emoji: '📋', grad: 'from-purple-950 via-violet-900 to-slate-900', accent: '#8B5CF6' }
  if (s.includes('relatives') || s.includes('family') || s.includes('quiet')) return { emoji: '🤝', grad: 'from-emerald-950 via-teal-900 to-slate-900', accent: '#10B981' }
  if (s.includes('post') || s.includes('recovery')) return { emoji: '💊', grad: 'from-green-950 via-emerald-900 to-slate-900', accent: '#22C55E' }
  if (s.includes('staff') || s.includes('office')) return { emoji: '☕', grad: 'from-stone-900 via-slate-900 to-slate-800', accent: '#78716C' }
  return { emoji: '🏥', grad: 'from-slate-950 via-slate-900 to-slate-800', accent: '#64748B' }
}

// ── Speaker label ─────────────────────────────────────────────────

const SPEAKER_LABELS: Record<Speaker, { en: string; vi: string; color: string }> = {
  nurse:   { en: 'Nurse Linh', vi: 'Điều dưỡng Linh', color: '#22D3EE' },
  patient: { en: 'Patient Dave', vi: 'Bệnh nhân Dave', color: '#86EFAC' },
  doctor:  { en: 'Doctor', vi: 'Bác sĩ', color: '#A78BFA' },
  family:  { en: 'Family', vi: 'Gia đình', color: '#FCD34D' },
}

// ── Avatar renderer ───────────────────────────────────────────────

function AvatarPanel({ speaker, avatarState, isActive }: {
  speaker: Speaker
  avatarState: AvatarState
  isActive: boolean
}) {
  const label = SPEAKER_LABELS[speaker]
  const AvatarComp =
    speaker === 'nurse'   ? NurseAvatar   :
    speaker === 'patient' ? PatientAvatar :
    speaker === 'doctor'  ? DoctorAvatar  :
    FamilyAvatar

  return (
    <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-60 scale-95'}`}>
      <div className={`relative rounded-full transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_16px_rgba(255,255,255,0.3)]' : ''}`}>
        {isActive && avatarState === 'talking' && (
          <div className="absolute inset-0 rounded-full animate-ping bg-white/10" />
        )}
        <AvatarComp state={avatarState} size={100} />
      </div>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: `${label.color}22`, color: label.color, border: `1px solid ${label.color}44` }}
      >
        {label.en}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

interface Props {
  manifest: AnimationManifest
  onComplete: () => void
}

type PlayerState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'done'

export default function ConversationAnimator({ manifest, onComplete }: Props) {
  const { lang } = useLang()
  const { segments, scene_setting, characters } = manifest

  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [viSubtitles, setViSubtitles] = useState(true)
  const [bubbleKey, setBubbleKey] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scene = getSceneStyle(scene_setting)

  const currentSeg: AnimationSegment | null = currentIdx >= 0 ? segments[currentIdx] : null
  const activeSpeaker: Speaker | null = currentSeg?.speaker ?? null

  // Compute avatar state for each unique speaker in this scene
  function getAvatarState(speaker: Speaker): AvatarState {
    if (playerState !== 'playing') return 'idle'
    if (speaker === activeSpeaker) return 'talking'
    return 'listening'
  }

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const playSegment = useCallback((idx: number) => {
    if (idx >= segments.length) {
      setPlayerState('done')
      setCurrentIdx(-1)
      return
    }

    setCurrentIdx(idx)
    setBubbleKey(k => k + 1)

    const seg = segments[idx]

    const advance = () => playSegment(idx + 1)

    if (seg.audioUrl) {
      const audio = new Audio(seg.audioUrl)
      audioRef.current = audio
      audio.onended = advance
      audio.onerror = () => {
        // fallback: wait 2.5s then advance
        timeoutRef.current = setTimeout(advance, 2500)
      }
      audio.play().catch(() => {
        timeoutRef.current = setTimeout(advance, 2500)
      })
    } else {
      // No audio: estimate ~3s per line based on word count
      const words = seg.text.split(' ').length
      const ms = Math.max(2000, words * 350)
      timeoutRef.current = setTimeout(advance, ms)
    }
  }, [segments])

  const handlePlay = () => {
    setPlayerState('playing')
    playSegment(0)
  }

  const handlePause = () => {
    setPlayerState('paused')
    stopAudio()
  }

  const handleResume = () => {
    setPlayerState('playing')
    playSegment(Math.max(0, currentIdx))
  }

  const handleSkip = () => {
    stopAudio()
    const next = currentIdx + 1
    if (next >= segments.length) {
      setPlayerState('done')
      setCurrentIdx(-1)
    } else {
      setPlayerState('playing')
      playSegment(next)
    }
  }

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio])

  // Unique speakers in order of appearance
  const uniqueSpeakers = Array.from(
    new Map(segments.map(s => [s.speaker, s.speaker])).values()
  ).slice(0, 3) as Speaker[]

  const progress = playerState === 'done'
    ? 100
    : currentIdx < 0
      ? 0
      : Math.round(((currentIdx + 1) / segments.length) * 100)

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none">
      {/* ── Scene header ── */}
      <div className={`bg-gradient-to-r ${scene.grad} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{scene.emoji}</span>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Scene</p>
            <p className="text-sm font-semibold text-white leading-tight">{scene_setting}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Vi subtitle toggle */}
          <button
            onClick={() => setViSubtitles(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors text-xs"
          >
            {viSubtitles ? <Captions size={14} /> : <CaptionsOff size={14} />}
            <span className="hidden sm:inline">🇻🇳</span>
          </button>
          {/* Skip button */}
          {playerState === 'playing' && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Skip to next line"
            >
              <SkipForward size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Stage ── */}
      <div className={`bg-gradient-to-b ${scene.grad} min-h-[260px] flex flex-col items-center justify-between px-4 py-6 relative overflow-hidden`}>
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: scene.accent }}
        />

        {/* ── Avatars row ── */}
        <div className="flex items-end justify-center gap-8 md:gap-16 w-full relative z-10">
          {uniqueSpeakers.map(speaker => (
            <AvatarPanel
              key={speaker}
              speaker={speaker}
              avatarState={getAvatarState(speaker)}
              isActive={playerState === 'playing' && speaker === activeSpeaker}
            />
          ))}
        </div>

        {/* ── Speech bubble ── */}
        <div className="w-full max-w-sm relative z-10 mt-4">
          {currentSeg && playerState !== 'idle' && (
            <div
              key={bubbleKey}
              className="animate-bubble-pop rounded-2xl bg-white/95 shadow-xl px-4 py-3 border border-white/20"
            >
              {/* Speaker tag */}
              <span
                className="text-[10px] font-bold uppercase tracking-widest mb-1 block"
                style={{ color: SPEAKER_LABELS[currentSeg.speaker].color === '#22D3EE' ? '#0891B2' : SPEAKER_LABELS[currentSeg.speaker].color }}
              >
                {SPEAKER_LABELS[currentSeg.speaker].en}
              </span>
              {/* English text */}
              <p className="text-sm font-medium text-gray-900 leading-snug">{currentSeg.text}</p>
              {/* Vi subtitle */}
              {viSubtitles && currentSeg.vi_text && (
                <p className="text-xs text-gray-500 mt-1.5 leading-snug border-t border-gray-100 pt-1.5">
                  🇻🇳 {currentSeg.vi_text}
                </p>
              )}
            </div>
          )}

          {/* Idle placeholder */}
          {(playerState === 'idle' || playerState === 'ready') && (
            <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center">
              <p className="text-white/50 text-sm">Press play to start the conversation</p>
            </div>
          )}

          {/* Done message */}
          {playerState === 'done' && (
            <div className="animate-bubble-pop rounded-2xl bg-white/95 border border-white/20 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-gray-800">✅ Conversation complete!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: scene.accent }}
        />
      </div>

      {/* ── Controls ── */}
      <div className="bg-slate-900 px-4 py-3 flex items-center gap-3">
        {/* Line counter */}
        <span className="text-xs text-white/40 font-mono flex-1">
          {playerState === 'done'
            ? `${segments.length}/${segments.length} lines`
            : currentIdx >= 0
              ? `${currentIdx + 1}/${segments.length} lines`
              : `${segments.length} lines`}
        </span>

        {/* Play / Pause / Resume */}
        {playerState === 'idle' && (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: scene.accent }}
          >
            <Play size={16} fill="white" />
            Play Conversation
          </button>
        )}
        {playerState === 'playing' && (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors"
          >
            <Pause size={16} />
            Pause
          </button>
        )}
        {playerState === 'paused' && (
          <button
            onClick={handleResume}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
            style={{ backgroundColor: scene.accent }}
          >
            <Play size={16} fill="white" />
            Resume
          </button>
        )}
        {playerState === 'done' && (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: scene.accent }}
          >
            Continue
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
