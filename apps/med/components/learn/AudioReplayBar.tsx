'use client'

import { useState, useRef } from 'react'
import { Play, Pause, ChevronDown, ChevronUp, Headphones } from 'lucide-react'

interface Props {
  audioUrl: string
  transcript?: string
  label?: string
}

const SPEEDS = [0.75, 1, 1.25] as const

export default function AudioReplayBar({ audioUrl, transcript, label = 'Replay audio' }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState<number>(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
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
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden mb-1">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setIsPlaying(false); setProgress(0) }}
      />

      {/* Collapsed header — always visible */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors flex-shrink-0"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Headphones size={13} className="text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-primary truncate">{label}</span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-1.5 w-full h-1 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-primary/60 hover:text-primary transition-colors flex-shrink-0 p-1"
          title={expanded ? 'Collapse' : 'Show transcript & controls'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded: full controls + transcript */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-primary/10 pt-3">
          {/* Seekbar + speed */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    speed === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-border text-text-muted hover:bg-surface'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-white/70 rounded-lg px-3 py-2.5 border border-primary/10">
              <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-1">Transcript</p>
              <p className="text-xs text-text leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
