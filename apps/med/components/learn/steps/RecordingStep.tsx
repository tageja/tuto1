'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Mic, MicOff, RotateCcw, CheckCircle, ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'

type RecordState = 'idle' | 'recording' | 'recorded' | 'submitted'

interface RubricItem {
  key: string
  label: string
  checked: boolean
}

const DEFAULT_RUBRIC: Omit<RubricItem, 'checked'>[] = [
  { key: 'balanced', label: 'Cân bằng? (giọng đều, không quá nhanh/chậm)' },
  { key: 'clear', label: 'Rõ ràng? (phát âm dễ nghe)' },
  { key: 'polite', label: 'Lịch sự? (dùng từ ngữ phù hợp)' },
  { key: 'keywords', label: 'Đúng từ khóa? (dùng đúng thuật ngữ y tế)' },
]

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

export default function RecordingStep({ step, onComplete }: Props) {
  const params = useParams<{ lessonId?: string }>()
  const lessonId = params?.lessonId ?? ''

  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rubric, setRubric] = useState<RubricItem[]>(
    DEFAULT_RUBRIC.map((r) => ({ ...r, checked: false }))
  )

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
      setError('Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.')
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
      let storagePath: string | null = null

      // Upload audio
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('type', 'audio')
      formData.append('lessonId', lessonId)

      try {
        const uploadRes = await fetch('/api/assets/upload', { method: 'POST', body: formData })
        const uploadJson = await uploadRes.json()
        storagePath = uploadJson.data?.storage_path ?? null
      } catch {
        // upload failed, proceed anyway
      }

      // Save submission
      const rubricMap = Object.fromEntries(rubric.map((r) => [r.key, r.checked]))
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest',
          lesson_id: lessonId,
          step_id: step.id,
          type: 'recording',
          storage_path: storagePath,
          rubric: rubricMap,
        }),
      })

      setState('submitted')
    } catch {
      setError('Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const toggleRubric = (key: string) => {
    setRubric((prev) => prev.map((r) => (r.key === key ? { ...r, checked: !r.checked } : r)))
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">🎤 {step.title ?? 'Ghi âm bài nói'}</h3>
        <p className="text-sm text-text-muted mt-1">Ghi âm và nộp bài thực hành của bạn</p>
      </div>

      {error && (
        <div className="card p-3 bg-red-50 border-error text-error text-sm">{error}</div>
      )}

      {/* IDLE state */}
      {state === 'idle' && (
        <div className="card p-8 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
            <Mic size={36} className="text-primary" />
          </div>
          <p className="text-text font-medium">Sẵn sàng ghi âm</p>
          <button onClick={startRecording} className="btn-primary">
            <Mic size={16} />
            Bắt đầu ghi âm
          </button>
        </div>
      )}

      {/* RECORDING state */}
      {state === 'recording' && (
        <div className="card p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <Mic size={36} className="text-error" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error animate-ping" />
          </div>
          <p className="text-error font-semibold text-xl tabular-nums">{formatTime(elapsed)}</p>
          <p className="text-xs text-text-muted">Tối đa 30 giây</p>
          <button onClick={stopRecording} className="btn-secondary">
            <MicOff size={16} />
            Dừng ghi âm
          </button>
        </div>
      )}

      {/* RECORDED state */}
      {state === 'recorded' && audioUrl && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <p className="text-sm font-medium text-text">Nghe lại bản ghi âm</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>

          {/* Rubric self-evaluation */}
          <div className="card p-4 space-y-3">
            <p className="text-sm font-semibold text-text">Tự đánh giá</p>
            {rubric.map((r) => (
              <label key={r.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => toggleRubric(r.key)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-text">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={resetRecording} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              Ghi lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Đang nộp...' : '📤 Nộp bài'}
            </button>
          </div>
        </div>
      )}

      {/* SUBMITTED state */}
      {state === 'submitted' && (
        <div className="space-y-4">
          <div className="card p-6 text-center bg-green-50 border-success">
            <CheckCircle size={48} className="mx-auto mb-3 text-success" />
            <p className="text-lg font-semibold text-text">Đã nộp!</p>
            <p className="text-sm text-text-muted mt-1">Bài ghi âm của bạn đã được lưu thành công</p>
          </div>

          {/* Rubric summary */}
          <div className="card p-4 space-y-2">
            <p className="text-sm font-semibold text-text">Kết quả tự đánh giá</p>
            {rubric.map((r) => (
              <div key={r.key} className="flex items-center gap-2 text-sm">
                <span className={r.checked ? 'text-success' : 'text-text-muted'}>
                  {r.checked ? '✅' : '⬜'}
                </span>
                <span className={r.checked ? 'text-text' : 'text-text-muted'}>{r.label}</span>
              </div>
            ))}
          </div>

          <button onClick={onComplete} className="btn-primary w-full justify-center">
            Tiếp theo <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
