'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, Mic, Award, TrendingUp, BookOpen } from 'lucide-react'
import type { NursedHospital } from '@/lib/supabase'

interface Analytics {
  totalEnrolled: number
  totalSubmissions: number
  recordingSubmissions: number
  quizSubmissions: number
  avgQuizScore: number
  avgCompletion: number
  completedLessons: number
}

interface KpiCard {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  desc?: string
}

export default function AnalyticsPage() {
  const [hospitals, setHospitals] = useState<NursedHospital[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [hospitalsLoading, setHospitalsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hospitals')
      .then((r) => r.json())
      .then((d) => {
        setHospitals(d.data ?? [])
      })
      .finally(() => setHospitalsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setAnalytics(null)
      return
    }
    setLoading(true)
    fetch(`/api/hospitals?analytics=true&hospitalId=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setAnalytics(d.data ?? null))
      .finally(() => setLoading(false))
  }, [selectedId])

  const kpiCards: KpiCard[] = analytics
    ? [
        {
          label: 'Tổng học viên đăng ký',
          value: analytics.totalEnrolled,
          icon: Users,
          color: 'text-primary',
        },
        {
          label: 'Tổng lượt nộp bài',
          value: analytics.totalSubmissions,
          icon: FileText,
          color: 'text-warning',
        },
        {
          label: 'Bản ghi âm đã nộp',
          value: analytics.recordingSubmissions,
          icon: Mic,
          color: 'text-error',
        },
        {
          label: 'Điểm Quiz trung bình',
          value: analytics.avgQuizScore > 0 ? `${analytics.avgQuizScore.toFixed(1)}%` : '—',
          icon: Award,
          color: 'text-success',
        },
        {
          label: 'Hoàn thành trung bình',
          value: analytics.avgCompletion > 0 ? `${analytics.avgCompletion.toFixed(1)}%` : '—',
          icon: TrendingUp,
          color: 'text-primary',
          desc: 'Tỷ lệ hoàn thành bài học',
        },
        {
          label: 'Bài học đã hoàn thành',
          value: analytics.completedLessons,
          icon: BookOpen,
          color: 'text-success',
        },
      ]
    : []

  const selectedHospital = hospitals.find((h) => h.id === selectedId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Phân tích</h1>
          <p className="text-sm text-text-muted mt-1">Theo dõi tiến độ học tập theo bệnh viện</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <label className="label">Chọn bệnh viện</label>
        <select
          className="input max-w-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={hospitalsLoading}
        >
          <option value="">— Chọn bệnh viện —</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
              {h.city ? ` (${h.city})` : ''}
            </option>
          ))}
        </select>
        {hospitalsLoading && (
          <p className="text-xs text-text-muted mt-2">Đang tải danh sách...</p>
        )}
      </div>

      {!selectedId && !hospitalsLoading && (
        <div className="card p-12 text-center">
          <TrendingUp size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Chọn một bệnh viện để xem số liệu phân tích</p>
        </div>
      )}

      {selectedId && (
        <>
          {selectedHospital && (
            <div className="mb-5">
              <h2 className="text-text">{selectedHospital.name}</h2>
              <p className="text-sm text-text-muted mt-0.5">
                {selectedHospital.city && `${selectedHospital.city} · `}
                Gói: <span className={selectedHospital.plan === 'pro' ? 'text-primary font-medium' : ''}>{selectedHospital.plan.toUpperCase()}</span>
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="kpi-card h-24 animate-pulse bg-surface" />
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiCards.map(({ label, value, icon: Icon, color, desc }) => (
                <div key={label} className="kpi-card">
                  <div className={color}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-text mt-1">{value}</p>
                  <p className="text-xs text-text-muted font-medium">{label}</p>
                  {desc && <p className="text-xs text-text-muted">{desc}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-text-muted">Không có dữ liệu cho bệnh viện này</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
