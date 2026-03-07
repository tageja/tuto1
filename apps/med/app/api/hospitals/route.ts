import { NextRequest, NextResponse } from 'next/server'
import { getHospitals, createHospital } from '@/lib/db/hospitals'
import { getHospitalAnalytics } from '@/lib/db/progress'

export async function GET(req: NextRequest) {
  try {
    const analytics = req.nextUrl.searchParams.get('analytics')
    const hospitalId = req.nextUrl.searchParams.get('hospitalId')

    if (analytics === 'true' && hospitalId) {
      const data = await getHospitalAnalytics(hospitalId)
      return NextResponse.json({ data })
    }

    const hospitals = await getHospitals()
    return NextResponse.json({ data: hospitals })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const hospital = await createHospital(body)
    return NextResponse.json({ data: hospital }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
