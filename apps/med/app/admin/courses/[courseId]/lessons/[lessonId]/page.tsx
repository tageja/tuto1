'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Edit, GripVertical, ChevronDown, Eye } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { StepEditor } from '@/components/admin/StepEditor'
import StepPreviewModal from '@/components/admin/StepPreviewModal'
import type { NursedLesson, NursedLessonStep, StepType } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

const TYPE_BADGE: Record<StepType, string> = {
  video: 'badge-blue',
  audio_shadow: 'badge-green',
  script_read: 'badge-yellow',
  cloze: 'badge-yellow',
  no_script: 'badge-gray',
  recording_submit: 'badge-red',
  quiz: 'badge-blue',
  mission: 'badge-green',
  scenario_intro: 'badge-red',
  self_reflection: 'badge-green',
  conversation_animation: 'badge-blue',
  matching: 'badge-blue',
  drag_order: 'badge-yellow',
  flash_card: 'badge-green',
}

const STAGE_COLORS: Record<string, string> = {
  heads_up: 'bg-primary-light text-primary border-primary/30',
  heads_down: 'bg-amber-100 text-amber-700 border-amber-200',
  heads_together: 'bg-green-100 text-green-700 border-green-200',
  assessment: 'bg-purple-100 text-purple-700 border-purple-200',
}

const STAGE_LABELS_EN: Record<string, string> = {
  heads_up: 'Heads Up',
  heads_down: 'Heads Down',
  heads_together: 'Heads Together',
  assessment: 'Assessment',
}

const STAGE_LABELS_VI: Record<string, string> = {
  heads_up: 'Làm quen',
  heads_down: 'Luyện tập',
  heads_together: 'Cùng nhau',
  assessment: 'Kiểm tra',
}

export default function LessonBuilderPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { toast } = useToast()
  const { t } = useLang()
  const [lesson, setLesson] = useState<NursedLesson | null>(null)
  const [steps, setSteps] = useState<NursedLessonStep[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState({ title: '', est_minutes: 10 })
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [addingStep, setAddingStep] = useState(false)
  const [previewStep, setPreviewStep] = useState<NursedLessonStep | null>(null)

  const STEP_TYPES: { value: StepType; label: string }[] = [
    { value: 'scenario_intro', label: t.stepTypeScenarioIntro },
    { value: 'audio_shadow', label: t.stepTypeAudioShadow },
    { value: 'script_read', label: t.stepTypeScriptRead },
    { value: 'cloze', label: t.stepTypeCloze },
    { value: 'no_script', label: t.stepTypeNoScript },
    { value: 'recording_submit', label: t.stepTypeRecording },
    { value: 'quiz', label: t.stepTypeQuiz },
    { value: 'mission', label: t.stepTypeMission },
    { value: 'self_reflection', label: t.stepTypeSelfReflection },
    { value: 'video', label: t.stepTypeVideo },
    { value: 'matching', label: t.stepTypeMatchingLabel },
    { value: 'drag_order', label: t.stepTypeDragOrderLabel },
    { value: 'flash_card', label: t.stepTypeFlashCardLabel },
  ]

  const TYPE_LABEL: Record<StepType, string> = {
    video: t.stepTypeVideo,
    audio_shadow: t.stepTypeAudioShadow,
    script_read: t.stepTypeScriptRead,
    cloze: t.stepTypeCloze,
    no_script: t.stepTypeNoScript,
    recording_submit: t.stepTypeRecording,
    quiz: t.stepTypeQuiz,
    mission: t.stepTypeMission,
    scenario_intro: t.stepTypeScenarioIntro,
    self_reflection: t.stepTypeSelfReflection,
    conversation_animation: t.stepTypeConversationAnimation,
    matching: t.stepTypeMatchingLabel,
    drag_order: t.stepTypeDragOrderLabel,
    flash_card: t.stepTypeFlashCardLabel,
  }

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
      toast(t.toastLessonUpdated, 'success')
    } else {
      toast(t.toastUpdateError, 'error')
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
      toast(lesson.published ? t.statusDraft : t.statusPublished, 'success')
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
        toast(t.toastStepAdded, 'success')
      } else {
        toast(t.toastStepAddError, 'error')
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
      toast(t.toastStepSaved, 'success')
    } else {
      toast(t.toastStepSaveError, 'error')
    }
  }

  async function handleDeleteStep(stepId: string) {
    if (!confirm(t.confirmDeleteStep)) return
    const res = await fetch(`/api/steps/${stepId}`, { method: 'DELETE' })
    if (res.ok) {
      setSteps((prev) => prev.filter((s) => s.id !== stepId))
      toast(t.toastStepDeleted, 'success')
    } else {
      toast(t.toastStepDeleteError, 'error')
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

  if (!lesson) return <p className="text-text-muted">{t.notFoundLesson}</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/courses/${courseId}`} className="btn-ghost !py-1.5">
          <ArrowLeft size={16} />
          {t.btnBackLesson}
        </Link>
      </div>


      <div className="card p-5 mb-6">
        {editingHeader ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">{t.labelLessonTitle}</label>
                <input
                  className="input"
                  value={headerDraft.title}
                  onChange={(e) => setHeaderDraft({ ...headerDraft, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">{t.labelEstMinutes}</label>
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
              <button onClick={handleSaveHeader} className="btn-primary">{t.btnSave}</button>
              <button onClick={() => setEditingHeader(false)} className="btn-secondary">{t.btnCancel}</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1>{lesson.title}</h1>
                {lesson.stage && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[lesson.stage] ?? 'bg-surface text-text-muted border-border'}`}>
                    {STAGE_LABELS_EN[lesson.stage] ?? lesson.stage}
                  </span>
                )}
              </div>
              {lesson.title_vi && <p className="text-sm text-text-muted mt-1">{lesson.title_vi}</p>}
              {lesson.objective && (
                <p className="text-xs text-primary mt-1 italic">{lesson.objective}</p>
              )}
              <p className="text-xs text-text-muted mt-2">
                {t.lessonEstMinutes.replace('{n}', String(lesson.est_minutes))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublished}
                className={`badge cursor-pointer ${lesson.published ? 'badge-green' : 'badge-gray'}`}
              >
                {lesson.published ? t.statusPublished : t.statusDraft}
              </button>
              <button onClick={() => setEditingHeader(true)} className="btn-ghost !p-1.5">
                <Edit size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2>{t.sectionSteps.replace('{n}', String(steps.length))}</h2>
        <div className="relative">
          <button
            className="btn-primary"
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            disabled={addingStep}
          >
            <Plus size={15} />
            {t.btnAddStep}
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
            <p className="text-text-muted">{t.emptySteps}</p>
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
                    type="button"
                    onClick={() => setPreviewStep(step)}
                    className="btn-ghost !py-1 !px-1.5 text-primary hover:bg-primary/10"
                    title={t.btnPreviewStep}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingStepId(editingStepId === step.id ? null : step.id)
                    }
                    className="btn-secondary !py-1 !px-2.5 text-xs"
                  >
                    <Edit size={13} />
                    {editingStepId === step.id ? t.btnCloseStep : t.btnEditStep}
                  </button>
                  <button
                    type="button"
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

      <StepPreviewModal step={previewStep} onClose={() => setPreviewStep(null)} />
    </div>
  )
}
