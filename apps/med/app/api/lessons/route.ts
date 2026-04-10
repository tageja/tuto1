import { NextRequest, NextResponse } from 'next/server'
import { createLesson } from '@/lib/db/courses'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId')
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

    const db = getServiceClient()
    // Lessons live under modules → query via module join
    const { data: modules, error } = await db
      .from('nursed_modules')
      .select('id, order_index, nursed_lessons(id, title, title_vi, order_index, module_id)')
      .eq('course_id', courseId)
      .order('order_index')

    if (error) throw error

    // Flatten all lessons from all modules, sorted by module order then lesson order
    const lessons = (modules ?? []).flatMap((mod) =>
      ((mod.nursed_lessons ?? []) as { id: string; title: string; title_vi: string | null; order_index: number; module_id: string }[])
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map(l => ({ ...l, _module_order: mod.order_index }))
    )

    return NextResponse.json({ data: lessons })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lesson = await createLesson(body)
    return NextResponse.json({ data: lesson }, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
