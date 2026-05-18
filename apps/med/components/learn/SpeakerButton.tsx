'use client'

import { useState, useRef, useCallback } from 'react'
import { Volume2 } from 'lucide-react'

interface Props {
  audioUrl?: string
  size?: number
  className?: string
  onPlay?: () => void
}

export default function SpeakerButton({ audioUrl, size = 16, className = '', onPlay }: Props) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (!el || !audioUrl) return

    if (playing) {
      el.pause()
      el.currentTime = 0
      setPlaying(false)
    } else {
      el.play()
        .then(() => onPlay?.())
        .catch(() => setPlaying(false))
      setPlaying(true)
    }
  }, [audioUrl, playing, onPlay])

  if (!audioUrl) return null

  return (
    <>
      {/* Hidden DOM <audio> element so Playwright can detect playback state */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        hidden
        onEnded={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
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
    </>
  )
}
