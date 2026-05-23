'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { CreatorApplication, CourseCategorySuggestion } from '@/lib/supabase'

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
}

export default function CreatorReviewsPage() {
  const { t } = useLang()
  const [applications, setApplications] = useState<CreatorApplication[]>([])
  const [suggestions, setSuggestions] = useState<CourseCategorySuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoading(true)
    try {
      const [applicationsRes, suggestionsRes] = await Promise.all([
        fetch('/api/creator-applications'),
        fetch('/api/studio/category-suggestions'),
      ])
      const applicationsJson = await applicationsRes.json()
      const suggestionsJson = await suggestionsRes.json()
      setApplications(applicationsJson.data ?? [])
      setSuggestions(suggestionsJson.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function updateApplication(id: string, status: 'approved' | 'rejected') {
    setSavingId(id)
    try {
      const res = await fetch(`/api/creator-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await loadReviews()
    } finally {
      setSavingId(null)
    }
  }

  async function updateSuggestion(id: string, status: 'approved' | 'rejected') {
    setSavingId(id)
    try {
      const res = await fetch(`/api/studio/category-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await loadReviews()
    } finally {
      setSavingId(null)
    }
  }

  const statusLabel = (status: string) => {
    if (status === 'approved') return t.creatorStatusApproved
    if (status === 'rejected') return t.creatorStatusRejected
    return t.creatorStatusPending
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.creatorAdminTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.creatorAdminSubtitle}</p>
        </div>
      </div>

      <section className="card p-5 mb-6">
        <h2 className="mb-4">{t.creatorApplicationsTitle}</h2>
        {loading ? (
          <LoadingRows />
        ) : applications.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">{t.creatorNoApplications}</p>
        ) : (
          <div className="divide-y divide-border">
            {applications.map((application) => (
              <div key={application.id} className="py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base">{application.full_name}</h3>
                    <span className={STATUS_CLASS[application.status] ?? 'badge-gray'}>
                      {statusLabel(application.status)}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {application.profession} · {application.topic_area}
                  </p>
                  {application.organisation && (
                    <p className="text-xs text-text-muted mt-1">{application.organisation}</p>
                  )}
                  <p className="text-sm text-text mt-3 max-w-3xl">{application.why_create}</p>
                </div>
                {application.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn-secondary text-success"
                      disabled={savingId === application.id}
                      onClick={() => updateApplication(application.id, 'approved')}
                    >
                      <CheckCircle size={16} />
                      {t.creatorApprove}
                    </button>
                    <button
                      className="btn-secondary text-error"
                      disabled={savingId === application.id}
                      onClick={() => updateApplication(application.id, 'rejected')}
                    >
                      <XCircle size={16} />
                      {t.creatorReject}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-4">{t.creatorCategorySuggestionsTitle}</h2>
        {loading ? (
          <LoadingRows />
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">{t.creatorNoSuggestions}</p>
        ) : (
          <div className="divide-y divide-border">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base">{suggestion.suggested_path}</h3>
                    <span className={STATUS_CLASS[suggestion.status] ?? 'badge-gray'}>
                      {statusLabel(suggestion.status)}
                    </span>
                  </div>
                  {suggestion.reason && (
                    <p className="text-sm text-text-muted mt-2 max-w-3xl">{suggestion.reason}</p>
                  )}
                </div>
                {suggestion.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn-secondary text-success"
                      disabled={savingId === suggestion.id}
                      onClick={() => updateSuggestion(suggestion.id, 'approved')}
                    >
                      <CheckCircle size={16} />
                      {t.creatorApprove}
                    </button>
                    <button
                      className="btn-secondary text-error"
                      disabled={savingId === suggestion.id}
                      onClick={() => updateSuggestion(suggestion.id, 'rejected')}
                    >
                      <XCircle size={16} />
                      {t.creatorReject}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-20 rounded-lg bg-surface animate-pulse" />
      ))}
    </div>
  )
}
