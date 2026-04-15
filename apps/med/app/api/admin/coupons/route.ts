import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndProfile, ADMIN_ROLES } from '@/lib/supabase-server'
import { getAllCoupons, upsertCoupon } from '@/lib/db/rewards'

export async function GET(_req: NextRequest) {
  try {
    const { profile } = await getSessionAndProfile()
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const coupons = await getAllCoupons()
    return NextResponse.json({ success: true, data: coupons })
  } catch (err) {
    console.error('[admin/coupons GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await getSessionAndProfile()
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, name_vi, description, description_vi, brand, image_url, star_cost, total_quantity } = body

    if (!name || !brand || !star_cost) {
      return NextResponse.json({ error: 'name, brand, and star_cost are required' }, { status: 400 })
    }

    const coupon = await upsertCoupon({
      name,
      name_vi: name_vi ?? null,
      description: description ?? null,
      description_vi: description_vi ?? null,
      brand,
      image_url: image_url ?? null,
      star_cost: Number(star_cost),
      total_quantity: total_quantity ? Number(total_quantity) : null,
      active: true,
    })

    return NextResponse.json({ success: true, data: coupon })
  } catch (err) {
    console.error('[admin/coupons POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
