'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { ValidationIssue, ValidationResult } from '@/lib/studio/validate-course'
import type { NursedCourse } from '@/lib/supabase'

type ReviewCounts = {
  mediaSubmitted: number
  mediaTotal: number
}

type Props = {
  course: NursedCourse
  counts: ReviewCounts
  t: Record<string, string>
  onRefresh: () => Promise<void>
}

function formatSubmittedDate(iso: string | null, locale: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ReviewStatusPanel({ course, counts, t, onRefresh }: Props) {
  const { lang } = useLang()
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [actionError, setActionError] = useState('')

  const status = course.review_status
  const hasValidationIssues = (validation?.issueCount ?? 0) > 0
  const canSubmit = status === 'draft' || status === 'rejected'
  const liveUrl = course.slug ? `https://pro.tuto.asia/learn/courses/${course.slug}` : null

  async function runValidation() {
    setValidating(true)
    setActionError('')
    try {
      const res = await fetch(`/api/studio/courses/${course.id}/validate`)
      const json = await res.json()
      if (!res.ok) {
        setActionError(json.error ?? 'Validation failed')
        return
      }
      setValidation(json.data as ValidationResult)
    } finally {
      setValidating(false)
    }
  }

  async function submitForReview() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/studio/courses/${course.id}/submit`, { method: 'POST' })
      const json = await res.json()
      if (res.status === 422) {
        setValidation(json.data as ValidationResult)
        setActionError(t.studioReviewIssues.replace('{n}', String(json.data?.issueCount ?? 0)))
        return
      }
      if (!res.ok) {
        setActionError(json.error ?? 'Could not submit course')
        return
      }
      await onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'submitted') {
    return (
      <section className="card p-5 border-l-4 border-l-green-500 bg-green-50/50">
        <h2 className="text-lg font-semibold text-green-800">{t.studioReviewUnderReview}</h2>
        <p className="text-sm text-green-700 mt-2">
          {t.studioReviewUnderReviewMsg}
          {course.submitted_at && (
            <span className="block mt-1">
              {formatSubmittedDate(course.submitted_at, lang)}
            </span>
          )}
        </p>
      </section>
    )
  }

  if (status === 'approved' || status === 'published') {
    return (
      <section className="card p-5 border-l-4 border-l-primary bg-blue-50/50">
        <h2 className="text-lg font-semibold text-primary">{t.studioReviewApproved}</h2>
        {liveUrl && (
          <p className="text-sm mt-2">
            {t.studioReviewLiveAt}{' '}
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {liveUrl}
            </a>
          </p>
        )}
      </section>
    )
  }

  if (status === 'rejected') {
    return (
      <section className="space-y-4">
        <div className="card p-5 border-l-4 border-l-red-500 bg-red-50/50">
          <h2 className="text-lg font-semibold text-red-800">{t.studioReviewRejected}</h2>
          <p className="text-sm text-red-700 mt-2">{t.studioReviewRejectedMsg}</p>
          {course.review_notes && (
            <blockquote className="mt-3 text-sm text-red-900 border-l-2 border-red-300 pl-3 whitespace-pre-wrap">
              {course.review_notes}
            </blockquote>
          )}
        </div>
        <DraftReviewActions
          t={t}
          counts={counts}
          validating={validating}
          submitting={submitting}
          validation={validation}
          hasValidationIssues={hasValidationIssues}
          actionError={actionError}
          onValidate={runValidation}
          onSubmit={submitForReview}
        />
      </section>
    )
  }

  if (!canSubmit) return null

  return (
    <DraftReviewActions
      t={t}
      counts={counts}
      validating={validating}
      submitting={submitting}
      validation={validation}
      hasValidationIssues={hasValidationIssues}
      actionError={actionError}
      onValidate={runValidation}
      onSubmit={submitForReview}
    />
  )
}

function DraftReviewActions({
  t,
  counts,
  validating,
  submitting,
  validation,
  hasValidationIssues,
  actionError,
  onValidate,
  onSubmit,
}: {
  t: Record<string, string>
  counts: ReviewCounts
  validating: boolean
  submitting: boolean
  validation: ValidationResult | null
  hasValidationIssues: boolean
  actionError: string
  onValidate: () => void
  onSubmit: () => void
}) {
  return (
    <section className="card p-5 space-y-4">
      <h2 className="text-lg font-semibold">{t.studioReviewDraftReady}</h2>
      <ul className="text-sm text-text-muted space-y-1 list-disc pl-5">
        <li>{t.studioReviewAiGenerated}</li>
        <li>
          {t.studioReviewMediaProgress
            .replace('{n}', String(counts.mediaSubmitted))
            .replace('{m}', String(counts.mediaTotal))}
        </li>
      </ul>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={onValidate}
          disabled={validating || submitting}
        >
          {validating ? t.studioReviewValidating : t.studioReviewValidate}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onSubmit}
          disabled={submitting || validating || hasValidationIssues}
        >
          {submitting ? t.studioReviewSubmitting : t.studioReviewSubmit}
        </button>
      </div>

      {validation && (
        <div className={hasValidationIssues ? 'text-sm text-error' : 'text-sm text-green-700'}>
          {hasValidationIssues
            ? t.studioReviewIssues.replace('{n}', String(validation.issueCount))
            : t.studioReviewAllGood}
        </div>
      )}

      {actionError && <p className="text-sm text-error">{actionError}</p>}

      {validation && validation.issues.length > 0 && (
        <ul className="text-xs space-y-2 border border-border rounded-lg divide-y divide-border max-h-64 overflow-y-auto">
          {validation.issues.map((issue: ValidationIssue, index) => (
            <li key={`${issue.stepId}-${issue.field}-${index}`} className="p-3">
              <p className="font-medium text-text">
                {issue.moduleTitle} · {issue.lessonTitle}
              </p>
              <p className="text-text-muted mt-0.5">
                {issue.stepType} — {issue.field}
              </p>
              <p className="text-error mt-1">{issue.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
