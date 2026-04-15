import { NextRequest, NextResponse } from 'next/server'
import { getPairGroups, createPairGroup, joinPairGroup } from '@/lib/db/hospitals'
import { getServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const hospitalId = req.nextUrl.searchParams.get('hospitalId') ?? undefined
    const data = await getPairGroups(hospitalId)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, joinCode, userId, ...rest } = body

    if (action === 'leave') {
      const supabase = await createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const pairGroupId = body.pairGroupId
      if (!pairGroupId) return NextResponse.json({ error: 'pairGroupId required' }, { status: 400 })

      const db = getServiceClient()
      const { error } = await db
        .from('nursed_pair_members')
        .delete()
        .eq('user_id', user.id)
        .eq('pair_group_id', pairGroupId)
      if (error) throw error

      return NextResponse.json({ data: { left: true } })
    }

    if (action === 'join') {
      if (!joinCode || !userId) return NextResponse.json({ error: 'joinCode and userId required' }, { status: 400 })
      const data = await joinPairGroup(joinCode, userId)
      return NextResponse.json({ data })
    }

    const group = await createPairGroup(rest)
    return NextResponse.json({ data: group }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
