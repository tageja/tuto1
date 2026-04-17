import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type LearningIntensity = 'mini' | 'deep'
type PreferredDays = 'everyday' | 'weekdays' | 'weekends'

const VALID_INTENSITIES: LearningIntensity[] = ['mini', 'deep']
const VALID_DAYS: PreferredDays[] = ['everyday', 'weekdays', 'weekends']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const intensity: LearningIntensity = body.intensity
    const preferredDays: PreferredDays = body.preferred_days

    if (!VALID_INTENSITIES.includes(intensity)) {
      return NextResponse.json({ error: 'Invalid intensity value' }, { status: 400 })
    }
    if (!VALID_DAYS.includes(preferredDays)) {
      return NextResponse.json({ error: 'Invalid preferred_days value' }, { status: 400 })
    }

    const { error } = await supabase
      .from('nursed_profiles')
      .update({
        learning_intensity: intensity,
        preferred_days: preferredDays,
        onboarding_done: true,
        schedule_set_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('[profile/preferences]', error)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[profile/preferences]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
