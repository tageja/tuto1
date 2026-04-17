import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getMonthActivityDates } from '@/lib/db/rewards'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const yearParam  = searchParams.get('year')
  const monthParam = searchParams.get('month') // 0-based from client

  const year  = yearParam  ? parseInt(yearParam,  10) : undefined
  const month = monthParam ? parseInt(monthParam, 10) : undefined

  try {
    const cookieStore = await cookies()
    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dates = await getMonthActivityDates(user.id, year, month)
    return NextResponse.json({ success: true, dates })
  } catch (err) {
    console.error('[calendar/activity]', err)
    return NextResponse.json({ success: false, dates: [] })
  }
}
