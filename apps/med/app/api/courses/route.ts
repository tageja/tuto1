import { NextRequest, NextResponse } from 'next/server'
import { getCourses, createCourse } from '@/lib/db/courses'

export async function GET(req: NextRequest) {
  try {
    const published = req.nextUrl.searchParams.get('published')
    const courses = await getCourses(published === 'true' ? true : published === 'false' ? false : undefined)
    return NextResponse.json({ data: courses })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const course = await createCourse(body)
    return NextResponse.json({ data: course }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
