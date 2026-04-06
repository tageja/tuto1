'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, CheckCircle, Captions, CaptionsOff } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

// ---------- VTT helpers ----------

interface VttCue {
  start: number
  end: number
  text: string
}

function parseVttTime(raw: string): number {
  const parts = raw.trim().split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1])
  }
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
}

function parseVttCues(vtt: string): VttCue[] {
  if (!vtt) return []
  const cues: VttCue[] = []
  const blocks = vtt.trim().split(/\n\n+/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const timeIdx = lines.findIndex((l) => l.includes('-->'))
    if (timeIdx < 0) continue
    const [startStr, endStr] = lines[timeIdx].split(/\s+-->\s+/)
    const text = lines.slice(timeIdx + 1).join(' ').trim()
    if (text) cues.push({ start: parseVttTime(startStr), end: parseVttTime(endStr), text })
  }
  return cues
}

function activeCue(cues: VttCue[], time: number): string | null {
  return cues.find((c) => time >= c.start && time <= c.end)?.text ?? null
}

// ---------- Embed helpers ----------

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

function isNativeVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url)
}

// ---------- Component ----------

export default function VideoStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [watched, setWatched] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentViCue, setCurrentViCue] = useState<string | null>(null)
  const [viCaptionsOn, setViCaptionsOn] = useState(true)

  const videoUrl = step.config?.videoUrl as string | undefined
  const subtitleVttVi = step.config?.subtitle_vtt_vi as string | undefined

  const embedUrl = videoUrl && !isNativeVideo(videoUrl) ? getEmbedUrl(videoUrl) : null
  const isNative = videoUrl ? isNativeVideo(videoUrl) : false

  // Parse Vietnamese cues once
  const viCues = useMemo(() => parseVttCues(subtitleVttVi ?? ''), [subtitleVttVi])

  // Localised header & description
  const title = (lang === 'vi' && step.title_vi) ? step.title_vi : step.title
  const description = lang === 'vi'
    ? (step.config?.description_vi as string | undefined) ?? (step.config?.description as string | undefined)
    : (step.config?.description as string | undefined)

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100
    setProgress(Math.round(pct))
    if (pct >= 60 && !watched) setWatched(true)
    setCurrentViCue(activeCue(viCues, v.currentTime))
  }

  // When video ends mark fully watched + clear cue
  function handleEnded() {
    setWatched(true)
    setCurrentViCue(null)
  }

  // Reset cue when video pauses (keeps last cue visible while paused)
  // — intentionally left without clearing so text stays readable on pause

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text flex items-center gap-2">
          🎬 {title ?? t.videoTitleFallback}
        </h3>
        {description && (
          <p className="text-sm text-text-muted mt-0.5">{description}</p>
        )}
      </div>

      {/* ── Native MP4 player ── */}
      {isNative && videoUrl ? (
        <div className="rounded-xl overflow-hidden border border-border shadow-card bg-black">
          {/* Video element — max height so it never pushes controls off screen */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[52vh] object-contain"
            controls
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />

          {/* Progress bar */}
          {progress > 0 && (
            <div className="h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Vietnamese caption bar — sits BELOW the video, ABOVE the Continue button */}
          {subtitleVttVi && (
            <div className="bg-black/90 border-t border-white/10">
              {/* Toggle row */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-wide font-medium">
                  🇻🇳 Phụ đề tiếng Việt
                </span>
                <button
                  onClick={() => setViCaptionsOn((v) => !v)}
                  className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white transition-colors"
                >
                  {viCaptionsOn ? <Captions size={11} /> : <CaptionsOff size={11} />}
                  {viCaptionsOn ? 'Tắt' : 'Bật'}
                </button>
              </div>

              {/* Caption text area — fixed height so layout doesn't jump */}
              {viCaptionsOn && (
                <div className="min-h-[44px] flex items-center justify-center px-4 pb-2.5">
                  {currentViCue ? (
                    <p className="text-white text-sm leading-snug text-center">
                      {currentViCue}
                    </p>
                  ) : (
                    <p className="text-white/25 text-xs text-center italic">
                      {progress === 0 ? 'Nhấn phát để xem phụ đề...' : '—'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      ) : embedUrl ? (
        /* ── Iframe embed (YouTube / Vimeo) ── */
        <div className="rounded-xl overflow-hidden border border-border shadow-card">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setWatched(true)}
            />
          </div>
        </div>

      ) : (
        /* ── Coming soon placeholder ── */
        <div className="card p-10 text-center bg-surface">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-primary ml-1" />
          </div>
          <p className="font-medium text-text mb-1">{t.videoComingSoon}</p>
          <p className="text-sm text-text-muted">{t.videoComingSoonDesc}</p>
        </div>
      )}

      {/* Watch progress hint */}
      {isNative && !watched && (
        <p className="text-xs text-center text-text-muted">
          {lang === 'vi' ? 'Xem ít nhất 60% để tiếp tục' : 'Watch at least 60% to continue'}
        </p>
      )}

      {/* Continue button */}
      <button
        onClick={onComplete}
        disabled={isNative && !watched}
        className="btn-primary w-full justify-center"
      >
        <CheckCircle size={18} />
        {watched
          ? t.btnWatched
          : lang === 'vi' ? 'Xem video để tiếp tục' : 'Watch to continue'}
      </button>
    </div>
  )
}
