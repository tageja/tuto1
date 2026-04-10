'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { AnimationSegment, Speaker } from '@/components/animations/types'

interface Props {
  lessonTitle: string
  stepTitle: string
  sceneSetting: string
  segments: AnimationSegment[]
}

// ── Character bibles ──────────────────────────────────────────────

const CHARACTER_BIBLES: Record<Speaker, string> = {
  nurse: `CHARACTER: NURSE LINH
• Vietnamese female, early 30s, professional and composed
• Outfit: Teal/blue nursing scrubs with white V-neck collar, stethoscope draped around neck, hair neatly tied in a bun, small name badge on left chest
• Skin tone: Warm medium tan
• Expression: Calm, empathetic, focused — slightly leaning forward when listening to the patient
• Posture: Standing at a slight angle (¾ view), weight forward to engage`,

  patient: `CHARACTER: PATIENT DAVE
• Male patient, mid-40s, visibly unwell or anxious
• Outfit: Pale blue hospital gown, white hospital ID wristband on right wrist
• Skin tone: Light, slightly pale from illness
• Expression: Worried, uncomfortable, seeking reassurance — eyes slightly wide, brow furrowed
• Posture: Seated on examination bed or triage chair, slightly hunched`,

  doctor: `CHARACTER: DOCTOR
• Male doctor, early 40s, authoritative but approachable
• Outfit: White lab coat over a blue collared shirt, stethoscope around neck, ID badge, pen in breast pocket
• Skin tone: Light medium
• Expression: Focused, analytical, measured — occasional nod when listening
• Posture: Standing, clipboard or tablet in hand`,

  family: `CHARACTER: FAMILY MEMBER
• Female, 35-55 years old, visibly distressed or anxious
• Outfit: Casual civilian clothing — cardigan or jacket, no hospital gear
• Expression: Worried, tearful, urgent — searching for information
• Posture: Standing, hands clasped or arms crossed tightly, leaning in`,
}

// ── Scene bibles ──────────────────────────────────────────────────

function getSceneBible(setting: string): string {
  const s = setting.toLowerCase()

  if (s.includes('triage'))
    return `SCENE: Hospital emergency triage desk / A&E reception
• Background: Clean hospital reception area with a high triage desk, computer monitor visible, NHS/hospital signage on walls, curtain bays visible in background
• Lighting: Bright clinical white overhead lighting, slightly cool tone
• Props: Triage assessment tools on desk (blood pressure cuff, clipboard, forms), call button, sanitiser dispenser
• Atmosphere: Professional, efficient — other staff moving in soft focus background
• Time of day: Could be any time — artificial hospital lighting`

  if (s.includes('trauma') || s.includes('resus'))
    return `SCENE: Hospital trauma bay / resuscitation room
• Background: High-tech emergency bay — crash cart with defibrillator, overhead surgical lights, multiple IV lines and monitors with ECG traces, medical waste bins
• Lighting: Bright surgical overhead lights, white and clinical
• Props: Trauma bed with side rails, monitoring equipment, oxygen mask and tubing nearby
• Atmosphere: Urgent, focused — controlled emergency energy
• Camera: Slightly lower angle to convey seriousness`

  if (s.includes('ward') || s.includes('corridor'))
    return `SCENE: Hospital general ward / corridor
• Background: Standard hospital ward — rows of beds with privacy curtains, nursing station visible in distance, window with natural light on one side
• Lighting: Mixed natural and fluorescent — warmer than A&E
• Props: Bedside table, call button, IV stand, observation chart at foot of bed
• Atmosphere: Calm but clinical — background hum of ward activity`

  if (s.includes('a&e') || s.includes('emergency'))
    return `SCENE: A&E treatment bay
• Background: Emergency bay behind a privacy curtain — treatment bed, wall-mounted medical equipment, emergency call button, sink
• Lighting: Bright overhead fluorescent, clinical white
• Props: Examination light, BP cuff on wall, sharps bin, gloves dispenser
• Atmosphere: Efficient, focused — quiet enough for one-to-one conversation`

  if (s.includes('station') || s.includes('nursing station'))
    return `SCENE: Hospital nursing station / admin area
• Background: Nurses' station with computers, medication trolley nearby, handover board with patient names, shelves of files and supplies
• Lighting: Office fluorescent lighting, medium brightness
• Props: Computer screens, phones, patient notes, coffee cup
• Atmosphere: Busy administrative hub — calm between crises`

  if (s.includes('relatives') || s.includes('family') || s.includes('quiet'))
    return `SCENE: Hospital relatives / quiet room
• Background: Small private room — two chairs, a small table, box of tissues, a window with frosted glass or soft blinds, NHS/hospital logo on wall
• Lighting: Warm, softer lighting — deliberately comforting and less clinical
• Props: Box of tissues on table, chairs arranged to face each other, informational leaflets on wall
• Atmosphere: Private, quiet, emotionally safe — designed for difficult conversations`

  if (s.includes('post') || s.includes('recovery'))
    return `SCENE: Post-operative / recovery ward
• Background: Post-op ward — patient in bed with recovery monitoring, IV drip, nurses visible in background
• Lighting: Medium warm lighting, less harsh than A&E
• Props: Monitoring equipment, IV stand, call buzzer, extra blankets
• Atmosphere: Recovering — quieter, calmer than acute areas`

  return `SCENE: Hospital clinical area
• Background: Clean modern hospital environment — clinical but professional
• Lighting: Standard hospital overhead lighting
• Props: Medical equipment appropriate to the context
• Atmosphere: Professional healthcare setting`
}

