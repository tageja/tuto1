import { NextRequest, NextResponse } from 'next/server'
import { getStepsByLesson, createStep, reorderSteps } from '@/lib/db/courses'

export async function GET(req: NextRequest) {
  try {
    const lessonId = req.nextUrl.searchParams.get('lessonId')
    if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
    const steps = await getStepsByLesson(lessonId)
    return NextResponse.json({ data: steps })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
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
