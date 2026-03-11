import { NextRequest, NextResponse } from 'next/server'
import { getCourses, getCoursesWithCounts, createCourse } from '@/lib/db/courses'

export async function GET(req: NextRequest) {
  try {
    const published = req.nextUrl.searchParams.get('published')
    const includeCounts = req.nextUrl.searchParams.get('includeCounts') === 'true'
    const publishedFilter = published === 'true' ? true : published === 'false' ? false : undefined

    const courses = includeCounts
      ? await getCoursesWithCounts(publishedFilter)
      : await getCourses(publishedFilter)

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
