import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const PILOT_COURSE_KEY = 'hcmute-technical-presentation'
const PILOT_TOTAL_SPOTS = 50

export async function GET() {
  try {
    const db = getServiceClient()

    const { count, error } = await db
      .from('nursed_survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', 'course_enrollment_interest_2026')
      .filter('answers->>course_key', 'eq', PILOT_COURSE_KEY)
      .filter('answers->>intent', 'eq', 'pilot')

    if (error) throw error

    const taken = count ?? 0
    const spotsLeft = Math.max(0, PILOT_TOTAL_SPOTS - taken)

    return NextResponse.json({
      success: true,
      data: {
        taken,
        total: PILOT_TOTAL_SPOTS,
        spotsLeft,
        isFull: spotsLeft === 0,
      },
    })
  } catch (err) {
    console.error('[pilot-spots GET]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
