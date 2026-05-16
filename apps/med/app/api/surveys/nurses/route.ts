import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const SURVEY_ID = 'nurses_2026'

// ─── POST — public (no auth required) ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, email, age, gender, phone, answers } = body as {
      name?: string
      email?: string
      age?: number | null
      gender?: string | null
      phone?: string | null
      answers?: Record<string, unknown>
    }

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    const db = getServiceClient()
    const { data, error } = await db
      .from('nursed_survey_responses')
      .insert({
        survey_id: SURVEY_ID,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: age ?? null,
        gender: gender ?? null,
        phone: phone?.trim() || null,
        answers,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[surveys/nurses POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[surveys/nurses POST]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// ─── GET — super_admin only ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()
    const { data: profile } = await db
      .from('nursed_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = req.nextUrl
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200)
    const from = (page - 1) * limit

    const { data, error, count } = await db
      .from('nursed_survey_responses')
      .select('*', { count: 'exact' })
      .eq('survey_id', SURVEY_ID)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data, total: count ?? 0, page, limit })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
