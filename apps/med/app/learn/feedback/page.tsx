'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bug, Lightbulb, BookOpen, HelpCircle, Clock, CheckCircle2, Loader2, XCircle, MessageCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { NursedFeedback, FeedbackCategory, FeedbackStatus } from '@/lib/supabase'

const CATEGORY_META: Record<FeedbackCategory, { icon: typeof Bug; color: string; bg: string }> = {
  bug: { icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
  suggestion: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50' },
  content: { icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  other: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
}

const STATUS_META: Record<FeedbackStatus, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100' },
  fixed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
}

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

export default function FeedbackHistoryPage() {
  const { t } = useLang()
  const [items, setItems] = useState<NursedFeedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feedback')
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/learn" className="p-1.5 rounded-lg hover:bg-surface text-text-muted">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-text">{t.feedbackHistoryTitle}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface rounded w-1/3 mb-2" />
              <div className="h-3 bg-surface rounded w-full mb-1" />
              <div className="h-3 bg-surface rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <MessageCircle size={24} className="text-primary" />
          </div>
          <p className="text-sm text-text-muted">{t.feedbackHistoryEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const catMeta = CATEGORY_META[item.category]
            const statusMeta = STATUS_META[item.status]
            const CatIcon = catMeta.icon
            const StatusIcon = statusMeta.icon
            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catMeta.bg} ${catMeta.color}`}>
                      <CatIcon size={12} />
                      {(t as Record<string, string>)[CATEGORY_LABEL_KEYS[item.category]]}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.color}`}>
                      <StatusIcon size={12} />
                      {(t as Record<string, string>)[STATUS_LABEL_KEYS[item.status]]}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text">{item.message}</p>
                {item.page_context && (
                  <p className="text-xs text-text-muted mt-1">
                    {t.feedbackAdminPageContext}: {item.page_context}
                  </p>
                )}
                {item.status === 'rejected' && item.admin_response && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
                    <p className="text-xs font-medium text-orange-700 mb-0.5">{t.feedbackAdminResponse}</p>
                    <p className="text-xs text-orange-600">{item.admin_response}</p>
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
