'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import AudioReplayBar from '@/components/learn/AudioReplayBar'

interface ScriptLine {
  role: string
  text: string
}

interface GuidedCue {
  label: string
  fullPhrase: string | null
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
  allSteps?: NursedLessonStep[]
  currentIdx?: number
}

const KNOWN_ROLES = ['Charge Nurse', 'Head Nurse', 'Supervisor', 'Doctor', 'Family', 'Patient', 'Nurse']

function parseDialogue(text: string): ScriptLine[] {
  const byLine = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const result: ScriptLine[] = []

  for (const line of byLine) {
    let matched = false
    for (const role of KNOWN_ROLES) {
      if (line.startsWith(`${role}:`)) {
        result.push({ role: role.toLowerCase().replace(/\s+/g, '_'), text: line.slice(role.length + 1).trim() })
        matched = true
        break
      }
    }
    if (!matched && result.length > 0) {
      result[result.length - 1].text += ' ' + line
    }
  }
  if (result.length > 1) return result

  const escaped = KNOWN_ROLES.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`\\b(${escaped.join('|')}):\\s*`, 'gi')
  const matches: { role: string; textStart: number; matchStart: number }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    matches.push({
      role: m[1].toLowerCase().replace(/\s+/g, '_'),
      textStart: m.index + m[0].length,
      matchStart: m.index,
    })
  }
  if (matches.length > 1) {
    const parts: ScriptLine[] = []
    for (let i = 0; i < matches.length; i++) {
      const end = i < matches.length - 1 ? matches[i + 1].matchStart : text.length
      const t = text.slice(matches[i].textStart, end).trim()
      if (t) parts.push({ role: matches[i].role, text: t })
    }
    return parts
  }

  return result
}

function getFirstWords(fullPhrase: string, count = 4): string {
  const words = fullPhrase.split(/\s+/)
  if (words.length <= count) return fullPhrase
  return words.slice(0, count).join(' ') + '...'
}

function extractPhrasesFromPriorSteps(allSteps: NursedLessonStep[], currentIdx: number): ScriptLine[] {
  const lines: ScriptLine[] = []
  for (let i = 0; i < currentIdx; i++) {
    const s = allSteps[i]
    if (!s.config) continue
    if (s.type === 'script_read') {
      const scriptLines = s.config.lines as ScriptLine[] | undefined
      if (Array.isArray(scriptLines) && scriptLines.length > 0) {
        for (const line of scriptLines) lines.push(line)
      } else {
        const script = s.config.script as string | undefined
        if (script) {
          for (const line of parseDialogue(script)) lines.push(line)
        }
      }
    }
    if (s.type === 'audio_shadow') {
      const txt = (s.config.transcript ?? s.config.transcriptEn) as string | undefined
      if (txt) {
        const parsed = parseDialogue(txt)
        if (parsed.length > 1) {
          for (const line of parsed) lines.push(line)
        } else {
          lines.push({ role: 'nurse', text: txt })
        }
      }
    }
  }
  return lines
}

function buildGuidedCues(
  step: NursedLessonStep,
  allSteps?: NursedLessonStep[],
  currentIdx?: number,
  fallbackCues?: string[],
): GuidedCue[] {
  const rawCues = step.config?.cues as string[] | undefined
  const hasCueLabels = rawCues && rawCues.length > 0

  let phrases: ScriptLine[] = []
  const ownScript = step.config?.script as string | undefined
  if (ownScript) {
    phrases = parseDialogue(ownScript)
  }
  if (phrases.length === 0 && allSteps && currentIdx != null) {
    phrases = extractPhrasesFromPriorSteps(allSteps, currentIdx)
  }

  if (hasCueLabels) {
    return rawCues.map((label, idx) => ({
      label,
      fullPhrase: phrases[idx]?.text ?? null,
    }))
  }

  if (phrases.length > 0) {
    return phrases.map((line) => ({
      label: line.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      fullPhrase: line.text,
    }))
  }

  if (fallbackCues && fallbackCues.length > 0) {
    return fallbackCues.map((cue) => ({ label: cue, fullPhrase: null }))
  }

  return []
}

