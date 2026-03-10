'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useHospitalCtx } from '../layout'
import type { HospitalNurseRosterRow } from '@/lib/db/progress'

function statusBadge(row: HospitalNurseRosterRow, t: Record<string, string>) {
  const lastActive = row.last_active ? new Date(row.last_active) : null
  const now = new Date()
  const daysSince = lastActive ? (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24) : Infinity

  if (daysSince <= 7) return <span className="badge badge-green">{t.hospStatusActive}</span>
  if (daysSince <= 14) return <span className="badge badge-yellow">{t.hospStatusAtRisk}</span>
  return <span className="badge badge-gray">{t.hospStatusInactive}</span>
}

function formatDate(dateStr: string | null, neverLabel: string) {
  if (!dateStr) return neverLabel
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LearnersPage() {
  const { t } = useLang()
  const { selectedId } = useHospitalCtx()
  const [roster, setRoster] = useState<HospitalNurseRosterRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) { setRoster([]); return }
    setLoading(true)
    fetch(`/api/hospitals/${selectedId}/roster`)
      .then(r => r.json())
      .then(data => { if (data.success) setRoster(data.data ?? []) })
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!selectedId) {
    return (
      <div className="card text-center py-16 text-text-muted">
        <Users size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">{t.hospNoSelection}</p>
      </div>
    )
  }

  const filtered = roster.filter(r => {
    const q = search.toLowerCase()
    return (
      !q ||
      r.email?.toLowerCase().includes(q) ||
      r.display_name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-text">{t.hospLearnersTitle}</h2>
          <p className="text-xs text-text-muted">{t.hospLearnersSubtitle}</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.hospSearchPlaceholder}
          className="input text-sm w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="card text-center py-12 text-sm text-text-muted animate-pulse">{t.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-sm text-text-muted">{t.hospLearnersEmpty}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-border">
            {filtered.map((row, i) => (
              <div key={i} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text truncate">{row.display_name ?? row.email}</p>
                  {statusBadge(row, t as unknown as Record<string, string>)}
                </div>
                <p className="text-xs text-text-muted">{row.email}</p>
                <p className="text-xs text-text-muted">{row.course_title ?? '—'}</p>
                <div className="flex gap-3 text-xs text-text-muted">
                  <span>{t.hospColLessons}: <strong className="text-text">{row.completed_lessons}</strong></span>
                  <span>{t.hospColLastActive}: <strong className="text-text">{formatDate(row.last_active, t.hospNever)}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted bg-surface border-b border-border">
                  <th className="px-4 py-3 font-medium">{t.hospColNurse}</th>
                  <th className="px-4 py-3 font-medium">{t.hospColCourse}</th>
                  <th className="px-4 py-3 font-medium text-center">{t.hospColStatus}</th>
                  <th className="px-4 py-3 font-medium text-center">{t.hospColLessons}</th>
                  <th className="px-4 py-3 font-medium">{t.hospColLastActive}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{row.display_name ?? row.email}</p>
                      {row.display_name && <p className="text-xs text-text-muted">{row.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-muted max-w-[200px] truncate">{row.course_title ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(row, t as unknown as Record<string, string>)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text">{row.completed_lessons}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{formatDate(row.last_active, t.hospNever)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
