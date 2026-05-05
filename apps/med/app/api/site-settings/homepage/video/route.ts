import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const KEY = 'homepage'
const BUCKET = 'nursed-assets'
const PUBLIC_PREFIX_REGEX = /\/storage\/v1\/object\/public\/[^/]+\//

export async function DELETE() {
  try {
    const db = getServiceClient()

    const { data: row } = await db
      .from('nursed_site_settings')
      .select('value')
      .eq('key', KEY)
      .maybeSingle()

    const current = (row?.value as { intro_video_url?: string | null } | null) ?? null
    const url = current?.intro_video_url ?? null

    if (url) {
      const match = url.match(PUBLIC_PREFIX_REGEX)
      if (match) {
        const path = url.slice((match.index ?? 0) + match[0].length)
        await db.storage.from(BUCKET).remove([path]).catch(() => undefined)
      }
    }

    const next = { ...(current ?? {}), intro_video_url: null }
    const { error } = await db
      .from('nursed_site_settings')
      .upsert({ key: KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
