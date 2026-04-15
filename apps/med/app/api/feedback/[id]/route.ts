import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, ADMIN_ROLES } from '@/lib/supabase-server'
import { updateFeedbackStatus, getFeedbackById } from '@/lib/db/feedback'
import type { FeedbackStatus } from '@/lib/supabase'

const VALID_STATUSES: FeedbackStatus[] = ['pending', 'in_progress', 'fixed', 'rejected']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('nursed_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await getFeedbackById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    const body = await req.json()
    const { status, adminResponse } = body as Record<string, unknown>

    if (!status || !VALID_STATUSES.includes(status as FeedbackStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (status === 'rejected' && (!adminResponse || typeof adminResponse !== 'string' || (adminResponse as string).trim().length === 0)) {
      return NextResponse.json({ error: 'Rejection requires an explanation' }, { status: 400 })
    }

    const data = await updateFeedbackStatus(
      id,
      status as FeedbackStatus,
      typeof adminResponse === 'string' ? adminResponse.trim() : null,
    )

    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
