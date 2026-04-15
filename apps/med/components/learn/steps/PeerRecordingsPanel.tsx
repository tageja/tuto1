'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, RefreshCw, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import PeerRatingWidget from './PeerRatingWidget'

type PeerRecording = {
  id: string
  user_id: string
  display_name: string | null
  storage_path: string | null
  public_url: string | null
  created_at: string
  my_review: { id: string; rating: number } | null
}

interface Props {
  stepId: string
}

export default function PeerRecordingsPanel({ stepId }: Props) {
  const { t } = useLang()
  const { user } = useAuth()
  const [recordings, setRecordings] = useState<PeerRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [noGroup, setNoGroup] = useState(false)

  const fetchRecordings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/peer-recordings?stepId=${stepId}`)
      const json = await res.json()
      setRecordings(json.data ?? [])
      setNoGroup(json.noGroup === true)
    } catch { /* network error — keep existing state */ }
    setLoading(false)
  }, [stepId, user])

  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  if (!user) return null

  if (loading) {
    return (
      <div className="card p-6 space-y-3 animate-pulse">
        <div className="h-5 w-1/3 rounded bg-surface" />
        <div className="h-16 rounded bg-surface" />
      </div>
    )
  }

  if (noGroup) {
    return (
      <div className="card p-5 text-center space-y-3 border-dashed">
        <Users size={32} className="mx-auto text-text-muted opacity-50" />
        <p className="text-sm text-text-muted">{t.peerRecordingsNotInGroup}</p>
        <Link href="/learn/pairs" className="btn-secondary text-sm inline-flex">
          {t.peerRecordingsGoToGroups}
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text flex items-center gap-2">
            <Users size={16} className="text-primary" />
            {t.peerRecordingsTitle}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">{t.peerRecordingsSubtitle}</p>
        </div>
        <button
          onClick={fetchRecordings}
          className="p-2 rounded-lg hover:bg-surface transition-colors"
          aria-label={t.peerRecordingsRefresh}
        >
          <RefreshCw size={16} className="text-text-muted" />
        </button>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-text-muted">{t.peerRecordingsEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => (
            <PeerRecordingCard
              key={rec.id}
              recording={rec}
              onRated={() => fetchRecordings()}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PeerRecordingCard({
  recording,
  onRated,
}: {
  recording: PeerRecording
  onRated: () => void
}) {
  const { t } = useLang()
  const displayName = recording.display_name ?? t.peerRecordingAnonymous
  const dateStr = new Date(recording.created_at).toLocaleDateString()

  return (
    <div className="rounded-xl border border-border p-4 space-y-3 bg-surface/50">
      <div className="flex items-center gap-2">
        <UserCircle size={20} className="text-text-muted flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">
            {t.peerRecordingBy.replace('{name}', displayName)}
          </p>
          <p className="text-xs text-text-muted">{dateStr}</p>
        </div>
      </div>

      {recording.public_url ? (
        <audio controls className="w-full" preload="metadata">
          <source src={recording.public_url} type="audio/webm" />
        </audio>
      ) : (
        <p className="text-xs text-text-muted italic">Audio unavailable</p>
      )}

      <div>
        <p className="text-xs text-text-muted mb-1">{t.peerRatingLabel}</p>
        <PeerRatingWidget
          submissionId={recording.id}
          initialRating={recording.my_review?.rating}
          onRated={onRated}
        />
      </div>
    </div>
  )
}
