import { NextResponse } from 'next/server'
import { getCourseTemplate } from '@/lib/studio/templates'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'

export type AdminReviewQueueCourse = {
  id: string
  slug: string | null
  title: string
  title_vi: string | null
  submitted_at: string | null
  creator_id: string | null
  creator_name: string | null
  creator_email: string | null
  template_id: string | null
  template_name: string | null
  modules_count: number
  lessons_count: number
}

export async function GET() {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await createSupabaseServiceServerClient()

    const { data: courses, error: coursesError } = await db
      .from('nursed_courses')
      .select(`
        id,
        slug,
        title,
        title_vi,
        submitted_at,
        creator_id,
        source_draft_id
      `)
      .eq('review_status', 'submitted')
      .order('submitted_at', { ascending: true })

    if (coursesError) throw coursesError

    const rows = courses ?? []
    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const creatorIds = [...new Set(rows.map((row) => row.creator_id).filter(Boolean))] as string[]
    const draftIds = [...new Set(rows.map((row) => row.source_draft_id).filter(Boolean))] as string[]

    const [{ data: profiles }, { data: drafts }] = await Promise.all([
      creatorIds.length
        ? db.from('nursed_profiles').select('id, full_name').in('id', creatorIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
      draftIds.length
        ? db.from('course_drafts').select('id, template_id, intake_form').in('id', draftIds)
        : Promise.resolve({ data: [] as { id: string; template_id: string; intake_form: Record<string, unknown> }[] }),
    ])

    const profileById = new Map((profiles ?? []).map((row) => [row.id, row.full_name]))
    const draftById = new Map((drafts ?? []).map((row) => [row.id, row]))

    const creatorEmails = new Map<string, string>()
    if (creatorIds.length) {
      const emailResults = await Promise.all(
        creatorIds.map(async (creatorId) => {
          const { data } = await db.auth.admin.getUserById(creatorId)
          return [creatorId, data.user?.email ?? null] as const
        }),
      )
      emailResults.forEach(([id, email]) => {
        if (email) creatorEmails.set(id, email)
      })
    }

    const enriched = await Promise.all(
      rows.map(async (course) => {
        const { data: modules } = await db
          .from('nursed_modules')
          .select('id, nursed_lessons(id)')
          .eq('course_id', course.id)

        let lessonsCount = 0
        for (const mod of modules ?? []) {
          const lessons = (mod as { nursed_lessons?: { id: string }[] }).nursed_lessons ?? []
          lessonsCount += lessons.length
        }

        const draft = course.source_draft_id ? draftById.get(course.source_draft_id) : undefined
        const intake = (draft?.intake_form ?? {}) as Record<string, unknown>
        const templateId =
          (typeof intake.templateId === 'string' ? intake.templateId : null)
          ?? draft?.template_id
          ?? null
        const template = templateId ? getCourseTemplate(templateId) : null

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          title_vi: course.title_vi,
          submitted_at: course.submitted_at,
          creator_id: course.creator_id,
          creator_name: course.creator_id ? profileById.get(course.creator_id) ?? null : null,
          creator_email: course.creator_id ? creatorEmails.get(course.creator_id) ?? null : null,
          template_id: templateId,
          template_name: template?.name ?? templateId,
          modules_count: modules?.length ?? 0,
          lessons_count: lessonsCount,
        } satisfies AdminReviewQueueCourse
      }),
    )

    return NextResponse.json({ success: true, data: enriched })
  } catch (err) {
    console.error('[admin/courses/review-queue GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
