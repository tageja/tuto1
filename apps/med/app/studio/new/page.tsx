'use client'

import { FormEvent, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { GenerationProgress, type GenerationStatus } from '@/components/studio/GenerationProgress'
import { RefinementChat } from '@/components/studio/RefinementChat'
import { SynopsisPanel } from '@/components/studio/SynopsisPanel'
import { useLang } from '@/contexts/LanguageContext'
import type { CourseCategory, CourseSize, CourseTemplateId } from '@/lib/supabase'
import { courseSynopsisSchema } from '@/lib/studio/schemas'
import { COURSE_SIZE_MODULES, type CourseIntakeForm, type CourseSynopsis } from '@/lib/studio/types'
import { courseTemplateOptions } from '@/lib/studio/templates'

const EMPTY_FORM = {
  profession: '',
  industry: '',
  topic: '',
  subtopic: '',
  target_age_group: '',
  learner_level: 'beginner',
  language: 'bilingual',
  course_size: 'starter' as CourseSize,
  estimated_minutes_per_lesson: 15,
  additional_context: '',
  template_id: 'professional_communication' as CourseTemplateId,
  category_id: '',
  category_suggestion_id: '',
}

type StudioStep = 'intake' | 'synopsis' | 'generation'

type BrainstormStreamEvent = {
  type: 'partial' | 'complete' | 'error'
  synopsis?: Partial<CourseSynopsis>
  error?: string
}

type GenerateStreamEvent = {
  type: 'start' | 'module_start' | 'lesson_start' | 'lesson_done' | 'complete' | 'error'
  totalLessons?: number
  totalModules?: number
  moduleIndex?: number
  lessonIndex?: number
  moduleTitle?: string
  lessonTitle?: string
  courseId?: string
  error?: string
}

const EMPTY_SUGGESTION = {
  parent_id: '',
  suggested_path: '',
  suggested_name: '',
  reason: '',
}

export default function NewStudioCoursePage() {
  const { t } = useLang()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const resumeDraftId = searchParams.get('draftId')
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [suggestion, setSuggestion] = useState(EMPTY_SUGGESTION)
  const [saving, setSaving] = useState(false)
  const [categoryError, setCategoryError] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [step, setStep] = useState<StudioStep>('intake')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [synopsis, setSynopsis] = useState<Partial<CourseSynopsis> | null>(null)
  const [brainstorming, setBrainstorming] = useState(false)
  const [brainstormError, setBrainstormError] = useState('')
  const [showRefinementChat, setShowRefinementChat] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [generationError, setGenerationError] = useState('')
  const [generatedCourseId, setGeneratedCourseId] = useState<string | null>(null)
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number | null>(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generationStartedRef = useRef(false)

  useEffect(() => {
    const urls = uploadedFiles.map((file) =>
      file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    )
    setPreviewUrls(urls)
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [uploadedFiles])

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch('/api/studio/categories')
      const json = await res.json()
      setCategories(json.data ?? [])
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!resumeDraftId) return
    async function loadDraft() {
      try {
        const res = await fetch('/api/studio/drafts')
        const json = await res.json()
        const draft = (json.data ?? []).find((d: { id: string }) => d.id === resumeDraftId)
        if (!draft) return
        setDraftId(draft.id)
        const intake = draft.intake_form as Record<string, unknown>
        setForm({
          profession: String(intake.profession ?? ''),
          industry: String(intake.industry ?? ''),
          topic: String(intake.topic ?? ''),
          subtopic: String(intake.subtopic ?? ''),
          target_age_group: String(intake.targetAgeGroup ?? ''),
          learner_level: String(intake.learnerLevel ?? 'beginner'),
          language: (intake.language as 'en' | 'vi' | 'bilingual') ?? 'bilingual',
          course_size: (intake.courseSize as CourseSize) ?? 'starter',
          estimated_minutes_per_lesson: Number(intake.estimatedMinutesPerLesson ?? 15),
          additional_context: String(intake.additionalContext ?? ''),
          template_id: (draft.template_id as CourseTemplateId) ?? 'professional_communication',
          category_id: draft.category_id ?? '',
          category_suggestion_id: draft.category_suggestion_id ?? '',
        })
        if (draft.status === 'refining' && draft.synopsis) {
          setSynopsis(draft.synopsis)
          setStep('synopsis')
        }
      } catch { /* silent */ }
    }
    loadDraft()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeDraftId])

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parent_id),
    [categories],
  )

  const intakeForm = useMemo(() => buildIntakeForm(), [form, uploadedUrls])

  const completeSynopsis = useMemo(() => {
    const parsed = courseSynopsisSchema.safeParse(synopsis)
    return parsed.success ? (parsed.data as CourseSynopsis) : null
  }, [synopsis])

  useEffect(() => {
    if (step !== 'generation' || !draftId || !completeSynopsis || generationStartedRef.current) return
    generationStartedRef.current = true
    runGeneration()
    // runGeneration reads the latest state values; generationStartedRef prevents duplicate requests in dev.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, draftId, completeSynopsis])

  const categoryLabel = (category: CourseCategory) => {
    const parent = categories.find((item) => item.id === category.parent_id)
    return parent ? `${parent.name} -> ${category.name}` : category.name
  }

  function buildIntakeForm(): CourseIntakeForm {
    return {
      profession: form.profession,
      industry: form.industry,
      topic: form.topic,
      subtopic: form.subtopic || undefined,
      targetAgeGroup: form.target_age_group,
      learnerLevel: form.learner_level as CourseIntakeForm['learnerLevel'],
      language: form.language as CourseIntakeForm['language'],
      courseSize: form.course_size,
      numModules: COURSE_SIZE_MODULES[form.course_size],
      estimatedMinutesPerLesson: form.estimated_minutes_per_lesson,
      additionalContext: form.additional_context || undefined,
      referenceImageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    }
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selected.length === 0) return

    setUploadedFiles((current) => {
      const merged = [...current, ...selected].slice(0, 5)
      if (merged.length < current.length + selected.length) {
        toast(t.studioUploadConstraints, 'error')
      }
      return merged
    })
    setUploadedUrls([])
  }

  function removeUploadedFile(index: number) {
    setUploadedFiles((current) => current.filter((_, i) => i !== index))
    setUploadedUrls([])
  }

  async function uploadReferenceFiles(): Promise<string[]> {
    if (uploadedFiles.length === 0) return uploadedUrls

    setUploading(true)
    try {
      const formData = new FormData()
      uploadedFiles.forEach((file) => formData.append('files', file))

      const res = await fetch('/api/studio/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'upload failed')

      const urls = (json.urls as string[]) ?? []
      setUploadedUrls(urls)
      return urls
    } catch {
      toast(t.studioUploadError, 'error')
      throw new Error('upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function submitSuggestion(event: FormEvent) {
    event.preventDefault()
    setSuggesting(true)
    try {
      const res = await fetch('/api/studio/category-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'suggestion failed')
      setForm({ ...form, category_id: '', category_suggestion_id: json.data.id })
      setSuggestion(EMPTY_SUGGESTION)
      toast(t.studioSuggestionSubmitted, 'success')
    } catch {
      toast(t.studioDraftError, 'error')
    } finally {
      setSuggesting(false)
    }
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault()
    if (!form.category_id && !form.category_suggestion_id) {
      setCategoryError(true)
      toast(t.studioCategoryRequired, 'error')
      return
    }
    setCategoryError(false)

    setSaving(true)
    try {
      let referenceUrls = uploadedUrls
      if (uploadedFiles.length > 0) {
        referenceUrls = await uploadReferenceFiles()
      }

      const res = await fetch('/api/studio/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          reference_image_urls: referenceUrls,
        }),
      })
      if (!res.ok) throw new Error('draft failed')
      const json = await res.json()
      const nextDraftId = json.data?.id as string | undefined
      if (!nextDraftId) throw new Error('draft missing id')

      setDraftId(nextDraftId)
      setStep('synopsis')
      toast(t.studioDraftSaved, 'success')
      await runBrainstorm(nextDraftId)
    } catch {
      toast(t.studioDraftError, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function runBrainstorm(nextDraftId = draftId) {
    if (!nextDraftId) return

    setBrainstorming(true)
    setBrainstormError('')
    setSynopsis(null)

    try {
      const res = await fetch('/api/studio/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: nextDraftId,
          intakeForm: buildIntakeForm(),
          templateId: form.template_id,
        }),
      })

      if (!res.ok || !res.body) throw new Error('brainstorm failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as BrainstormStreamEvent
          if (event.type === 'error') throw new Error(event.error ?? 'brainstorm failed')
          if (event.synopsis) setSynopsis(event.synopsis)
        }
      }

      if (buffer.trim()) {
        const event = JSON.parse(buffer) as BrainstormStreamEvent
        if (event.synopsis) setSynopsis(event.synopsis)
      }
    } catch {
      setBrainstormError(t.studioBrainstormError)
      toast(t.studioBrainstormError, 'error')
    } finally {
      setBrainstorming(false)
    }
  }

  function handleContinue() {
    setStep('generation')
  }

  async function runGeneration() {
    if (!draftId || !completeSynopsis) return

    setGenerationStatus('generating')
    setGenerationError('')
    setGeneratedCourseId(null)
    setGenerationStartedAt(Date.now())
    setCurrentModuleIndex(null)
    setCurrentLessonIndex(null)
    setCompletedLessons(new Set())

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      })

      if (!res.ok || !res.body) throw new Error('generation failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          handleGenerateEvent(JSON.parse(line) as GenerateStreamEvent)
        }
      }

      if (buffer.trim()) handleGenerateEvent(JSON.parse(buffer) as GenerateStreamEvent)
    } catch (error) {
      const message = error instanceof Error ? error.message : t.studioGenerationFailed
      setGenerationStatus('error')
      setGenerationError(message)
      toast(t.studioGenerationFailed, 'error')
    }
  }

  function handleGenerateEvent(event: GenerateStreamEvent) {
    if (event.type === 'module_start' && event.moduleIndex) {
      setCurrentModuleIndex(event.moduleIndex)
      setCurrentLessonIndex(null)
      return
    }

    if (event.type === 'lesson_start' && event.moduleIndex && event.lessonIndex) {
      setCurrentModuleIndex(event.moduleIndex)
      setCurrentLessonIndex(event.lessonIndex)
      return
    }

    if (event.type === 'lesson_done' && event.moduleIndex && event.lessonIndex) {
      setCompletedLessons((current) => {
        const next = new Set(current)
        next.add(`${event.moduleIndex}:${event.lessonIndex}`)
        return next
      })
      return
    }

    if (event.type === 'complete' && event.courseId) {
      setGeneratedCourseId(event.courseId)
      setGenerationStatus('complete')
      setCurrentLessonIndex(null)
      return
    }

    if (event.type === 'error') {
      throw new Error(event.error ?? t.studioGenerationFailed)
    }
  }

  function retryGeneration() {
    generationStartedRef.current = true
    runGeneration()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.studioNewTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.studioNewSubtitle}</p>
        </div>
      </div>

      {step === 'generation' ? (
        <GenerationProgress
          synopsis={completeSynopsis}
          status={generationStatus}
          completedLessons={completedLessons}
          currentModuleIndex={currentModuleIndex}
          currentLessonIndex={currentLessonIndex}
          courseId={generatedCourseId}
          error={generationError}
          startedAt={generationStartedAt}
          onRetry={retryGeneration}
        />
      ) : step === 'synopsis' ? (
        <div className="space-y-5">
          {brainstormError && (
            <div className="card p-4 border-error/30 bg-red-50 text-sm text-error flex items-center justify-between gap-4">
              <span>{brainstormError}</span>
              <button
                type="button"
                className="btn-secondary text-sm shrink-0"
                onClick={() => runBrainstorm()}
              >
                {t.studioBrainstormRetry ?? 'Retry'}
              </button>
            </div>
          )}
          <div className={showRefinementChat ? 'grid xl:grid-cols-[minmax(0,1.25fr)_440px] gap-5 items-start' : ''}>
            <SynopsisPanel synopsis={synopsis} isStreaming={brainstorming} />
            {showRefinementChat && completeSynopsis && (
              <RefinementChat
                draftId={draftId}
                currentSynopsis={completeSynopsis}
                intakeForm={intakeForm}
                onSynopsisUpdate={setSynopsis}
              />
            )}
          </div>
          <div className="sticky bottom-4 card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-card">
            <div>
              <p className="font-semibold">{t.studioBrainstormReviewTitle}</p>
              <p className="text-sm text-text-muted">{t.studioBrainstormReviewDesc}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                className="btn-secondary flex-1 sm:flex-none"
                disabled={brainstorming || !completeSynopsis}
                onClick={() => setShowRefinementChat((current) => !current)}
              >
                {showRefinementChat ? t.studioHideRefineChat : t.studioRefineWithAi}
              </button>
              <button
                className="btn-primary flex-1 sm:flex-none"
                disabled={brainstorming || !completeSynopsis}
                onClick={handleContinue}
              >
                {t.studioLooksGoodContinue}
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <form onSubmit={saveDraft} className="card p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t.studioProfession}</label>
              <input
                className="input"
                required
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                placeholder="Registered Nurse"
              />
            </div>
            <div>
              <label className="label">{t.studioIndustry}</label>
              <input
                className="input"
                required
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="Healthcare"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t.studioTopic}</label>
              <input
                className="input"
                required
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="Emergency communication in English"
              />
            </div>
            <div>
              <label className="label">{t.studioSubtopic}</label>
              <input
                className="input"
                value={form.subtopic}
                onChange={(e) => setForm({ ...form, subtopic: e.target.value })}
                placeholder="Triage language"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t.studioCategory}</label>
              <select
                className={`input ${categoryError && !form.category_id && !form.category_suggestion_id ? 'border-red-500' : ''}`}
                value={form.category_id}
                onChange={(e) => {
                  setForm({ ...form, category_id: e.target.value, category_suggestion_id: '' })
                  if (e.target.value) setCategoryError(false)
                }}
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
              {categoryError && !form.category_id && !form.category_suggestion_id && (
                <p className="text-red-500 text-xs mt-1">{t.studioCategoryRequired}</p>
              )}
              {form.category_suggestion_id && (
                <p className="text-xs text-warning mt-1">{t.studioSuggestionSubmitted}</p>
              )}
            </div>
            <div>
              <label className="label">{t.studioTemplate}</label>
              <select
                className="input"
                value={form.template_id}
                onChange={(e) => setForm({ ...form, template_id: e.target.value as CourseTemplateId })}
              >
                {courseTemplateOptions.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} — {template.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t.studioCourseSize}</label>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ['starter', t.studioCourseSizeStarter, t.studioCourseSizeStarterDesc],
                ['standard', t.studioCourseSizeStandard, t.studioCourseSizeStandardDesc],
                ['full', t.studioCourseSizeFull, t.studioCourseSizeFullDesc],
              ].map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, course_size: value as CourseSize })}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    form.course_size === value
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-bg hover:bg-surface'
                  }`}
                >
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="block text-xs mt-1 text-text-muted">{description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">{t.studioTargetAgeGroup}</label>
              <input
                className="input"
                required
                value={form.target_age_group}
                onChange={(e) => setForm({ ...form, target_age_group: e.target.value })}
                placeholder="22-35 working professionals"
              />
            </div>
            <div>
              <label className="label">{t.studioLearnerLevel}</label>
              <select
                className="input"
                value={form.learner_level}
                onChange={(e) => setForm({ ...form, learner_level: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">{t.studioLanguage}</label>
              <select
                className="input"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="bilingual">Bilingual EN/VI</option>
                <option value="en">English only</option>
                <option value="vi">Vietnamese support</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-[180px_1fr] gap-4">
            <div>
              <label className="label">{t.studioEstimatedMinutes}</label>
              <input
                className="input"
                type="number"
                min={10}
                max={20}
                value={form.estimated_minutes_per_lesson}
                onChange={(e) => setForm({ ...form, estimated_minutes_per_lesson: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">{t.studioAdditionalContext}</label>
              <textarea
                className="input min-h-24 resize-y"
                value={form.additional_context}
                onChange={(e) => setForm({ ...form, additional_context: e.target.value })}
                placeholder="Learners struggle with short emergency phone calls..."
              />
            </div>
          </div>

          <div className="border-t border-border pt-5 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">{t.studioUploadTitle}</h3>
              <p className="text-sm text-text-muted mt-1">{t.studioUploadSubtitle}</p>
              <p className="text-xs text-text-muted mt-1">{t.studioUploadConstraints}</p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf"
                onChange={handleFilesSelected}
                disabled={uploadedFiles.length >= 5 || saving || uploading}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={uploadedFiles.length >= 5 || saving || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? t.studioUploadUploading : t.studioUploadButton}
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    {file.type.startsWith('image/') && previewUrls[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrls[index]}
                        alt=""
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <span className="h-10 w-10 rounded bg-bg border border-border flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-text-muted" aria-hidden />
                      </span>
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      className="p-1 text-text-muted hover:text-error"
                      aria-label={t.studioUploadRemove}
                      disabled={saving || uploading}
                      onClick={() => removeUploadedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="btn-primary" disabled={saving || uploading}>
            {uploading
              ? t.studioUploadUploading
              : saving
                ? t.studioSavingDraft
                : t.studioSaveDraft}
          </button>
        </form>

        <aside className="card p-5">
          <h2 className="mb-2">{t.studioSuggestCategory}</h2>
          <p className="text-sm text-text-muted mb-4">
            Healthcare - Nurse - Emergency, University - Computers, Real Estate - Sales
          </p>
          <form onSubmit={submitSuggestion} className="space-y-4">
            <div>
              <label className="label">{t.studioCategory}</label>
              <select
                className="input"
                value={suggestion.parent_id}
                onChange={(e) => setSuggestion({ ...suggestion, parent_id: e.target.value })}
              >
                <option value="">Top level</option>
                {topLevelCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.studioSuggestedPath}</label>
              <input
                className="input"
                required
                value={suggestion.suggested_path}
                onChange={(e) => setSuggestion({ ...suggestion, suggested_path: e.target.value })}
                placeholder="Healthcare -> Nurse -> ICU"
              />
            </div>
            <div>
              <label className="label">{t.studioSuggestedName}</label>
              <input
                className="input"
                required
                value={suggestion.suggested_name}
                onChange={(e) => setSuggestion({ ...suggestion, suggested_name: e.target.value })}
                placeholder="ICU"
              />
            </div>
            <div>
              <label className="label">{t.studioSuggestionReason}</label>
              <textarea
                className="input min-h-24 resize-y"
                value={suggestion.reason}
                onChange={(e) => setSuggestion({ ...suggestion, reason: e.target.value })}
              />
            </div>
            <button className="btn-secondary w-full justify-center" disabled={suggesting}>
              {t.studioSubmitSuggestion}
            </button>
          </form>
        </aside>
      </div>
      )}
    </div>
  )
}
