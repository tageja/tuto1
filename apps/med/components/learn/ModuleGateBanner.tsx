'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Mic, Star, CheckCircle, Lock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

type StepStatus = {
  stepId: string
  stepTitle: string | null
  hasRecording: boolean
  hasReview: boolean
}

type GateResult = {
  gateOpen: boolean
  steps: StepStatus[]
  totalRequired: number
  completedRecordings: number
  completedReviews: number
}

interface Props {
  moduleId: string
  onGateResolved?: (open: boolean) => void
}

export default function ModuleGateBanner({ moduleId, onGateResolved }: Props) {
  const { t } = useLang()
  const { user } = useAuth()
  const [gate, setGate] = useState<GateResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !moduleId) {
      setLoading(false)
      return
    }
    fetch(`/api/module-progress?moduleId=${moduleId}`)
      .then((r) => r.json())
      .then((j) => {
        const result = j.data as GateResult
        setGate(result)
        onGateResolved?.(result?.gateOpen ?? true)
      })
      .catch(() => onGateResolved?.(true))
      .finally(() => setLoading(false))
  }, [user, moduleId, onGateResolved])

  if (loading || !gate) return null
  if (gate.totalRequired === 0) return null

  if (gate.gateOpen) {
    return (
      <div className="card p-4 bg-green-50 border-success flex items-center gap-3">
        <CheckCircle size={20} className="text-success flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-text">{t.moduleGateTitle}</p>
          <p className="text-xs text-success">{t.moduleGateComplete}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-4 border-warning bg-amber-50/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Lock size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{t.moduleGateTitle}</p>
          <p className="text-xs text-text-muted">{t.moduleGateDesc}</p>
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1 text-text-muted">
          <Mic size={12} />
          {t.moduleGateRecordingDone
            .replace('{n}', String(gate.completedRecordings))
            .replace('{total}', String(gate.totalRequired))}
        </span>
        <span className="flex items-center gap-1 text-text-muted">
          <Star size={12} />
          {t.moduleGateReviewDone
            .replace('{n}', String(gate.completedReviews))
            .replace('{total}', String(gate.totalRequired))}
        </span>
      </div>

      <div className="space-y-2">
        {gate.steps
          .filter((s) => !s.hasRecording || !s.hasReview)
          .map((s) => (
            <div key={s.stepId} className="space-y-1">
              {!s.hasRecording && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Mic size={14} className="flex-shrink-0" />
                  <span>{t.moduleGateRecordingNeeded.replace('{step}', s.stepTitle ?? s.stepId)}</span>
                </div>
              )}
              {!s.hasReview && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <ShieldCheck size={14} className="flex-shrink-0" />
                  <span>{t.moduleGateReviewNeeded.replace('{step}', s.stepTitle ?? s.stepId)}</span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
