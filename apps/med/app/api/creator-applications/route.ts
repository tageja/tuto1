import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'

const ORGANISATION_TYPES = ['hospital', 'university', 'company', 'independent', 'other'] as const

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export async function GET() {
  try {
    const { profile } = await getSessionAndProfile()
    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('creator_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[creator-applications GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const fullName = cleanText(body.full_name, 120)
    const profession = cleanText(body.profession, 120)
    const topicArea = cleanText(body.topic_area, 160)
    const whyCreate = cleanText(body.why_create, 1200)
    const organisation = cleanText(body.organisation, 160) || null
    const requestedType = cleanText(body.organisation_type, 40)
    const organisationType = ORGANISATION_TYPES.includes(requestedType as typeof ORGANISATION_TYPES[number])
      ? requestedType
      : null

    if (!fullName || !profession || !topicArea || whyCreate.length < 10) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('creator_applications')
      .insert({
        user_id: user.id,
        full_name: fullName,
        profession,
        organisation,
        organisation_type: organisationType,
        topic_area: topicArea,
        why_create: whyCreate,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('[creator-applications POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
