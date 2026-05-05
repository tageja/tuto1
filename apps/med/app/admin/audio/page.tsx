'use client'

import { useEffect, useState } from 'react'
import { Mic, CheckCircle, AlertCircle, Loader2, RefreshCw, Volume2, Languages } from 'lucide-react'

interface Course {
  id: string
  title: string
  title_vi: string | null
}

type BatchStatus = 'idle' | 'previewing' | 'running' | 'done' | 'error'

interface PreviewStep {
  id: string
  type: string
  tasks: Array<{ text: string; voice: string; field: string }>
}

interface BatchResult {
  processed: number
  skipped: number
  errors: string[]
  total: number
}

const STEP_TYPE_LABELS: Record<string, string> = {
  scenario_intro: 'Scenario Intro',
  audio_shadow: 'Audio Shadow',
  script_read: 'Script Read',
}

const VOICE_COLORS: Record<string, string> = {
  nurse: 'bg-blue-100 text-blue-700',
  patient: 'bg-green-100 text-green-700',
  doctor: 'bg-purple-100 text-purple-700',
}

interface TranslateStats { totalSteps: number; totalLines: number; translatedLines: number; pendingLines: number }

export default function AudioBatchPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [stepTypes, setStepTypes] = useState<string[]>(['scenario_intro', 'audio_shadow', 'script_read'])
  const [preview, setPreview] = useState<PreviewStep[]>([])
  const [status, setStatus] = useState<BatchStatus>('idle')
  const [result, setResult] = useState<BatchResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  // Translation state
  const [translateStatus, setTranslateStatus] = useState<'idle' | 'checking' | 'running' | 'done' | 'error'>('idle')
  const [translateStats, setTranslateStats] = useState<TranslateStats | null>(null)
  const [translateResult, setTranslateResult] = useState<BatchResult | null>(null)
  const [translateError, setTranslateError] = useState('')

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => setCourses(j.data ?? []))
      .catch(() => {})
  }, [])

  const checkTranslations = async () => {
    if (!selectedCourse) return
    setTranslateStatus('checking')
    setTranslateStats(null)
    try {
      const res = await fetch(`/api/translate?courseId=${selectedCourse}`)
      const json = await res.json()
      setTranslateStats(json)
      setTranslateStatus('idle')
    } catch {
      setTranslateStatus('error')
      setTranslateError('Failed to check translation status')
    }
  }

  const runTranslate = async () => {
    if (!selectedCourse) return
    setTranslateStatus('running')
    setTranslateResult(null)
    setTranslateError('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse }),
      })
      const json = await res.json()
      if (!res.ok) {
        setTranslateStatus('error')
        setTranslateError(json.error ?? 'Translation failed')
      } else {
        setTranslateResult(json)
        setTranslateStatus('done')
        // Refresh stats
        const statsRes = await fetch(`/api/translate?courseId=${selectedCourse}`)
        setTranslateStats(await statsRes.json())
      }
    } catch (err) {
      setTranslateStatus('error')
      setTranslateError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const loadPreview = async () => {
    if (!selectedCourse) return
    setStatus('previewing')
    setPreview([])
    try {
      const res = await fetch(`/api/audio/batch?courseId=${selectedCourse}`)
      const json = await res.json()
      setPreview(json.steps ?? [])
      setStatus('idle')
    } catch {
      setStatus('error')
      setErrorMsg('Failed to load preview')
    }
  }

  const runBatch = async () => {
    if (!selectedCourse) return
    setStatus('running')
    setResult(null)
    setProgress(0)
    setErrorMsg('')
    try {
      const res = await fetch('/api/audio/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse, stepTypes }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(json.error ?? 'Batch failed')
      } else {
        setResult(json)
        setStatus('done')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const totalTasks = preview.reduce((sum, s) => sum + s.tasks.length, 0)
  const selectedCourseName = courses.find((c) => c.id === selectedCourse)?.title ?? ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Volume2 size={20} className="text-primary" />
            Batch Audio Generation
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Generate fish.audio TTS for all English practice strings in a course
          </p>
        </div>
      </div>

      {/* Config card */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text">Configuration</h2>

        {/* Course selector */}
        <div>
          <label className="label text-xs">Course</label>
          <select
            className="input text-sm"
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setPreview([]); setResult(null) }}
          >
            <option value="">Select a course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Step type toggles */}
        <div>
          <label className="label text-xs">Step Types to Generate</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {['scenario_intro', 'audio_shadow', 'script_read'].map((type) => (
              <button
                key={type}
                onClick={() => setStepTypes((prev) =>
                  prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                )}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  stepTypes.includes(type)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg border-border text-text-muted hover:border-primary'
                }`}
              >
                {STEP_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={loadPreview}
            disabled={!selectedCourse || status === 'running' || status === 'previewing'}
            className="btn-secondary text-sm"
          >
            {status === 'previewing' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Preview
          </button>
          <button
            onClick={runBatch}
            disabled={!selectedCourse || status === 'running' || !stepTypes.length}
            className="btn-primary text-sm"
          >
            {status === 'running' ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
            {status === 'running' ? 'Generating…' : 'Generate All Audio'}
          </button>
        </div>
      </div>

      {/* Running state */}
      {status === 'running' && (
        <div className="card p-6 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
          <p className="font-semibold text-text">Generating audio for {selectedCourseName}…</p>
          <p className="text-sm text-text-muted">
            This may take a few minutes. Each step is being processed with fish.audio s2-pro.
          </p>
          <p className="text-xs text-text-muted">Do not close this tab.</p>
        </div>
      )}

      {/* Result */}
      {status === 'done' && result && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-success" />
            <h2 className="font-semibold text-text">Generation Complete</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">{result.processed}</div>
              <div className="text-xs text-green-600 mt-0.5">Steps processed</div>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl border border-border">
              <div className="text-2xl font-bold text-text-muted">{result.skipped}</div>
              <div className="text-xs text-text-muted mt-0.5">Already had audio</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl font-bold text-error">{result.errors.length}</div>
              <div className="text-xs text-red-500 mt-0.5">Errors</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-error font-mono">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && errorMsg && (
        <div className="card p-4 flex items-start gap-3 bg-red-50 border-red-200">
          <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{errorMsg}</p>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && status !== 'running' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              Preview — {preview.length} steps · {totalTasks} audio strings to generate
            </h2>
            <span className="badge badge-blue">{selectedCourseName}</span>
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {preview.map((step) => (
              <div key={step.id} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-gray text-[10px]">{STEP_TYPE_LABELS[step.type] ?? step.type}</span>
                  <span className="text-xs text-text-muted font-mono">{step.id.slice(0, 8)}…</span>
                </div>
                {step.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-2 pl-2">
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${VOICE_COLORS[task.voice] ?? 'bg-surface text-text-muted'}`}>
                      {task.voice}
                    </span>
                    <p className="text-xs text-text leading-relaxed line-clamp-2">{task.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {preview.length === 0 && status === 'idle' && selectedCourse && (
        <div className="card p-8 text-center text-text-muted">
          <Mic size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click Preview to see what audio will be generated</p>
        </div>
      )}

      {/* ─── Dialogue Translation Section ─── */}
      <div className="card p-5 space-y-4 border-t-4 border-t-emerald-400">
        <div>
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Languages size={16} className="text-emerald-600" />
            Dialogue Line Translations (EN → VI)
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Auto-translate conversation lines in <strong>script_read</strong> steps (line_N_vi keys) and phrase segments in <strong>audio_shadow</strong> steps (hover tooltips). Uses MyMemory free API.
          </p>
        </div>

        {/* Stats */}
        {translateStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2.5 bg-surface rounded-xl border border-border">
              <div className="text-xl font-bold text-text">{translateStats.totalLines}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Total lines</div>
            </div>
            <div className="text-center p-2.5 bg-green-50 rounded-xl border border-green-200">
              <div className="text-xl font-bold text-green-700">{translateStats.translatedLines}</div>
              <div className="text-[10px] text-green-600 mt-0.5">Translated</div>
            </div>
            <div className="text-center p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-xl font-bold text-amber-700">{translateStats.pendingLines}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Pending</div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={checkTranslations}
            disabled={!selectedCourse || translateStatus === 'running' || translateStatus === 'checking'}
            className="btn-secondary text-sm"
          >
            {translateStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Check Status
          </button>
          <button
            onClick={runTranslate}
            disabled={!selectedCourse || translateStatus === 'running' || translateStats?.pendingLines === 0}
            className="text-sm px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
          >
            {translateStatus === 'running'
              ? <><Loader2 size={14} className="animate-spin" /> Translating…</>
              : <><Languages size={14} /> Translate All Dialogue</>
            }
          </button>
        </div>

        {translateStatus === 'running' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-800">
            <Loader2 size={16} className="animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold">Translating dialogue lines…</p>
              <p className="text-xs mt-0.5">Processing ~300ms per line. Do not close this tab.</p>
            </div>
          </div>
        )}

        {translateStatus === 'done' && translateResult && (
          <div className="flex items-start gap-2 px-3 py-3 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              <span className="font-semibold">{translateResult.processed} steps translated</span>
              {translateResult.skipped > 0 && `, ${translateResult.skipped} already done`}
              {translateResult.errors.length > 0 && `, ${translateResult.errors.length} errors`}.
              Hover tooltips are now active on conversation lines.
            </p>
          </div>
        )}

        {translateStatus === 'error' && translateError && (
          <div className="flex items-start gap-2 px-3 py-3 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle size={16} className="text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-error">{translateError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
