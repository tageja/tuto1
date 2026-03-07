'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer, ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_CUES = ['Chào hỏi', 'Hỏi tên', 'Hỏi ngày sinh', 'Hỏi triệu chứng', 'Kết thúc']
const TIMER_SECONDS = 60

export default function NoScriptStep({ step, onComplete }: Props) {
  const rawCues = step.config?.cues as string[] | undefined
  const cues = rawCues && rawCues.length > 0 ? rawCues : EXAMPLE_CUES

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running])

  const start = () => {
    setTimeLeft(TIMER_SECONDS)
    setFinished(false)
    setRunning(true)
  }

  const skip = () => {
    clearInterval(intervalRef.current!)
    setRunning(false)
    setFinished(true)
  }

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - timeLeft / TIMER_SECONDS)

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text">🎯 {step.title ?? 'Nói không nhìn kịch bản'}</h3>
        <p className="text-sm text-text-muted mt-1">Dùng các gợi ý bên dưới để nói tự nhiên</p>
      </div>

      {/* Cue cards */}
      <div className="flex flex-wrap gap-2">
        {cues.map((cue, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="card px-3 py-2 text-sm font-medium text-text">
              {idx + 1}. {cue}
            </span>
            {idx < cues.length - 1 && <ChevronRight size={14} className="text-text-muted" />}
          </div>
        ))}
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={timeLeft < 10 ? '#EF4444' : '#0B5FFF'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text">{minutes}:{seconds}</span>
            <span className="text-xs text-text-muted">giây</span>
          </div>
        </div>

        <div className="flex gap-3">
          {!running && !finished && (
            <button onClick={start} className="btn-primary">
              <Timer size={16} />
              Bắt đầu đếm giờ
            </button>
          )}
          {running && (
            <button onClick={skip} className="btn-secondary">
              Bỏ qua
            </button>
          )}
        </div>

        {finished && (
          <div className="badge badge-green text-sm px-3 py-1.5">
            ✅ Thời gian hoàn thành!
          </div>
        )}
      </div>

      <button
        onClick={onComplete}
        disabled={!finished}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        Hoàn thành <ChevronRight size={16} />
      </button>
      {!finished && (
        <p className="text-xs text-center text-text-muted">Hoàn thành bộ đếm giờ để tiếp tục</p>
      )}
    </div>
  )
}
