import { NextRequest, NextResponse } from 'next/server'
import { getPairGroups, createPairGroup, joinPairGroup } from '@/lib/db/hospitals'
import { getServiceClient } from '@/lib/supabase'

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
