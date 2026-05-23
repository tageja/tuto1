'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Search, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { AdminReviewQueueCourse } from '@/app/api/admin/courses/review-queue/route'
import type { NursedCourse, NursedHospital } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

const LEVEL_CLASS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

type CourseTab = 'all' | 'pending' | 'published' | 'drafts'

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
  const { t } = useLang()
  const { toast } = useToast()
  const [courses, setCourses] = useState<NursedCourse[]>([])
  const [pendingCourses, setPendingCourses] = useState<AdminReviewQueueCourse[]>([])
  const [hospitals, setHospitals] = useState<NursedHospital[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<CourseTab>('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateCourseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [reviewSavingId, setReviewSavingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [coursesRes, hospitalsRes, pendingRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/hospitals'),
        fetch('/api/admin/courses/review-queue'),
      ])
      const c = await coursesRes.json()
      const h = await hospitalsRes.json()
      const pending = await pendingRes.json()
      setCourses(c.data ?? [])
      setHospitals(h.data ?? [])
      setPendingCourses(pending.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = pendingCourses.length

  const tabCourses = courses.filter((course) => {
    if (tab === 'pending') return course.review_status === 'submitted'
    if (tab === 'published') return course.published || course.review_status === 'published'
    if (tab === 'drafts') {
      return !course.published && ['draft', 'rejected', 'admin_created'].includes(course.review_status)
    }
    return true
  })

  const filtered = tabCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.title_vi ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const sortedPending = [...pendingCourses].sort((a, b) => {
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
    return aTime - bTime
  })

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
      toast(course.published ? t.statusDraft : t.statusPublished, 'success')
    } else {
      toast(t.toastUpdateError, 'error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.confirmDeleteCourse)) return
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast(t.toastCourseDeleted, 'success')
    } else {
      toast(t.toastDeleteError, 'error')
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
        toast(t.toastCourseCreated, 'success')
        setShowModal(false)
        setForm(EMPTY_FORM)
        await loadData()
      } else {
        toast(t.toastCreateError, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleReview(courseId: string, action: 'approve' | 'reject') {
    if (action === 'reject') {
      const notes = (rejectNotes[courseId] ?? '').trim()
      if (!notes) {
        toast(t.adminReviewRejectNotes, 'error')
        return
      }
    }

    setReviewSavingId(courseId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          review_notes: action === 'reject' ? rejectNotes[courseId] : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast(json.error ?? t.toastUpdateError, 'error')
        return
      }
      toast(action === 'approve' ? t.adminReviewApprove : t.adminReviewReject, 'success')
      setRejectingId(null)
      setRejectNotes((prev) => {
        const next = { ...prev }
        delete next[courseId]
        return next
      })
      await loadData()
    } finally {
      setReviewSavingId(null)
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.adminCoursesTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{courses.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          {t.btnCreateCourse}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ['all', 'All'],
          ['pending', t.adminReviewPendingTab],
          ['published', t.statusPublished],
          ['drafts', t.statusDraft],
        ] as const).map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              tab === tabId
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            {label}
            {tabId === 'pending' && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input pl-9"
            placeholder={t.searchPlaceholderCourses}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {tab === 'pending' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="card p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-surface animate-pulse" />
              ))}
            </div>
          ) : sortedPending.length === 0 ? (
            <p className="text-center text-text-muted py-12">{t.emptySearchCourses}</p>
          ) : (
            sortedPending.map((course) => {
              const previewSlug = course.slug ?? course.id
              const isRejecting = rejectingId === course.id
              return (
                <article key={course.id} className="card p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">{course.title}</h2>
                      {course.title_vi && (
                        <p className="text-sm text-text-muted">{course.title_vi}</p>
                      )}
                      <p className="text-sm text-text-muted mt-2">
                        {[course.creator_name, course.creator_email].filter(Boolean).join(' · ')}
                      </p>
                      <p className="text-sm mt-2">
                        {course.template_name ?? course.template_id ?? '—'}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {course.modules_count} modules · {course.lessons_count} lessons ·{' '}
                        {t.adminReviewSubmittedOn} {formatDate(course.submitted_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <a
                        href={`/learn/courses/${previewSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs"
                      >
                        {t.adminReviewPreview}
                      </a>
                      <button
                        type="button"
                        className="btn-primary text-xs"
                        disabled={reviewSavingId === course.id}
                        onClick={() => handleReview(course.id, 'approve')}
                      >
                        {t.adminReviewApprove}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary text-xs text-error"
                        disabled={reviewSavingId === course.id}
                        onClick={() => setRejectingId(isRejecting ? null : course.id)}
                      >
                        {t.adminReviewReject}
                      </button>
                    </div>
                  </div>
                  {isRejecting && (
                    <div className="border-t border-border pt-4 space-y-3">
                      <label className="label">{t.adminReviewRejectNotes}</label>
                      <textarea
                        className="input resize-none"
                        rows={3}
                        value={rejectNotes[course.id] ?? ''}
                        onChange={(e) =>
                          setRejectNotes((prev) => ({ ...prev, [course.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="btn-secondary text-error"
                        disabled={reviewSavingId === course.id}
                        onClick={() => handleReview(course.id, 'reject')}
                      >
                        {t.adminReviewConfirmReject}
                      </button>
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-text-muted py-12">{t.emptySearchCourses}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t.tableColName}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted w-20">{t.tableColLevel}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted w-28">{t.tableColStatus}</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted w-32">{t.tableColActions}</th>
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
                        {course.published ? t.statusPublished : t.statusDraft}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.slug ?? course.id}`}
                          className="btn-secondary !py-1 !px-3 text-xs"
                        >
                          {t.btnViewDetail}
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
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="card p-6 w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2>{t.modalCreateCourseTitle}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost !p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">{t.labelTitleEn}</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t.placeholderTitleEn}
                />
              </div>
              <div>
                <label className="label">{t.labelTitleVi}</label>
                <input
                  className="input"
                  value={form.title_vi}
                  onChange={(e) => setForm({ ...form, title_vi: e.target.value })}
                  placeholder={t.placeholderTitleVi}
                />
              </div>
              <div>
                <label className="label">{t.labelDescription}</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t.placeholderDescription}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.labelLevel}</label>
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
                  <label className="label">{t.labelHospital}</label>
                  <select
                    className="input"
                    value={form.hospital_id}
                    onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}
                  >
                    <option value="">{t.selectAllHospitals}</option>
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
                  {t.btnCancel}
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? t.btnCreating : t.btnCreateCourse}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
