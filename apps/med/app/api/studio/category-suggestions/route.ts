import { NextRequest, NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export async function GET() {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await createSupabaseServiceServerClient()
    let query = db
      .from('course_category_suggestions')
      .select('*')
      .order('created_at', { ascending: false })

    if (profile.role !== 'super_admin') {
      query = query.eq('creator_id', user.id)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[studio/category-suggestions GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const suggestedPath = cleanText(body.suggested_path, 240)
    const suggestedName = cleanText(body.suggested_name, 120)
    const reason = cleanText(body.reason, 500) || null
    const parentId = cleanText(body.parent_id, 80) || null

    if (!suggestedPath || !suggestedName) {
      return NextResponse.json({ error: 'Suggested path and name are required' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('course_category_suggestions')
      .insert({
        creator_id: user.id,
        parent_id: parentId,
        suggested_path: suggestedPath,
        suggested_name: suggestedName,
        reason,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('[studio/category-suggestions POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
