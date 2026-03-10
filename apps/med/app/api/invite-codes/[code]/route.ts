import { NextRequest, NextResponse } from 'next/server'
import { getHospitalByInviteCode } from '@/lib/db/hospitals'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const hospital = await getHospitalByInviteCode(code)
    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Invalid invite code' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { hospital_id: hospital.id, name: hospital.name } })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
