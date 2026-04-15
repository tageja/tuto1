'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bug, Lightbulb, BookOpen, HelpCircle, Clock, CheckCircle2, Loader2, XCircle, MessageSquare, Filter } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { NursedFeedback, FeedbackCategory, FeedbackStatus } from '@/lib/supabase'

type FeedbackWithProfile = NursedFeedback & {
  learner_name: string | null
}

const CATEGORY_META: Record<FeedbackCategory, { icon: typeof Bug; color: string; bg: string; border: string }> = {
  bug: { icon: Bug, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  suggestion: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  content: { icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  other: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
}

const STATUS_META: Record<FeedbackStatus, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100' },
  fixed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
}

const ALL_STATUSES: FeedbackStatus[] = ['pending', 'in_progress', 'fixed', 'rejected']
const ALL_CATEGORIES: FeedbackCategory[] = ['bug', 'suggestion', 'content', 'other']

const STATUS_LABEL_KEYS: Record<FeedbackStatus, string> = {
  pending: 'feedbackStatusPending',
  in_progress: 'feedbackStatusInProgress',
  fixed: 'feedbackStatusFixed',
  rejected: 'feedbackStatusRejected',
}

const CATEGORY_LABEL_KEYS: Record<FeedbackCategory, string> = {
  bug: 'feedbackCategoryBug',
  suggestion: 'feedbackCategorySuggestion',
  content: 'feedbackCategoryContent',
  other: 'feedbackCategoryOther',
}

export default function AdminFeedbackPage() {
  const { t } = useLang()
  const [items, setItems] = useState<FeedbackWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('')
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | ''>('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const tAny = t as Record<string, string>

  const fetchData = useCallback(() => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterCategory) params.set('category', filterCategory)
    const qs = params.toString()
    setLoading(true)
    fetch(`/api/feedback${qs ? `?${qs}` : ''}`)
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filterStatus, filterCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function updateStatus(id: string, status: FeedbackStatus, adminResponse?: string) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)))
        setRejectingId(null)
        setRejectReason('')
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(null)
    }
  }

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    in_progress: items.filter((i) => i.status === 'in_progress').length,
    fixed: items.filter((i) => i.status === 'fixed').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="page-header">{t.feedbackAdminTitle}</h1>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {([
          { label: tAny.feedbackAdminTotal, value: stats.total, color: 'text-text' },
          { label: tAny.feedbackStatusPending, value: stats.pending, color: 'text-gray-600' },
          { label: tAny.feedbackStatusInProgress, value: stats.in_progress, color: 'text-blue-600' },
          { label: tAny.feedbackStatusFixed, value: stats.fixed, color: 'text-green-600' },
          { label: tAny.feedbackStatusRejected, value: stats.rejected, color: 'text-orange-600' },
        ] as const).map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter size={16} className="text-text-muted" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | '')}
          className="input text-sm py-1.5 px-3 pr-8 rounded-lg"
        >
          <option value="">{tAny.feedbackAdminFilterStatus}: {tAny.feedbackAdminFilterAll}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{tAny[STATUS_LABEL_KEYS[s]]}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as FeedbackCategory | '')}
          className="input text-sm py-1.5 px-3 pr-8 rounded-lg"
        >
          <option value="">{tAny.feedbackAdminFilterCategory}: {tAny.feedbackAdminFilterAll}</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{tAny[CATEGORY_LABEL_KEYS[c]]}</option>
          ))}
        </select>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface rounded w-1/4 mb-2" />
              <div className="h-3 bg-surface rounded w-full mb-1" />
              <div className="h-3 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">{t.feedbackAdminNoResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const catMeta = CATEGORY_META[item.category]
            const statusMeta = STATUS_META[item.status]
            const CatIcon = catMeta.icon
            const StatusIcon = statusMeta.icon
            const learnerName = item.learner_name ?? tAny.feedbackAdminAnonymous
            const isUpdating = updatingId === item.id

            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-text">{learnerName}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catMeta.bg} ${catMeta.color}`}>
                      <CatIcon size={12} />
                      {tAny[CATEGORY_LABEL_KEYS[item.category]]}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.color}`}>
                      <StatusIcon size={12} />
                      {tAny[STATUS_LABEL_KEYS[item.status]]}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-text mb-2">{item.message}</p>

                {item.page_context && (
                  <p className="text-xs text-text-muted mb-2">
                    {tAny.feedbackAdminPageContext}: <code className="bg-surface px-1 py-0.5 rounded text-[11px]">{item.page_context}</code>
                  </p>
                )}

                {item.admin_response && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
                    <p className="text-xs font-medium text-orange-700 mb-0.5">{tAny.feedbackAdminResponse}</p>
                    <p className="text-xs text-orange-600">{item.admin_response}</p>
                  </div>
                )}

                {item.status !== 'fixed' && item.status !== 'rejected' && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(item.id, 'in_progress')}
                        disabled={isUpdating}
                        className="btn-secondary text-xs py-1 px-3 disabled:opacity-50"
                      >
                        {tAny.feedbackAdminMarkInProgress}
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(item.id, 'fixed')}
                      disabled={isUpdating}
                      className="btn-primary text-xs py-1 px-3 disabled:opacity-50"
                    >
                      {tAny.feedbackAdminMarkFixed}
                    </button>
                    {rejectingId === item.id ? (
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={tAny.feedbackAdminRejectPlaceholder}
                          className="input text-xs py-1 px-2 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (rejectReason.trim()) updateStatus(item.id, 'rejected', rejectReason.trim())
                          }}
                          disabled={!rejectReason.trim() || isUpdating}
                          className="btn-secondary text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          {tAny.feedbackAdminReject}
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason('') }}
                          className="text-xs text-text-muted hover:text-text"
                        >
                          {tAny.btnCancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingId(item.id)}
                        className="btn-secondary text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {tAny.feedbackAdminReject}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
