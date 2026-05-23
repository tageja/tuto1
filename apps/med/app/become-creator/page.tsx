'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Sparkles } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'

const EMPTY_FORM = {
  full_name: '',
  profession: '',
  organisation: '',
  organisation_type: 'independent',
  topic_area: '',
  why_create: '',
}

export default function BecomeCreatorPage() {
  const { t } = useLang()
  const { user, profile, loading } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/creator-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('submit failed')
      setSubmitted(true)
      setForm(EMPTY_FORM)
    } catch {
      setError(t.creatorApplyError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <LandingNav />

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div className="card p-6 md:p-8 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-5">
              <Sparkles size={22} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t.creatorApplyTitle}</h1>
            <p className="text-text-muted leading-relaxed">{t.creatorApplySubtitle}</p>

            <div className="mt-6 space-y-3 text-sm text-text-muted">
              <div className="flex gap-2">
                <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                <span>Template-first courses keep quality consistent.</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                <span>Start with a smaller course and expand after review.</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                <span>Video production is requested from admins; creator audio comes later.</span>
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-8 bg-white">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle size={42} className="text-success mx-auto mb-4" />
                <h2 className="mb-2">{t.creatorApplySuccessTitle}</h2>
                <p className="text-text-muted">{t.creatorApplySuccessBody}</p>
              </div>
            ) : !loading && !user ? (
              <div className="text-center py-10">
                <h2 className="mb-2">{t.creatorApplyLoginRequired}</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/login?next=/become-creator" className="btn-primary">
                    {t.creatorApplyCtaLogin}
                  </Link>
                  <Link href="/auth/register" className="btn-secondary">
                    {t.creatorApplyCtaRegister}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {user && (
                  <p className="text-xs text-text-muted">
                    {t.creatorApplySignedInAs}: {user.email}
                  </p>
                )}
                <div>
                  <label className="label">{t.creatorApplyFullName}</label>
                  <input
                    className="input"
                    name="full_name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder={profile?.full_name ?? 'Tarun Sharma'}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t.creatorApplyProfession}</label>
                    <input
                      className="input"
                      name="profession"
                      required
                      value={form.profession}
                      onChange={(e) => setForm({ ...form, profession: e.target.value })}
                      placeholder="Registered Nurse"
                    />
                  </div>
                  <div>
                    <label className="label">{t.creatorApplyTopicArea}</label>
                    <input
                      className="input"
                      name="topic_area"
                      required
                      value={form.topic_area}
                      onChange={(e) => setForm({ ...form, topic_area: e.target.value })}
                      placeholder="Emergency communication"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      {t.creatorApplyOrganisation} <span className="text-text-muted">({t.creatorApplyOrganisationOptional})</span>
                    </label>
                    <input
                      className="input"
                      name="organisation"
                      value={form.organisation}
                      onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                      placeholder="CHIR, HCMUTE, Company..."
                    />
                  </div>
                  <div>
                    <label className="label">{t.creatorApplyOrganisationType}</label>
                    <select
                      className="input"
                      value={form.organisation_type}
                      onChange={(e) => setForm({ ...form, organisation_type: e.target.value })}
                    >
                      <option value="independent">Independent</option>
                      <option value="hospital">Hospital</option>
                      <option value="university">University</option>
                      <option value="company">Company</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">{t.creatorApplyWhy}</label>
                  <textarea
                    className="input min-h-32 resize-y"
                    name="why_create"
                    required
                    minLength={10}
                    value={form.why_create}
                    onChange={(e) => setForm({ ...form, why_create: e.target.value })}
                    placeholder="I want to help new nurses practise the exact English they need on shift..."
                  />
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
                <button
                  type="submit"
                  className="btn-primary w-full justify-center"
                  disabled={submitting || loading}
                >
                  {submitting ? t.creatorApplySubmitting : t.creatorApplySubmit}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
