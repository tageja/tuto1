'use client'

import { useState } from 'react'
import { Play, CheckCircle } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

export default function VideoStep({ step, onComplete }: Props) {
  const [watched, setWatched] = useState(false)
  const videoUrl = step.config?.videoUrl as string | undefined
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-text">🎬 {step.title ?? 'Xem video'}</h3>
        {step.config?.description && (
          <p className="text-sm text-text-muted">{step.config.description as string}</p>
        )}
      </div>

      {embedUrl ? (
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
        <div className="card p-10 text-center bg-surface">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-primary ml-1" />
          </div>
          <p className="font-medium text-text mb-1">Video sẽ có sớm</p>
          <p className="text-sm text-text-muted">Nội dung đang được chuẩn bị</p>
        </div>
      )}

      <button
        onClick={() => {
          setWatched(true)
          onComplete()
        }}
        className="btn-primary w-full justify-center"
      >
        <CheckCircle size={18} />
        Đã xem xong
      </button>
    </div>
  )
}
