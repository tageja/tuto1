import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { checkAndGrantRewards } from '@/lib/rewards-engine'
import type { RewardAction } from '@/lib/rewards-config'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as {
      action: RewardAction
      lessonId?: string
      moduleId?: string
      courseId?: string
      quizScore?: number
    }

    const { action, lessonId, moduleId, courseId, quizScore } = body
    if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 })

    const justEarned = await checkAndGrantRewards(user.id, action, {
      lessonId,
      moduleId,
      courseId,
      quizScore,
    })

    return NextResponse.json({ success: true, data: { justEarned } })
  } catch (err) {
    console.error('[rewards/check]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
