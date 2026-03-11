'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useHospitalCtx } from '../layout'
import type { HospitalCourseFunnelRow } from '@/lib/db/progress'

function ProgressBar({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden border border-border">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-muted w-6 text-right">{value}</span>
    </div>
  )
}

export default function CoursesPage() {
  const { t } = useLang()
  const { selectedId } = useHospitalCtx()
  const [funnel, setFunnel] = useState<HospitalCourseFunnelRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) { setFunnel([]); return }
    setLoading(true)
    fetch(`/api/hospitals/${selectedId}/funnel`)
      .then(r => r.json())
      .then(data => { if (data.success) setFunnel(data.data ?? []) })
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!selectedId) {
    return (
      <div className="card text-center py-16 text-text-muted">
        <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">{t.hospNoSelection}</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card text-center py-12 text-sm text-text-muted animate-pulse">{t.loading}</div>
  }

  if (funnel.length === 0) {
    return <div className="card text-center py-12 text-sm text-text-muted">{t.hospCoursesEmpty}</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">{t.hospCoursesTitle}</h2>
        <p className="text-xs text-text-muted">{t.hospCoursesSubtitle}</p>
      </div>

      {funnel.map(row => (
        <div key={row.course_id} className="card space-y-4">
          {/* Course header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-text">{row.course_title ?? '—'}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                <span>{t.hospKpiAvgQuiz}: <strong className="text-text">{row.avg_quiz_score > 0 ? `${Math.round(row.avg_quiz_score)}%` : '—'}</strong></span>
                <span>{t.hospKpiAvgCompletion}: <strong className="text-text">{row.avg_completion > 0 ? `${Math.round(row.avg_completion)}%` : '—'}</strong></span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-blue">{row.enrolled} {t.hospFunnelEnrolled}</span>
            </div>
          </div>

          {/* Funnel bars */}
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">{t.hospFunnelStarted}</span>
                <span className="font-medium text-text">{row.enrolled > 0 ? `${Math.round((row.started / row.enrolled) * 100)}%` : '—'}</span>
              </div>
              <ProgressBar value={row.started} max={row.enrolled} color="bg-primary" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">{t.hospFunnelModule1}</span>
                <span className="font-medium text-text">{row.enrolled > 0 ? `${Math.round((row.completed_module1 / row.enrolled) * 100)}%` : '—'}</span>
              </div>
              <ProgressBar value={row.completed_module1} max={row.enrolled} color="bg-primary" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">{t.hospFunnelCompleted}</span>
                <span className="font-medium text-text">{row.enrolled > 0 ? `${Math.round((row.completed_full / row.enrolled) * 100)}%` : '—'}</span>
              </div>
              <ProgressBar value={row.completed_full} max={row.enrolled} color="bg-green-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
