'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Download, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import SurveyVoucherUploader from '@/components/admin/SurveyVoucherUploader'
import SurveyAnalytics from '@/components/admin/SurveyAnalytics'
import type { NursedSurveyResponse } from '@/lib/supabase'

interface SurveySettings {
  voucher_image_url: string | null
  voucher_title: string | null
  is_active: boolean
}

const DEFAULT_SETTINGS: SurveySettings = {
  voucher_image_url: null,
  voucher_title: null,
  is_active: true,
}

export default function SurveysAdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const { t } = useLang()

  const [settings, setSettings] = useState<SurveySettings>(DEFAULT_SETTINGS)
  const [responses, setResponses] = useState<NursedSurveyResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && profile?.role !== 'super_admin') {
      router.replace('/admin')
    }
  }, [profile, loading, router])

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [settingsRes, responsesRes] = await Promise.all([
        fetch('/api/site-settings/survey-hcmute'),
        fetch('/api/surveys/hcmute?limit=200'),
      ])
      if (settingsRes.ok) {
        const json = await settingsRes.json()
        setSettings(json.data ?? DEFAULT_SETTINGS)
      }
      if (responsesRes.ok) {
        const json = await responsesRes.json()
        setResponses(json.data ?? [])
        setTotal(json.total ?? 0)
      }
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      fetchData()
    }
  }, [profile, fetchData])

  const exportCsv = () => {
    if (responses.length === 0) return
    const headers = ['id', 'name', 'email', 'age', 'gender', 'phone', 'answers', 'created_at']
    const rows = responses.map((r) => [
      r.id,
      r.name,
      r.email,
      r.age ?? '',
      r.gender ?? '',
      r.phone ?? '',
      JSON.stringify(r.answers),
      r.created_at,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hcmute_survey_responses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{t.surveyAdminTitle}</h1>
          <p className="text-sm text-text-muted mt-0.5">HCMUTE Survey — hcmute_2026</p>
        </div>
        <a
          href="/survey-hcmute"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline font-medium"
        >
          Open survey page ↗
        </a>
      </div>

      {/* Analytics dashboard */}
      {responses.length > 0 && (
        <section>
          <SurveyAnalytics responses={responses} />
        </section>
      )}

      {/* Voucher settings */}
      <section className="bg-white rounded-2xl border border-border p-6 shadow-card">
        <h2 className="text-base font-bold text-text mb-5">{t.surveyAdminVoucherSection}</h2>
        <SurveyVoucherUploader initial={settings} onSaved={setSettings} />
      </section>

      {/* Responses */}
      <section className="bg-white rounded-2xl border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-text">{t.surveyAdminResponsesSection}</h2>
            <p className="text-sm text-text-muted">{total} response{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white text-xs font-medium text-text-muted hover:bg-surface transition-all"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={responses.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              {t.surveyAdminExportCsv}
            </button>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">
            {t.surveyAdminNoResponses}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Email', 'Age', 'Gender', 'Major (Q1b)', 'Submitted'].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {responses.map((r) => {
                  const major = (r.answers as Record<string, unknown>)?.q1b_major
                  return (
                    <tr key={r.id} className="hover:bg-surface transition-colors">
                      <td className="px-3 py-3 font-medium text-text">{r.name}</td>
                      <td className="px-3 py-3 text-text-muted">{r.email}</td>
                      <td className="px-3 py-3 text-text-muted">{r.age ?? '—'}</td>
                      <td className="px-3 py-3 text-text-muted capitalize">{r.gender ?? '—'}</td>
                      <td className="px-3 py-3 text-text-muted">{String(major ?? '—')}</td>
                      <td className="px-3 py-3 text-text-muted">
                        {new Date(r.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
