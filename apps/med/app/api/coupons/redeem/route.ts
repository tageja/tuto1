import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redeemCoupon } from '@/lib/db/rewards'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { couponId } = await req.json()
    if (!couponId) return NextResponse.json({ error: 'couponId is required' }, { status: 400 })

    const redemption = await redeemCoupon(user.id, couponId)
    return NextResponse.json({ success: true, data: redemption })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message === 'Insufficient stars' || message === 'Coupon not available' || message === 'Coupon out of stock' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
