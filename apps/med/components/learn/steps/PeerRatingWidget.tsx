'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  submissionId: string
  initialRating?: number
  onRated?: (rating: number) => void
}

export default function PeerRatingWidget({ submissionId, initialRating, onRated }: Props) {
  const { t } = useLang()
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedRating, setSelectedRating] = useState(initialRating ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!initialRating)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (rating: number) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/peer-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, rating }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? t.peerRatingError)
      setSelectedRating(rating)
      setSubmitted(true)
      onRated?.(rating)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.peerRatingError
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStarClick = (star: number) => {
    if (submitting) return
    setSelectedRating(star)
    handleSubmit(star)
  }

  const displayRating = hoveredStar || selectedRating

  return (
    <div className="space-y-1" data-tour-target="peer-review-prompt">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleStarClick(star)}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={20}
              className={
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }
            />
          </button>
        ))}
        {submitted && !error && (
          <span className="text-xs text-success ml-2">
            {initialRating ? t.peerRatingUpdated : t.peerRatingSubmitted}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
