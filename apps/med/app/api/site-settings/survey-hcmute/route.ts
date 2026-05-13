import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const KEY = 'hcmute_survey'

export type HcmuteSurveySettings = {
  voucher_image_url: string | null
  voucher_title: string | null
  is_active: boolean
}

const DEFAULT: HcmuteSurveySettings = {
  voucher_image_url: null,
  voucher_title: null,
  is_active: true,
}

export async function GET() {
  try {
    const db = getServiceClient()
    const { data, error } = await db
      .from('nursed_site_settings')
      .select('value, updated_at')
      .eq('key', KEY)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const value = (data?.value as HcmuteSurveySettings | null) ?? DEFAULT
    return NextResponse.json({ data: value, updated_at: data?.updated_at ?? null })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<HcmuteSurveySettings>
    const db = getServiceClient()

    const { data: existing } = await db
      .from('nursed_site_settings')
      .select('value')
      .eq('key', KEY)
      .maybeSingle()

    const merged: HcmuteSurveySettings = {
      ...(existing?.value as HcmuteSurveySettings | null ?? DEFAULT),
      ...body,
    }

    const { error } = await db
      .from('nursed_site_settings')
      .upsert({ key: KEY, value: merged, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: merged })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
