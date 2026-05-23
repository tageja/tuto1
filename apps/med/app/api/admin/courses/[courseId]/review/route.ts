import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'

type RouteContext = {
  params: Promise<{ courseId: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = await context.params
    const body = await req.json().catch(() => ({}))
    const action = body.action as string | undefined
    const reviewNotes = typeof body.review_notes === 'string' ? body.review_notes.trim() : ''

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
    }

    if (action === 'reject' && !reviewNotes) {
      return NextResponse.json({ error: 'review_notes required for rejection' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()

    const { data: course, error: courseError } = await db
      .from('nursed_courses')
      .select('id, review_status')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (course.review_status !== 'submitted') {
      return NextResponse.json(
        { error: 'Only submitted courses can be reviewed' },
        { status: 409 },
      )
    }

    const reviewStatus = action === 'approve' ? 'published' : 'rejected'

    const updatePayload =
      action === 'approve'
        ? {
            review_status: 'published' as const,
            published: true,
            approved_at: new Date().toISOString(),
            approved_by: user.id,
            review_notes: null,
          }
        : {
            review_status: 'rejected' as const,
            review_notes: reviewNotes,
          }

    const { error: updateError } = await db
      .from('nursed_courses')
      .update(updatePayload)
      .eq('id', courseId)

    if (updateError) throw updateError

    // When approving, publish all modules and lessons so learners can access them
    if (action === 'approve') {
      const { data: modules } = await db
        .from('nursed_modules')
        .select('id')
        .eq('course_id', courseId)

      if (modules && modules.length > 0) {
        const moduleIds = modules.map((m) => m.id)
        await db
          .from('nursed_lessons')
          .update({ published: true })
          .in('module_id', moduleIds)
      }
    }

    return NextResponse.json({ success: true, reviewStatus })
  } catch (err) {
    console.error('[admin/courses/review POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
