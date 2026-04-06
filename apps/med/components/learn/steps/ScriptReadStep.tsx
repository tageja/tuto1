'use client'

import { ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import ConversationAvatar, { type AvatarRole } from '@/components/learn/ConversationAvatar'
import ConversationBubble from '@/components/learn/ConversationBubble'

interface ScriptLine {
  role: string
  text: string
  text_vi?: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_LINES: ScriptLine[] = [
  { role: 'nurse', text: "Hello, I'm Nurse Lan. How can I help you today?", text_vi: 'Xin chào, tôi là Y tá Lan. Tôi có thể giúp gì cho bạn?' },
  { role: 'patient', text: 'I have a headache and I feel very tired.', text_vi: 'Tôi bị đau đầu và cảm thấy rất mệt.' },
  { role: 'nurse', text: 'I see. How long have you had these symptoms?', text_vi: 'Tôi hiểu. Bạn có các triệu chứng này bao lâu rồi?' },
  { role: 'patient', text: 'Since yesterday morning.', text_vi: 'Từ sáng hôm qua.' },
  { role: 'nurse', text: 'Okay, let me take your temperature and blood pressure.', text_vi: 'Được, hãy để tôi đo nhiệt độ và huyết áp cho bạn.' },
]

// Known role prefixes in the script string format "Role: text"
const KNOWN_ROLES = ['Charge Nurse', 'Head Nurse', 'Supervisor', 'Doctor', 'Family', 'Patient', 'Nurse']

function parseScriptString(script: string): ScriptLine[] {
  const lines = script.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const result: ScriptLine[] = []
  for (const line of lines) {
    let matched = false
    for (const role of KNOWN_ROLES) {
      if (line.startsWith(`${role}:`)) {
        result.push({ role: role.toLowerCase().replace(' ', '_'), text: line.slice(role.length + 1).trim() })
        matched = true
        break
      }
    }
    if (!matched && result.length > 0) {
      // Continuation of previous line
      result[result.length - 1].text += ' ' + line
    }
  }
  return result
}

function resolveRole(role: string): AvatarRole {
  const r = role.toLowerCase().replace(/\s+|_/g, '')
  if (r === 'nurse' || r === 'chargenurse' || r === 'headnurse') return 'nurse'
  if (r === 'patient') return 'patient'
  if (r === 'doctor') return 'doctor'
  if (r.includes('family') || r.includes('relative')) return 'family'
  if (r.includes('supervisor')) return 'supervisor'
  return 'nurse'
}

function isLeftSide(role: string): boolean {
  const r = role.toLowerCase().replace(/\s+|_/g, '')
  // Nurse-side roles on the left, patient/others on the right
  return r === 'nurse' || r === 'chargenurse' || r === 'headnurse' || r === 'doctor' || r === 'supervisor'
}

const ROLE_LABELS: Record<string, string> = {
  nurse: 'Nurse',
  patient: 'Patient',
  doctor: 'Doctor',
  family: 'Family',
  supervisor: 'Supervisor',
}

export default function ScriptReadStep({ step, onComplete }: Props) {
  const { t, phraseTranslationEnabled } = useLang()
  const rawLines = step.config?.lines as ScriptLine[] | undefined
  const scriptStr = step.config?.script as string | undefined
  const parsedFromScript = scriptStr ? parseScriptString(scriptStr) : []
  const lines = (rawLines && rawLines.length > 0)
    ? rawLines
    : parsedFromScript.length > 0
    ? parsedFromScript
    : EXAMPLE_LINES

  const hasAnyVi = lines.some((l, idx) =>
    l.text_vi || !!(step.config as Record<string, unknown> | null)?.[`line_${idx}_vi`]
  )
  const hasAnyAudio = lines.some((_, idx) => {
    const key = `line_${idx}_audioUrl`
    return !!(step.config as Record<string, unknown> | null)?.[key]
  })

  // Gather unique roles for avatar legend
  const roles = Array.from(new Set(lines.map((l) => l.role.toLowerCase()))) as AvatarRole[]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text">
          💬 {step.title ?? t.scriptTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-0.5">{t.scriptSubtitle}</p>
      </div>

      {/* Character avatars row */}
      <div className="flex items-center gap-4 px-3 py-3 bg-surface rounded-xl border border-border">
        {roles.map((role) => (
          <ConversationAvatar key={role} role={resolveRole(role)} size={48} />
        ))}
        <div className="ml-auto text-right">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Scene</p>
          <p className="text-xs text-text">{(step.config?.setting_en as string | undefined) ?? 'Hospital'}</p>
        </div>
      </div>

      {/* VI hint banner — shown when toggle is on but no VI text exists */}
      {phraseTranslationEnabled && !hasAnyVi && hasAnyAudio && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span className="text-base leading-none mt-0.5">🇻🇳</span>
          <p>
            <span className="font-semibold">Vietnamese hints: </span>
            Tap the <span className="font-semibold">🔊 speaker icon</span> on each line to hear the pronunciation. Written translations for dialogue lines are coming soon.
          </p>
        </div>
      )}

      {/* Conversation */}
      <div className="space-y-2 py-1">
        {lines.map((line, idx) => {
          const role = line.role.toLowerCase().replace('_', ' ')
          const avatarRole = resolveRole(role)
          const isLeft = isLeftSide(role)
          const audioKey = `line_${idx}_audioUrl`
          const audioUrl = (step.config as Record<string, unknown> | null)?.[audioKey] as string | undefined

          // vi from lines array OR from config key written by translate API
          const configViKey = `line_${idx}_vi`
          const textVi = line.text_vi
            ?? ((step.config as Record<string, unknown> | null)?.[configViKey] as string | undefined)

          return (
            <div key={idx} className={`flex items-end gap-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
              <ConversationAvatar role={avatarRole} size={36} />
              <ConversationBubble
                index={idx}
                text={line.text}
                textVi={textVi}
                roleLabel={ROLE_LABELS[role] ?? role}
                isLeft={isLeft}
                audioUrl={audioUrl}
                delay={idx * 100}
              />
            </div>
          )
        })}
      </div>

      <button onClick={onComplete} className="btn-primary w-full justify-center">
        <ChevronRight size={16} />
        {t.btnDoneReading}
      </button>
    </div>
  )
}
