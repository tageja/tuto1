import { NextRequest, NextResponse } from 'next/server'
import { getLessonById, updateLesson, deleteLesson } from '@/lib/db/courses'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params
    const lesson = await getLessonById(lessonId)
    return NextResponse.json({ data: lesson })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params
    const body = await req.json()
    const lesson = await updateLesson(lessonId, body)
    return NextResponse.json({ data: lesson })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params
    await deleteLesson(lessonId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
