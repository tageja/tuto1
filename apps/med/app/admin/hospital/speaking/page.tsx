'use client'

import { useEffect, useState } from 'react'
import { Mic, Brain, Target, Users2, Info } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useHospitalCtx } from '../layout'
import type { HospitalSpeakingStats } from '@/lib/db/progress'

export default function SpeakingPage() {
  const { t } = useLang()
  const { selectedId } = useHospitalCtx()
  const [stats, setStats] = useState<HospitalSpeakingStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) { setStats(null); return }
    setLoading(true)
    fetch(`/api/hospitals/${selectedId}/speaking`)
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.data) })
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!selectedId) {
    return (
      <div className="card text-center py-16 text-text-muted">
        <Mic size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">{t.hospNoSelection}</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card text-center py-12 text-sm text-text-muted animate-pulse">{t.loading}</div>
  }

  const kpis = stats
    ? [
        { label: t.hospSpeakingRecordings, value: stats.totalRecordings, icon: Mic, color: 'text-rose-600 bg-rose-50' },
        { label: t.hospSpeakingQuiz, value: stats.totalQuizSubmissions, icon: Brain, color: 'text-purple-600 bg-purple-50' },
        { label: t.hospSpeakingMissions, value: stats.totalMissionSubmissions, icon: Target, color: 'text-amber-600 bg-amber-50' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-text">{t.hospSpeakingTitle}</h2>
        <p className="text-xs text-text-muted">{t.hospSpeakingSubtitle}</p>
      </div>

      {/* Speaking KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-2`}>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-bold text-text">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pair groups */}
      <div className="card">
        <h3 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
          <Users2 size={16} />
          {t.hospPairGroupsTitle}
        </h3>

        {!stats || stats.pairGroups.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-text-muted">{t.hospPairEmpty}</p>
            {stats && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary-light border border-primary/20 text-xs text-primary mt-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p>{t.hospSpeakingShareHint}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-border">
                  <th className="pb-2 font-medium pr-4">{t.hospPairGroup}</th>
                  <th className="pb-2 font-medium text-center px-3">{t.hospPairMembers}</th>
                  <th className="pb-2 font-medium text-center px-3">{t.hospPairSessions}</th>
                  <th className="pb-2 font-medium px-3">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.pairGroups.map(group => (
                  <tr key={group.id} className="hover:bg-surface/50">
                    <td className="py-3 pr-4 font-medium text-text">{group.name ?? '—'}</td>
                    <td className="py-3 px-3 text-center">{group.memberCount}</td>
                    <td className="py-3 px-3 text-center">{group.sessionsCount}</td>
                    <td className="py-3 px-3">
                      <code className="text-xs px-2 py-0.5 bg-surface rounded border border-border text-text-muted font-mono">
                        {group.join_code}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
