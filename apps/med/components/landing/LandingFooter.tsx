'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export function LandingFooter() {
  const { t } = useLang()

  return (
    <footer className="bg-white border-t border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="font-bold text-xl text-[var(--primary)] mb-2">tuto.</div>
            <div className="text-sm text-[var(--text-muted)] mb-4">{t.footerTagline}</div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">{t.footerDesc}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footerPlatform}</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/learn/courses" className="hover:text-[var(--text)] transition-colors">{t.footerCourses}</Link></li>
              <li><Link href="/learn" className="hover:text-[var(--text)] transition-colors">{t.footerDashboard}</Link></li>
              <li><Link href="/learn/pairs" className="hover:text-[var(--text)] transition-colors">{t.footerPairPractice}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footerAdmin}</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/admin" className="hover:text-[var(--text)] transition-colors">{t.footerAdminLogin}</Link></li>
              <li><Link href="/admin" className="hover:text-[var(--text)] transition-colors">{t.footerHospitalDashboard}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">{t.footerCopyright}</p>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Globe className="w-4 h-4" />
            <span>med.tuto.asia</span>
            <span>{t.madeInVietNam}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
