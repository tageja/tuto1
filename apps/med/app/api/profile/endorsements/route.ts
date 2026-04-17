import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()
    const { data, error } = await db
      .from('nursed_endorsements')
      .select('message, created_at, nursed_profiles!from_user_id(full_name)')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    type EndorsementRow = {
      message: string
      created_at: string
      nursed_profiles: { full_name: string | null } | Array<{ full_name: string | null }> | null
    }
    const result = (data as EndorsementRow[] ?? []).map(e => {
      const profileRef = e.nursed_profiles
      const from_name = Array.isArray(profileRef)
        ? (profileRef[0]?.full_name ?? null)
        : (profileRef?.full_name ?? null)
      return { from_name, message: e.message, created_at: e.created_at }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[GET /api/profile/endorsements]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
