import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'

type RouteContext = {
  params: Promise<{ applicationId: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { applicationId } = await context.params
    const body = await req.json()
    const status = body.status === 'approved' || body.status === 'rejected'
      ? body.status
      : null

    if (!status) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data: application, error: fetchError } = await db
      .from('creator_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError) throw fetchError

    const reviewNotes = typeof body.review_notes === 'string'
      ? body.review_notes.trim().slice(0, 1000)
      : null

    const { data, error } = await db
      .from('creator_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: reviewNotes,
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    if (status === 'approved') {
      const { error: profileError } = await db
        .from('nursed_profiles')
        .update({ role: 'course_creator' })
        .eq('id', application.user_id)

      if (profileError) throw profileError
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[creator-applications PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
