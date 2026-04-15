import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserPairGroupId, getGroupRecordingsForStep } from '@/lib/db/peer-reviews'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stepId = req.nextUrl.searchParams.get('stepId')
    if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 })

    const pairGroupId = await getUserPairGroupId(user.id)
    if (!pairGroupId) {
      return NextResponse.json({ data: [], noGroup: true })
    }

    const recordings = await getGroupRecordingsForStep(pairGroupId, stepId, user.id)
    return NextResponse.json({ data: recordings })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
