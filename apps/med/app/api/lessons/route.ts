import { NextRequest, NextResponse } from 'next/server'
import { createLesson } from '@/lib/db/courses'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lesson = await createLesson(body)
    return NextResponse.json({ data: lesson }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
