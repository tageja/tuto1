'use client'

import { useState, FormEvent } from 'react'
import { Upload, Plus, Trash2 } from 'lucide-react'
import type { NursedLessonStep, StepType } from '@/lib/supabase'

interface StepEditorProps {
  step: NursedLessonStep
  onSave: (stepId: string, config: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function StepEditor({ step, onSave, onCancel }: StepEditorProps) {
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
    default: return <p className="text-sm text-text-muted">Loại bước chưa được hỗ trợ</p>
  }
}

interface EditorProps {
  step: NursedLessonStep
  onSubmit: (config: Record<string, unknown>) => Promise<void>
  saving: boolean
  onCancel: () => void
}

function VideoEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const cfg = step.config as { url?: string; title?: string }
  const [url, setUrl] = useState(cfg.url ?? '')
  const [title, setTitle] = useState(cfg.title ?? step.title ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">Tiêu đề video</label>
        <input className="input text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
      </div>
      <div>
        <label className="label text-xs">URL video (YouTube/Vimeo/CDN) *</label>
        <input className="input text-sm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ url, title })} />
    </div>
  )
}

function AudioShadowEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
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
        <label className="label text-xs">File âm thanh</label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          {audioUrl ? (
            <div className="space-y-2">
              <audio src={audioUrl} controls className="w-full" />
              <button onClick={() => setAudioUrl('')} className="text-xs text-error hover:underline">Xóa</button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} className="text-text-muted" />
              <span className="text-sm text-text-muted">
                {uploading ? 'Đang tải lên...' : 'Chọn file audio (MP3/WAV)'}
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
        <label className="label text-xs">Tốc độ phát</label>
        <select className="input text-sm" value={speed} onChange={(e) => setSpeed(e.target.value)}>
          <option value="slow">Chậm</option>
          <option value="normal">Bình thường</option>
        </select>
      </div>
      <div>
        <label className="label text-xs">Transcript</label>
        <textarea className="input resize-none text-sm" rows={4} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Nurse: Good morning...\nPatient: Good morning..." />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ audio_url: audioUrl, speed, transcript })} />
    </div>
  )
}

function ScriptEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const cfg = step.config as { script?: string }
  const [script, setScript] = useState(cfg.script ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">Nội dung kịch bản (Nurse/Patient)</label>
        <textarea className="input resize-none text-sm font-mono" rows={8} value={script} onChange={(e) => setScript(e.target.value)} placeholder={"Nurse: Good morning, how can I help you?\nPatient: I have a headache."} />
        <p className="text-xs text-text-muted mt-1">Mỗi dòng: "Nurse: ..." hoặc "Patient: ..."</p>
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script })} />
    </div>
  )
}

function ClozeEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
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
        <label className="label text-xs">Kịch bản gốc</label>
        <textarea className="input resize-none text-sm font-mono" rows={5} value={script} onChange={(e) => setScript(e.target.value)} placeholder="Điền kịch bản đầy đủ..." />
      </div>
      <button type="button" onClick={generateCloze} className="btn-secondary text-xs">
        Tự động tạo Cloze (mỗi từ thứ 4)
      </button>
      {cloze && (
        <div>
          <label className="label text-xs">Bản Cloze</label>
          <textarea className="input resize-none text-sm font-mono" rows={5} value={cloze} onChange={(e) => setCloze(e.target.value)} />
        </div>
      )}
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ script, cloze })} />
    </div>
  )
}

function RecordingEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const cfg = step.config as { rubric?: Record<string, boolean> }
  const defaultRubric = { complete: false, clear: false, polite: false, keywords: false }
  const [rubric, setRubric] = useState<Record<string, boolean>>(cfg.rubric ?? defaultRubric)

  const labels: Record<string, string> = {
    complete: 'Hoàn chỉnh (Complete)?',
    clear: 'Rõ ràng (Clear)?',
    polite: 'Lịch sự (Polite)?',
    keywords: 'Từ khóa đúng (Key words)?',
  }

  return (
    <div className="space-y-3">
      <label className="label text-xs">Tiêu chí chấm điểm (Rubric)</label>
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
            <span className="text-xs font-medium text-text-muted">Câu {idx + 1}</span>
            <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-error hover:underline text-xs">
              <Trash2 size={12} />
            </button>
          </div>
          <input className="input text-sm" value={q.prompt_en} onChange={(e) => updateQuestion(idx, 'prompt_en', e.target.value)} placeholder="Question (English)" />
          <input className="input text-sm" value={q.prompt_vi} onChange={(e) => updateQuestion(idx, 'prompt_vi', e.target.value)} placeholder="Câu hỏi (Tiếng Việt)" />
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, oIdx) => (
              <input key={opt.id} className="input text-xs" value={opt.text} onChange={(e) => updateOption(idx, oIdx, e.target.value)} placeholder={`Đáp án ${opt.id.toUpperCase()}`} />
            ))}
          </div>
          <div>
            <label className="label text-xs">Đáp án đúng</label>
            <select className="input text-sm" value={q.answer} onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}>
              {q.options.map((o) => <option key={o.id} value={o.id}>{o.id.toUpperCase()}: {o.text || '...'}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-secondary text-xs w-full">
        <Plus size={13} />
        Thêm câu hỏi
      </button>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ questions })} />
    </div>
  )
}

function MissionEditor({ step, onSubmit, saving, onCancel }: EditorProps) {
  const cfg = step.config as { mission_en?: string; mission_vi?: string }
  const [missionEn, setMissionEn] = useState(cfg.mission_en ?? '')
  const [missionVi, setMissionVi] = useState(cfg.mission_vi ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="label text-xs">Nhiệm vụ (English)</label>
        <textarea className="input resize-none text-sm" rows={3} value={missionEn} onChange={(e) => setMissionEn(e.target.value)} placeholder="Mission description in English..." />
      </div>
      <div>
        <label className="label text-xs">Nhiệm vụ (Tiếng Việt)</label>
        <textarea className="input resize-none text-sm" rows={3} value={missionVi} onChange={(e) => setMissionVi(e.target.value)} placeholder="Mô tả nhiệm vụ bằng tiếng Việt..." />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={() => onSubmit({ mission_en: missionEn, mission_vi: missionVi })} />
    </div>
  )
}

function EditorActions({ saving, onCancel, onSave }: { saving: boolean; onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="button" onClick={onCancel} className="btn-secondary flex-1">Hủy</button>
      <button type="button" onClick={onSave} disabled={saving} className="btn-primary flex-1">
        {saving ? 'Đang lưu...' : 'Lưu bước'}
      </button>
    </div>
  )
}
