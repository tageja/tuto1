import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, course_id, hospital_id } = body

    if (!user_id || !course_id) {
      return NextResponse.json({ success: false, error: 'user_id and course_id are required' }, { status: 400 })
    }

    const db = getServiceClient()
    const { data, error } = await db
      .from('nursed_enrollments')
      .upsert(
        { user_id, course_id, hospital_id: hospital_id ?? null, status: 'active' },
        { onConflict: 'user_id,course_id' }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
