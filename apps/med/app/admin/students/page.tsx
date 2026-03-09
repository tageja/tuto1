'use client'

import { useEffect, useState } from 'react'
import { Users, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function AdminStudentsPage() {
  const { t } = useLang()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hospitals')
      .then((r) => r.json())
      .then((j) => {
        setEnrollments(j.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-text">{t.adminStudentsTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.adminStudentsSubtitle}</p>
        </div>
        <button className="btn-ghost text-sm">
          <RefreshCw size={15} /> {t.btnRefresh}
        </button>
      </div>

      {loading ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-text-muted">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">{t.loading}</p>
        </div>
      ) : (
        <div className="card p-8 flex flex-col items-center gap-3 text-center">
          <Users size={48} className="text-text-muted/40" />
          <p className="text-lg font-semibold text-text">{t.featureWipTitle}</p>
          <p className="text-sm text-text-muted max-w-sm">
            {t.featureWipDesc.split(t.featureWipLink).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <Link href="/admin/analytics" className="font-semibold underline">
                    {t.featureWipLink}
                  </Link>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
      )}
    </div>
  )
}
