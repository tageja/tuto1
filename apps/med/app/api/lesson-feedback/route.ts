import { NextRequest, NextResponse } from 'next/server'
import { saveLessonFeedback } from '@/lib/db/progress'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const SCORE_KEYS = [
  'q1_animation',
  'q2_variety',
  'q3_usefulness',
  'q4_confidence',
  'q5_continue',
] as const

type ScoreKey = (typeof SCORE_KEYS)[number]

function parseScoreField(name: ScoreKey, value: unknown): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { ok: false, error: `${name} must be an integer between 1 and 5` }
  }
  if (value < 1 || value > 5) {
    return { ok: false, error: `${name} must be between 1 and 5` }
  }
  return { ok: true, value }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      lessonId,
      q1_animation,
      q2_variety,
      q3_usefulness,
      q4_confidence,
      q5_continue,
    } = body as Record<string, unknown>

    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
    }

    const rawScores: Record<ScoreKey, unknown> = {
      q1_animation,
      q2_variety,
      q3_usefulness,
      q4_confidence,
      q5_continue,
    }

    const scores: Partial<Record<ScoreKey, number>> = {}
    for (const key of SCORE_KEYS) {
      const parsed = parseScoreField(key, rawScores[key])
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 })
      }
      scores[key] = parsed.value
    }

    const data = await saveLessonFeedback({
      user_id: user.id,
      lesson_id: lessonId,
      q1_animation: scores.q1_animation,
      q2_variety: scores.q2_variety,
      q3_usefulness: scores.q3_usefulness,
      q4_confidence: scores.q4_confidence,
      q5_continue: scores.q5_continue,
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
