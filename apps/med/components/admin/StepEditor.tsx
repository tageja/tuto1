'use client'

import { useState } from 'react'
import { Upload, Plus, Trash2 } from 'lucide-react'
import type { NursedLessonStep, StepType } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface StepEditorProps {
  step: NursedLessonStep
  onSave: (stepId: string, config: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function StepEditor({ step, onSave, onCancel }: StepEditorProps) {
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

  const editorProps = { step, onSubmit: handleSubmit, saving, onCancel }

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
    default: return <p className="text-sm text-text-muted">{t.unsupportedStepType}</p>
  }
}

interface EditorProps {
  step: NursedLessonStep
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
  const cfg = step.config as { audio_url?: string; speed?: string; transcript?: string }
  const [audioUrl, setAudioUrl] = useState(cfg.audio_url ?? '')
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
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ audio_url: audioUrl, speed, transcript })} />
    </div>
  )
}

function ScriptEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { script?: string }
  const [script, setScript] = useState(cfg.script ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelScriptContent}</label>
        <textarea className="input resize-none text-sm font-mono" rows={8} value={script} onChange={(e) => setScript(e.target.value)} placeholder={"Nurse: Good morning, how can I help you?\nPatient: I have a headache."} />
        <p className="text-xs text-text-muted mt-1">{t.scriptFormatHint}</p>
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script })} />
    </div>
  )
}

function ClozeEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { script?: string; cloze?: string }
  const [script, setScript] = useState(cfg.script ?? '')
  const [cloze, setCloze] = useState(cfg.cloze ?? '')

  function generateCloze() {
    const words = script.split(/\s+/)
    const result = words.map((w, i) => ((i + 1) % 4 === 0 ? '___' : w)).join(' ')
    setCloze(result)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">{t.labelOriginalScript}</label>
        <textarea className="input resize-none text-sm font-mono" rows={5} value={script} onChange={(e) => setScript(e.target.value)} placeholder={t.placeholderOriginalScript} />
      </div>
      <button type="button" onClick={generateCloze} className="btn-secondary text-xs">
        {t.btnAutoCloze}
      </button>
      {cloze && (
        <div>
          <label className="label text-xs">{t.labelClozeOutput}</label>
          <textarea className="input resize-none text-sm font-mono" rows={5} value={cloze} onChange={(e) => setCloze(e.target.value)} />
        </div>
      )}
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script, cloze })} />
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

interface QuizOption { id: string; text: string }
interface QuizQuestion { type: string; prompt_en: string; prompt_vi: string; options: QuizOption[]; answer: string }

function QuizEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const { t } = useLang()
  const cfg = step.config as { questions?: QuizQuestion[] }
  const [questions, setQuestions] = useState<QuizQuestion[]>(cfg.questions ?? [])

  function addQuestion() {
    setQuestions([...questions, {
      type: 'mcq',
      prompt_en: '',
      prompt_vi: '',
      options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
      answer: 'a',
    }])
  }

  function updateQuestion(idx: number, field: keyof QuizQuestion, value: unknown) {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  function updateOption(qIdx: number, oIdx: number, text: string) {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q
      const opts = q.options.map((o, j) => j === oIdx ? { ...o, text } : o)
      return { ...q, options: opts }
    })
    setQuestions(updated)
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-surface rounded-lg p-3 space-y-2 border border-border">
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
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, oIdx) => (
              <input key={opt.id} className="input text-xs" value={opt.text} onChange={(e) => updateOption(idx, oIdx, e.target.value)} placeholder={t.placeholderOption.replace('{letter}', opt.id.toUpperCase())} />
            ))}
          </div>
          <div>
            <label className="label text-xs">{t.labelCorrectAnswer}</label>
            <select className="input text-sm" value={q.answer} onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}>
              {q.options.map((o) => <option key={o.id} value={o.id}>{o.id.toUpperCase()}: {o.text || '...'}</option>)}
            </select>
          </div>
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
