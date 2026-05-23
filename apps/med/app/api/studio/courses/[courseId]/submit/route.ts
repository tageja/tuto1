import { NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'
import { validateCourseContent } from '@/lib/studio/validate-course'

type RouteContext = {
  params: Promise<{ courseId: string }>
}

const SUBMITTABLE_STATUSES = new Set(['draft', 'rejected'])

export async function POST(_req: Request, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = await context.params
    const db = await createSupabaseServiceServerClient()

    const { data: course, error: courseError } = await db
      .from('nursed_courses')
      .select('id, creator_id, review_status, slug')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (course.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!SUBMITTABLE_STATUSES.has(course.review_status)) {
      return NextResponse.json(
        { error: 'Course cannot be submitted in its current review status' },
        { status: 409 },
      )
    }

    const validation = await validateCourseContent(courseId, db)
    if (validation.issueCount > 0) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.issues, data: validation },
        { status: 422 },
      )
    }

    const { error: updateError } = await db
      .from('nursed_courses')
      .update({
        review_status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', courseId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      courseSlug: course.slug,
    })
  } catch (err) {
    console.error('[studio/courses/submit POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
