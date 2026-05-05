import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const BUCKET = 'nursed-assets'

export async function GET(req: NextRequest) {
  try {
    const ext = (req.nextUrl.searchParams.get('ext') ?? 'mp4').toLowerCase()
    if (!['mp4', 'webm', 'mov'].includes(ext)) {
      return NextResponse.json({ error: 'Only mp4, webm, mov accepted' }, { status: 400 })
    }

    const storagePath = `site/homepage/intro-video.${ext}`
    const db = getServiceClient()

    const { data, error } = await db.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath, { upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
      publicUrl: urlData.publicUrl,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
