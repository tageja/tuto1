'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Building2, Users, BarChart3 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export function AdminSidebar() {
  const pathname = usePathname()
  const { t, lang, toggleLang } = useLang()

  const NAV_ITEMS = [
    { label: t.navOverview, href: '/admin', icon: LayoutDashboard },
    { label: t.navCourses, href: '/admin/courses', icon: BookOpen },
    { label: t.navHospitals, href: '/admin/hospitals', icon: Building2 },
    { label: t.navStudents, href: '/admin/students', icon: Users },
    { label: t.navAnalytics, href: '/admin/analytics', icon: BarChart3 },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-bg border-r border-border flex flex-col z-40">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/admin" className="block">
          <img src="/images/tuto-logo.png" alt="tuto." className="h-9 w-auto" />
          <span className="text-xs font-semibold text-text-muted tracking-wide mt-1 block">{t.logoSub}</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? 'sidebar-item-active' : 'sidebar-item-inactive'}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border space-y-3">
        {/* Partner logo */}
        <div className="rounded-lg bg-white border border-border px-3 py-3 flex flex-col items-center gap-1">
          <span className="text-[10px] text-text-muted tracking-widest uppercase font-semibold">In partnership with</span>
          <img src="/images/chir-logo.jpg" alt="chir" className="h-14 w-auto object-contain" style={{ maxWidth: 120 }} />
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:bg-surface transition-all w-full justify-center"
        >
          <span className={lang === 'en' ? 'text-primary font-bold' : ''}>EN</span>
          <span className="text-border">|</span>
          <span className={lang === 'vi' ? 'text-primary font-bold' : ''}>VI</span>
        </button>
        <p className="text-xs text-text-muted font-medium">{t.adminFooterLabel}</p>
        <p className="text-xs text-text-muted mt-0.5">{t.adminFooterVersion}</p>
      </div>
    </aside>
  )
}