export default function NoScriptStep({ step, onComplete, contextAudio, allSteps, currentIdx }: Props) {
  const { t } = useLang()

  const EXAMPLE_CUES = [t.exampleCue1, t.exampleCue2, t.exampleCue3, t.exampleCue4, t.exampleCue5]
  const rawCues = step.config?.cues as string[] | undefined
  const fallbackCues = rawCues && rawCues.length > 0 ? rawCues : EXAMPLE_CUES

  const guidedCues = useMemo(
    () => buildGuidedCues(step, allSteps, currentIdx, fallbackCues),
    [step, allSteps, currentIdx, fallbackCues],
  )

  const [activeIdx, setActiveIdx] = useState(0)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [visited, setVisited] = useState<Set<number>>(new Set([0]))

  const total = guidedCues.length
  const current = guidedCues[activeIdx]
  const allVisited = visited.size >= total

  const goNext = () => {
    if (activeIdx < total - 1) {
      const next = activeIdx + 1
      setActiveIdx(next)
      setVisited((prev) => new Set(prev).add(next))
      setRevealed((prev) => { const s = new Set(prev); s.delete(activeIdx); return s })
    }
  }

  const goPrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1)
      setRevealed((prev) => { const s = new Set(prev); s.delete(activeIdx); return s })
    }
  }

  const toggleReveal = () => {
    setRevealed((prev) => {
      const s = new Set(prev)
      if (s.has(activeIdx)) s.delete(activeIdx)
      else s.add(activeIdx)
      return s
    })
  }

  const isRevealed = revealed.has(activeIdx)
  const hasFullPhrase = !!current?.fullPhrase

  return (
    <div className="space-y-6">
      {contextAudio?.url && (
        <AudioReplayBar
          audioUrl={contextAudio.url}
          transcript={contextAudio.transcript}
          label="Replay audio from previous step"
        />
      )}

      <div>
        <h3 className="text-base font-semibold text-text">🎯 {step.title ?? t.noScriptTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.noScriptSubtitle}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {guidedCues.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIdx(idx); setVisited((p) => new Set(p).add(idx)) }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === activeIdx
                ? 'bg-primary scale-125'
                : visited.has(idx)
                  ? 'bg-green-400'
                  : 'bg-gray-300'
            }`}
            aria-label={`${t.guidedCueLabel} ${idx + 1}`}
          />
        ))}
      </div>

      {/* Cue card */}
      {current && (
        <div className="card p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {t.guidedCueLabel} {activeIdx + 1} {t.guidedCueOf} {total}
            </span>
            {visited.has(activeIdx) && activeIdx !== total - 1 && (
              <CheckCircle size={16} className="text-green-500" />
            )}
          </div>

          {/* Cue label */}
          <h4 className="text-lg font-bold text-text">{current.label}</h4>

          {/* First-words hint */}
          {hasFullPhrase && !isRevealed && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted font-medium">{t.guidedFirstWords}</p>
              <p className="text-base text-text font-medium italic bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                &ldquo;{getFirstWords(current.fullPhrase!, 4)}&rdquo;
              </p>
            </div>
          )}

          {/* Full phrase (revealed) */}
          {hasFullPhrase && isRevealed && (
            <div className="space-y-1">
              <p className="text-base text-text font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                &ldquo;{current.fullPhrase}&rdquo;
              </p>
            </div>
          )}

          {/* Show/hide toggle */}
          {hasFullPhrase && (
            <button
              onClick={toggleReveal}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
              {isRevealed ? t.guidedHidePhrase : t.guidedShowPhrase}
            </button>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={goPrev}
              disabled={activeIdx === 0}
              className="btn-secondary flex-1 justify-center disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              {t.guidedPrevCue}
            </button>
            {activeIdx < total - 1 ? (
              <button onClick={goNext} className="btn-primary flex-1 justify-center">
                {t.guidedNextCue}
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setVisited((p) => new Set(p).add(activeIdx))}
                className="btn-primary flex-1 justify-center"
                disabled={visited.has(activeIdx)}
              >
                <CheckCircle size={16} />
                {t.guidedFinish}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completion */}
      {allVisited && (
        <div className="space-y-3">
          <div className="badge badge-green text-sm px-3 py-1.5 mx-auto block w-fit">
            {t.guidedAllDone}
          </div>
          <button
            onClick={onComplete}
            className="btn-primary w-full justify-center"
          >
            {t.btnComplete} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {!allVisited && (
        <p className="text-xs text-center text-text-muted">
          {t.guidedCueLabel} {visited.size} {t.guidedCueOf} {total}
        </p>
      )}
    </div>
  )
}
