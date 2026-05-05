import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type TourAction = 'complete' | 'skip' | 'reset'

const VALID_ACTIONS: TourAction[] = ['complete', 'skip', 'reset']

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const action: TourAction = body.action

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const now = new Date().toISOString()

    let update: Record<string, string | null> = {}
    if (action === 'complete') {
      update = { tour_completed_at: now }
    } else if (action === 'skip') {
      update = { tour_skipped_at: now }
    } else {
      update = { tour_completed_at: null, tour_skipped_at: null }
    }

    const { data, error } = await supabase
      .from('nursed_profiles')
      .update(update)
      .eq('id', user.id)
      .select('tour_completed_at, tour_skipped_at')
      .single()

    if (error) {
      console.error('[profile/tour]', error)
      return NextResponse.json({ error: 'Failed to update tour state' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[profile/tour]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
