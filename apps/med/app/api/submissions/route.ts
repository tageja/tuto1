import { NextRequest, NextResponse } from 'next/server'
import { saveSubmission, getSubmissionsByStep } from '@/lib/db/progress'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const VALID_TYPES = ['recording', 'quiz', 'mission'] as const
type SubmissionType = typeof VALID_TYPES[number]

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const stepId = req.nextUrl.searchParams.get('stepId')
    if (!userId || !stepId) return NextResponse.json({ error: 'userId and stepId required' }, { status: 400 })
    const data = await getSubmissionsByStep(userId, stepId)
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Resolve the authenticated user server-side — never trust body user_id
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { lesson_id, step_id, type, quiz_score, storage_path, transcript, keyword_score, rubric, pair_session_id } = body

    if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })
    if (!step_id) return NextResponse.json({ error: 'step_id required' }, { status: 400 })
    if (!type || !VALID_TYPES.includes(type as SubmissionType)) {
      return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }

    const submission = await saveSubmission({
      user_id: user.id,
      lesson_id,
      step_id,
      type: type as SubmissionType,
      quiz_score: quiz_score ?? null,
      storage_path: storage_path ?? null,
      transcript: transcript ?? null,
      keyword_score: keyword_score ?? null,
      rubric: rubric ?? null,
      pair_session_id: pair_session_id ?? null,
    })
    return NextResponse.json({ data: submission }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
