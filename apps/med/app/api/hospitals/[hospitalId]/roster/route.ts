import { NextRequest, NextResponse } from 'next/server'
import { getHospitalNurseRoster } from '@/lib/db/progress'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const roster = await getHospitalNurseRoster(hospitalId)
    return NextResponse.json({ success: true, data: roster })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
