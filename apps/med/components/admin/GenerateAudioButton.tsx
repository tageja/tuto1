'use client'

import { useState } from 'react'
import { Mic, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AudioField {
  text: string
  voice: 'nurse' | 'patient' | 'doctor'
  field: string
  label: string
}

interface Props {
  stepId: string
  fields: AudioField[]
  onGenerated?: (field: string, url: string) => void
}

type FieldStatus = 'idle' | 'loading' | 'done' | 'error'

export default function GenerateAudioButton({ stepId, fields, onGenerated }: Props) {
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({})
  const [generatingAll, setGeneratingAll] = useState(false)

  const generateOne = async (f: AudioField): Promise<void> => {
    if (!f.text?.trim()) return
    setStatuses((s) => ({ ...s, [f.field]: 'loading' }))
    try {
      const res = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: f.text, voice: f.voice, stepId, field: f.field }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStatuses((s) => ({ ...s, [f.field]: 'done' }))
      onGenerated?.(f.field, json.url)
    } catch {
      setStatuses((s) => ({ ...s, [f.field]: 'error' }))
    }
  }

  const generateAll = async () => {
    setGeneratingAll(true)
    for (const f of fields) {
      await generateOne(f)
    }
    setGeneratingAll(false)
  }

  const pendingCount = fields.filter((f) => statuses[f.field] !== 'done').length

  if (!fields.length) return null

  return (
    <div className="border border-border rounded-xl p-4 bg-surface space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic size={15} className="text-primary" />
          <span className="text-sm font-semibold text-text">Audio Generation</span>
          <span className="text-xs text-text-muted">({fields.length} string{fields.length !== 1 ? 's' : ''})</span>
        </div>
        <button
          onClick={generateAll}
          disabled={generatingAll || pendingCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generatingAll ? <Loader2 size={12} className="animate-spin" /> : <Mic size={12} />}
          Generate All
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((f) => {
          const status = statuses[f.field] ?? 'idle'
          return (
            <div key={f.field} className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2 border border-border">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-text-muted mb-0.5">{f.label} · <span className="text-primary">{f.voice}</span></div>
                <div className="text-xs text-text truncate">{f.text}</div>
              </div>
              <button
                onClick={() => generateOne(f)}
                disabled={status === 'loading'}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border hover:border-primary hover:text-primary disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {status === 'loading' && <Loader2 size={11} className="animate-spin text-primary" />}
                {status === 'done' && <CheckCircle size={11} className="text-success" />}
                {status === 'error' && <AlertCircle size={11} className="text-error" />}
                {status === 'idle' && <Mic size={11} />}
                <span>{status === 'done' ? 'Done' : status === 'error' ? 'Retry' : status === 'loading' ? '...' : 'Gen'}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
