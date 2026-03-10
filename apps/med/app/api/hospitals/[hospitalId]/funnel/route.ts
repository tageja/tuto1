import { NextRequest, NextResponse } from 'next/server'
import { getHospitalCourseFunnel } from '@/lib/db/progress'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const funnel = await getHospitalCourseFunnel(hospitalId)
    return NextResponse.json({ success: true, data: funnel })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
