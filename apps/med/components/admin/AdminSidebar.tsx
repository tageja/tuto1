'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Building2, Users, BarChart3, Activity, X } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname()
  const { t, lang, toggleLang } = useLang()

  const NAV_ITEMS = [
    { label: t.navOverview, href: '/admin', icon: LayoutDashboard },
    { label: t.navCourses, href: '/admin/courses', icon: BookOpen },
    { label: t.navHospitals, href: '/admin/hospitals', icon: Building2 },
    { label: t.navHospitalDashboard ?? 'Hospital Dashboard', href: '/admin/hospital', icon: Activity },
    { label: t.navStudents, href: '/admin/students', icon: Users },
    { label: t.navAnalytics, href: '/admin/analytics', icon: BarChart3 },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    if (href === '/admin/hospital') {
      return pathname.startsWith('/admin/hospital') && !pathname.startsWith('/admin/hospitals')
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={[
        'fixed top-0 left-0 h-screen w-64 bg-bg border-r border-border flex flex-col z-50',
        'transition-transform duration-200 ease-in-out',
        // Mobile: slide in/out; Desktop: always visible
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link href="/admin" className="block" onClick={onClose}>
          <img src="/images/tuto-logo.png" alt="tuto." className="h-9 w-auto" />
          <span className="text-xs font-semibold text-text-muted tracking-wide mt-1 block">{t.logoSub}</span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-surface text-text-muted"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={isActive(href) ? 'sidebar-item-active' : 'sidebar-item-inactive'}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border space-y-3">
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
