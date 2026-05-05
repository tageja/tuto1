'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Mic, RotateCcw, ChevronRight, CheckCircle2, Volume2 } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useIsPreview } from '@/contexts/PreviewContext'
import ConversationAvatar, { type AvatarRole } from '@/components/learn/ConversationAvatar'
import ConversationBubble from '@/components/learn/ConversationBubble'
import PeerRatingWidget from './PeerRatingWidget'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScriptLine {
  role: string
  text: string
  text_vi?: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

type Phase = 'listen' | 'read_along' | 'speak_together'
type RecState = 'idle' | 'recording' | 'recorded' | 'submitting'
type PeerState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'found'; submission_id: string; recording_url: string }
  | { status: 'rated' }

// ─── Static helpers ──────────────────────────────────────────────────────────

const KNOWN_ROLES = [
  'Charge Nurse', 'Head Nurse', 'Supervisor', 'Doctor',
  'Family', 'Parent', 'Mother', 'Father',
  'Passerby', 'Bystander', 'Witness',
  'Child', 'Patient', 'Nurse',
]

function parseScriptString(script: string): ScriptLine[] {
  const lines = script.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const result: ScriptLine[] = []
  for (const line of lines) {
    let matched = false
    for (const role of KNOWN_ROLES) {
      if (line.toLowerCase().startsWith(`${role.toLowerCase()}:`)) {
        result.push({ role: role.toLowerCase().replace(' ', '_'), text: line.slice(role.length + 1).trim() })
        matched = true
        break
      }
    }
    // Generic fallback: any "Word:" prefix at the start of a line is treated as a role
    if (!matched) {
      const generic = line.match(/^([A-Za-z][A-Za-z ]{0,20}):\s*(.+)$/)
      if (generic) {
        result.push({ role: generic[1].trim().toLowerCase().replace(/\s+/g, '_'), text: generic[2].trim() })
        matched = true
      }
    }
    if (!matched && result.length > 0) {
      result[result.length - 1].text += ' ' + line
    }
  }
  return result
}

function resolveRole(role: string): AvatarRole {
  const r = role.toLowerCase().replace(/\s+|_/g, '')
  // Only the bare learner role "nurse" gets the nurse avatar
  if (r === 'nurse') return 'nurse'
  // Senior clinical staff get the doctor avatar so they look visually distinct
  if (r === 'chargenurse' || r === 'headnurse' || r === 'supervisor' || r === 'doctor') return 'doctor'
  if (r === 'patient' || r === 'child' || r === 'childpatient') return 'patient'
  if (r.includes('family') || r.includes('relative') || r.includes('parent') ||
      r.includes('mother') || r.includes('father') ||
      r.includes('passerby') || r.includes('bystander') || r.includes('witness')) return 'family'
  return 'patient'
}

// Learner's own role is the bare "Nurse:" label — all other roles go to the right side.
function isLeftSide(role: string): boolean {
  return role.toLowerCase().replace(/\s+|_/g, '') === 'nurse'
}

// Only the bare "Nurse:" lines are queued for the read-along and speak-together phases.
function isNurseRole(role: string): boolean {
  return role.toLowerCase().replace(/\s+|_/g, '') === 'nurse'
}

const ROLE_LABELS: Record<string, string> = {
  nurse: 'Nurse',
  charge_nurse: 'Charge Nurse',
  head_nurse: 'Head Nurse',
  supervisor: 'Supervisor',
  patient: 'Patient',
  doctor: 'Doctor',
  family: 'Family',
  parent: 'Parent',
  mother: 'Mother',
  father: 'Father',
  passerby: 'Passerby',
  bystander: 'Bystander',
  witness: 'Witness',
  child: 'Child',
  supervisor: 'Supervisor',
}

const EXAMPLE_LINES: ScriptLine[] = [
  { role: 'nurse', text: "Hello, I'm Nurse Lan. How can I help you today?", text_vi: 'Xin chào, tôi là Y tá Lan. Tôi có thể giúp gì cho bạn?' },
  { role: 'patient', text: 'I have a headache and I feel very tired.', text_vi: 'Tôi bị đau đầu và cảm thấy rất mệt.' },
  { role: 'nurse', text: 'I see. How long have you had these symptoms?', text_vi: 'Tôi hiểu. Bạn có các triệu chứng này bao lâu rồi?' },
  { role: 'patient', text: 'Since yesterday morning.', text_vi: 'Từ sáng hôm qua.' },
  { role: 'nurse', text: 'Okay, let me take your temperature and blood pressure.', text_vi: 'Được, hãy để tôi đo nhiệt độ và huyết áp cho bạn.' },
]

