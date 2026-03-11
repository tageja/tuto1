'use client'

import { useEffect, useState } from 'react'
import { Users, Activity, AlertTriangle, BarChart3, Mic, Users2, BookOpen, TrendingUp } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useHospitalCtx } from './layout'
import type { HospitalOverview } from '@/lib/db/progress'
import type { HospitalCourseFunnelRow } from '@/lib/db/progress'

export default function HospitalOverviewPage() {
  const { t } = useLang()
  const { selectedId } = useHospitalCtx()
  const [overview, setOverview] = useState<HospitalOverview | null>(null)
  const [funnel, setFunnel] = useState<HospitalCourseFunnelRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) {
      setOverview(null)
      setFunnel([])
      return
    }
    setLoading(true)
    Promise.all([
      fetch(`/api/hospitals/${selectedId}/overview`).then(r => r.json()),
      fetch(`/api/hospitals/${selectedId}/funnel`).then(r => r.json()),
    ])
      .then(([ov, fn]) => {
        if (ov.success) setOverview(ov.data)
        if (fn.success) setFunnel(fn.data)
      })
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!selectedId) {
    return (
      <div className="card text-center py-16 text-text-muted">
        <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">{t.hospNoSelection}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-16 text-text-muted text-sm animate-pulse">
        {t.loading}
      </div>
    )
  }

  const kpiCards = overview
    ? [
        { label: t.hospKpiEnrolled, value: overview.totalEnrolled, icon: Users, color: 'text-primary bg-primary-light' },
        { label: t.hospKpiActive, value: overview.activeThisWeek, icon: Activity, color: 'text-green-600 bg-green-50' },
        { label: t.hospKpiAtRisk, value: overview.atRisk, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
        { label: t.hospKpiAvgQuiz, value: `${Math.round(overview.avgQuizScore)}%`, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
        { label: t.hospKpiAvgCompletion, value: `${Math.round(overview.avgCompletion)}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
        { label: t.hospKpiLessonsCompleted, value: overview.completedLessons, icon: BookOpen, color: 'text-cyan-600 bg-cyan-50' },
        { label: t.hospKpiRecordings, value: overview.recordingSubmissions, icon: Mic, color: 'text-rose-600 bg-rose-50' },
        { label: t.hospKpiPairSessions, value: overview.pairSessionsCount, icon: Users2, color: 'text-amber-600 bg-amber-50' },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-2`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="text-xs text-text-muted mt-0.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="card">
        <h2 className="text-base font-semibold text-text mb-3">{t.hospAlertsTitle}</h2>
        {overview && overview.atRisk > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-700">
            <AlertTriangle size={16} />
            <span>{t.hospAlertInactive.replace('{n}', String(overview.atRisk))}</span>
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t.hospNoAlerts}</p>
        )}
      </div>

      {/* Course funnel */}
      <div className="card">
        <h2 className="text-base font-semibold text-text mb-4">{t.hospFunnelTitle}</h2>
        {funnel.length === 0 ? (
          <p className="text-sm text-text-muted">{t.hospFunnelEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-border">
                  <th className="pb-2 font-medium pr-4">Course</th>
                  <th className="pb-2 font-medium text-center px-2">{t.hospFunnelEnrolled}</th>
                  <th className="pb-2 font-medium text-center px-2">{t.hospFunnelStarted}</th>
                  <th className="pb-2 font-medium text-center px-2">{t.hospFunnelModule1}</th>
                  <th className="pb-2 font-medium text-center px-2">{t.hospFunnelCompleted}</th>
                  <th className="pb-2 font-medium text-center px-2">{t.hospFunnelAvgScore}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {funnel.map(row => (
                  <tr key={row.course_id}>
                    <td className="py-3 font-medium text-text pr-4 max-w-[180px] truncate">{row.course_title ?? '—'}</td>
                    <td className="py-3 text-center px-2">{row.enrolled}</td>
                    <td className="py-3 text-center px-2">
                      <span className={row.started > 0 ? 'text-green-700' : 'text-text-muted'}>{row.started}</span>
                    </td>
                    <td className="py-3 text-center px-2">
                      <span className={row.completed_module1 > 0 ? 'text-primary' : 'text-text-muted'}>{row.completed_module1}</span>
                    </td>
                    <td className="py-3 text-center px-2">
                      <span className={row.completed_full > 0 ? 'text-purple-700 font-semibold' : 'text-text-muted'}>{row.completed_full}</span>
                    </td>
                    <td className="py-3 text-center px-2">{row.avg_quiz_score > 0 ? `${Math.round(row.avg_quiz_score)}%` : '—'}</td>
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
