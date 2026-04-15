import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import type { AnimationSegment } from '@/components/animations/types'

// ── Quiz generation ───────────────────────────────────────────────

interface QuizOption { id: string; text: string }
interface QuizQuestion {
  id: string
  type: 'mcq'
  prompt_en: string
  prompt_vi: string
  options: QuizOption[]
  answer: string
  explanation_en: string
  explanation_vi: string
  order_index: number
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateQuizQuestions(segments: AnimationSegment[]): QuizQuestion[] {
  const nurseLines = segments.filter(s => s.speaker === 'nurse' && s.vi_text)
  const patientLines = segments.filter(s => s.speaker === 'patient' && s.vi_text)
  const questions: QuizQuestion[] = []

  // Q1-Q3: Vietnamese → English phrase matching (from nurse lines)
  const matchLines = nurseLines.slice(0, 3)
  matchLines.forEach((seg, i) => {
    const distractors = nurseLines
      .filter(s => s.text !== seg.text)
      .map(s => s.text)
      .slice(0, 3)

    // Pad distractors if not enough nurse lines
    const fallbacks = [
      'Please wait while I check your details.',
      'The doctor will see you shortly.',
      'Can you rate your pain from one to ten?',
      'I need to take your blood pressure now.',
    ].filter(f => f !== seg.text && !distractors.includes(f))

    while (distractors.length < 3) distractors.push(fallbacks.shift() ?? 'I understand.')

    const opts = shuffle([
      { id: 'a', text: seg.text },
      ...distractors.slice(0, 3).map((t, j) => ({ id: String.fromCharCode(98 + j), text: t })),
    ])
    // Re-assign ids sequentially after shuffle
    opts.forEach((o, idx) => { o.id = String.fromCharCode(97 + idx) })
    const correctId = opts.find(o => o.text === seg.text)!.id

    questions.push({
      id: `q_match_${i}`,
      type: 'mcq',
      prompt_en: `Which English phrase matches: "${seg.vi_text}"?`,
      prompt_vi: `Câu tiếng Anh nào tương ứng với: "${seg.vi_text}"?`,
      options: opts,
      answer: correctId,
      explanation_en: `The correct phrase is: "${seg.text}"`,
      explanation_vi: `Câu đúng là: "${seg.text}"`,
      order_index: i,
    })
  })

  // Q4: Patient response matching (if available)
  if (patientLines[0]?.vi_text) {
    const seg = patientLines[0]
    const distractors = patientLines
      .slice(1)
      .map(s => s.text)
      .concat([
        'I feel fine, thank you.',
        'It started about two hours ago.',
        'The pain is in my left arm.',
      ])
      .slice(0, 3)

    const opts = shuffle([
      { id: 'a', text: seg.text },
      ...distractors.map((t, j) => ({ id: String.fromCharCode(98 + j), text: t })),
    ])
    opts.forEach((o, idx) => { o.id = String.fromCharCode(97 + idx) })
    const correctId = opts.find(o => o.text === seg.text)!.id

    questions.push({
      id: 'q_patient_0',
      type: 'mcq',
      prompt_en: `What does the patient say? "${seg.vi_text}"`,
      prompt_vi: `Bệnh nhân nói gì? "${seg.vi_text}"`,
      options: opts,
      answer: correctId,
      explanation_en: `The correct phrase is: "${seg.text}"`,
      explanation_vi: `Câu đúng là: "${seg.text}"`,
      order_index: questions.length,
    })
  }

  return questions
}

// ── Cloze generation ──────────────────────────────────────────────

/**
 * Blank out the final meaningful clause of a nurse line.
 * Uses comma / "or" / "and" split to find a good split point.
 * Falls back to blanking last 3 words.
 */
function blankLine(text: string): string | null {
  // Remove trailing punctuation for clean answers
  const clean = text.replace(/[?.!]+$/, '').trim()

  // Try: split after last comma → blank the tail
  const commaIdx = clean.lastIndexOf(',')
  if (commaIdx > 0 && commaIdx < clean.length - 5) {
    const prefix = clean.slice(0, commaIdx + 1).trim()
    const suffix = clean.slice(commaIdx + 1).trim()
    if (suffix.split(' ').length >= 2) return `${prefix} [${suffix}]?`
  }

  // Try: split at " or " → blank after "or"
  const orMatch = clean.match(/^(.+\bor\b\s*)(.+)$/i)
  if (orMatch && orMatch[2].split(' ').length >= 2) {
    return `[${orMatch[1].trim()}] ${orMatch[2].trim()}?`
  }

  // Fallback: blank last 3 words
  const words = clean.split(' ')
  if (words.length < 5) return null
  const prefix = words.slice(0, -3).join(' ')
  const answer = words.slice(-3).join(' ')
  return `${prefix} [${answer}]?`
}

function generateClozeText(segments: AnimationSegment[]): string {
  const nurseLines = segments
    .filter(s => s.speaker === 'nurse')
    .slice(0, 5)

  const clozeLines: string[] = []
  for (const seg of nurseLines) {
    const blanked = blankLine(seg.text)
    if (blanked) clozeLines.push(blanked)
    if (clozeLines.length >= 4) break
  }

  if (!clozeLines.length) {
    // Absolute fallback
    return 'Hello, I\'m your nurse today. How can I [help] you?'
  }

  return clozeLines.join('\n')
}

// ── Route handler ─────────────────────────────────────────────────

/**
 * POST /api/steps/generate-practice
 * body JSON: { stepId: string, segments: AnimationSegment[] }
 *
 * Creates two new steps linked to the same lesson as stepId:
 *  1. quiz  – Vietnamese ↔ English phrase matching
 *  2. cloze – Fill-in-the-blank from key dialogue lines
 */
export async function POST(req: NextRequest) {
  try {
    const { stepId, segments } = (await req.json()) as {
      stepId: string
      segments: AnimationSegment[]
    }

    if (!stepId || !segments?.length) {
      return NextResponse.json({ error: 'stepId and segments are required' }, { status: 400 })
    }

    const db = getServiceClient()

    // Fetch the source step to get lesson_id + order_index
    const { data: sourceStep, error: stepErr } = await db
      .from('nursed_lesson_steps')
      .select('lesson_id, order_index, title')
      .eq('id', stepId)
      .single()

    if (stepErr || !sourceStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const { lesson_id } = sourceStep

    // Find max order_index in this lesson so we can append
    const { data: allSteps } = await db
      .from('nursed_lesson_steps')
      .select('order_index')
      .eq('lesson_id', lesson_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = allSteps?.[0]?.order_index ?? 0

    const questions = generateQuizQuestions(segments)
    const clozeText = generateClozeText(segments)

    const now = new Date().toISOString()

    const quizStep = {
      lesson_id,
      order_index: maxOrder + 1,
      type: 'quiz',
      title: `Comprehension Check — ${sourceStep.title ?? 'Dialogue'}`,
      title_vi: `Kiểm tra hiểu biết`,
      config: {
        questions,
        description_en: 'Match each Vietnamese phrase to its English equivalent from the dialogue.',
        description_vi: 'Nối mỗi cụm tiếng Việt với cụm tiếng Anh tương ứng trong hội thoại.',
        source_step_id: stepId,
      },
      created_at: now,
    }

    const clozeStep = {
      lesson_id,
      order_index: maxOrder + 2,
      type: 'cloze',
      title: `Fill in the Blanks — ${sourceStep.title ?? 'Dialogue'}`,
      title_vi: `Điền vào chỗ trống`,
      config: {
        clozeText,
        instructions_en: 'Fill in the missing key phrases from the dialogue.',
        instructions_vi: 'Điền vào các cụm từ quan trọng còn thiếu trong hội thoại.',
        source_step_id: stepId,
      },
      created_at: now,
    }

    const { data: inserted, error: insertErr } = await db
      .from('nursed_lesson_steps')
      .insert([quizStep, clozeStep])
      .select('id, type, title, order_index')

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      created: inserted,
      quizQuestions: questions.length,
      clozeLines: clozeText.split('\n').filter(Boolean).length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
