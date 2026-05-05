'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Building2, Users, TrendingUp, Globe } from 'lucide-react'
import type { NursedCourse, NursedHospital } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

interface KpiData {
  totalCourses: number
  publishedCourses: number
  totalHospitals: number
}

const LEVEL_CLASS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

export default function AdminDashboard() {
  useDocumentTitle('Admin')
  const { t } = useLang()
  const [kpi, setKpi] = useState<KpiData>({ totalCourses: 0, publishedCourses: 0, totalHospitals: 0 })
  const [recentCourses, setRecentCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, hospitalsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/hospitals'),
        ])
        const coursesData = await coursesRes.json()
        const hospitalsData = await hospitalsRes.json()

        const courses: NursedCourse[] = coursesData.data ?? []
        const hospitals: NursedHospital[] = hospitalsData.data ?? []

        setKpi({
          totalCourses: courses.length,
          publishedCourses: courses.filter((c) => c.published).length,
          totalHospitals: hospitals.length,
        })
        setRecentCourses(courses.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpiCards = [
    { label: t.kpiTotalCourses, value: kpi.totalCourses, icon: BookOpen, color: 'text-primary' },
    { label: t.kpiPublished, value: kpi.publishedCourses, icon: TrendingUp, color: 'text-success' },
    { label: t.kpiHospitals, value: kpi.totalHospitals, icon: Building2, color: 'text-warning' },
    { label: t.kpiStudents, value: '—', icon: Users, color: 'text-text-muted' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.adminDashTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.adminDashSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={`${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-text mt-1">
              {loading ? <span className="animate-pulse">—</span> : value}
            </p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Site settings</h3>
              <p className="text-xs text-text-muted">Homepage intro video and other public-page content.</p>
            </div>
          </div>
          <Link href="/admin/site" className="text-sm text-primary hover:underline whitespace-nowrap">
            Manage →
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3>{t.recentCoursesTitle}</h3>
          <Link href="/admin/courses" className="text-sm text-primary hover:underline">
            {t.recentCoursesViewAll}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">{t.emptyCourses}</p>
        ) : (
          <div className="divide-y divide-border">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={LEVEL_CLASS[course.level] ?? 'badge-gray'}>{course.level}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{course.title}</p>
                    {course.title_vi && (
                      <p className="text-xs text-text-muted truncate">{course.title_vi}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={course.published ? 'badge-green' : 'badge-gray'}>
                    {course.published ? t.statusPublished : t.statusDraft}
                  </span>
                  <Link
                    href={`/admin/courses/${course.slug ?? course.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {t.linkDetail}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
