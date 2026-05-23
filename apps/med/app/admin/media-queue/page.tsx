'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import type { AdminMediaQueueRow } from '@/app/api/admin/media-queue/route'

type FilterStatus = 'submitted' | 'pending' | 'complete' | 'all'

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-yellow',
  submitted: 'badge-green',
  complete: 'badge-blue',
  generating: 'badge-gray',
  failed: 'badge-red',
  cancelled: 'badge-gray',
}

function locationLabel(row: AdminMediaQueueRow) {
  const mod = row.module_order_index ?? '?'
  const lesson = row.lesson_order_index ?? '?'
  const step = row.step_order_index ?? '?'
  return `Module ${mod} · Lesson ${lesson} · Step ${step}`
}

function TruncatedCell({
  text,
  expandLabel,
  collapseLabel,
}: {
  text: string
  expandLabel: string
  collapseLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const truncated = text.length > 100 ? `${text.slice(0, 100)}…` : text

  if (!text) return <span className="text-text-muted">—</span>

  return (
    <div className="max-w-xs">
      <p className="text-sm whitespace-pre-wrap">{expanded ? text : truncated}</p>
      {text.length > 100 && (
        <button
          type="button"
          className="text-xs text-primary mt-1 hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  )
}

function MarkCompleteForm({
  queueId,
  onComplete,
  t,
}: {
  queueId: string
  onComplete: () => void
  t: ReturnType<typeof useLang>['t']
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    const trimmed = url.trim()
    if (!trimmed) {
      setError('URL required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/media-queue/${queueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output_url: trimmed, status: 'complete' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Update failed')
        return
      }
      setOpen(false)
      setUrl('')
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn-primary text-xs py-1.5 px-3" onClick={() => setOpen(true)}>
        {t.adminMediaMarkComplete}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <input
        type="url"
        className="input text-sm"
        placeholder={t.adminMediaPasteUrl}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className="btn-primary text-xs py-1.5 px-3" disabled={saving} onClick={handleSubmit}>
          {saving ? '...' : t.adminMediaConfirm}
        </button>
        <button type="button" className="btn-ghost text-xs py-1.5 px-3" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AdminMediaQueuePage() {
  const { t } = useLang()
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<FilterStatus>('submitted')
  const [rows, setRows] = useState<AdminMediaQueueRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !profile) return
    if (profile.role !== 'super_admin') {
      router.replace('/admin')
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    if (profile?.role !== 'super_admin') return
    loadRows()
  }, [filter, profile?.role])

  async function loadRows() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media-queue?status=${filter}`)
      const json = await res.json()
      setRows(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'submitted', label: t.adminMediaFilterSubmitted },
    { id: 'pending', label: t.adminMediaFilterPending },
    { id: 'complete', label: t.adminMediaFilterComplete },
    { id: 'all', label: t.adminMediaFilterAll },
  ]

  if (authLoading || !profile || profile.role !== 'super_admin') {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.adminMediaQueueTitle}</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={filter === id ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="p-3 font-medium">{t.adminMediaColCreator}</th>
              <th className="p-3 font-medium">{t.adminMediaColCourse}</th>
              <th className="p-3 font-medium">{t.adminMediaColLocation}</th>
              <th className="p-3 font-medium">{t.adminMediaColScript}</th>
              <th className="p-3 font-medium">{t.adminMediaColNotes}</th>
              <th className="p-3 font-medium">{t.adminMediaColStatus}</th>
              <th className="p-3 font-medium">{t.adminMediaColActions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted">
                  No items in this queue.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border align-top">
                  <td className="p-3">
                    <p className="font-medium">{row.creator_name ?? '—'}</p>
                    <p className="text-xs text-text-muted">{row.creator_email ?? '—'}</p>
                  </td>
                  <td className="p-3">{row.course_title ?? '—'}</td>
                  <td className="p-3">{locationLabel(row)}</td>
                  <td className="p-3">
                    <TruncatedCell
                      text={row.script}
                      expandLabel={t.adminMediaExpand}
                      collapseLabel={t.adminMediaCollapse}
                    />
                  </td>
                  <td className="p-3">
                    <TruncatedCell
                      text={row.creator_notes ?? ''}
                      expandLabel={t.adminMediaExpand}
                      collapseLabel={t.adminMediaCollapse}
                    />
                  </td>
                  <td className="p-3">
                    <span className={STATUS_CLASS[row.status] ?? 'badge-gray'}>{row.status}</span>
                  </td>
                  <td className="p-3">
                    {row.status === 'submitted' ? (
                      <MarkCompleteForm queueId={row.id} onComplete={loadRows} t={t} />
                    ) : row.status === 'complete' && row.output_url ? (
                      <a
                        href={row.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View video
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
