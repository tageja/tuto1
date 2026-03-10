import { NextRequest, NextResponse } from 'next/server'
import { generateHospitalInviteCode } from '@/lib/db/hospitals'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const code = await generateHospitalInviteCode(hospitalId)
    return NextResponse.json({ success: true, data: { invite_code: code } })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
