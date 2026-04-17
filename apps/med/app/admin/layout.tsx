'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_ROLES = ['hospital_admin', 'super_admin'] as const
const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip role enforcement when auth is disabled (local testing)
    if (AUTH_DISABLED) return
    if (loading) return
    if (!role) {
      router.replace('/auth/login?next=/admin')
      return
    }
    if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
      router.replace('/learn/courses')
    }
  }, [role, loading, router])

  // Block render until role resolves — unless auth is disabled for testing
  if (!AUTH_DISABLED && (loading || !role || !(ADMIN_ROLES as readonly string[]).includes(role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-bg sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-surface text-text-muted"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <img src="/images/tuto-logo.png" alt="tuto." className="h-7 w-auto" />
          </div>

          <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </ToastProvider>
  )
}
