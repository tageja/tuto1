import { NextRequest, NextResponse } from 'next/server'
import { getSessionAndProfile, ADMIN_ROLES } from '@/lib/supabase-server'
import { getAllRedemptions } from '@/lib/db/rewards'

export async function GET(_req: NextRequest) {
  try {
    const { profile } = await getSessionAndProfile()
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const redemptions = await getAllRedemptions(200)
    return NextResponse.json({ success: true, data: redemptions })
  } catch (err) {
    console.error('[admin/redemptions]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
