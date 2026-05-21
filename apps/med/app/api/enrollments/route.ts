import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const PILOT_INTEREST_SURVEY_ID = 'course_enrollment_interest_2026'
const HCMUTE_PILOT_COURSE_KEY = 'hcmute-technical-presentation'
const HCMUTE_PILOT_SPOT_LIMIT = 50

type PilotInterestPayload = {
  mode: 'pilot_interest'
  courseKey?: string
  courseTitle?: string
  intent?: 'pilot' | 'interest'
  name?: string
  email?: string
  phone?: string
  major?: string
  source?: string
}

const VALID_PILOT_INTENTS = new Set(['pilot', 'interest'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body?.mode === 'pilot_interest') {
      return createPilotInterest(req, body as PilotInterestPayload)
    }

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

async function createPilotInterest(req: NextRequest, body: PilotInterestPayload) {
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const courseKey = body.courseKey?.trim()
  const courseTitle = body.courseTitle?.trim()
  const intent = body.intent ?? 'interest'

  if (!name) {
    return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
  }

  if (!courseKey || !courseTitle) {
    return NextResponse.json({ success: false, error: 'Course is required' }, { status: 400 })
  }

  if (!VALID_PILOT_INTENTS.has(intent)) {
    return NextResponse.json({ success: false, error: 'Invalid enrollment intent' }, { status: 400 })
  }

  const db = getServiceClient()

  // Enforce spot limit for the HCMUTE pilot course
  if (intent === 'pilot' && courseKey === HCMUTE_PILOT_COURSE_KEY) {
    const { count, error: countError } = await db
      .from('nursed_survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', PILOT_INTEREST_SURVEY_ID)
      .filter('answers->>course_key', 'eq', HCMUTE_PILOT_COURSE_KEY)
      .filter('answers->>intent', 'eq', 'pilot')

    if (countError) {
      console.error('[enrollments spot-check]', countError)
    } else if ((count ?? 0) >= HCMUTE_PILOT_SPOT_LIMIT) {
      return NextResponse.json(
        { success: false, error: 'SPOTS_FULL', spotsLeft: 0 },
        { status: 409 }
      )
    }
  }

  const { data, error } = await db
    .from('nursed_survey_responses')
    .insert({
      survey_id: PILOT_INTEREST_SURVEY_ID,
      name,
      email,
      age: null,
      gender: null,
      phone: body.phone?.trim() || null,
      answers: {
        course_key: courseKey,
        course_title: courseTitle,
        intent,
        major: body.major?.trim() || null,
        source: body.source?.trim() || 'homepage',
        captured_from: 'professional_paths_homepage',
        user_agent: req.headers.get('user-agent'),
      },
    })
    .select('id')
    .single()

  if (error) {
    console.error('[enrollments pilot_interest]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
