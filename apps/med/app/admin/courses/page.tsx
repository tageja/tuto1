'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Search, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { NursedCourse, NursedHospital } from '@/lib/supabase'

const LEVEL_CLASS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

interface CreateCourseForm {
  title: string
  title_vi: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  hospital_id: string
}

const EMPTY_FORM: CreateCourseForm = {
  title: '',
  title_vi: '',
  description: '',
  level: 'A1',
  hospital_id: '',
}

export default function CoursesPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<NursedCourse[]>([])
  const [hospitals, setHospitals] = useState<NursedHospital[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateCourseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [coursesRes, hospitalsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/hospitals'),
      ])
      const c = await coursesRes.json()
      const h = await hospitalsRes.json()
      setCourses(c.data ?? [])
      setHospitals(h.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.title_vi ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  async function handleTogglePublished(course: NursedCourse) {
    const updated = { published: !course.published }
    const res = await fetch(`/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, published: !c.published } : c)),
      )
      toast(course.published ? 'Đã đặt thành nháp' : 'Đã xuất bản', 'success')
    } else {
      toast('Lỗi cập nhật', 'error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast('Đã xóa khóa học', 'success')
    } else {
      toast('Lỗi xóa', 'error')
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form,
        hospital_id: form.hospital_id || null,
      }
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast('Tạo khóa học thành công', 'success')
        setShowModal(false)
        setForm(EMPTY_FORM)
        await loadData()
      } else {
        toast('Lỗi tạo khóa học', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Quản lý Khóa học</h1>
          <p className="text-sm text-text-muted mt-1">{courses.length} khóa học</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Tạo khóa học
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input pl-9"
            placeholder="Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-text-muted py-12">Không tìm thấy khóa học nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Tên khóa học</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted w-20">Cấp độ</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted w-28">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{course.title}</p>
                    {course.title_vi && (
                      <p className="text-xs text-text-muted">{course.title_vi}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={LEVEL_CLASS[course.level] ?? 'badge-gray'}>{course.level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(course)}
                      className={`badge cursor-pointer transition-colors ${
                        course.published
                          ? 'badge-green hover:bg-red-100 hover:text-red-700'
                          : 'badge-gray hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {course.published ? 'Đã xuất bản' : 'Nháp'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="btn-secondary !py-1 !px-3 text-xs"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="btn-ghost !py-1 !px-2 text-error hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="card p-6 w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2>Tạo khóa học mới</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost !p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Tên (Tiếng Anh) *</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nursing English A1"
                />
              </div>
              <div>
                <label className="label">Tên (Tiếng Việt)</label>
                <input
                  className="input"
                  value={form.title_vi}
                  onChange={(e) => setForm({ ...form, title_vi: e.target.value })}
                  placeholder="Tiếng Anh Điều dưỡng A1"
                />
              </div>
              <div>
                <label className="label">Mô tả</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả khóa học..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cấp độ *</label>
                  <select
                    className="input"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value as CreateCourseForm['level'] })
                    }
                  >
                    {['A1', 'A2', 'B1', 'B2'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Bệnh viện</label>
                  <select
                    className="input"
                    value={form.hospital_id}
                    onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}
                  >
                    <option value="">Tất cả</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Đang tạo...' : 'Tạo khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
