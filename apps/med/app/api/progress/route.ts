import { NextRequest, NextResponse } from 'next/server'
import { getProgress, upsertProgress } from '@/lib/db/progress'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const lessonId = req.nextUrl.searchParams.get('lessonId')
    if (!userId || !lessonId) return NextResponse.json({ error: 'userId and lessonId required' }, { status: 400 })
    const data = await getProgress(userId, lessonId)
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Resolve the authenticated user server-side — never trust body userId
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { lessonId, current_step_index, completion_pct, completed, last_active } = body

    if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
    if (typeof completion_pct === 'number' && (completion_pct < 0 || completion_pct > 100)) {
      return NextResponse.json({ error: 'completion_pct must be 0–100' }, { status: 400 })
    }

    const data = await upsertProgress(user.id, lessonId, {
      current_step_index,
      completion_pct,
      completed,
      last_active,
    })
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
