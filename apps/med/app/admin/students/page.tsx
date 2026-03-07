'use client'

import { useEffect, useState } from 'react'
import { Users, RefreshCw } from 'lucide-react'

export default function AdminStudentsPage() {
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
          <h1 className="text-2xl font-bold text-text">Học viên</h1>
          <p className="text-sm text-text-muted mt-1">Danh sách điều dưỡng đã đăng ký</p>
        </div>
        <button className="btn-ghost text-sm">
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-text-muted">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải...</p>
        </div>
      ) : (
        <div className="card p-8 flex flex-col items-center gap-3 text-center">
          <Users size={48} className="text-text-muted/40" />
          <p className="text-lg font-semibold text-text">Chức năng đang phát triển</p>
          <p className="text-sm text-text-muted max-w-sm">
            Quản lý học viên sẽ khả dụng sau khi kích hoạt hệ thống xác thực.
            Hiện tại, hãy sử dụng trang <strong>Phân tích</strong> để xem thống kê tổng quan.
          </p>
        </div>
      )}
    </div>
  )
}
