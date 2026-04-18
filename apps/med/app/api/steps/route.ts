import { NextRequest, NextResponse } from 'next/server'
import { getStepsByLesson, createStep, reorderSteps, resolveLesson } from '@/lib/db/courses'
import { isUuid } from '@/lib/utils/slug'

export async function GET(req: NextRequest) {
  try {
    let lessonId = req.nextUrl.searchParams.get('lessonId')
    if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
    if (!isUuid(lessonId)) {
      const lesson = await resolveLesson(lessonId)
      if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      lessonId = lesson.id
    }
    const steps = await getStepsByLesson(lessonId)
    return NextResponse.json({ data: steps })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Resolve lesson slug → UUID if needed (slug-based URLs pass non-UUID lesson_id)
    if (body.lesson_id && !isUuid(body.lesson_id)) {
      const lesson = await resolveLesson(body.lesson_id)
      if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      body.lesson_id = lesson.id
    }
    const step = await createStep(body)
    return NextResponse.json({ data: step }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    await reorderSteps(body.steps)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
