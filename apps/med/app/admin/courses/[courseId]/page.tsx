'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { NursedCourse, NursedModule, NursedLesson } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface ModuleWithLessons extends NursedModule {
  lessons: NursedLesson[]
  expanded: boolean
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { toast } = useToast()
  const { t } = useLang()
  const [course, setCourse] = useState<NursedCourse | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [showAddModule, setShowAddModule] = useState(false)
  const [moduleForm, setModuleForm] = useState({ title: '', title_vi: '', order_index: 1 })
  const [addLessonFor, setAddLessonFor] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({ title: '', title_vi: '', est_minutes: 10 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  async function loadCourse() {
    setLoading(true)
    try {
      const courseRes = await fetch(`/api/courses/${courseId}`)
      const courseData = await courseRes.json()
      const raw = courseData.data

      setCourse(raw)
      setTitleDraft(raw?.title ?? '')

      const rawModules: Array<NursedModule & { nursed_lessons?: NursedLesson[] }> =
        raw?.nursed_modules ?? []

      const withLessons: ModuleWithLessons[] = rawModules
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((mod) => ({
          ...mod,
          lessons: (mod.nursed_lessons ?? []).slice().sort(
            (a, b) => a.order_index - b.order_index,
          ),
          expanded: true,
        }))

      setModules(withLessons)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTitle() {
    if (!course) return
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleDraft }),
    })
    if (res.ok) {
      setCourse({ ...course, title: titleDraft })
      setEditingTitle(false)
      toast(t.toastUpdated, 'success')
    } else {
      toast(t.toastUpdateError, 'error')
    }
  }

  async function handleTogglePublished() {
    if (!course) return
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !course.published }),
    })
    if (res.ok) {
      setCourse({ ...course, published: !course.published })
      toast(course.published ? t.statusDraft : t.statusPublished, 'success')
    }
  }

  async function handleAddModule(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...moduleForm, course_id: courseId }),
      })
      if (res.ok) {
        toast(t.toastModuleCreated, 'success')
        setShowAddModule(false)
        setModuleForm({ title: '', title_vi: '', order_index: modules.length + 1 })
        await loadCourse()
      } else {
        toast(t.toastModuleError, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleAddLesson(e: FormEvent, moduleId: string) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lessonForm, module_id: moduleId, order_index: 1 }),
      })
      if (res.ok) {
        toast(t.toastLessonCreated, 'success')
        setAddLessonFor(null)
        setLessonForm({ title: '', title_vi: '', est_minutes: 10 })
        await loadCourse()
      } else {
        toast(t.toastLessonError, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm(t.confirmDeleteModule)) return
    const res = await fetch(`/api/modules/${moduleId}`, { method: 'DELETE' })
    if (res.ok) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId))
      toast(t.toastModuleDeleted, 'success')
    }
  }

  async function handleDeleteLesson(lessonId: string, moduleId: string) {
    if (!confirm(t.confirmDeleteLesson)) return
    const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
    if (res.ok) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m,
        ),
      )
      toast(t.toastLessonDeleted, 'success')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-surface rounded animate-pulse" />
        <div className="h-32 rounded-xl bg-surface animate-pulse" />
        <div className="h-48 rounded-xl bg-surface animate-pulse" />
      </div>
    )
  }

  if (!course) return <p className="text-text-muted">{t.notFoundCourse}</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="btn-ghost !py-1.5">
          <ArrowLeft size={16} />
          {t.btnBackCourses}
        </Link>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  className="input text-lg font-semibold"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="btn-primary !py-1.5">
                  {t.btnSave}
                </button>
                <button onClick={() => setEditingTitle(false)} className="btn-secondary !py-1.5">
                  {t.btnCancel}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="truncate">{course.title}</h1>
                <button onClick={() => setEditingTitle(true)} className="btn-ghost !p-1.5">
                  <Edit size={15} />
                </button>
              </div>
            )}
            {course.title_vi && (
              <p className="text-sm text-text-muted mt-1">{course.title_vi}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="badge badge-blue">{course.level}</span>
            <button
              onClick={handleTogglePublished}
              className={`badge cursor-pointer ${
                course.published ? 'badge-green' : 'badge-gray'
              }`}
            >
              {course.published ? t.statusPublished : t.statusDraft}
            </button>
          </div>
        </div>
        {course.description && (
          <p className="text-sm text-text-muted mt-3 border-t border-border pt-3">
            {course.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2>{t.sectionCourseContent}</h2>
        <button className="btn-primary" onClick={() => setShowAddModule(true)}>
          <Plus size={15} />
          {t.btnAddModule}
        </button>
      </div>

      {showAddModule && (
        <div className="card p-4 mb-4 border-primary/30 bg-primary-light/20">
          <h3 className="mb-3">{t.modalAddModuleTitle}</h3>
          <form onSubmit={handleAddModule} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t.labelModuleTitleEn}</label>
                <input
                  className="input"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder={t.placeholderModuleTitleEn}
                />
              </div>
              <div>
                <label className="label">{t.labelModuleTitleVi}</label>
                <input
                  className="input"
                  value={moduleForm.title_vi}
                  onChange={(e) => setModuleForm({ ...moduleForm, title_vi: e.target.value })}
                  placeholder={t.placeholderModuleTitleVi}
                />
              </div>
            </div>
            <div className="w-32">
              <label className="label">{t.labelOrder}</label>
              <input
                className="input"
                type="number"
                min={1}
                value={moduleForm.order_index}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, order_index: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? t.btnSaving : t.btnCreateModule}
              </button>
              <button type="button" onClick={() => setShowAddModule(false)} className="btn-secondary">
                {t.btnCancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {modules.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-text-muted">{t.emptyModules}</p>
          </div>
        ) : (
          modules.map((mod) => (
            <div key={mod.id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface/60 transition-colors"
                onClick={() =>
                  setModules((prev) =>
                    prev.map((m) => (m.id === mod.id ? { ...m, expanded: !m.expanded } : m)),
                  )
                }
              >
                <div className="flex items-center gap-3">
                  {mod.expanded ? (
                    <ChevronDown size={16} className="text-text-muted" />
                  ) : (
                    <ChevronRight size={16} className="text-text-muted" />
                  )}
                  <div>
                    <p className="font-medium text-text text-sm">{mod.title}</p>
                    {mod.title_vi && (
                      <p className="text-xs text-text-muted">{mod.title_vi}</p>
                    )}
                  </div>
                  <span className="badge-gray text-xs">
                    {t.lessonCountBadge.replace('{n}', String(mod.lessons.length))}
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setAddLessonFor(addLessonFor === mod.id ? null : mod.id)}
                    className="btn-ghost !py-1 !px-2 text-xs"
                  >
                    <Plus size={13} />
                    {t.btnAddLesson}
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    className="btn-ghost !py-1 !px-2 text-error hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {addLessonFor === mod.id && (
                <div className="px-4 pb-3 pt-1 border-t border-border bg-surface/50">
                  <form
                    onSubmit={(e) => handleAddLesson(e, mod.id)}
                    className="flex items-end gap-3 flex-wrap"
                  >
                    <div className="flex-1 min-w-[180px]">
                      <label className="label text-xs">{t.labelLessonTitleEn}</label>
                      <input
                        className="input text-sm"
                        required
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder={t.placeholderLessonTitleEn}
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <label className="label text-xs">{t.labelLessonTitleVi}</label>
                      <input
                        className="input text-sm"
                        value={lessonForm.title_vi}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, title_vi: e.target.value })
                        }
                        placeholder={t.placeholderLessonTitleVi}
                      />
                    </div>
                    <div className="w-24">
                      <label className="label text-xs">{t.labelMinutes}</label>
                      <input
                        className="input text-sm"
                        type="number"
                        min={1}
                        value={lessonForm.est_minutes}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, est_minutes: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex gap-2 pb-0.5">
                      <button type="submit" disabled={saving} className="btn-primary !py-2">
                        {t.btnCreate}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddLessonFor(null)}
                        className="btn-secondary !py-2"
                      >
                        {t.btnCancel}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {mod.expanded && (
                <div className="divide-y divide-border border-t border-border">
                  {mod.lessons.length === 0 ? (
                    <p className="px-10 py-4 text-sm text-text-muted">{t.emptyLessons}</p>
                  ) : (
                    mod.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between px-10 py-3 hover:bg-surface/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-muted w-6 shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm text-text">{lesson.title}</p>
                            {lesson.title_vi && (
                              <p className="text-xs text-text-muted">{lesson.title_vi}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">
                            {t.lessonMinutes.replace('{n}', String(lesson.est_minutes))}
                          </span>
                          <span className={lesson.published ? 'badge-green' : 'badge-gray'}>
                            {lesson.published ? t.statusPublished : t.statusDraft}
                          </span>
                          <Link
                            href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                            className="btn-secondary !py-1 !px-2.5 text-xs"
                          >
                            <Edit size={12} />
                            {t.btnEdit}
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id, mod.id)}
                            className="btn-ghost !py-1 !px-1.5 text-error hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
