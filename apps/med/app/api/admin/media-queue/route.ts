import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'
import type { MediaQueueItem } from '@/lib/supabase'

type StepJoin = {
  id: string
  title: string
  order_index: number
  type: string
  nursed_lessons: {
    id: string
    title: string
    order_index: number
    nursed_modules: {
      id: string
      title: string
      order_index: number
    } | null
  } | null
}

export type AdminMediaQueueRow = MediaQueueItem & {
  creator_name: string | null
  creator_email: string | null
  course_title: string | null
  step_title: string | null
  step_order_index: number | null
  lesson_title: string | null
  lesson_order_index: number | null
  module_title: string | null
  module_order_index: number | null
}

function mapRow(
  row: MediaQueueItem & {
    nursed_lesson_steps?: StepJoin | null
    nursed_courses?: { title: string } | null
  },
  creatorName: string | null,
  creatorEmail: string | null,
): AdminMediaQueueRow {
  const step = row.nursed_lesson_steps
  const lesson = step?.nursed_lessons
  const module = lesson?.nursed_modules
  const { nursed_lesson_steps: _s, nursed_courses: _c, ...item } = row

  return {
    ...item,
    creator_name: creatorName,
    creator_email: creatorEmail,
    course_title: row.nursed_courses?.title ?? null,
    step_title: step?.title ?? null,
    step_order_index: step?.order_index ?? null,
    lesson_title: lesson?.title ?? null,
    lesson_order_index: lesson?.order_index ?? null,
    module_title: module?.title ?? null,
    module_order_index: module?.order_index ?? null,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const filter = req.nextUrl.searchParams.get('status') ?? 'submitted'
    const db = await createSupabaseServiceServerClient()

    let query = db
      .from('media_queue')
      .select(`
        *,
        nursed_courses ( title ),
        nursed_lesson_steps (
          id,
          title,
          order_index,
          type,
          nursed_lessons (
            id,
            title,
            order_index,
            nursed_modules (
              id,
              title,
              order_index
            )
          )
        )
      `)
      .eq('media_type', 'video_request')
      .order('updated_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data: rows, error } = await query
    if (error) throw error

    const creatorIds = [...new Set((rows ?? []).map((row) => row.creator_id).filter(Boolean))] as string[]
    const nameById = new Map<string, string | null>()
    const emailById = new Map<string, string | null>()

    if (creatorIds.length > 0) {
      const { data: profiles } = await db
        .from('nursed_profiles')
        .select('id, full_name')
        .in('id', creatorIds)

      for (const p of profiles ?? []) {
        nameById.set(p.id, p.full_name)
      }

      await Promise.all(
        creatorIds.map(async (creatorId) => {
          const { data: authData } = await db.auth.admin.getUserById(creatorId)
          emailById.set(creatorId, authData.user?.email ?? null)
        }),
      )
    }

    const items = (rows ?? []).map((row) => {
      const typed = row as MediaQueueItem & {
        nursed_lesson_steps?: StepJoin | null
        nursed_courses?: { title: string } | null
      }
      const creatorId = typed.creator_id
      return mapRow(
        typed,
        creatorId ? nameById.get(creatorId) ?? null : null,
        creatorId ? emailById.get(creatorId) ?? null : null,
      )
    })

    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    console.error('[admin/media-queue GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
