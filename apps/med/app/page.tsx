'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Mic,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { useLang } from '@/contexts/LanguageContext'

type PathStatus = 'live' | 'pilot' | 'interest'

type ProfessionalPath = {
  key: string
  title: string
  audience: string
  description: string
  status: PathStatus
  badge: string
  cta: string
  icon: string
  href?: string
  accent: string
  outcomes: string[]
}

type EnrollmentForm = {
  name: string
  email: string
  phone: string
  major: string
}

type PilotSpots = {
  taken: number
  total: number
  spotsLeft: number
  isFull: boolean
}

const INITIAL_FORM: EnrollmentForm = { name: '', email: '', phone: '', major: '' }

export default function Home() {
  const { t } = useLang()

  const FEATURED_PILOT: ProfessionalPath = {
    key: 'hcmute-technical-presentation',
    title: t.hpFeaturedTitle,
    audience: t.hpFeaturedAudience,
    description: t.hpFeaturedDesc,
    status: 'pilot',
    badge: t.hpBadgePilot,
    cta: t.hpFeaturedCta,
    icon: '🎓',
    accent: 'from-blue-600 to-indigo-600',
    outcomes: [t.hpFeaturedOutcome1, t.hpFeaturedOutcome2, t.hpFeaturedOutcome3],
  }

  const LIVE_PATH: ProfessionalPath = {
    key: 'emergency-nursing-communication',
    title: t.hpLiveTitle,
    audience: t.hpLiveAudience,
    description: t.hpLiveDesc,
    status: 'live',
    badge: t.hpBadgeLive,
    cta: t.hpLiveCta,
    icon: '🩺',
    href: '/learn/courses/emergency-nursing-communication',
    accent: 'from-rose-500 to-red-600',
    outcomes: [t.hpLiveOutcome1, t.hpLiveOutcome2, t.hpLiveOutcome3],
  }

  const FUTURE_PATHS: ProfessionalPath[] = [
    {
      // #1 — Workplace English (highest survey demand: 40%)
      key: 'workplace-communication',
      title: t.hpPath1Title,
      audience: t.hpPath1Audience,
      description: t.hpPath1Desc,
      status: 'interest',
      badge: t.hpFutureInterestBadge,
      cta: t.hpFutureInterestCta,
      icon: '🤝',
      accent: 'from-emerald-500 to-teal-600',
      outcomes: [t.hpPath1Outcome1, t.hpPath1Outcome2, t.hpPath1Outcome3],
    },
    {
      // #2 — Internship Interviews (second-highest pain point: 35%)
      key: 'internship-interview-english',
      title: t.hpPath2Title,
      audience: t.hpPath2Audience,
      description: t.hpPath2Desc,
      status: 'interest',
      badge: t.hpFutureInterestBadge,
      cta: t.hpFutureInterestCta,
      icon: '💼',
      accent: 'from-amber-500 to-orange-500',
      outcomes: [t.hpPath2Outcome1, t.hpPath2Outcome2, t.hpPath2Outcome3],
    },
    {
      // #3 — Technical Reports & Labs (renamed from "Lab Communication"; targets IT/engineering 30%)
      key: 'engineering-lab-communication',
      title: t.hpPath3Title,
      audience: t.hpPath3Audience,
      description: t.hpPath3Desc,
      status: 'interest',
      badge: t.hpFutureInterestBadge,
      cta: t.hpFutureInterestCta,
      icon: '💻',
      accent: 'from-slate-700 to-slate-900',
      outcomes: [t.hpPath3Outcome1, t.hpPath3Outcome2, t.hpPath3Outcome3],
    },
  ]

  const LEARNING_LOOP = [
    { icon: PlayCircle, title: t.hpLoop1Title, desc: t.hpLoop1Desc },
    { icon: Mail,        title: t.hpLoop2Title, desc: t.hpLoop2Desc },
    { icon: Sparkles,   title: t.hpLoop3Title, desc: t.hpLoop3Desc },
    { icon: Mic,        title: t.hpLoop4Title, desc: t.hpLoop4Desc },
  ]

  const PREVIEW_ITEMS = [t.hpPreviewItem1, t.hpPreviewItem2, t.hpPreviewItem3]

  const [selectedPath, setSelectedPath] = useState<ProfessionalPath | null>(null)
  const [form, setForm] = useState<EnrollmentForm>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedPathKey, setSubmittedPathKey] = useState<string | null>(null)
  const [pilotSpots, setPilotSpots] = useState<PilotSpots | null>(null)

  useEffect(() => {
    fetch('/api/pilot-spots')
      .then((r) => r.json())
      .then((d) => { if (d.success) setPilotSpots(d.data) })
      .catch(() => {})
  }, [])

  const openEnrollment = (path: ProfessionalPath) => {
    setSelectedPath(path)
    setSubmitError('')
  }

  const closeEnrollment = () => {
    setSelectedPath(null)
    setForm(INITIAL_FORM)
    setSubmitError('')
  }

  const updateForm = (field: keyof EnrollmentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitEnrollment = async () => {
    if (!selectedPath || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pilot_interest',
          courseKey: selectedPath.key,
          courseTitle: selectedPath.title,
          intent: selectedPath.status === 'pilot' ? 'pilot' : 'interest',
          source: 'homepage_professional_paths',
          ...form,
        }),
      })
      const payload = await response.json()
      if (response.status === 409 && payload.error === 'SPOTS_FULL') {
        setPilotSpots((prev) => prev ? { ...prev, spotsLeft: 0, isFull: true } : prev)
        throw new Error(t.hpSpotsFull)
      }
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? t.hpModalError)
      }
      setPilotSpots((prev) => prev ? { ...prev, taken: prev.taken + 1, spotsLeft: Math.max(0, prev.spotsLeft - 1), isFull: prev.spotsLeft <= 1 } : prev)
      setSubmittedPathKey(selectedPath.key)
      closeEnrollment()
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message === t.hpSpotsFull) setSubmitError(message)
      else if (/failed to fetch|network|abort/i.test(message)) setSubmitError(t.hpModalError)
      else setSubmitError(message || t.hpModalError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[var(--text)]">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full bg-purple-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-24 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                {t.hpHeroBadge}
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl md:leading-[1.08]">
                {t.hpHeroTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                {t.hpHeroSubtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => !pilotSpots?.isFull && openEnrollment(FEATURED_PILOT)}
                  disabled={pilotSpots?.isFull}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pilotSpots?.isFull ? t.hpSpotsFullBtn : t.hpHeroCtaPilot}
                  {!pilotSpots?.isFull && <ArrowRight className="h-4 w-4" />}
                </button>
                <Link
                  href="/learn/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {t.hpHeroCtaLive}
                </Link>
              </div>

              {/* Nurse shortcut — lets nurses jump straight to the live course without scrolling */}
              <a
                href="#nursing-course"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-rose-600"
              >
                🩺 {t.hpHeroCtaNurse}
              </a>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-blue-900/10 backdrop-blur">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">{t.hpPreviewLabel}</p>
                    <h2 className="mt-1 text-xl font-bold">{t.hpPreviewTitle}</h2>
                  </div>
                  <button
                    onClick={() => !pilotSpots?.isFull && openEnrollment(FEATURED_PILOT)}
                    disabled={pilotSpots?.isFull}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-transform ${
                      pilotSpots?.isFull
                        ? 'cursor-not-allowed bg-red-500/30 text-red-200'
                        : pilotSpots && pilotSpots.spotsLeft <= 10
                          ? 'animate-pulse cursor-pointer bg-red-500/25 text-red-200 hover:scale-105'
                          : 'cursor-pointer bg-emerald-400/15 text-emerald-200 hover:scale-105 hover:bg-emerald-400/25'
                    }`}
                  >
                    {pilotSpots
                      ? pilotSpots.isFull
                        ? t.hpSpotsFull
                        : `🔥 ${pilotSpots.spotsLeft} ${t.hpSpotsLeft}`
                      : t.hpPreviewSlots}
                  </button>
                </div>

                <div className="space-y-3">
                  {PREVIEW_ITEMS.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      <span className="text-sm text-white/90">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-blue-500/15 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
                    <Mic className="h-4 w-4" />
                    {t.hpPreviewAudioHeading}
                  </div>
                  <p className="text-sm leading-6 text-white/75">{t.hpPreviewAudioBody}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live + Featured Pilot */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{t.hpPathsEyebrow}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{t.hpPathsTitle}</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">{t.hpPathsNote}</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <PathCard id="nursing-course" path={LIVE_PATH} onEnroll={openEnrollment} submitted={submittedPathKey === LIVE_PATH.key} t={t} />
              <FeaturedPilotCard id="hcmute-pilot" path={FEATURED_PILOT} onEnroll={openEnrollment} submitted={submittedPathKey === FEATURED_PILOT.key} t={t} spots={pilotSpots} />
            </div>
          </div>
        </section>

        {/* Interest capture */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{t.hpFutureEyebrow}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{t.hpFutureTitle}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t.hpFutureNote}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FUTURE_PATHS.map((path) => (
                <PathCard key={path.key} path={path} onEnroll={openEnrollment} submitted={submittedPathKey === path.key} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* Learning loop */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-xl md:grid-cols-[0.85fr_1.15fr] md:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">{t.hpLoopEyebrow}</p>
                <h2 className="mt-2 text-3xl font-extrabold">{t.hpLoopTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-white/70">{t.hpLoopBody}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {LEARNING_LOOP.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <Icon className="mb-3 h-5 w-5 text-blue-200" />
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/65">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {selectedPath && (
        <EnrollmentModal
          path={selectedPath}
          form={form}
          submitting={submitting}
          error={submitError}
          onClose={closeEnrollment}
          onSubmit={submitEnrollment}
          onChange={updateForm}
          t={t}
        />
      )}
    </div>
  )
}

type TranslationMap = ReturnType<typeof useLang>['t']

function PathCard({
  path,
  onEnroll,
  submitted,
  t,
  id,
}: {
  path: ProfessionalPath
  onEnroll: (path: ProfessionalPath) => void
  submitted: boolean
  t: TranslationMap
  id?: string
}) {
  const isLive = path.status === 'live'

  return (
    <article id={id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent} text-2xl shadow-lg shadow-slate-900/10`}>
          {path.icon}
        </div>
        <StatusBadge status={path.status} label={path.badge} />
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{path.audience}</p>
      <h3 className="text-xl font-extrabold leading-tight text-slate-950">{path.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{path.description}</p>

      <div className="my-5 space-y-2 border-y border-slate-100 py-4">
        {path.outcomes.map((outcome) => (
          <div key={outcome} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {outcome}
          </div>
        ))}
      </div>

      {isLive && path.href ? (
        <Link
          href={path.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          {path.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          onClick={() => onEnroll(path)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          {submitted ? t.hpModalSubmitted : path.cta}
          {submitted ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      )}
    </article>
  )
}

function FeaturedPilotCard({
  id,
  path,
  onEnroll,
  submitted,
  t,
  spots,
}: {
  id?: string
  path: ProfessionalPath
  onEnroll: (path: ProfessionalPath) => void
  submitted: boolean
  t: TranslationMap
  spots: PilotSpots | null
}) {
  const fillPct = spots ? Math.min(100, (spots.taken / spots.total) * 100) : 0
  const barColor =
    spots && spots.spotsLeft <= 5
      ? '#ef4444'
      : spots && spots.spotsLeft <= 15
        ? '#f97316'
        : '#34d399'

  return (
    <article id={id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-2xl shadow-blue-900/20 md:p-8">
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/15 blur-3xl" />
      <div className="relative grid h-full gap-8 md:grid-cols-[1fr_0.85fr]">
        <div>
          <StatusBadge status={path.status} label={path.badge} inverted />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-blue-100">{t.hpPreviewLabel}</p>
          <h3 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{path.title}</h3>
          <p className="mt-4 text-sm leading-7 text-blue-50/85">{path.description}</p>

          {/* ── Scarcity block ─────────────────────────────────── */}
          {spots && (
            <div className="mt-5 rounded-2xl border border-white/15 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">{t.hpSpotsLabel}</span>
                <span className={`text-xs font-extrabold ${spots.isFull ? 'text-red-300' : spots.spotsLeft <= 10 ? 'animate-pulse text-red-300' : 'text-emerald-300'}`}>
                  {spots.isFull
                    ? t.hpSpotsFull
                    : spots.spotsLeft <= 10
                      ? `${t.hpSpotsAlmostFull}: ${spots.spotsLeft} left`
                      : `🔥 ${spots.spotsLeft} ${t.hpSpotsLeft}`}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${fillPct}%`, backgroundColor: barColor }}
                />
              </div>
              <p className="mt-1.5 text-xs text-white/40">{spots.taken} {t.hpSpotsOf}</p>
            </div>
          )}

          <button
            onClick={() => !spots?.isFull && onEnroll(path)}
            disabled={spots?.isFull}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {spots?.isFull ? t.hpSpotsFullBtn : submitted ? t.hpModalSubmittedFull : path.cta}
            {!spots?.isFull && (submitted ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
          </button>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">{path.icon}</div>
            <div>
              <p className="text-sm font-bold">{t.hpFeaturedPreviewNote1}</p>
              <p className="text-xs text-blue-100">{t.hpFeaturedPreviewNote2}</p>
            </div>
          </div>
          <div className="space-y-3">
            {path.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-2xl bg-white/10 p-3 text-sm text-white/90">
                {outcome}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ status, label, inverted = false }: { status: PathStatus; label: string; inverted?: boolean }) {
  const styles = {
    live: inverted ? 'bg-emerald-300/20 text-emerald-50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pilot: inverted ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border-blue-200',
    interest: inverted ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

type FieldErrors = Partial<Record<keyof EnrollmentForm, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EnrollmentModal({
  path,
  form,
  submitting,
  error,
  onClose,
  onSubmit,
  onChange,
  t,
}: {
  path: ProfessionalPath
  form: EnrollmentForm
  submitting: boolean
  error: string
  onClose: () => void
  onSubmit: () => void
  onChange: (field: keyof EnrollmentForm, value: string) => void
  t: TranslationMap
}) {
  const isPilot = path.status === 'pilot'
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!form.name.trim()) next.name = t.hpModalNameRequired
    if (!form.email.trim()) next.email = t.hpModalEmailRequired
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = t.hpModalEmailInvalid
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit()
  }

  const handleChange = (field: keyof EnrollmentForm, value: string) => {
    onChange(field, value)
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const updated = { ...current }
        delete updated[field]
        return updated
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
              {isPilot ? t.hpModalLabelPilot : t.hpModalLabelInterest}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{path.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.hpModalDesc}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={t.hpModalClose}>
            ×
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{t.hpModalName}</span>
            <input
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              aria-invalid={!!fieldErrors.name}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-blue-100 ${fieldErrors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
              placeholder="Nguyễn Văn A"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{t.hpModalEmail}</span>
            <input
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              aria-invalid={!!fieldErrors.email}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-blue-100 ${fieldErrors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
              placeholder="you@email.com"
              type="email"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">{t.hpModalPhone}</span>
              <input
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder={t.hpModalPhonePlaceholder}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">{t.hpModalMajor}</span>
              <input
                value={form.major}
                onChange={(event) => handleChange('major', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder={t.hpModalMajorPlaceholder}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            {t.hpModalCancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.hpModalSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}
