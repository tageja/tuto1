import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndProfile, ADMIN_ROLES } from '@/lib/supabase-server'
import { upsertCoupon, deleteCoupon, toggleCouponActive } from '@/lib/db/rewards'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await getSessionAndProfile()
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    if (body.active !== undefined && Object.keys(body).length === 1) {
      await toggleCouponActive(id, body.active)
      return NextResponse.json({ success: true })
    }

    const coupon = await upsertCoupon({ ...body, id })
    return NextResponse.json({ success: true, data: coupon })
  } catch (err) {
    console.error('[admin/coupons PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await getSessionAndProfile()
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await deleteCoupon(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/coupons DELETE]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
