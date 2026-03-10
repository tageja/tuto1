import { NextRequest, NextResponse } from 'next/server'
import { getHospitalOverview } from '@/lib/db/progress'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const overview = await getHospitalOverview(hospitalId)
    return NextResponse.json({ success: true, data: overview })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
