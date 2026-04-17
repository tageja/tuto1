import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getFullProfile, updateProfile } from '@/lib/db/profile'

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await getFullProfile(user.id)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const patch: Record<string, string> = {}

    if (typeof body.full_name === 'string') {
      if (body.full_name.length > 100) return NextResponse.json({ error: 'Name too long' }, { status: 400 })
      patch.full_name = body.full_name.trim()
    }
    if (typeof body.position === 'string') {
      if (body.position.length > 100) return NextResponse.json({ error: 'Position too long' }, { status: 400 })
      patch.position = body.position.trim()
    }
    if (typeof body.bio === 'string') {
      if (body.bio.length > 500) return NextResponse.json({ error: 'Bio too long' }, { status: 400 })
      patch.bio = body.bio.trim()
    }
    if (typeof body.date_of_birth === 'string') {
      patch.date_of_birth = body.date_of_birth
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await updateProfile(user.id, patch)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/profile]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
