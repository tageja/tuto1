import { NextRequest, NextResponse } from 'next/server'
import { getHospitalSpeakingStats } from '@/lib/db/progress'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const stats = await getHospitalSpeakingStats(hospitalId)
    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
