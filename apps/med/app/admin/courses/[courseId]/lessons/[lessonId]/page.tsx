'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Edit, GripVertical, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { StepEditor } from '@/components/admin/StepEditor'
import type { NursedLesson, NursedLessonStep, StepType } from '@/lib/supabase'

const STEP_TYPES: { value: StepType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'audio_shadow', label: 'Nghe & Bắt chước (Audio Shadow)' },
  { value: 'script_read', label: 'Đọc kịch bản (Script Read)' },
  { value: 'cloze', label: 'Điền vào chỗ trống (Cloze)' },
  { value: 'no_script', label: 'Hội thoại tự do (No Script)' },
  { value: 'recording_submit', label: 'Nộp bản ghi âm (Recording)' },
  { value: 'quiz', label: 'Bài kiểm tra (Quiz)' },
  { value: 'mission', label: 'Nhiệm vụ (Mission)' },
]

const TYPE_BADGE: Record<StepType, string> = {
  video: 'badge-blue',
  audio_shadow: 'badge-green',
  script_read: 'badge-yellow',
  cloze: 'badge-yellow',
  no_script: 'badge-gray',
  recording_submit: 'badge-red',
  quiz: 'badge-blue',
  mission: 'badge-green',
}

const TYPE_LABEL: Record<StepType, string> = {
  video: 'Video',
  audio_shadow: 'Audio',
  script_read: 'Script',
  cloze: 'Cloze',
  no_script: 'No Script',
  recording_submit: 'Recording',
  quiz: 'Quiz',
  mission: 'Mission',
}

export default function LessonBuilderPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { toast } = useToast()
  const [lesson, setLesson] = useState<NursedLesson | null>(null)
  const [steps, setSteps] = useState<NursedLessonStep[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState({ title: '', est_minutes: 10 })
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [addingStep, setAddingStep] = useState(false)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  async function loadLesson() {
    setLoading(true)
    try {
      const [lessonRes, stepsRes] = await Promise.all([
        fetch(`/api/lessons/${lessonId}`),
        fetch(`/api/steps?lessonId=${lessonId}`),
      ])
      const lessonData = await lessonRes.json()
      const stepsData = await stepsRes.json()
      const l = lessonData.data as NursedLesson
      setLesson(l)
      setHeaderDraft({ title: l?.title ?? '', est_minutes: l?.est_minutes ?? 10 })
      setSteps((stepsData.data ?? []).sort((a: NursedLessonStep, b: NursedLessonStep) => a.order_index - b.order_index))
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveHeader() {
    if (!lesson) return
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(headerDraft),
    })
    if (res.ok) {
      setLesson({ ...lesson, ...headerDraft })
      setEditingHeader(false)
      toast('Đã cập nhật bài học', 'success')
    } else {
      toast('Lỗi cập nhật', 'error')
    }
  }

  async function handleTogglePublished() {
    if (!lesson) return
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !lesson.published }),
    })
    if (res.ok) {
      setLesson({ ...lesson, published: !lesson.published })
      toast(lesson.published ? 'Đặt thành nháp' : 'Đã xuất bản', 'success')
    }
  }

  async function handleAddStep(type: StepType) {
    setShowAddDropdown(false)
    setAddingStep(true)
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          type,
          title: TYPE_LABEL[type],
          order_index: steps.length + 1,
          config: {},
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSteps((prev) => [...prev, data.data])
        setEditingStepId(data.data.id)
        toast('Đã thêm bước', 'success')
      } else {
        toast('Lỗi thêm bước', 'error')
      }
    } finally {
      setAddingStep(false)
    }
  }

  async function handleSaveStep(stepId: string, config: Record<string, unknown>) {
    const res = await fetch(`/api/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    })
    if (res.ok) {
      const data = await res.json()
      setSteps((prev) => prev.map((s) => (s.id === stepId ? data.data : s)))
      setEditingStepId(null)
      toast('Đã lưu bước', 'success')
    } else {
      toast('Lỗi lưu bước', 'error')
    }
  }

  async function handleDeleteStep(stepId: string) {
    if (!confirm('Xóa bước này?')) return
    const res = await fetch(`/api/steps/${stepId}`, { method: 'DELETE' })
    if (res.ok) {
      setSteps((prev) => prev.filter((s) => s.id !== stepId))
      toast('Đã xóa bước', 'success')
    } else {
      toast('Lỗi xóa', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-surface rounded animate-pulse" />
        <div className="h-28 rounded-xl bg-surface animate-pulse" />
        <div className="h-48 rounded-xl bg-surface animate-pulse" />
      </div>
    )
  }

  if (!lesson) return <p className="text-text-muted">Không tìm thấy bài học.</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/courses/${courseId}`} className="btn-ghost !py-1.5">
          <ArrowLeft size={16} />
          Quay lại
        </Link>
      </div>

      <div className="card p-5 mb-6">
        {editingHeader ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">Tên bài học *</label>
                <input
                  className="input"
                  value={headerDraft.title}
                  onChange={(e) => setHeaderDraft({ ...headerDraft, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phút ước tính</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={headerDraft.est_minutes}
                  onChange={(e) =>
                    setHeaderDraft({ ...headerDraft, est_minutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveHeader} className="btn-primary">Lưu</button>
              <button onClick={() => setEditingHeader(false)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1>{lesson.title}</h1>
              {lesson.title_vi && <p className="text-sm text-text-muted mt-1">{lesson.title_vi}</p>}
              <p className="text-xs text-text-muted mt-2">{lesson.est_minutes} phút ước tính</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublished}
                className={`badge cursor-pointer ${lesson.published ? 'badge-green' : 'badge-gray'}`}
              >
                {lesson.published ? 'Đã xuất bản' : 'Nháp'}
              </button>
              <button onClick={() => setEditingHeader(true)} className="btn-ghost !p-1.5">
                <Edit size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2>Các bước ({steps.length})</h2>
        <div className="relative">
          <button
            className="btn-primary"
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            disabled={addingStep}
          >
            <Plus size={15} />
            Thêm bước
            <ChevronDown size={14} />
          </button>
          {showAddDropdown && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-bg border border-border rounded-xl shadow-md z-20 py-1 animate-fade-in">
              {STEP_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleAddStep(value)}
                  className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors"
                >
                  <span className={`${TYPE_BADGE[value]} mr-2`}>{TYPE_LABEL[value]}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAddDropdown(false)} />
      )}

      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-text-muted">Chưa có bước nào. Nhấn "Thêm bước" để bắt đầu!</p>
          </div>
        ) : (
          steps.map((step, idx) => (
            <div key={step.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical size={16} className="text-text-muted cursor-grab" />
                <span className="text-xs text-text-muted w-5 shrink-0">{idx + 1}</span>
                <span className={`${TYPE_BADGE[step.type]} shrink-0`}>{TYPE_LABEL[step.type]}</span>
                <p className="text-sm text-text flex-1 truncate">
                  {step.title || TYPE_LABEL[step.type]}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setEditingStepId(editingStepId === step.id ? null : step.id)
                    }
                    className="btn-secondary !py-1 !px-2.5 text-xs"
                  >
                    <Edit size={13} />
                    {editingStepId === step.id ? 'Đóng' : 'Chỉnh sửa'}
                  </button>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="btn-ghost !py-1 !px-1.5 text-error hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {editingStepId === step.id && (
                <div className="px-4 pb-4 pt-1 border-t border-border bg-surface/30">
                  <StepEditor
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={() => setEditingStepId(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
