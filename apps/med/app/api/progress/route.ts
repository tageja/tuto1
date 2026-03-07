import { NextRequest, NextResponse } from 'next/server'
import { getProgress, upsertProgress } from '@/lib/db/progress'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const lessonId = req.nextUrl.searchParams.get('lessonId')
    if (!userId || !lessonId) return NextResponse.json({ error: 'userId and lessonId required' }, { status: 400 })
    const data = await getProgress(userId, lessonId)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, lessonId, ...rest } = body
    const data = await upsertProgress(userId, lessonId, rest)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
