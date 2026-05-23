import { NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await createSupabaseServiceServerClient()
    const { count, error } = await db
      .from('nursed_courses')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'submitted')

    if (error) throw error

    return NextResponse.json({ success: true, count: count ?? 0 })
  } catch (err) {
    console.error('[admin/courses/pending-count GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
