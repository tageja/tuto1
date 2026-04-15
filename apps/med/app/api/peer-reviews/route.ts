import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createPeerReview, getPeerReviewsByReviewer } from '@/lib/db/peer-reviews'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stepId = req.nextUrl.searchParams.get('stepId')
    if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 })

    const reviews = await getPeerReviewsByReviewer(user.id, stepId)
    return NextResponse.json({ data: reviews })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { submission_id, rating } = body

    if (!submission_id) return NextResponse.json({ error: 'submission_id required' }, { status: 400 })
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 })
    }

    const review = await createPeerReview(user.id, submission_id, rating)
    return NextResponse.json({ data: review }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const status = message.includes('not found') || message.includes('not in') || message.includes('Cannot') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
