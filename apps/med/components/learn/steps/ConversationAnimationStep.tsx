'use client'

import { Play } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import ConversationAnimator from '@/components/animations/ConversationAnimator'
import type { AnimationManifest } from '@/components/animations/types'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

export default function ConversationAnimationStep({ step, onComplete }: Props) {
  const manifest = step.config?.animation_manifest as AnimationManifest | undefined

  if (!manifest?.segments?.length) {
    return (
      <div className="card p-10 text-center bg-surface space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto">
          <Play size={28} className="text-primary ml-1" />
        </div>
        <p className="font-semibold text-text">Animation coming soon</p>
        <p className="text-sm text-text-muted">This conversation hasn't been animated yet.</p>
        <button onClick={onComplete} className="btn-secondary mx-auto">Skip for now</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-text flex items-center gap-2">
          🎬 {step.title ?? 'Watch the conversation'}
        </h3>
        {step.config?.description && (
          <p className="text-sm text-text-muted mt-0.5">{step.config.description as string}</p>
        )}
      </div>
      <ConversationAnimator manifest={manifest} onComplete={onComplete} />
    </div>
  )
}
