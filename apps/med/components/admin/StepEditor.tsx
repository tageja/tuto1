'use client'

import { useState, useCallback } from 'react'
import { Upload, Plus, Trash2, GripVertical } from 'lucide-react'
import type { NursedLessonStep, StepType, QuizQuestionType, QuickResponseOption } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import GenerateAudioButton from './GenerateAudioButton'
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface StepEditorProps {
  step: NursedLessonStep
  siblingSteps?: NursedLessonStep[]
  onSave: (stepId: string, config: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function StepEditor({ step, siblingSteps = [], onSave, onCancel }: StepEditorProps) {
  const { t } = useLang()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(config: Record<string, unknown>) {
    setSaving(true)
    try {
      await onSave(step.id, config)
    } finally {
      setSaving(false)
    }
  }

  const editorProps = { step, siblingSteps, onSubmit: handleSubmit, saving, onCancel }

  switch (step.type) {
    case 'video': return <VideoEditor {...editorProps} />
    case 'audio_shadow': return <AudioShadowEditor {...editorProps} />
    case 'script_read':
    case 'no_script': return <ScriptEditor {...editorProps} />
    case 'cloze': return <ClozeEditor {...editorProps} />
    case 'recording_submit': return <RecordingEditor {...editorProps} />
    case 'quiz': return <QuizEditor {...editorProps} />
    case 'mission': return <MissionEditor {...editorProps} />
    case 'scenario_intro': return <ScenarioIntroEditor {...editorProps} />
    case 'self_reflection': return <SelfReflectionEditor {...editorProps} />
    case 'matching': return <MatchingEditor {...editorProps} />
    case 'drag_order': return <DragOrderEditor {...editorProps} />
    case 'flash_card': return <FlashCardEditor {...editorProps} />
    case 'quick_response': return <QuickResponseEditor {...editorProps} />
    case 'odd_one_out': return <OddOneOutEditor {...editorProps} />
    case 'sentence_builder': return <SentenceBuilderEditor {...editorProps} />
    case 'spot_the_mistake': return <SpotTheMistakeEditor {...editorProps} />
    default: return <p className="text-sm text-text-muted">{t.unsupportedStepType}</p>
  }
}

interface EditorProps {
  step: NursedLessonStep
  siblingSteps: NursedLessonStep[]
  onSubmit: (config: Record<string, unknown>) => Promise<void>
  saving: boolean
  onCancel: () => void
}

function VideoEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { url?: string; title?: string }
  const [url, setUrl] = useState(cfg.url ?? '')
  const [title, setTitle] = useState(cfg.title ?? step.title ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelVideoTitle}</label>
        <input className="input text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.placeholderVideoTitle} />
      </div>
      <div>
        <label className="label text-xs">{t.labelVideoUrl}</label>
        <input className="input text-sm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t.placeholderVideoUrl} />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ url, title })} />
    </div>
  )
}

function AudioShadowEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { audioUrl?: string; audio_url?: string; speed?: string; transcript?: string }
  const [audioUrl, setAudioUrl] = useState(cfg.audioUrl ?? cfg.audio_url ?? '')
  const [speed, setSpeed] = useState(cfg.speed ?? 'normal')
  const [transcript, setTranscript] = useState(cfg.transcript ?? '')
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'audio')
      fd.append('step_id', step.id)
      const res = await fetch('/api/assets/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.data?.public_url) setAudioUrl(data.data.public_url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelAudioFile}</label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          {audioUrl ? (
            <div className="space-y-2">
              <audio src={audioUrl} controls className="w-full" />
              <button onClick={() => setAudioUrl('')} className="text-xs text-error hover:underline">{t.btnAudioRemove}</button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} className="text-text-muted" />
              <span className="text-sm text-text-muted">
                {uploading ? t.audioUploading : t.audioUploadLabel}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>
      <div>
        <label className="label text-xs">{t.labelPlaybackSpeed}</label>
        <select className="input text-sm" value={speed} onChange={(e) => setSpeed(e.target.value)}>
          <option value="slow">{t.speedSlow}</option>
          <option value="normal">{t.speedNormal}</option>
        </select>
      </div>
      <div>
        <label className="label text-xs">{t.labelTranscript}</label>
        <textarea className="input resize-none text-sm" rows={4} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Nurse: Good morning...\nPatient: Good morning..." />
      </div>
      {transcript && (
        <GenerateAudioButton
          stepId={step.id}
          fields={[{ text: transcript, voice: 'nurse', field: 'audioUrl', label: 'Full transcript' }]}
          onGenerated={(_, url) => setAudioUrl(url)}
        />
      )}
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ audioUrl, speed, transcript })} />
    </div>
  )
}

function ScriptEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { script?: string }
  const [script, setScript] = useState(cfg.script ?? '')

  const audioFields = script
    .split('\n')
    .map((line, i) => {
      const match = line.match(/^(Nurse|Patient|Doctor|Family):\s*(.+)/)
      if (!match) return null
      const roleRaw = match[1].toLowerCase() as 'nurse' | 'patient' | 'doctor'
      const voice = roleRaw === 'family' ? 'patient' : roleRaw
      return { text: match[2], voice, field: `line_${i}_audioUrl`, label: `Line ${i + 1} — ${match[1]}` }
    })
    .filter(Boolean) as { text: string; voice: 'nurse' | 'patient' | 'doctor'; field: string; label: string }[]

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelScriptContent}</label>
        <textarea className="input resize-none text-sm font-mono" rows={8} value={script} onChange={(e) => setScript(e.target.value)} placeholder={"Nurse: Good morning, how can I help you?\nPatient: I have a headache."} />
        <p className="text-xs text-text-muted mt-1">{t.scriptFormatHint}</p>
      </div>
      {audioFields.length > 0 && (
        <GenerateAudioButton stepId={step.id} fields={audioFields} />
      )}
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script })} />
    </div>
  )
}

function ClozeEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { script?: string; cloze?: string; clozeText?: string }
  const [script, setScript] = useState(cfg.script ?? '')
  const [cloze, setCloze] = useState(cfg.clozeText ?? cfg.cloze ?? '')

  /** Collect full script text from sibling script_read / audio_shadow / no_script steps. */
  function pullScriptFromSiblings(): string {
    for (const s of siblingSteps) {
      const cfg2 = s.config as Record<string, unknown> | null
      if (!cfg2) continue
      for (const key of ['script', 'transcript']) {
        const text = cfg2[key]
        if (typeof text === 'string' && text.trim().length > 10) return text.trim()
      }
    }
    return ''
  }

  const siblingScript = pullScriptFromSiblings()

  function handlePullScript() {
    if (siblingScript) setScript(siblingScript)
  }

  function generateCloze() {
    const src = script.trim()
    if (!src) return
    // Every 4th word becomes [word] — the bracket embeds the correct answer for the learner.
    const words = src.split(/\s+/)
    const result = words.map((w, i) => ((i + 1) % 4 === 0 ? `[${w}]` : w)).join(' ')
    setCloze(result)
  }

  const hasScript = script.trim().length > 0

  return (
    <div className="space-y-3">
      {/* Pull-from-lesson banner */}
      {siblingScript && !hasScript && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">Script found in this lesson</p>
            <p className="text-xs text-text-muted mt-0.5">Pull it in, then click Auto-generate Cloze.</p>
          </div>
          <button
            type="button"
            onClick={handlePullScript}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0"
          >
            ⚡ Pull script
          </button>
        </div>
      )}

      <div>
        <label className="label text-xs">{t.labelOriginalScript}</label>
        <textarea
          className="input resize-none text-sm font-mono"
          rows={5}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder={t.placeholderOriginalScript}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={generateCloze}
          disabled={!hasScript}
          className="btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          title={!hasScript ? 'Paste the full script above first' : undefined}
        >
          {t.btnAutoCloze}
        </button>
        {!hasScript && (
          <span className="text-xs text-text-muted">← paste the full script above first</span>
        )}
      </div>

      {cloze && (
        <div>
          <label className="label text-xs">{t.labelClozeOutput}</label>
          <p className="text-xs text-text-muted mb-1">
            Words in <code className="bg-surface px-1 rounded">[brackets]</code> are the blanks — the word inside is the correct answer. Edit freely.
          </p>
          <textarea
            className="input resize-none text-sm font-mono"
            rows={6}
            value={cloze}
            onChange={(e) => setCloze(e.target.value)}
          />
        </div>
      )}

      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script, clozeText: cloze })} />
    </div>
  )
}

function RecordingEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { rubric?: Record<string, boolean> }
  const defaultRubric = { complete: false, clear: false, polite: false, keywords: false }
  const [rubric, setRubric] = useState<Record<string, boolean>>(cfg.rubric ?? defaultRubric)

  const labels: Record<string, string> = {
    complete: t.rubricComplete,
    clear: t.rubricClear,
    polite: t.rubricPolite,
    keywords: t.rubricKeywords,
  }

  return (
    <div className="space-y-3">
      <label className="label text-xs">{t.labelRubric}</label>
      <div className="space-y-2 bg-surface rounded-lg p-3">
        {Object.keys(labels).map((key) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rubric[key] ?? false}
              onChange={(e) => setRubric({ ...rubric, [key]: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text">{labels[key]}</span>
          </label>
        ))}
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ rubric })} />
    </div>
  )
}

interface QuizOption { id: string; text: string; text_vi?: string }
interface QuizQuestion {
  id: string
  type: QuizQuestionType
  prompt_en: string
  prompt_vi: string
  options: QuizOption[]
  answer: string
  explanation_en?: string
  explanation_vi?: string
}

function normalizeQuizQuestions(raw: QuizQuestion[] | undefined): QuizQuestion[] {
  return (raw ?? []).map((q) => ({
    ...q,
    id: q.id && q.id.length > 0 ? q.id : crypto.randomUUID(),
  }))
}

function QuizEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { questions?: QuizQuestion[] }
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => normalizeQuizQuestions(cfg.questions))

  function addQuestion() {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      type: 'mcq',
      prompt_en: '',
      prompt_vi: '',
      options: [{ id: 'a', text: '', text_vi: '' }, { id: 'b', text: '', text_vi: '' }, { id: 'c', text: '', text_vi: '' }, { id: 'd', text: '', text_vi: '' }],
      answer: 'a',
      explanation_en: '',
      explanation_vi: '',
    }])
  }

  function updateQuestion(idx: number, field: keyof QuizQuestion, value: unknown) {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  function updateOption(qIdx: number, oIdx: number, field: 'text' | 'text_vi', value: string) {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q
      const opts = q.options.map((o, j) => j === oIdx ? { ...o, [field]: value } : o)
      return { ...q, options: opts }
    })
    setQuestions(updated)
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q.id} className="bg-surface rounded-lg p-3 space-y-2 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              {t.quizQuestionLabel.replace('{n}', String(idx + 1))}
            </span>
            <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-error hover:underline text-xs">
              <Trash2 size={12} />
            </button>
          </div>
          <input className="input text-sm" value={q.prompt_en} onChange={(e) => updateQuestion(idx, 'prompt_en', e.target.value)} placeholder={t.placeholderQuestionEn} />
          <input className="input text-sm" value={q.prompt_vi} onChange={(e) => updateQuestion(idx, 'prompt_vi', e.target.value)} placeholder={t.placeholderQuestionVi} />
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-medium">{t.labelOptionsEn}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => (
                <input key={opt.id} className="input text-xs" value={opt.text} onChange={(e) => updateOption(idx, oIdx, 'text', e.target.value)} placeholder={t.placeholderOption.replace('{letter}', opt.id.toUpperCase())} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-text-muted font-medium">{t.labelOptionsVi}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => (
                <input key={`${opt.id}_vi`} className="input text-xs" value={opt.text_vi ?? ''} onChange={(e) => updateOption(idx, oIdx, 'text_vi', e.target.value)} placeholder={t.placeholderOptionVi.replace('{letter}', opt.id.toUpperCase())} />
              ))}
            </div>
          </div>
          <div>
            <label className="label text-xs">{t.labelCorrectAnswer}</label>
            <select className="input text-sm" value={q.answer} onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}>
              {q.options.map((o) => <option key={o.id} value={o.id}>{o.id.toUpperCase()}: {o.text || '...'}</option>)}
            </select>
          </div>
          <input className="input text-xs" value={q.explanation_en ?? ''} onChange={(e) => updateQuestion(idx, 'explanation_en', e.target.value)} placeholder={t.placeholderExplanationEn} />
          <input className="input text-xs" value={q.explanation_vi ?? ''} onChange={(e) => updateQuestion(idx, 'explanation_vi', e.target.value)} placeholder={t.placeholderExplanationVi} />
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-secondary text-xs w-full">
        <Plus size={13} />
        {t.btnAddQuestion}
      </button>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ questions })} />
    </div>
  )
}

function MissionEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { mission_en?: string; mission_vi?: string }
  const [missionEn, setMissionEn] = useState(cfg.mission_en ?? '')
  const [missionVi, setMissionVi] = useState(cfg.mission_vi ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelMissionEn}</label>
        <textarea className="input resize-none text-sm" rows={3} value={missionEn} onChange={(e) => setMissionEn(e.target.value)} placeholder={t.placeholderMissionEn} />
      </div>
      <div>
        <label className="label text-xs">{t.labelMissionVi}</label>
        <textarea className="input resize-none text-sm" rows={3} value={missionVi} onChange={(e) => setMissionVi(e.target.value)} placeholder={t.placeholderMissionVi} />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ mission_en: missionEn, mission_vi: missionVi })} />
    </div>
  )
}

interface KeyPhrase { en: string; vi: string }

function ScenarioIntroEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as {
    context_en?: string
    context_vi?: string
    setting_en?: string
    setting_vi?: string
    audio_url?: string
    _instructions?: string
    key_phrases?: KeyPhrase[]
  }

  const [contextEn, setContextEn] = useState(cfg.context_en ?? '')
  const [contextVi, setContextVi] = useState(cfg.context_vi ?? '')
  const [settingEn, setSettingEn] = useState(cfg.setting_en ?? '')
  const [settingVi, setSettingVi] = useState(cfg.setting_vi ?? '')
  const [audioUrl, setAudioUrl] = useState(cfg.audio_url ?? 'PLACEHOLDER')
  const [instructions, setInstructions] = useState(cfg._instructions ?? '')
  const [phrases, setPhrases] = useState<KeyPhrase[]>(cfg.key_phrases ?? [{ en: '', vi: '' }])

  function addPhrase() {
    setPhrases([...phrases, { en: '', vi: '' }])
  }

  function updatePhrase(idx: number, field: 'en' | 'vi', val: string) {
    setPhrases(phrases.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }

  function removePhrase(idx: number) {
    setPhrases(phrases.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelScenarioSettingEn}</label>
        <input className="input text-sm" value={settingEn} onChange={(e) => setSettingEn(e.target.value)} placeholder="e.g. Emergency Room — Chest Pain" />
      </div>
      <div>
        <label className="label text-xs">{t.labelScenarioSettingVi}</label>
        <input className="input text-sm" value={settingVi} onChange={(e) => setSettingVi(e.target.value)} placeholder="e.g. Phòng Cấp cứu — Đau ngực" />
      </div>
      <div>
        <label className="label text-xs">{t.labelScenarioContextEn}</label>
        <textarea className="input resize-none text-sm" rows={3} value={contextEn} onChange={(e) => setContextEn(e.target.value)} placeholder="Describe the clinical scenario in English..." />
      </div>
      <div>
        <label className="label text-xs">{t.labelScenarioContextVi}</label>
        <textarea className="input resize-none text-sm" rows={3} value={contextVi} onChange={(e) => setContextVi(e.target.value)} placeholder="Mô tả tình huống lâm sàng bằng tiếng Việt..." />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label text-xs mb-0">{t.labelKeyPhrases}</label>
          <button type="button" onClick={addPhrase} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus size={12} /> {t.btnAddPhrase}
          </button>
        </div>
        <div className="space-y-2">
          {phrases.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input text-xs flex-1" value={p.en} onChange={(e) => updatePhrase(i, 'en', e.target.value)} placeholder="English phrase" />
              <input className="input text-xs flex-1" value={p.vi} onChange={(e) => updatePhrase(i, 'vi', e.target.value)} placeholder="Cụm từ tiếng Việt" />
              <button onClick={() => removePhrase(i)} className="text-error"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label text-xs">{t.labelAudioUrl}</label>
        <input className="input text-sm" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="PLACEHOLDER or actual URL" />
      </div>

      <div>
        <label className="label text-xs">{t.labelAudioInstructions}</label>
        <textarea className="input resize-none text-sm" rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions for audio producer: duration, speed, tone, key phrases..." />
      </div>

      <EditorActions
        saving={saving}
        onCancel={onCancel}
        onSave={() => onSubmit({
          context_en: contextEn,
          context_vi: contextVi,
          setting_en: settingEn,
          setting_vi: settingVi,
          audio_url: audioUrl,
          _instructions: instructions,
          key_phrases: phrases.filter((p) => p.en || p.vi),
        })}
      />
    </div>
  )
}

interface ReflectionPrompt { key: string; label_en: string; label_vi: string; type: 'slider' | 'text' }

function SelfReflectionEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { prompts?: ReflectionPrompt[] }

  const DEFAULT_PROMPTS: ReflectionPrompt[] = [
    { key: 'confidence', label_en: 'How confident do you feel using this language now?', label_vi: 'Bạn cảm thấy tự tin ở mức nào?', type: 'slider' },
    { key: 'usefulness', label_en: 'How useful was this module for your real work?', label_vi: 'Module này có hữu ích cho công việc thực tế không?', type: 'slider' },
    { key: 'difficulty', label_en: 'How difficult was this module overall?', label_vi: 'Module này khó ở mức độ nào?', type: 'slider' },
    { key: 'pair_helped', label_en: 'Did the pair practice help you speak more naturally?', label_vi: 'Luyện cặp đôi có giúp bạn nói tự nhiên hơn không?', type: 'slider' },
    { key: 'open_feedback', label_en: 'Which task felt most useful for your real work?', label_vi: 'Bài tập nào hữu ích nhất cho công việc của bạn?', type: 'text' },
  ]

  const [prompts, setPrompts] = useState<ReflectionPrompt[]>(cfg.prompts ?? DEFAULT_PROMPTS)

  function addPrompt() {
    setPrompts([...prompts, { key: `prompt_${prompts.length}`, label_en: '', label_vi: '', type: 'slider' }])
  }

  function updatePrompt(idx: number, field: keyof ReflectionPrompt, val: string) {
    setPrompts(prompts.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">{t.selfReflectionEditorHint}</p>
      <div className="space-y-3">
        {prompts.map((prompt, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Prompt {idx + 1}</span>
              <div className="flex items-center gap-2">
                <select
                  className="text-xs border border-border rounded px-2 py-1"
                  value={prompt.type}
                  onChange={(e) => updatePrompt(idx, 'type', e.target.value)}
                >
                  <option value="slider">Slider (1–5)</option>
                  <option value="text">Open Text</option>
                </select>
                <button onClick={() => setPrompts(prompts.filter((_, i) => i !== idx))} className="text-error">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <input className="input text-xs" value={prompt.label_en} onChange={(e) => updatePrompt(idx, 'label_en', e.target.value)} placeholder="English prompt..." />
            <input className="input text-xs" value={prompt.label_vi} onChange={(e) => updatePrompt(idx, 'label_vi', e.target.value)} placeholder="Câu hỏi tiếng Việt..." />
          </div>
        ))}
      </div>
      <button type="button" onClick={addPrompt} className="btn-secondary text-xs w-full">
        <Plus size={13} /> {t.btnAddPrompt}
      </button>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ prompts })} />
    </div>
  )
}

// ─── Matching Editor ────────────────────────────────────────────────────────
// Each line: "English phrase | Tiếng Việt"

/** Parse script/transcript text and extract English dialogue lines. */
function extractEnglishLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      // "Nurse: Good morning, how can I help you?" → "Good morning, how can I help you?"
      const match = line.match(/^(?:Nurse|Patient|Doctor|Family|Speaker\s*\d*):\s*(.+)/i)
      return match ? match[1].trim() : null
    })
    .filter((l): l is string => l !== null && l.length > 2)
}

function MatchingEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const existing = (step.config?.pairs as { en: string; vi: string }[] | undefined) ?? []
  const [raw, setRaw] = useState(existing.map((p) => `${p.en} | ${p.vi}`).join('\n'))
  const [pulled, setPulled] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translateProgress, setTranslateProgress] = useState('')

  /** Collect unique English dialogue lines from sibling script/audio steps. */
  function collectLines(): string[] {
    const lines: string[] = []
    for (const s of siblingSteps) {
      const cfg = s.config as Record<string, unknown> | null
      if (!cfg) continue
      for (const key of ['script', 'transcript']) {
        const text = cfg[key]
        if (typeof text === 'string' && text.trim()) {
          lines.push(...extractEnglishLines(text))
        }
      }
    }
    return [...new Set(lines)]
  }

  async function handlePullFromScript() {
    const unique = collectLines()
    if (unique.length === 0) return

    setTranslating(true)
    setTranslateProgress(`Translating ${unique.length} lines…`)

    try {
      const res = await fetch('/api/translate/phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrases: unique }),
      })
      const data = await res.json() as { pairs?: { en: string; vi: string }[]; error?: string }

      if (!res.ok || data.error || !data.pairs) {
        // Fallback: insert English-only lines so the user can type VI manually
        const existingTrimmed = raw.trim()
        const fallback = unique.map((en) => `${en} | `).join('\n')
        setRaw(existingTrimmed ? `${existingTrimmed}\n${fallback}` : fallback)
        setTranslateProgress('Translation failed — fill Vietnamese manually')
      } else {
        const existingTrimmed = raw.trim()
        const newLines = data.pairs.map(({ en, vi }) => `${en} | ${vi}`).join('\n')
        setRaw(existingTrimmed ? `${existingTrimmed}\n${newLines}` : newLines)
        setTranslateProgress(`✓ ${data.pairs.length} lines translated`)
      }
    } catch {
      const existingTrimmed = raw.trim()
      const fallback = unique.map((en) => `${en} | `).join('\n')
      setRaw(existingTrimmed ? `${existingTrimmed}\n${fallback}` : fallback)
      setTranslateProgress('Translation failed — fill Vietnamese manually')
    } finally {
      setTranslating(false)
      setPulled(true)
    }
  }

  const availableScriptCount = siblingSteps.reduce((acc, s) => {
    const cfg = s.config as Record<string, unknown> | null
    if (!cfg) return acc
    for (const key of ['script', 'transcript']) {
      const text = cfg[key]
      if (typeof text === 'string') acc += extractEnglishLines(text).length
    }
    return acc
  }, 0)

  function handleSave() {
    const pairs = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [en, vi] = line.split('|').map((s) => s.trim())
        return { en: en ?? '', vi: vi ?? '' }
      })
      .filter((p) => p.en && p.vi)
    onSubmit({ pairs })
  }

  return (
    <div className="space-y-3">
      {availableScriptCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              {availableScriptCount} dialogue line{availableScriptCount !== 1 ? 's' : ''} found in this lesson's scripts
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {translateProgress || 'Pull & auto-translate into English | Vietnamese pairs.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePullFromScript}
            disabled={pulled || translating}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            {translating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Translating…
              </>
            ) : pulled ? (
              '✓ Done'
            ) : (
              '⚡ Pull & translate'
            )}
          </button>
        </div>
      )}
      <p className="text-xs text-text-muted">{t.matchingEditorHint}</p>
      <textarea
        className="input resize-none text-sm font-mono"
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"Good morning, how can I help you? | Chào buổi sáng, tôi có thể giúp gì cho bạn?\nPlease take a seat. | Mời bạn ngồi xuống."}
        disabled={translating}
      />
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Drag Order Editor ───────────────────────────────────────────────────────
// One dialogue line per row — stored in correct order; player shuffles on render
function DragOrderEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const existing = (step.config?.lines as string[] | undefined) ?? []
  const [raw, setRaw] = useState(existing.join('\n'))

  function handleSave() {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    onSubmit({ lines })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">{t.dragOrderEditorHint}</p>
      <textarea
        className="input resize-none text-sm font-mono"
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"Nurse: Good morning. How can I help you?\nPatient: I have a headache.\nNurse: How long have you had this?"}
      />
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Flash Card Editor ───────────────────────────────────────────────────────
// Each line: "English front | Vietnamese back"  (audio_url optional, not editable here yet)
// Also supports sprint mode flag + duration input, and pull-from-script via /api/translate/phrases.
function FlashCardEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const existing    = (step.config?.cards as { front_en: string; back_vi: string; audio_url?: string }[] | undefined) ?? []
  const existingMode = (step.config?.mode as string | undefined) ?? 'study'
  const existingSec  = (step.config?.sprint_seconds as number | undefined) ?? 30

  const [raw, setRaw]                   = useState(existing.map((c) => `${c.front_en} | ${c.back_vi}`).join('\n'))
  const [sprintMode, setSprintMode]     = useState(existingMode === 'sprint')
  const [sprintSeconds, setSprintSeconds] = useState(existingSec)
  const [pulled, setPulled]             = useState(false)
  const [translating, setTranslating]   = useState(false)
  const [translateProgress, setTranslateProgress] = useState('')

  function collectLines(): string[] {
    const lines: string[] = []
    for (const s of siblingSteps) {
      const cfg = s.config as Record<string, unknown> | null
      if (!cfg) continue
      for (const key of ['script', 'transcript']) {
        const text = cfg[key]
        if (typeof text === 'string' && text.trim()) {
          lines.push(...extractEnglishLines(text))
        }
      }
    }
    return [...new Set(lines)]
  }

  async function handlePullFromScript() {
    const unique = collectLines()
    if (unique.length === 0) return

    setTranslating(true)
    setTranslateProgress(`Translating ${unique.length} lines…`)

    try {
      const res  = await fetch('/api/translate/phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrases: unique }),
      })
      const data = await res.json() as { pairs?: { en: string; vi: string }[]; error?: string }

      if (!res.ok || data.error || !data.pairs) {
        const existingTrimmed = raw.trim()
        const fallback = unique.map((en) => `${en} | `).join('\n')
        setRaw(existingTrimmed ? `${existingTrimmed}\n${fallback}` : fallback)
        setTranslateProgress('Translation failed — fill Vietnamese manually')
      } else {
        const existingTrimmed = raw.trim()
        const newLines = data.pairs.map(({ en, vi }) => `${en} | ${vi}`).join('\n')
        setRaw(existingTrimmed ? `${existingTrimmed}\n${newLines}` : newLines)
        setTranslateProgress(`✓ ${data.pairs.length} lines translated`)
      }
    } catch {
      const existingTrimmed = raw.trim()
      const fallback = unique.map((en) => `${en} | `).join('\n')
      setRaw(existingTrimmed ? `${existingTrimmed}\n${fallback}` : fallback)
      setTranslateProgress('Translation failed — fill Vietnamese manually')
    } finally {
      setTranslating(false)
      setPulled(true)
    }
  }

  const availableScriptCount = siblingSteps.reduce((acc, s) => {
    const cfg = s.config as Record<string, unknown> | null
    if (!cfg) return acc
    for (const key of ['script', 'transcript']) {
      const text = cfg[key]
      if (typeof text === 'string') acc += extractEnglishLines(text).length
    }
    return acc
  }, 0)

  function handleSave() {
    const cards = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [front_en, back_vi] = line.split('|').map((s) => s.trim())
        return { front_en: front_en ?? '', back_vi: back_vi ?? '' }
      })
      .filter((c) => c.front_en && c.back_vi)

    const config: Record<string, unknown> = { cards }
    if (sprintMode) {
      config.mode = 'sprint'
      config.sprint_seconds = sprintSeconds
    }
    onSubmit(config)
  }

  return (
    <div className="space-y-3">
      {availableScriptCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              {t.flashCardVocabBannerLabel.replace('{n}', String(availableScriptCount))}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {translateProgress || 'Pull & auto-translate into English | Vietnamese card pairs.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePullFromScript}
            disabled={pulled || translating}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            {translating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Translating…
              </>
            ) : pulled ? (
              t.flashCardVocabPulled
            ) : (
              t.flashCardPullVocab
            )}
          </button>
        </div>
      )}

      <p className="text-xs text-text-muted">{t.flashCardEditorHint}</p>
      <textarea
        className="input resize-none text-sm font-mono"
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"Good morning, how can I help you? | Chào buổi sáng, tôi có thể giúp gì cho bạn?\nPlease take a seat. | Mời bạn ngồi xuống."}
        disabled={translating}
      />

      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sprintMode}
            onChange={(e) => setSprintMode(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          <span className="text-xs font-medium text-text">{t.flashCardModeSprintLabel}</span>
        </label>
        {sprintMode && (
          <label className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-text-muted">{t.flashCardSprintDurationLabel}:</span>
            <input
              type="number"
              min={10}
              max={120}
              value={sprintSeconds}
              onChange={(e) => setSprintSeconds(Number(e.target.value))}
              className="input !py-1 !px-2 w-16 text-xs text-center"
            />
          </label>
        )}
      </div>

      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Script reference panel (shared by Odd One Out, Sentence Builder, Spot the Mistake) ──

interface ScriptRefPanelProps {
  siblingSteps: NursedLessonStep[]
  onCopy: (line: string) => void
}

function ScriptRefPanel({ siblingSteps, onCopy }: ScriptRefPanelProps) {
  const { t } = useLang()
  const [copiedLine, setCopiedLine] = useState<string | null>(null)

  const lines: string[] = []
  for (const s of siblingSteps) {
    const cfg = s.config as Record<string, unknown> | null
    if (!cfg) continue
    for (const key of ['script', 'transcript']) {
      const text = cfg[key]
      if (typeof text === 'string' && text.trim()) {
        lines.push(...extractEnglishLines(text))
      }
    }
  }
  const unique = [...new Set(lines)]

  if (unique.length === 0) return null

  function handleCopy(line: string) {
    navigator.clipboard.writeText(line).catch(() => undefined)
    setCopiedLine(line)
    onCopy(line)
    setTimeout(() => setCopiedLine(null), 1500)
  }

  return (
    <details className="border border-border rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between px-3 py-2 bg-surface cursor-pointer select-none text-xs font-semibold text-primary">
        🪞 {t.oddOneOutEditorReferencePanelTitle}
        <span className="text-text-muted font-normal">({unique.length} lines)</span>
      </summary>
      <div className="p-3 space-y-1 max-h-40 overflow-y-auto bg-bg">
        {unique.map((line, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCopy(line)}
            className="w-full text-left text-xs text-text-muted hover:text-primary hover:bg-primary/5 px-2 py-1 rounded transition-colors truncate"
            title={line}
          >
            {copiedLine === line ? '✓ Copied' : line}
          </button>
        ))}
        <p className="text-[10px] text-text-muted italic pt-1">{t.oddOneOutEditorCopiedToast}</p>
      </div>
    </details>
  )
}

// ─── Quick Response Editor ─────────────────────────────────────────────────────

function QuickResponseEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as {
    prompt_en?: string; prompt_vi?: string;
    speaker_label_en?: string; speaker_label_vi?: string;
    question_en?: string; question_vi?: string;
    options?: QuickResponseOption[];
    feedback_best_en?: string; feedback_best_vi?: string;
  }

  const defaultOptions: QuickResponseOption[] = [
    { id: 'a', text_en: '', text_vi: '', rating: 'best' },
    { id: 'b', text_en: '', text_vi: '', rating: 'acceptable' },
    { id: 'c', text_en: '', text_vi: '', rating: 'incorrect' },
  ]

  const [promptEn, setPromptEn] = useState(cfg.prompt_en ?? '')
  const [promptVi, setPromptVi] = useState(cfg.prompt_vi ?? '')
  const [speakerEn, setSpeakerEn] = useState(cfg.speaker_label_en ?? '')
  const [speakerVi, setSpeakerVi] = useState(cfg.speaker_label_vi ?? '')
  const [questionEn, setQuestionEn] = useState(cfg.question_en ?? '')
  const [questionVi, setQuestionVi] = useState(cfg.question_vi ?? '')
  const [options, setOptions] = useState<QuickResponseOption[]>(cfg.options ?? defaultOptions)
  const [feedbackEn, setFeedbackEn] = useState(cfg.feedback_best_en ?? '')
  const [feedbackVi, setFeedbackVi] = useState(cfg.feedback_best_vi ?? '')
  const [validationError, setValidationError] = useState('')

  function addOption() {
    if (options.length >= 4) return
    const ids = ['a', 'b', 'c', 'd']
    const usedIds = new Set(options.map((o) => o.id))
    const nextId = ids.find((id) => !usedIds.has(id)) ?? 'd'
    setOptions([...options, { id: nextId, text_en: '', text_vi: '', rating: 'incorrect' }])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  function updateOption(idx: number, field: keyof QuickResponseOption, value: string) {
    setOptions(options.map((o, i) => i === idx ? { ...o, [field]: value } : o))
  }

  function handleSave() {
    if (!promptEn.trim()) { setValidationError(t.quickResponseEditorValidationNeedPrompt); return }
    const hasBest = options.some((o) => o.rating === 'best')
    if (!hasBest) { setValidationError(t.quickResponseEditorValidationNeedBest); return }
    setValidationError('')
    onSubmit({
      prompt_en: promptEn, prompt_vi: promptVi,
      speaker_label_en: speakerEn || undefined, speaker_label_vi: speakerVi || undefined,
      question_en: questionEn || undefined, question_vi: questionVi || undefined,
      options,
      feedback_best_en: feedbackEn || undefined, feedback_best_vi: feedbackVi || undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Speaker label EN</label>
          <input className="input text-sm" value={speakerEn} onChange={(e) => setSpeakerEn(e.target.value)} placeholder="Patient" />
        </div>
        <div>
          <label className="label text-xs">Speaker label VI</label>
          <input className="input text-sm" value={speakerVi} onChange={(e) => setSpeakerVi(e.target.value)} placeholder="Bệnh nhân" />
        </div>
      </div>
      <div>
        <label className="label text-xs">Patient prompt EN *</label>
        <textarea className="input resize-none text-sm" rows={2} value={promptEn} onChange={(e) => setPromptEn(e.target.value)} placeholder='e.g. "I feel dizzy."' />
      </div>
      <div>
        <label className="label text-xs">Patient prompt VI</label>
        <textarea className="input resize-none text-sm" rows={2} value={promptVi} onChange={(e) => setPromptVi(e.target.value)} placeholder='e.g. "Tôi cảm thấy chóng mặt."' />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Question EN</label>
          <input className="input text-sm" value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} placeholder="What would you say next?" />
        </div>
        <div>
          <label className="label text-xs">Question VI</label>
          <input className="input text-sm" value={questionVi} onChange={(e) => setQuestionVi(e.target.value)} placeholder="Bạn sẽ nói gì tiếp theo?" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label text-xs mb-0">Options</label>
          <span className="text-[10px] text-text-muted">{t.quickResponseEditorMaxOptionsHint}</span>
        </div>
        {options.map((opt, idx) => (
          <div key={opt.id} className="bg-surface border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Option {opt.id.toUpperCase()}</span>
              <div className="flex items-center gap-2">
                <select
                  className="text-xs border border-border rounded px-2 py-1"
                  value={opt.rating}
                  onChange={(e) => updateOption(idx, 'rating', e.target.value)}
                >
                  <option value="best">{t.quickResponseEditorRatingBest}</option>
                  <option value="acceptable">{t.quickResponseEditorRatingAcceptable}</option>
                  <option value="incorrect">{t.quickResponseEditorRatingIncorrect}</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  disabled={options.length <= 2}
                  className="text-error disabled:opacity-30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <input className="input text-xs" value={opt.text_en} onChange={(e) => updateOption(idx, 'text_en', e.target.value)} placeholder="Response EN *" />
            <input className="input text-xs" value={opt.text_vi} onChange={(e) => updateOption(idx, 'text_vi', e.target.value)} placeholder="Response VI" />
            <input className="input text-xs" value={opt.explanation_en ?? ''} onChange={(e) => updateOption(idx, 'explanation_en', e.target.value)} placeholder="Why (EN, optional)" />
            <input className="input text-xs" value={opt.explanation_vi ?? ''} onChange={(e) => updateOption(idx, 'explanation_vi', e.target.value)} placeholder="Why (VI, optional)" />
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 4}
          className="btn-secondary text-xs w-full disabled:opacity-40"
        >
          <Plus size={13} /> {t.quickResponseEditorAddOption}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">{t.quickResponseEditorBestFeedbackLabel} (EN)</label>
          <input className="input text-sm" value={feedbackEn} onChange={(e) => setFeedbackEn(e.target.value)} placeholder="Best choice — you ensure safety..." />
        </div>
        <div>
          <label className="label text-xs">{t.quickResponseEditorBestFeedbackLabel} (VI)</label>
          <input className="input text-sm" value={feedbackVi} onChange={(e) => setFeedbackVi(e.target.value)} placeholder="Lựa chọn tốt nhất..." />
        </div>
      </div>

      {validationError && (
        <p className="text-xs text-error font-medium">{validationError}</p>
      )}

      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Odd One Out Editor ───────────────────────────────────────────────────────

interface OddOneOutWordDraft { text_en: string; text_vi: string; is_odd: boolean }
interface OddOneOutQuestionDraft {
  id: string
  prompt_en: string
  prompt_vi: string
  words: OddOneOutWordDraft[]
  explanation_en: string
  explanation_vi: string
}

function makeDefaultOOOQuestion(): OddOneOutQuestionDraft {
  return {
    id: crypto.randomUUID(),
    prompt_en: '',
    prompt_vi: '',
    words: [
      { text_en: '', text_vi: '', is_odd: false },
      { text_en: '', text_vi: '', is_odd: false },
      { text_en: '', text_vi: '', is_odd: false },
      { text_en: '', text_vi: '', is_odd: true },
    ],
    explanation_en: '',
    explanation_vi: '',
  }
}

function OddOneOutEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { questions?: OddOneOutQuestionDraft[] }
  const [questions, setQuestions] = useState<OddOneOutQuestionDraft[]>(
    cfg.questions?.length ? cfg.questions : [makeDefaultOOOQuestion()]
  )
  const [validationError, setValidationError] = useState('')

  function updateQuestion(qIdx: number, field: keyof OddOneOutQuestionDraft, value: unknown) {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q))
  }

  function updateWord(qIdx: number, wIdx: number, field: keyof OddOneOutWordDraft, value: unknown) {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q
      const words = q.words.map((w, j) => {
        if (field === 'is_odd') {
          return { ...w, is_odd: j === wIdx }
        }
        return j === wIdx ? { ...w, [field]: value } : w
      })
      return { ...q, words }
    })
    setQuestions(updated)
  }

  function addQuestion() {
    setQuestions([...questions, makeDefaultOOOQuestion()])
  }

  function removeQuestion(qIdx: number) {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== qIdx))
  }

  function handleSave() {
    for (const q of questions) {
      if (q.words.length !== 4 || q.words.some((w) => !w.text_en.trim())) {
        setValidationError(t.oddOneOutEditorValidationNeedFour); return
      }
      if (!q.words.some((w) => w.is_odd)) {
        setValidationError(t.oddOneOutEditorValidationNeedOdd); return
      }
      if (!q.explanation_en.trim()) {
        setValidationError(t.oddOneOutEditorValidationNeedExplanation); return
      }
    }
    setValidationError('')
    onSubmit({ questions })
  }

  return (
    <div className="space-y-4">
      <ScriptRefPanel siblingSteps={siblingSteps} onCopy={() => undefined} />

      {questions.map((q, qIdx) => (
        <div key={q.id} className="border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">
              {t.oddOneOutQuestionLabel.replace('{n}', String(qIdx + 1)).replace('{total}', String(questions.length))}
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(qIdx)}
              disabled={questions.length <= 1}
              className="text-error disabled:opacity-30"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input className="input text-xs" value={q.prompt_en} onChange={(e) => updateQuestion(qIdx, 'prompt_en', e.target.value)} placeholder={t.oddOneOutDefaultPromptEn} />
            <input className="input text-xs" value={q.prompt_vi} onChange={(e) => updateQuestion(qIdx, 'prompt_vi', e.target.value)} placeholder="Từ nào không thuộc nhóm?" />
          </div>

          <div className="space-y-2">
            {q.words.map((w, wIdx) => (
              <div key={wIdx} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                <span className="text-xs font-semibold text-text-muted w-4 shrink-0">{wIdx + 1}</span>
                <input className="input text-xs flex-1" value={w.text_en} onChange={(e) => updateWord(qIdx, wIdx, 'text_en', e.target.value)} placeholder={`Word ${wIdx + 1} EN`} />
                <input className="input text-xs flex-1" value={w.text_vi} onChange={(e) => updateWord(qIdx, wIdx, 'text_vi', e.target.value)} placeholder="VI" />
                <label className="flex items-center gap-1 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name={`odd-${q.id}`}
                    checked={w.is_odd}
                    onChange={() => updateWord(qIdx, wIdx, 'is_odd', true)}
                    className="accent-primary"
                  />
                  <span className="text-[10px] text-text-muted">{t.oddOneOutEditorMarkAsOdd}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-[10px]">{t.oddOneOutEditorExplanationEnLabel} *</label>
              <textarea className="input resize-none text-xs" rows={2} value={q.explanation_en} onChange={(e) => updateQuestion(qIdx, 'explanation_en', e.target.value)} placeholder="Three are respiratory; stomachache is digestive." />
            </div>
            <div>
              <label className="label text-[10px]">{t.oddOneOutEditorExplanationViLabel}</label>
              <textarea className="input resize-none text-xs" rows={2} value={q.explanation_vi} onChange={(e) => updateQuestion(qIdx, 'explanation_vi', e.target.value)} placeholder="Ba từ liên quan đến hô hấp..." />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addQuestion} className="btn-secondary text-xs w-full">
        <Plus size={13} /> {t.oddOneOutEditorAddQuestionBtn}
      </button>

      {validationError && <p className="text-xs text-error font-medium">{validationError}</p>}

      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Sentence Builder Editor ──────────────────────────────────────────────────

interface SortableChunkProps { id: string; text: string; index: number }

function SortableChunk({ id, text, index }: SortableChunkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const transformStr = transform
    ? `translate3d(${transform.x}px,${transform.y}px,0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
    : undefined
  const style = { transform: transformStr, transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2"
    >
      <span {...attributes} {...listeners} className="cursor-grab text-text-muted hover:text-primary">
        <GripVertical size={14} />
      </span>
      <span className="text-xs font-semibold text-text-muted w-4">{index + 1}.</span>
      <span className="text-sm font-medium text-text flex-1">{text}</span>
    </div>
  )
}

function SentenceBuilderEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as {
    prompt_vi?: string; prompt_en?: string; audio_url?: string;
    chunks?: string[]; correct_order?: number[];
    hint_en?: string; hint_vi?: string;
  }

  const [promptVi, setPromptVi] = useState(cfg.prompt_vi ?? '')
  const [promptEnCtx, setPromptEnCtx] = useState(cfg.prompt_en ?? '')
  const [audioUrl, setAudioUrl] = useState(cfg.audio_url ?? '')
  const [rawSentence, setRawSentence] = useState(
    cfg.chunks?.length && cfg.correct_order?.length
      ? cfg.correct_order.map((i) => cfg.chunks![i]).join(' | ')
      : ''
  )
  const [chunks, setChunks] = useState<string[]>(cfg.chunks ?? [])
  const [hintEn, setHintEn] = useState(cfg.hint_en ?? '')
  const [hintVi, setHintVi] = useState(cfg.hint_vi ?? '')
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleParse() {
    const parts = rawSentence.split('|').map((s) => s.trim()).filter(Boolean)
    setChunks(parts)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = chunks.findIndex((_, i) => String(i) === active.id)
    const newIndex = chunks.findIndex((_, i) => String(i) === over.id)
    setChunks(arrayMove(chunks, oldIndex, newIndex))
  }

  const deterministicPreview = useCallback(() => {
    const a = [...chunks.map((_, i) => i)]
    let s = 42
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      const j = Math.abs(s) % (i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a.map((i) => chunks[i])
  }, [chunks])

  async function handleAudioUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'audio')
      fd.append('step_id', step.id)
      const res = await fetch('/api/assets/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.data?.public_url) setAudioUrl(data.data.public_url)
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    if (!promptVi.trim()) { setValidationError(t.sentenceBuilderEditorValidationNeedPromptVi); return }
    if (chunks.length < 2) { setValidationError(t.sentenceBuilderEditorValidationNeedTwoChunks); return }
    setValidationError('')
    const correct_order = chunks.map((_, i) => i)
    onSubmit({
      prompt_vi: promptVi,
      prompt_en: promptEnCtx || undefined,
      audio_url: audioUrl || undefined,
      chunks,
      correct_order,
      hint_en: hintEn || undefined,
      hint_vi: hintVi || undefined,
    })
  }

  return (
    <div className="space-y-3">
      <ScriptRefPanel siblingSteps={siblingSteps} onCopy={() => undefined} />

      <div>
        <label className="label text-xs">{t.sentenceBuilderEditorPromptViLabel} *</label>
        <textarea className="input resize-none text-sm" rows={2} value={promptVi} onChange={(e) => setPromptVi(e.target.value)} placeholder="Tôi cần kiểm tra huyết áp của bạn ngay bây giờ." />
      </div>

      <div>
        <label className="label text-xs">{t.sentenceBuilderEditorContextEnLabel}</label>
        <input className="input text-sm" value={promptEnCtx} onChange={(e) => setPromptEnCtx(e.target.value)} placeholder="Optional EN context shown above the prompt" />
      </div>

      <div>
        <label className="label text-xs">EN audio (optional)</label>
        <div className="border-2 border-dashed border-border rounded-lg p-3 text-center">
          {audioUrl ? (
            <div className="space-y-1">
              <audio src={audioUrl} controls className="w-full h-8" />
              <button onClick={() => setAudioUrl('')} className="text-xs text-error hover:underline">{t.btnAudioRemove}</button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-1">
              <Upload size={20} className="text-text-muted" />
              <span className="text-xs text-text-muted">{uploading ? t.audioUploading : t.audioUploadLabel}</span>
              <input type="file" accept="audio/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg p-3 space-y-3">
        <label className="label text-xs mb-0">{t.sentenceBuilderEditorChunksLabel}</label>
        <p className="text-[10px] text-text-muted">Type the EN sentence with &quot; | &quot; between chunks, then Parse.</p>
        <div className="flex gap-2">
          <input
            className="input text-sm flex-1"
            value={rawSentence}
            onChange={(e) => setRawSentence(e.target.value)}
            placeholder="I need to | check | your blood pressure | right now"
          />
          <button type="button" onClick={handleParse} className="btn-secondary text-xs shrink-0">
            {t.sentenceBuilderEditorParseBtn}
          </button>
        </div>

        {chunks.length > 0 && (
          <>
            <p className="text-[10px] text-text-muted">Drag to reorder — this order is the correct answer:</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={chunks.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {chunks.map((chunk, i) => (
                    <SortableChunk key={String(i)} id={String(i)} text={chunk} index={i} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div>
              <p className="text-[10px] text-text-muted mb-1">{t.sentenceBuilderEditorPreviewPoolLabel}:</p>
              <div className="flex flex-wrap gap-1">
                {deterministicPreview().map((chunk, i) => (
                  <span key={i} className="px-2 py-1 rounded-xl bg-primary-light text-primary text-xs font-medium border border-primary/30">{chunk}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">{t.sentenceBuilderEditorHintEnLabel}</label>
          <input className="input text-sm" value={hintEn} onChange={(e) => setHintEn(e.target.value)} placeholder="Optional hint shown after first wrong attempt" />
        </div>
        <div>
          <label className="label text-xs">{t.sentenceBuilderEditorHintViLabel}</label>
          <input className="input text-sm" value={hintVi} onChange={(e) => setHintVi(e.target.value)} placeholder="Gợi ý (tùy chọn)" />
        </div>
      </div>

      {validationError && <p className="text-xs text-error font-medium">{validationError}</p>}

      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

// ─── Spot the Mistake Editor ──────────────────────────────────────────────────

interface STMToken { text: string; is_wrong: boolean }
interface STMQuestionDraft {
  id: string
  sentence_en: string
  sentence_vi: string
  tokens: STMToken[]
  correction_en: string
  correction_vi: string
  explanation_en: string
  explanation_vi: string
}

function makeDefaultSTMQuestion(): STMQuestionDraft {
  return {
    id: crypto.randomUUID(),
    sentence_en: '',
    sentence_vi: '',
    tokens: [],
    correction_en: '',
    correction_vi: '',
    explanation_en: '',
    explanation_vi: '',
  }
}

function SpotTheMistakeEditor({ step, siblingSteps, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { questions?: STMQuestionDraft[] }
  const [questions, setQuestions] = useState<STMQuestionDraft[]>(
    cfg.questions?.length ? cfg.questions : [makeDefaultSTMQuestion()]
  )
  const [validationError, setValidationError] = useState('')

  function updateQuestion(qIdx: number, field: keyof STMQuestionDraft, value: unknown) {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q))
  }

  function tokenise(qIdx: number) {
    const sentence = questions[qIdx].sentence_en
    const tokens = sentence.split(/\s+/).filter(Boolean).map((text) => ({ text, is_wrong: false }))
    updateQuestion(qIdx, 'tokens', tokens)
  }

  function toggleWrong(qIdx: number, tIdx: number) {
    const tokens = questions[qIdx].tokens.map((tk, i) => ({ ...tk, is_wrong: i === tIdx }))
    updateQuestion(qIdx, 'tokens', tokens)
  }

  function mergeWithLeft(qIdx: number, tIdx: number) {
    if (tIdx === 0) return
    const tokens = [...questions[qIdx].tokens]
    const merged: STMToken = {
      text: `${tokens[tIdx - 1].text} ${tokens[tIdx].text}`,
      is_wrong: tokens[tIdx - 1].is_wrong || tokens[tIdx].is_wrong,
    }
    tokens.splice(tIdx - 1, 2, merged)
    updateQuestion(qIdx, 'tokens', tokens)
  }

  function splitToken(qIdx: number, tIdx: number) {
    const tokens = [...questions[qIdx].tokens]
    const parts = tokens[tIdx].text.split(' ')
    if (parts.length < 2) return
    const split: STMToken[] = parts.map((text, i) => ({ text, is_wrong: i === 0 && tokens[tIdx].is_wrong }))
    tokens.splice(tIdx, 1, ...split)
    updateQuestion(qIdx, 'tokens', tokens)
  }

  function addQuestion() {
    setQuestions([...questions, makeDefaultSTMQuestion()])
  }

  function removeQuestion(qIdx: number) {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== qIdx))
  }

  function handleSave() {
    for (const q of questions) {
      if (q.tokens.length < 2 || !q.tokens.some((tk) => tk.is_wrong)) {
        setValidationError(t.spotTheMistakeEditorValidationNeedWrong); return
      }
      if (!q.correction_en.trim()) { setValidationError(t.spotTheMistakeEditorValidationNeedCorrection); return }
      if (!q.explanation_en.trim()) { setValidationError(t.spotTheMistakeEditorValidationNeedExplanation); return }
    }
    setValidationError('')
    onSubmit({ questions })
  }

  return (
    <div className="space-y-4">
      <ScriptRefPanel siblingSteps={siblingSteps} onCopy={() => undefined} />

      {questions.map((q, qIdx) => (
        <div key={q.id} className="border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">
              {t.spotTheMistakeQuestionLabel.replace('{n}', String(qIdx + 1)).replace('{total}', String(questions.length))}
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(qIdx)}
              disabled={questions.length <= 1}
              className="text-error disabled:opacity-30"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div>
            <label className="label text-[10px]">{t.spotTheMistakeEditorSentenceEnLabel} *</label>
            <div className="flex gap-2">
              <input
                className="input text-sm flex-1"
                value={q.sentence_en}
                onChange={(e) => updateQuestion(qIdx, 'sentence_en', e.target.value)}
                placeholder="Please take this medication twice in a day."
              />
              <button type="button" onClick={() => tokenise(qIdx)} className="btn-secondary text-xs shrink-0">
                {t.spotTheMistakeEditorTokeniseBtn}
              </button>
            </div>
          </div>

          {q.tokens.length > 0 && (
            <div>
              <p className="text-[10px] text-text-muted mb-2">{t.spotTheMistakeEditorTokensLabel}</p>
              <p className="text-[10px] text-text-muted italic mb-2">{t.spotTheMistakeEditorMergeHint}</p>
              <div className="flex flex-wrap gap-1.5">
                {q.tokens.map((tk, tIdx) => {
                  const isMerged = tk.text.includes(' ')
                  return (
                    <div key={tIdx} className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (e.shiftKey) { mergeWithLeft(qIdx, tIdx) }
                          else { toggleWrong(qIdx, tIdx) }
                        }}
                        className={`px-2 py-1 rounded border text-xs font-medium transition-colors min-h-[32px] ${
                          tk.is_wrong
                            ? 'border-error bg-red-50 text-error'
                            : 'border-border bg-surface text-text hover:border-primary'
                        }`}
                      >
                        {tk.text}
                      </button>
                      {isMerged && (
                        <button
                          type="button"
                          onClick={() => splitToken(qIdx, tIdx)}
                          className="text-[9px] text-text-muted hover:text-primary"
                        >
                          {t.spotTheMistakeEditorSplitBtn}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-[10px]">{t.spotTheMistakeEditorCorrectionEnLabel} *</label>
              <input className="input text-xs" value={q.correction_en} onChange={(e) => updateQuestion(qIdx, 'correction_en', e.target.value)} placeholder="a day" />
            </div>
            <div>
              <label className="label text-[10px]">{t.spotTheMistakeEditorCorrectionViLabel}</label>
              <input className="input text-xs" value={q.correction_vi} onChange={(e) => updateQuestion(qIdx, 'correction_vi', e.target.value)} placeholder="một ngày" />
            </div>
          </div>

          <div>
            <label className="label text-[10px]">{t.spotTheMistakeEditorSentenceViLabel}</label>
            <input className="input text-xs" value={q.sentence_vi} onChange={(e) => updateQuestion(qIdx, 'sentence_vi', e.target.value)} placeholder="Vui lòng uống thuốc này hai lần mỗi ngày." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-[10px]">{t.spotTheMistakeEditorExplanationEnLabel} *</label>
              <textarea className="input resize-none text-xs" rows={2} value={q.explanation_en} onChange={(e) => updateQuestion(qIdx, 'explanation_en', e.target.value)} placeholder="We don't use 'in' with this expression." />
            </div>
            <div>
              <label className="label text-[10px]">{t.spotTheMistakeEditorExplanationViLabel}</label>
              <textarea className="input resize-none text-xs" rows={2} value={q.explanation_vi} onChange={(e) => updateQuestion(qIdx, 'explanation_vi', e.target.value)} placeholder="Chúng tôi không dùng 'in' ở đây." />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addQuestion} className="btn-secondary text-xs w-full">
        <Plus size={13} /> {t.spotTheMistakeEditorAddQuestionBtn}
      </button>

      {validationError && <p className="text-xs text-error font-medium">{validationError}</p>}

      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

function EditorActions({ saving, onCancel, onSave }: { saving: boolean; onCancel: () => void; onSave: () => void }) {
  const { t } = useLang()
  return (
    <div className="flex gap-2 pt-1">
      <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t.btnCancel}</button>
      <button type="button" onClick={onSave} disabled={saving} className="btn-primary flex-1">
        {saving ? t.btnSaving : t.btnSaveStep}
      </button>
    </div>
  )
}
