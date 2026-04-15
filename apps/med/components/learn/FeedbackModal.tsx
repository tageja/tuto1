'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, Bug, Lightbulb, BookOpen, HelpCircle, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import type { FeedbackCategory } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES: { key: FeedbackCategory; icon: typeof Bug; color: string; bgColor: string }[] = [
  { key: 'bug', icon: Bug, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { key: 'suggestion', icon: Lightbulb, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { key: 'content', icon: BookOpen, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { key: 'other', icon: HelpCircle, color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100' },
]

const CATEGORY_LABEL_KEYS: Record<FeedbackCategory, keyof ReturnType<typeof useLang>['t']> = {
  bug: 'feedbackCategoryBug',
  suggestion: 'feedbackCategorySuggestion',
  content: 'feedbackCategoryContent',
  other: 'feedbackCategoryOther',
}

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const { t } = useLang()
  const { user } = useAuth()
  const pathname = usePathname()

  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const charCount = message.trim().length
  const isValid = category !== null && charCount >= 10 && charCount <= 500

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          pageContext: pathname,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setCategory(null)
    setMessage('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text">{t.feedbackModalTitle}</h2>
            <p className="text-xs text-text-muted mt-0.5">{t.feedbackModalSubtitle}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-surface text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">{t.feedbackSuccessTitle} 🎉</h3>
              <p className="text-sm text-text-muted mb-6">{t.feedbackSuccessMessage}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/learn/feedback"
                  onClick={handleClose}
                  className="btn-secondary text-sm py-2"
                >
                  {t.feedbackSuccessViewHistory}
                </Link>
                <button onClick={handleClose} className="btn-primary text-sm py-2">
                  {t.btnClose}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {CATEGORIES.map(({ key, icon: Icon, color, bgColor }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm font-medium transition-all',
                      category === key
                        ? `${bgColor} ring-2 ring-primary/30 border-primary`
                        : `${bgColor} border-transparent`,
                    ].join(' ')}
                  >
                    <Icon size={16} className={color} />
                    <span className="text-text">{t[CATEGORY_LABEL_KEYS[key]]}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.feedbackMessagePlaceholder}
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${charCount > 500 ? 'text-red-500' : charCount >= 10 ? 'text-green-600' : 'text-text-muted'}`}>
                    {charCount}/500
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.feedbackSubmitting : t.feedbackSubmit}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
