import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserRedemptions } from '@/lib/db/rewards'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const redemptions = await getUserRedemptions(user.id)
    return NextResponse.json({ success: true, data: redemptions })
  } catch (err) {
    console.error('[coupons/my-redemptions]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
