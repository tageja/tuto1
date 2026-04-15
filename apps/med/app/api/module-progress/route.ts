import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getModulePeerReviewStatus } from '@/lib/db/peer-reviews'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const moduleId = req.nextUrl.searchParams.get('moduleId')
    if (!moduleId) return NextResponse.json({ error: 'moduleId required' }, { status: 400 })

    const result = await getModulePeerReviewStatus(user.id, moduleId)
    return NextResponse.json({ data: result })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
