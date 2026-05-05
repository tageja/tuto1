'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Bug, Lightbulb, BookOpen, HelpCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { FeedbackCategory } from '@/lib/supabase'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

const CATEGORIES: {
  key: FeedbackCategory
  icon: typeof Bug
  color: string
  bg: string
  selectedBg: string
}[] = [
  {
    key: 'bug',
    icon: Bug,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200 hover:bg-red-100',
    selectedBg: 'bg-red-50 border-primary ring-2 ring-primary/20',
  },
  {
    key: 'suggestion',
    icon: Lightbulb,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    selectedBg: 'bg-blue-50 border-primary ring-2 ring-primary/20',
  },
  {
    key: 'content',
    icon: BookOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    selectedBg: 'bg-amber-50 border-primary ring-2 ring-primary/20',
  },
  {
    key: 'other',
    icon: HelpCircle,
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    selectedBg: 'bg-gray-50 border-primary ring-2 ring-primary/20',
  },
]

const CATEGORY_LABEL_KEYS: Record<FeedbackCategory, keyof ReturnType<typeof useLang>['t']> = {
  bug: 'feedbackCategoryBug',
  suggestion: 'feedbackCategorySuggestion',
  content: 'feedbackCategoryContent',
  other: 'feedbackCategoryOther',
}

function resetFormState() {
  return {
    category: null as FeedbackCategory | null,
    message: '',
    submitting: false,
    success: false,
    error: null as string | null,
  }
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useLang()
  const pathname = usePathname()

  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      const initial = resetFormState()
      setCategory(initial.category)
      setMessage(initial.message)
      setSubmitting(initial.submitting)
      setSuccess(initial.success)
      setError(initial.error)
    }
  }, [open])

  // Auto-close 3 s after success
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [success, onClose])

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  const charCount = message.length
  const trimmedLen = message.trim().length
  const charCountValid = trimmedLen >= 10 && charCount <= 500
  const isValid = category !== null && charCountValid && !submitting

  const charCountColor =
    charCount > 500 ? 'text-red-500' : trimmedLen < 10 && charCount > 0 ? 'text-red-500' : 'text-text-muted'

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
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? t.feedbackModalErrorGeneric)
        return
      }
      setSuccess(true)
    } catch {
      setError(t.feedbackModalErrorNetwork)
    } finally {
      setSubmitting(false)
    }
  }

  // Framer-motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Mobile: slide up from bottom; Desktop: scale + fade in from centre
  const sheetVariants = {
    hidden: { y: '100%', opacity: 0.5 },
    visible: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0.5 },
  }

  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 8 },
  }

  const spring = { type: 'spring', stiffness: 380, damping: 32 } as const
  const ease = { duration: 0.2, ease: 'easeOut' } as const

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="feedback-backdrop"
            className="fixed inset-0 z-[95] bg-black/40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* ── Mobile bottom-sheet (≤640 px) ── */}
          <motion.div
            key="feedback-sheet-mobile"
            className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col sm:hidden rounded-t-2xl bg-white shadow-2xl max-h-[82vh] overflow-hidden"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={spring}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <ModalContent
              t={t}
              category={category}
              setCategory={setCategory}
              message={message}
              setMessage={setMessage}
              charCount={charCount}
              charCountColor={charCountColor}
              trimmedLen={trimmedLen}
              submitting={submitting}
              success={success}
              error={error}
              isValid={isValid}
              onClose={onClose}
              onSubmit={handleSubmit}
            />
          </motion.div>

          {/* ── Desktop centred modal (>640 px) ── */}
          <div className="fixed inset-0 z-[100] hidden sm:flex items-center justify-center p-4">
            <motion.div
              key="feedback-modal-desktop"
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              variants={desktopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={ease}
            >
              <ModalContent
                t={t}
                category={category}
                setCategory={setCategory}
                message={message}
                setMessage={setMessage}
                charCount={charCount}
                charCountColor={charCountColor}
                trimmedLen={trimmedLen}
                submitting={submitting}
                success={success}
                error={error}
                isValid={isValid}
                onClose={onClose}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Shared inner content (rendered in both mobile + desktop containers) ─────

interface ContentProps {
  t: ReturnType<typeof useLang>['t']
  category: FeedbackCategory | null
  setCategory: (c: FeedbackCategory) => void
  message: string
  setMessage: (m: string) => void
  charCount: number
  charCountColor: string
  trimmedLen: number
  submitting: boolean
  success: boolean
  error: string | null
  isValid: boolean
  onClose: () => void
  onSubmit: () => void
}

function ModalContent({
  t,
  category,
  setCategory,
  message,
  setMessage,
  charCount,
  charCountColor,
  trimmedLen,
  submitting,
  success,
  error,
  isValid,
  onClose,
  onSubmit,
}: ContentProps) {
  return (
    <div className="flex flex-col max-h-[80vh] sm:max-h-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border shrink-0">
        <div>
          <h2 className="text-base font-semibold text-text">{t.feedbackModalTitle}</h2>
          <p className="text-xs text-text-muted mt-0.5">{t.feedbackModalSubtitle}</p>
        </div>
        <button
          onClick={onClose}
          aria-label={t.feedbackModalClose}
          className="ml-3 p-1.5 rounded-lg hover:bg-surface text-text-muted shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        {success ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-3">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-1">{t.feedbackModalSuccessTitle}</h3>
            <p className="text-sm text-text-muted mb-5">{t.feedbackModalSuccessSubtitle}</p>
            <Link
              href="/learn/feedback"
              onClick={onClose}
              className="inline-block px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t.feedbackModalViewHistory}
            </Link>
          </div>
        ) : (
          <>
            {/* Category grid */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                {t.feedbackModalCategoryLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ key, icon: Icon, color, bg, selectedBg }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm font-medium transition-all',
                      category === key ? selectedBg : bg,
                    ].join(' ')}
                  >
                    <Icon size={16} className={color} />
                    <span className="text-text leading-tight">{t[CATEGORY_LABEL_KEYS[key]]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message textarea */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                {t.feedbackModalMessageLabel}
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.feedbackModalMessagePlaceholder}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
              <div className="flex items-center justify-between mt-1">
                {trimmedLen > 0 && trimmedLen < 10 ? (
                  <span className="text-xs text-red-500">{t.feedbackModalMessageMin}</span>
                ) : (
                  <span />
                )}
                <span className={`text-xs ml-auto ${charCountColor}`}>{charCount} / 500</span>
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={!isValid}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? t.feedbackModalSubmitting : t.feedbackModalSubmit}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
