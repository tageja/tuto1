'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Users } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', labelVi: 'Tổng quan', icon: Home, href: '/learn' },
  { label: 'My Courses', labelVi: 'Khóa học của tôi', icon: BookOpen, href: '/learn/courses' },
  { label: 'Practice Groups', labelVi: 'Nhóm luyện tập', icon: Users, href: '/learn/pairs' },
]

export default function LearnerSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/learn') return pathname === '/learn'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/learn" className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-lg font-bold text-text">NurseEd</span>
        </Link>
        <p className="text-xs text-text-muted mt-0.5">med.tuto.asia</p>
      </div>

      {/* User greeting */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-sm font-medium text-text">Xin chào, Điều dưỡng 👋</p>
        <p className="text-xs text-text-muted mt-0.5">Chào mừng trở lại!</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'sidebar-item-active' : 'sidebar-item-inactive'}
            >
              <Icon size={18} />
              <span>{item.labelVi}</span>
            </Link>
          )
        })}
      </nav>

      {/* Streak badge */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-orange-700">3 ngày liên tục</p>
            <p className="text-xs text-orange-500">Tiếp tục duy trì nhé!</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
