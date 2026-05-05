'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Mic, MicOff, RotateCcw, CheckCircle, ChevronRight, FileText } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useIsPreview } from '@/contexts/PreviewContext'
import { useAuth } from '@/contexts/AuthContext'
import PeerRecordingsPanel from './PeerRecordingsPanel'

type RecordState = 'idle' | 'recording' | 'recorded' | 'submitted'

interface ScriptLine {
  role: string
  text: string
}

interface RubricItem {
  key: string
  checked: boolean
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
  allSteps?: NursedLessonStep[]
  currentIdx?: number
  lessonId?: string
}

function extractLessonPrompt(allSteps: NursedLessonStep[], currentIdx: number): string[] {
  const lines: string[] = []

  for (let i = 0; i < currentIdx; i++) {
    const s = allSteps[i]
    if (!s.config) continue

    if (s.type === 'audio_shadow') {
      const txt = (s.config.transcript ?? s.config.transcriptEn) as string | undefined
      if (txt) lines.push(txt)
    }

    if (s.type === 'script_read') {
      const scriptLines = s.config.lines as ScriptLine[] | undefined
      if (Array.isArray(scriptLines)) {
        for (const line of scriptLines) {
          const role = line.role?.replace('_', ' ') ?? ''
          lines.push(`${role}: ${line.text}`)
        }
      } else {
        const script = s.config.script as string | undefined
        if (script) lines.push(script)
      }
    }
  }

  return lines
}

export default function RecordingStep({ step, onComplete, allSteps, currentIdx, lessonId: lessonIdProp }: Props) {
  const params = useParams<{ lessonId?: string }>()
  const lessonId = lessonIdProp ?? params?.lessonId ?? ''
  const { t } = useLang()
  const isPreview = useIsPreview()
  const { user } = useAuth()

  const promptLines = useMemo(() => {
    if (!allSteps || currentIdx == null) return []
    return extractLessonPrompt(allSteps, currentIdx)
  }, [allSteps, currentIdx])

  const configPrompt = step.config?.prompt as string | undefined

  const rubricKeys: RubricItem[] = [
    { key: 'balanced', checked: false },
    { key: 'clear', checked: false },
    { key: 'polite', checked: false },
    { key: 'keywords', checked: false },
  ]

  const rubricLabels: Record<string, string> = {
    balanced: t.rubricBalanced,
    clear: t.rubricClearStep,
    polite: t.rubricPoliteStep,
    keywords: t.rubricKeywordsStep,
  }

  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rubric, setRubric] = useState<RubricItem[]>(rubricKeys)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current!)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        setState('recorded')
      }

      mr.start()
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= 29) {
            stopRecording()
            return 30
          }
          return e + 1
        })
      }, 1000)
    } catch {
      setError(t.errorMicAccess)
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current!)
    mediaRecorderRef.current?.stop()
  }

  const resetRecording = () => {
    setAudioUrl(null)
    setAudioBlob(null)
    setElapsed(0)
    setState('idle')
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    setSubmitting(true)
    setError(null)

    try {
      if (isPreview) {
        setState('submitted')
        return
      }

      let storagePath: string | null = null

      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('type', 'audio')
      formData.append('lessonId', lessonId)
      formData.append('stepId', step.id)

      try {
        const uploadRes = await fetch('/api/assets/upload', { method: 'POST', body: formData })
        const uploadJson = await uploadRes.json()
        storagePath = uploadJson.data?.storage_path ?? null
      } catch {
        setError(t.errorUpload)
      }

      const rubricMap = Object.fromEntries(rubric.map((r) => [r.key, r.checked]))
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? 'guest',
          lesson_id: lessonId,
          step_id: step.id,
          type: 'recording',
          storage_path: storagePath,
          rubric: rubricMap,
        }),
      })

      setState('submitted')
    } catch {
      setError(t.errorSubmit)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const toggleRubric = (key: string) => {
    setRubric((prev) => prev.map((r) => (r.key === key ? { ...r, checked: !r.checked } : r)))
  }

  const hasPrompt = configPrompt || promptLines.length > 0

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">{step.title ?? t.recordingTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.recordingSubtitle}</p>
      </div>

      {hasPrompt && (
        <div className="card p-4 bg-primary-light/30 border-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <FileText size={16} />
            {t.recordingPromptTitle}
          </div>
          <div className="text-sm text-text leading-relaxed whitespace-pre-line">
            {configPrompt || promptLines.join('\n')}
          </div>
        </div>
      )}

      {isPreview && (
        <div className="card p-3 bg-amber-50 border-warning text-amber-700 text-sm">
          {t.previewRecordingNote}
        </div>
      )}

      {error && (
        <div className="card p-3 bg-red-50 border-error text-error text-sm">{error}</div>
      )}

      {state === 'idle' && (
        <div className="card p-8 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
            <Mic size={36} className="text-primary" />
          </div>
          <p className="text-text font-medium">{t.idleLabel}</p>
          {/* data-tour-target="recording-mic" — lesson tour step 4 */}
          <button onClick={startRecording} className="btn-primary" data-tour-target="recording-mic">
            <Mic size={16} />
            {t.btnStartRecording}
          </button>
        </div>
      )}

      {state === 'recording' && (
        <div className="card p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <Mic size={36} className="text-error" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error animate-ping" />
          </div>
          <p className="text-error font-semibold text-xl tabular-nums">{formatTime(elapsed)}</p>
          <p className="text-xs text-text-muted">{t.recordingMaxTime}</p>
          <button onClick={stopRecording} className="btn-secondary">
            <MicOff size={16} />
            {t.btnStopRecording}
          </button>
        </div>
      )}

      {state === 'recorded' && audioUrl && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <p className="text-sm font-medium text-text">{t.playbackLabel}</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-sm font-semibold text-text">{t.selfEvalTitle}</p>
            {rubric.map((r) => (
              <label key={r.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => toggleRubric(r.key)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-text">{rubricLabels[r.key]}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={resetRecording} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              {t.btnReRecord}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? t.btnSubmitting : t.btnSubmit}
            </button>
          </div>
        </div>
      )}

      {state === 'submitted' && (
        <div className="space-y-4">
          <div className="card p-6 text-center bg-green-50 border-success">
            <CheckCircle size={48} className="mx-auto mb-3 text-success" />
            <p className="text-lg font-semibold text-text">{t.submittedTitle}</p>
            <p className="text-sm text-text-muted mt-1">{t.submittedDesc}</p>
          </div>

          <div className="card p-4 space-y-2">
            <p className="text-sm font-semibold text-text">{t.selfEvalSummaryTitle}</p>
            {rubric.map((r) => (
              <div key={r.key} className="flex items-center gap-2 text-sm">
                <span className={r.checked ? 'text-success' : 'text-text-muted'}>
                  {r.checked ? '✅' : '⬜'}
                </span>
                <span className={r.checked ? 'text-text' : 'text-text-muted'}>{rubricLabels[r.key]}</span>
              </div>
            ))}
          </div>

          {!isPreview && <PeerRecordingsPanel stepId={step.id} />}

          <button onClick={onComplete} className="btn-primary w-full justify-center">
            {t.btnNextRecording} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
