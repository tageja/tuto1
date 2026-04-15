'use client'

import { Users, Lock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function JoinGroupGate() {
  const { t } = useLang()

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="card p-8 max-w-md w-full text-center space-y-6 border-warning bg-amber-50/50">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Lock size={28} className="text-amber-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text">{t.groupGateTitle}</h2>
          <p className="text-sm text-text-muted leading-relaxed">{t.groupGateDesc}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/learn/pairs"
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
          >
            <Users size={16} />
            {t.groupGateCreate}
          </Link>
          <Link
            href="/learn/pairs"
            className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
          >
            {t.groupGateJoin}
          </Link>
        </div>
      </div>
    </div>
  )
}