// ─── Phase indicator ─────────────────────────────────────────────────────────

function PhaseIndicator({ current, labels }: { current: Phase; labels: [string, string, string] }) {
  const phases: Phase[] = ['listen', 'read_along', 'speak_together']
  const currentIdx = phases.indexOf(current)
  return (
    <div className="flex items-center gap-1.5">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1.5 flex-1">
          <div
            className={`flex-1 text-center py-1 px-2 rounded-lg text-xs font-medium truncate transition-colors ${
              i === currentIdx
                ? 'bg-primary text-white'
                : i < currentIdx
                ? 'bg-primary/20 text-primary'
                : 'bg-surface text-text-muted'
            }`}
          >
            {i < currentIdx ? '✓ ' : ''}{labels[i]}
          </div>
          {i < 2 && <span className="text-text-muted text-xs">›</span>}
        </div>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ScriptReadStep({ step, onComplete }: Props) {
  const params = useParams<{ lessonId?: string }>()
  const lessonId = params?.lessonId ?? ''
  const { t, phraseTranslationEnabled } = useLang()
  const { user } = useAuth()
  const isPreview = useIsPreview()

  // ── Resolve lines ─────────────────────────────────────────────
  const rawLines = step.config?.lines as ScriptLine[] | undefined
  const scriptStr = step.config?.script as string | undefined
  const parsedFromScript = scriptStr ? parseScriptString(scriptStr) : []
  const lines = (rawLines && rawLines.length > 0)
    ? rawLines
    : parsedFromScript.length > 0
    ? parsedFromScript
    : EXAMPLE_LINES

  const readAlongCount = (step.config?.read_along_line_count as number | undefined) ?? 3
  const nurseLines = lines
    .map((l, originalIdx) => ({ ...l, originalIdx }))
    .filter((l) => isNurseRole(l.role))
    .slice(0, readAlongCount)

  const hasAnyVi = lines.some((l, idx) =>
    l.text_vi || !!(step.config as Record<string, unknown> | null)?.[`line_${idx}_vi`]
  )
  const hasAnyAudio = lines.some((_, idx) =>
    !!(step.config as Record<string, unknown> | null)?.[`line_${idx}_audioUrl`]
  )
  const roles = Array.from(new Set(lines.map((l) => l.role.toLowerCase()))) as AvatarRole[]

  // ── Phase state ───────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('listen')
  const [lineIdx, setLineIdx] = useState(0)

  // ── Recording state (read_along) ──────────────────────────────
  const [recState, setRecState] = useState<RecState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recError, setRecError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // ── Peer state ────────────────────────────────────────────────
  const [peerState, setPeerState] = useState<PeerState>({ status: 'loading' })

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // ── Listen-phase play tracking ────────────────────────────────
  // Track which lines have been played at least once. Only lines
  // that actually have an audio URL are required.
  const [playedIndices, setPlayedIndices] = useState<Set<number>>(new Set())

  const playableIndices = useMemo(
    () =>
      lines
        .map((_, i) => i)
        .filter((i) => !!(step.config as Record<string, unknown> | null)?.[`line_${i}_audioUrl`]),
    [lines, step.config]
  )
  const allLinesPlayed =
    playableIndices.length === 0 || playableIndices.every((i) => playedIndices.has(i))

  const markPlayed = useCallback((idx: number) => {
    setPlayedIndices((prev) => {
      if (prev.has(idx)) return prev
      const next = new Set(prev)
      next.add(idx)
      return next
    })
  }, [])

  // ── Fetch peer recording when speak_together phase starts ─────
  const fetchPeerRecording = useCallback(async () => {
    if (isPreview) {
      setPeerState({ status: 'none' })
      return
    }
    setPeerState({ status: 'loading' })
    try {
      const res = await fetch(`/api/submissions/peer?stepId=${step.id}`)
      const json = await res.json()
      if (json.data) {
        setPeerState({ status: 'found', submission_id: json.data.submission_id, recording_url: json.data.recording_url })
      } else {
        setPeerState({ status: 'none' })
      }
    } catch {
      setPeerState({ status: 'none' })
    }
  }, [step.id, isPreview])

  useEffect(() => {
    if (phase === 'speak_together') {
      fetchPeerRecording()
    }
  }, [phase, fetchPeerRecording])

  // ── Recording helpers (read_along single-line) ────────────────
  const startRecording = async () => {
    setRecError(null)
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
        setRecState('recorded')
      }
      mr.start()
      setRecState('recording')
    } catch {
      setRecError('Could not access microphone. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecState('idle')
    setRecError(null)
  }

  // ── Listen-phase advance ──────────────────────────────────────
  const handleListenDone = () => {
    setPhase('read_along')
  }

  const handleSubmitLine = async () => {
    if (!audioBlob) return
    setRecState('submitting')
    setRecError(null)

    try {
      if (!isPreview) {
        const userId = user?.id ?? 'guest'
        const filename = `read_along_${userId}_${lineIdx}.webm`
        const file = new File([audioBlob], filename, { type: 'audio/webm' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'audio')
        formData.append('lessonId', lessonId)
        formData.append('stepId', step.id)

        const uploadRes = await fetch('/api/assets/upload', { method: 'POST', body: formData })
        const uploadJson = await uploadRes.json()
        const storagePath: string | null = uploadJson.data?.storage_path ?? null

        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            step_id: step.id,
            type: 'recording',
            storage_path: storagePath,
          }),
        })
      }

      const nextIdx = lineIdx + 1
      if (nextIdx >= nurseLines.length) {
        setPhase('speak_together')
      } else {
        setLineIdx(nextIdx)
        resetRecording()
      }
    } catch {
      setRecError('Upload failed. Please try again.')
      setRecState('recorded')
    }
  }

  // ── Render helpers ────────────────────────────────────────────
  const phaseLabels: [string, string, string] = [
    t.scriptReadTabListen,
    t.scriptReadTabReadAlong,
    t.scriptReadTabSpeakTogether,
  ]

  // ── Render: listen ────────────────────────────────────────────
  function renderListen() {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text">
            💬 {step.title ?? t.scriptTitleFallback}
          </h3>
          <p className="text-sm text-text-muted mt-0.5">{t.scriptSubtitle}</p>
        </div>

        <div className="flex items-center gap-4 px-3 py-3 bg-surface rounded-xl border border-border">
          {roles.map((role) => (
            <ConversationAvatar key={role} role={resolveRole(role)} size={48} />
          ))}
          <div className="ml-auto text-right">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Scene</p>
            <p className="text-xs text-text">{(step.config?.setting_en as string | undefined) ?? 'Hospital'}</p>
          </div>
        </div>

        {phraseTranslationEnabled && !hasAnyVi && hasAnyAudio && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <span className="text-base leading-none mt-0.5">🇻🇳</span>
            <p>
              <span className="font-semibold">Vietnamese hints: </span>
              Tap the <span className="font-semibold">🔊 speaker icon</span> on each line to hear the pronunciation. Written translations for dialogue lines are coming soon.
            </p>
          </div>
        )}

        {playableIndices.length > 0 ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <p className="text-text-muted flex items-center gap-1.5">
              <Volume2 size={13} />
              {t.scriptReadListenRecordPrompt}
            </p>
            <p className="font-semibold text-primary whitespace-nowrap">
              {playedIndices.size}/{playableIndices.length}
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">
            {t.scriptReadPreviewPrompt ?? 'Read the dialogue below to set the scene, then continue to record your nurse lines.'}
          </p>
        )}

        <div className="space-y-2 py-1">
          {lines.map((line, idx) => {
            const role = line.role.toLowerCase().replace('_', ' ')
            const avatarRole = resolveRole(role)
            const isLeft = isLeftSide(role)
            const audioKey = `line_${idx}_audioUrl`
            const lineAudioUrl = (step.config as Record<string, unknown> | null)?.[audioKey] as string | undefined
            const configViKey = `line_${idx}_vi`
            const textVi = line.text_vi
              ?? ((step.config as Record<string, unknown> | null)?.[configViKey] as string | undefined)
            const isPlayed = playedIndices.has(idx)

            return (
              <div key={idx}>
                <div className={`flex items-end gap-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="relative">
                    <ConversationAvatar role={avatarRole} size={36} />
                    {lineAudioUrl && isPlayed && (
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success text-white text-[10px] font-bold flex items-center justify-center border-2 border-background"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <ConversationBubble
                    index={idx}
                    text={line.text}
                    textVi={textVi}
                    roleLabel={ROLE_LABELS[role] ?? role}
                    isLeft={isLeft}
                    audioUrl={lineAudioUrl}
                    delay={idx * 100}
                    onAudioPlayed={() => markPlayed(idx)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {allLinesPlayed && playableIndices.length > 0 && (
          <p className="text-xs text-success text-center font-medium">
            {t.scriptReadListenAllRecordedHint}
          </p>
        )}
        {playableIndices.length === 0 && (
          <p className="text-[11px] text-text-muted text-center italic">
            (Audio narration is not available for this dialogue yet.)
          </p>
        )}

        <button
          onClick={handleListenDone}
          disabled={!allLinesPlayed}
          className="btn-primary w-full justify-center disabled:opacity-40"
        >
          <ChevronRight size={16} />
          {t.scriptReadStartRecording}
        </button>
      </div>
    )
  }

  // ── Render: read_along ────────────────────────────────────────
  function renderReadAlong() {
    if (nurseLines.length === 0) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-text-muted text-center py-8">No nurse lines found in this dialogue.</p>
          <button onClick={() => setPhase('speak_together')} className="btn-primary w-full justify-center">
            <ChevronRight size={16} />
            {t.scriptReadTabSpeakTogether}
          </button>
        </div>
      )
    }

    const currentLine = nurseLines[lineIdx]
    const originalIdx = currentLine.originalIdx
    const configViKey = `line_${originalIdx}_vi`
    const textVi = currentLine.text_vi
      ?? ((step.config as Record<string, unknown> | null)?.[configViKey] as string | undefined)

    const counter = t.scriptReadLineCounter
      .replace('{current}', String(lineIdx + 1))
      .replace('{total}', String(nurseLines.length))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{counter}</p>
          <span className="text-xs text-primary font-medium">{t.scriptReadTabReadAlong}</span>
        </div>

        {/* Line card */}
        <div className="card p-5 space-y-2 bg-primary/5 border-primary/20">
          <p className="text-xl font-semibold text-text leading-snug">{currentLine.text}</p>
          {textVi && (
            <p className="text-sm italic text-text-muted">{textVi}</p>
          )}
        </div>

        <p className="text-xs text-text-muted text-center">{t.scriptReadRecordPrompt}</p>

        {recError && (
          <div className="card p-3 bg-red-50 border-error text-error text-sm">{recError}</div>
        )}

        {/* Idle */}
        {recState === 'idle' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label={t.scriptReadTapToRecord}
            >
              <Mic size={36} className="text-primary" />
            </button>
            <p className="text-sm text-text-muted">{t.scriptReadTapToRecord}</p>
          </div>
        )}

        {/* Recording */}
        {recState === 'recording' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onClick={stopRecording}
              className="relative w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
              aria-label={t.scriptReadStopRecording}
            >
              <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-50" />
              <Mic size={36} className="text-error relative z-10" />
            </button>
            <p className="text-sm font-medium text-error">{t.scriptReadStopRecording}</p>
          </div>
        )}

        {/* Recorded */}
        {(recState === 'recorded' || recState === 'submitting') && audioUrl && (
          <div className="space-y-3">
            <div className="card p-4 space-y-2">
              <audio controls src={audioUrl} className="w-full" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetRecording}
                disabled={recState === 'submitting'}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw size={16} />
                {t.scriptReadReRecord}
              </button>
              <button
                onClick={handleSubmitLine}
                disabled={recState === 'submitting'}
                className="btn-primary flex-1 justify-center"
              >
                <ChevronRight size={16} />
                {recState === 'submitting' ? t.scriptReadUploading : t.scriptReadSubmitLine}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render: speak_together ────────────────────────────────────
  function renderSpeakTogether() {
    if (peerState.status === 'loading') {
      return (
        <div className="space-y-3 animate-pulse py-8">
          <div className="h-5 w-1/3 mx-auto rounded bg-surface" />
          <div className="h-16 rounded-xl bg-surface" />
        </div>
      )
    }

    if (peerState.status === 'none' || peerState.status === 'rated') {
      return (
        <div className="space-y-4">
          <div className="card p-6 text-center bg-green-50 border-success space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-success" />
            <p className="text-base font-semibold text-text">{t.scriptReadAllLinesRecorded}</p>
            <p className="text-sm text-text-muted">{t.scriptReadNoPeerRecording}</p>
          </div>
          <button onClick={onComplete} className="btn-primary w-full justify-center">
            <ChevronRight size={16} />
            {t.scriptReadComplete}
          </button>
        </div>
      )
    }

    // found
    return (
      <div className="space-y-4">
        <div className="card p-5 space-y-3">
          <p className="text-sm font-semibold text-text">{t.scriptReadPeerPlayback}</p>
          <audio controls src={peerState.recording_url} className="w-full" preload="metadata" />
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-sm text-text">{t.scriptReadPeerRatingPrompt}</p>
          <PeerRatingWidget
            submissionId={peerState.submission_id}
            onRated={() => onComplete()}
          />
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <PhaseIndicator current={phase} labels={phaseLabels} />
      {phase === 'listen' && renderListen()}
      {phase === 'read_along' && renderReadAlong()}
      {phase === 'speak_together' && renderSpeakTogether()}
    </div>
  )
}