// ── Timing estimate ───────────────────────────────────────────────

function estimateTiming(segments: AnimationSegment[]): { lines: string[]; totalSec: number } {
  let elapsed = 0
  const lines = segments.map((seg, i) => {
    const wordCount = seg.text.split(' ').length
    const duration = Math.max(2.5, wordCount * 0.4)
    const start = elapsed
    elapsed += duration + 0.5 // 0.5s gap between speakers
    return `[${start.toFixed(1)}s–${(start + duration).toFixed(1)}s] ${seg.speaker.toUpperCase()}: "${seg.text}"`
  })
  return { lines, totalSec: elapsed }
}

// ── Main component ────────────────────────────────────────────────

export default function HeyGenPrompt({ lessonTitle, stepTitle, sceneSetting, segments }: Props) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)

  if (segments.length === 0) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700">
        Parse the script first to generate a HeyGen prompt.
      </div>
    )
  }

  const uniqueSpeakers = Array.from(new Set(segments.map(s => s.speaker))) as Speaker[]
  const { lines: timedLines, totalSec } = estimateTiming(segments)
  const sceneBible = getSceneBible(sceneSetting)

  const prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEYGEN ANIMATION BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT CONTEXT
Course: Emergency Nursing Communication — English for Vietnamese Nurses
Lesson: ${lessonTitle}
Step: ${stepTitle}
Scene: ${sceneSetting}
Purpose: Educational animation showing a realistic nurse-patient conversation
Style: Realistic/semi-realistic avatar video, professional medical drama tone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DURATION & PACING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target duration: ${Math.min(45, Math.ceil(totalSec))} seconds (MAXIMUM 45 seconds)
Estimated script duration: ~${totalSec.toFixed(0)} seconds
Pacing: Natural conversational pace — not rushed. Allow brief pauses between speakers.
Subtitles: Include English subtitles/captions throughout.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER DESCRIPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${uniqueSpeakers.map(s => CHARACTER_BIBLES[s]).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENE & BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${sceneBible}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMERA & FRAMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Default: Split-screen or alternating medium shots (chest up) for each speaker
• Cut to close-up on face during emotional moments or key phrases
• Slight camera movement allowed (slow push in) to add life — avoid jarring cuts
• When nurse listens: show attentive posture, nod slightly
• When patient speaks: show vulnerability or effort in expression
• Final shot: wide two-shot showing both characters to close the scene

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIALOGUE SCRIPT WITH TIMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${timedLines.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOICE & AUDIO NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nurse Linh voice:
• Female, clear and professional, warm but not overly soft
• Slight Vietnamese accent is acceptable and authentic
• Calm pacing — does not rush, speaks clearly for learners

Patient voice:
• Male, slightly strained or breathless depending on scenario
• Natural conversational tone — not overly dramatic
• Some hesitation or pausing where appropriate to medical context

Doctor voice (if present):
• Male, authoritative but reassuring
• Faster, more technical pacing
• Confident and direct

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTION NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Export format: MP4, H.264, minimum 1080p (1920×1080)
• DO NOT add intro/outro cards or logos
• DO NOT add background music (voiceover only)
• Facial expressions must feel human and natural — avoid uncanny valley
• Lip sync must be accurate — this is for language learning
• Total file size target: under 100 MB
• ${totalSec > 45 ? '⚠️ Script is over 45s — consider trimming 1-2 lines before production' : '✅ Script is within the 45s limit'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="border border-purple-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-purple-50 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <div>
            <p className="text-sm font-semibold text-purple-900">HeyGen Prompt</p>
            <p className="text-xs text-purple-600">
              {uniqueSpeakers.length} character{uniqueSpeakers.length !== 1 ? 's' : ''} · ~{totalSec.toFixed(0)}s estimated
              {totalSec > 45 && <span className="text-amber-600 ml-1">⚠️ over 45s</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); handleCopy() }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
          {expanded ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
        </div>
      </div>

      {/* Prompt body */}
      {expanded && (
        <pre className="text-[11px] leading-relaxed font-mono text-gray-700 bg-gray-50 p-4 overflow-x-auto whitespace-pre-wrap max-h-[440px] overflow-y-auto border-t border-purple-100">
          {prompt}
        </pre>
      )}
    </div>
  )
}
