import { NextRequest, NextResponse } from 'next/server'
import { getHospitalById, updateHospital } from '@/lib/db/hospitals'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const hospital = await getHospitalById(hospitalId)
    return NextResponse.json({ data: hospital })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params
    const body = await req.json()
    const hospital = await updateHospital(hospitalId, body)
    return NextResponse.json({ data: hospital })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
