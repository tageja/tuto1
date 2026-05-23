'use client'

import { useState, FormEvent } from 'react'
import { Copy } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { StudioVideoQueueItem } from '@/app/api/studio/courses/[courseId]/route'

interface VideoRequestCardProps {
  item: StudioVideoQueueItem
  onSubmitted: (updated: StudioVideoQueueItem) => void
}

function locationLabel(item: StudioVideoQueueItem) {
  const mod = item.module_order_index ?? '?'
  const lesson = item.lesson_order_index ?? '?'
  const step = item.step_order_index ?? '?'
  return `Module ${mod} · Lesson ${lesson} · Step ${step} - video`
}

function buildCreatorNotes(character: string, scene: string, notes: string) {
  const parts = [
    `Character / Presenter:\n${character.trim()}`,
    `Scene / Setting:\n${scene.trim()}`,
    `Additional Notes:\n${notes.trim() || '—'}`,
  ]
  return parts.join('\n\n')
}

export function VideoRequestCard({ item, onSubmitted }: VideoRequestCardProps) {
  const { t } = useLang()
  const [character, setCharacter] = useState('')
  const [scene, setScene] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleCopyScript() {
    try {
      await navigator.clipboard.writeText(item.script)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!character.trim() || !scene.trim()) {
      setError('Character and scene are required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/studio/media/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_notes: buildCreatorNotes(character, scene, notes),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not submit request.')
        return
      }
      onSubmitted({
        ...item,
        status: 'submitted',
        creator_notes: buildCreatorNotes(character, scene, notes),
      })
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = () => {
    if (item.status === 'complete') {
      return <span className="badge-blue">{t.studioMediaComplete}</span>
    }
    if (item.status === 'submitted') {
      return <span className="badge-green">{t.studioMediaSubmitted}</span>
    }
    return <span className="badge-yellow">{t.studioMediaPending}</span>
  }

  return (
    <article className="rounded-xl border border-border bg-bg p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold">{locationLabel(item)}</p>
        {statusBadge()}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {t.studioMediaScript}
          </p>
          <button type="button" className="btn-ghost text-xs py-1 px-2" onClick={handleCopyScript}>
            <Copy size={14} />
            {copied ? t.studioMediaCopied : t.studioMediaCopyScript}
          </button>
        </div>
        <div className="rounded-lg bg-surface border border-border p-3 text-sm text-text-muted whitespace-pre-wrap max-h-48 overflow-y-auto">
          {item.script}
        </div>
      </div>

      {item.status === 'pending' && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-4">
          <label className="block">
            <span className="text-sm font-medium">
              {t.studioMediaCharacter} <span className="text-error">*</span>
            </span>
            <textarea
              className="input mt-1 min-h-[80px]"
              required
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder={t.studioMediaCharacterPlaceholder}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              {t.studioMediaScene} <span className="text-error">*</span>
            </span>
            <textarea
              className="input mt-1 min-h-[80px]"
              required
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              placeholder={t.studioMediaScenePlaceholder}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t.studioMediaNotes}</span>
            <textarea
              className="input mt-1 min-h-[72px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.studioMediaNotesPlaceholder}
            />
          </label>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '...' : t.studioMediaSubmitRequest}
          </button>
        </form>
      )}

      {item.status === 'submitted' && (
        <div className="border-t border-border pt-4 space-y-3">
          {item.creator_notes && (
            <div className="rounded-lg bg-surface border border-border p-3 text-sm whitespace-pre-wrap">
              {item.creator_notes}
            </div>
          )}
          <p className="text-sm text-text-muted">{t.studioMediaSubmittedMessage}</p>
        </div>
      )}

      {item.status === 'complete' && item.output_url && (
        <div className="border-t border-border pt-4">
          <a
            href={item.output_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary font-medium hover:underline"
          >
            {t.studioMediaVideoReady}: {item.output_url}
          </a>
        </div>
      )}
    </article>
  )
}
