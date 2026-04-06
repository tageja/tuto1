'use client'

import { useState, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface Props {
  audioUrl?: string
  size?: number
  className?: string
}

export default function SpeakerButton({ audioUrl, size = 16, className = '' }: Props) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = useCallback(() => {
    if (!audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onerror = () => setPlaying(false)
    }

    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }, [audioUrl, playing])

  if (!audioUrl) return null

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle() }}
      title={playing ? 'Stop' : 'Play audio'}
      className={`inline-flex items-center justify-center rounded-md transition-all ${
        playing
          ? 'text-primary bg-primary/10 hover:bg-primary/20'
          : 'text-text-muted hover:text-primary hover:bg-primary/8'
      } ${className}`}
      style={{ width: size + 10, height: size + 10 }}
    >
      {playing ? (
        <span className="flex items-end gap-px" style={{ height: size }}>
          <span className="waveform-bar" style={{ animationDelay: '0ms' }} />
          <span className="waveform-bar" style={{ animationDelay: '150ms' }} />
          <span className="waveform-bar" style={{ animationDelay: '300ms' }} />
        </span>
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  )
}
