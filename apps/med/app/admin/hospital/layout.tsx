'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { Copy, Check, RefreshCw } from 'lucide-react'

// ─── Hospital context shared with all sub-pages ───────────────────────────
export type HospitalOption = { id: string; name: string; invite_code?: string | null }
export const HospitalCtx = createContext<{ selectedId: string; setSelectedId: (id: string) => void; hospitals: HospitalOption[] }>({
  selectedId: '',
  setSelectedId: () => {},
  hospitals: [],
})
export const useHospitalCtx = () => useContext(HospitalCtx)

const STORAGE_KEY = 'hosp_dash_selected'

export default function HospitalDashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang()
  const pathname = usePathname()
  const [hospitals, setHospitals] = useState<HospitalOption[]>([])
  const [selectedId, setSelectedIdState] = useState('')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  const TABS = [
    { label: t.hospTabOverview, href: '/admin/hospital' },
    { label: t.hospTabLearners, href: '/admin/hospital/learners' },
    { label: t.hospTabCourses, href: '/admin/hospital/courses' },
    { label: t.hospTabSpeaking, href: '/admin/hospital/speaking' },
  ]

  useEffect(() => {
    fetch('/api/hospitals')
      .then(r => r.json())
      .then(data => {
        if (data.success) setHospitals(data.data ?? [])
      })
      .catch(() => {})

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setSelectedIdState(saved)
  }, [])

  useEffect(() => {
    const hosp = hospitals.find(h => h.id === selectedId)
    setInviteCode(hosp?.invite_code ?? null)
  }, [selectedId, hospitals])

  const setSelectedId = (id: string) => {
    setSelectedIdState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const handleGenerateCode = async () => {
    if (!selectedId) return
    setGenerating(true)
    try {
      const res = await fetch(`/api/hospitals/${selectedId}/invite-code`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setInviteCode(data.data.invite_code)
        setHospitals(prev => prev.map(h => h.id === selectedId ? { ...h, invite_code: data.data.invite_code } : h))
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!inviteCode) return
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isTab = (href: string) => {
    if (href === '/admin/hospital') return pathname === '/admin/hospital'
    return pathname.startsWith(href)
  }

  return (
    <HospitalCtx.Provider value={{ selectedId, setSelectedId, hospitals }}>
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-text">{t.hospDashTitle}</h1>
          <p className="text-sm text-text-muted mt-0.5">{t.hospDashSubtitle}</p>
        </div>

        {/* Hospital selector + invite code */}
        <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="input w-full text-sm"
            >
              <option value="">{t.hospSelectPlaceholder}</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {selectedId && (
            <div className="flex items-center gap-2 flex-wrap">
              {inviteCode ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-medium">{t.hospInviteCodeLabel}:</span>
                  <code className="px-2.5 py-1 bg-surface rounded-lg text-sm font-mono font-bold text-primary border border-border tracking-wider">
                    {inviteCode}
                  </code>
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-surface border border-border text-text-muted" title={t.hospCopyCode}>
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                  <button onClick={handleGenerateCode} className="p-1.5 rounded-lg hover:bg-surface border border-border text-text-muted" title={t.hospGenerateCode}>
                    <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60"
                >
                  {generating ? t.hospGenerating : t.hospGenerateCode}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                isTab(tab.href)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Page content */}
        <div>{children}</div>
      </div>
    </HospitalCtx.Provider>
  )
}
