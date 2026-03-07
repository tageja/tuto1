import { NextRequest, NextResponse } from 'next/server'
import { getModules, createModule } from '@/lib/db/courses'

export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId')
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    const modules = await getModules(courseId)
    return NextResponse.json({ data: modules })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const module_ = await createModule(body)
    return NextResponse.json({ data: module_ }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
