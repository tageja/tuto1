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

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = await context.params
    const db = await createSupabaseServiceServerClient()

    const { data: course, error: courseError } = await db
      .from('nursed_courses')
      .select('id, creator_id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (course.creator_id !== user.id && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await validateCourseContent(courseId, db)

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[studio/courses/validate GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
