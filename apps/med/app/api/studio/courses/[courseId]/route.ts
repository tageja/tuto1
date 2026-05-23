import { NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'
import type { MediaQueueItem, NursedCourse, NursedLesson, NursedModule } from '@/lib/supabase'

type RouteContext = {
  params: Promise<{ courseId: string }>
}

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

export type StudioVideoQueueItem = MediaQueueItem & {
  step_title: string | null
  step_order_index: number | null
  lesson_title: string | null
  lesson_order_index: number | null
  module_title: string | null
  module_order_index: number | null
}

function mapVideoItem(row: MediaQueueItem & { nursed_lesson_steps?: StepJoin | null }): StudioVideoQueueItem {
  const step = row.nursed_lesson_steps
  const lesson = step?.nursed_lessons
  const module = lesson?.nursed_modules
  const { nursed_lesson_steps: _omit, ...item } = row

  return {
    ...item,
    step_title: step?.title ?? null,
    step_order_index: step?.order_index ?? null,
    lesson_title: lesson?.title ?? null,
    lesson_order_index: lesson?.order_index ?? null,
    module_title: module?.title ?? null,
    module_order_index: module?.order_index ?? null,
  }
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
      .select(`
        *,
        nursed_modules (
          *,
          nursed_lessons (*)
        )
      `)
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const typedCourse = course as NursedCourse & {
      nursed_modules?: Array<NursedModule & { nursed_lessons?: NursedLesson[] }>
    }

    if (
      typedCourse.creator_id !== user.id
      && profile.role !== 'super_admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const modules = (typedCourse.nursed_modules ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((mod) => ({
        ...mod,
        nursed_lessons: (mod.nursed_lessons ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index),
      }))

    const lessonIds = modules.flatMap((mod) =>
      (mod.nursed_lessons ?? []).map((lesson) => lesson.id),
    )

    let totalSteps = 0
    if (lessonIds.length > 0) {
      const { count, error: countError } = await db
        .from('nursed_lesson_steps')
        .select('id', { count: 'exact', head: true })
        .in('lesson_id', lessonIds)

      if (countError) throw countError
      totalSteps = count ?? 0
    }

    const totalLessons = lessonIds.length
    const totalModules = modules.length

    const { data: videoRows, error: videoError } = await db
      .from('media_queue')
      .select(`
        *,
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
      .eq('course_id', courseId)
      .eq('media_type', 'video_request')
      .order('created_at', { ascending: true })

    if (videoError) throw videoError

    const videoItems = (videoRows ?? []).map((row) =>
      mapVideoItem(row as MediaQueueItem & { nursed_lesson_steps?: StepJoin | null }),
    )

    const statusCounts = {
      pending: videoItems.filter((item) => item.status === 'pending').length,
      submitted: videoItems.filter((item) => item.status === 'submitted').length,
      complete: videoItems.filter((item) => item.status === 'complete').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        course: { ...typedCourse, nursed_modules: modules },
        stats: { totalModules, totalLessons, totalSteps },
        videoItems,
        statusCounts,
      },
    })
  } catch (err) {
    console.error('[studio/courses GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
