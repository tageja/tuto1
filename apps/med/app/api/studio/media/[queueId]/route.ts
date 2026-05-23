import { NextRequest, NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'

type RouteContext = {
  params: Promise<{ queueId: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { queueId } = await context.params
    const body = await req.json()
    const creatorNotes = typeof body.creator_notes === 'string'
      ? body.creator_notes.trim()
      : ''

    if (!creatorNotes || creatorNotes.length > 2000) {
      return NextResponse.json({ error: 'creator_notes must be 1–2000 characters' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data: item, error: fetchError } = await db
      .from('media_queue')
      .select('id, creator_id, status')
      .eq('id', queueId)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (item.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (item.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending requests can be submitted' }, { status: 409 })
    }

    const { error } = await db
      .from('media_queue')
      .update({
        status: 'submitted',
        creator_notes: creatorNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[studio/media PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
