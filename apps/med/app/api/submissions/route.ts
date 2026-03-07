import { NextRequest, NextResponse } from 'next/server'
import { saveSubmission, getSubmissionsByStep } from '@/lib/db/progress'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const stepId = req.nextUrl.searchParams.get('stepId')
    if (!userId || !stepId) return NextResponse.json({ error: 'userId and stepId required' }, { status: 400 })
    const data = await getSubmissionsByStep(userId, stepId)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const submission = await saveSubmission(body)
    return NextResponse.json({ data: submission }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
