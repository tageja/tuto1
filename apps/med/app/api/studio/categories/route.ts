import { NextResponse } from 'next/server'
import { createSupabaseServiceServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('course_categories')
      .select('*')
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[studio/categories GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
