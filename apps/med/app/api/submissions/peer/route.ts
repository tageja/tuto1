import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getServiceClient } from '@/lib/supabase'
import { getPublicUrl } from '@/lib/storage'
import { getUserPairGroupId, getGroupMemberIds } from '@/lib/db/peer-reviews'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stepId = req.nextUrl.searchParams.get('stepId')
    if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 })

    const pairGroupId = await getUserPairGroupId(user.id)
    if (!pairGroupId) return NextResponse.json({ data: null })

    const memberIds = await getGroupMemberIds(pairGroupId)
    const peerIds = memberIds.filter((id) => id !== user.id)
    if (peerIds.length === 0) return NextResponse.json({ data: null })

    const db = getServiceClient()
    const { data: rows, error } = await db
      .from('nursed_submissions')
      .select('id, storage_path')
      .eq('step_id', stepId)
      .eq('type', 'recording')
      .in('user_id', peerIds)
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    if (!rows?.length) return NextResponse.json({ data: null })

    const pick = rows[Math.floor(Math.random() * rows.length)]
    const publicUrl = await getPublicUrl(pick.storage_path!)

    return NextResponse.json({
      data: { submission_id: pick.id, recording_url: publicUrl },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
