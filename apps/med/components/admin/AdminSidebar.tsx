'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Building2, Users, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { label: 'Khóa học', href: '/admin/courses', icon: BookOpen },
  { label: 'Bệnh viện', href: '/admin/hospitals', icon: Building2 },
  { label: 'Học viên', href: '/admin/students', icon: Users },
  { label: 'Phân tích', href: '/admin/analytics', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-bg border-r border-border flex flex-col z-40">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/admin" className="block">
          <img src="/images/tuto-logo.png" alt="tuto." className="h-9 w-auto" />
          <span className="text-xs font-semibold text-text-muted tracking-wide mt-1 block">NurseEd</span>
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

      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-text-muted font-medium">Tuto Admin</p>
        <p className="text-xs text-text-muted mt-0.5">v0.1.0</p>
      </div>
    </aside>
  )
}
