import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserPairGroupId, getGroupRecentRecordings } from '@/lib/db/peer-reviews'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limitParam = req.nextUrl.searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 10

    const groupId = await getUserPairGroupId(user.id)
    if (!groupId) return NextResponse.json({ data: [] })

    const data = await getGroupRecentRecordings(groupId, limit)
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
