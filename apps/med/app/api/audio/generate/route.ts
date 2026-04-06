import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const FISH_AUDIO_API = 'https://api.fish.audio/v1/tts'
const BUCKET = 'nursed-assets'

const VOICE_MAP: Record<string, string> = {
  nurse: process.env.FISH_AUDIO_VOICE_NURSE ?? '',
  patient: process.env.FISH_AUDIO_VOICE_PATIENT ?? '',
  doctor: process.env.FISH_AUDIO_VOICE_NURSE ?? '',
  default: process.env.FISH_AUDIO_VOICE_NURSE ?? '',
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'nurse', stepId, field } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }
    if (!stepId || !field) {
      return NextResponse.json({ error: 'stepId and field are required' }, { status: 400 })
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'FISH_AUDIO_API_KEY not configured' }, { status: 500 })
    }

    const referenceId = VOICE_MAP[voice] ?? VOICE_MAP.default
    if (!referenceId) {
      return NextResponse.json({ error: `Voice ID not configured for: ${voice}` }, { status: 500 })
    }

    // Call fish.audio TTS API
    const ttsRes = await fetch(FISH_AUDIO_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        model: 's2-pro',
      },
      body: JSON.stringify({
        text,
        reference_id: referenceId,
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'normal',
      }),
    })

    if (!ttsRes.ok) {
      const errText = await ttsRes.text()
      return NextResponse.json({ error: `fish.audio error: ${errText}` }, { status: ttsRes.status })
    }

    const audioBuffer = await ttsRes.arrayBuffer()

    // Upload to Supabase Storage
    const db = getServiceClient()
    const storagePath = `audio/${stepId}/${field}.mp3`

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    // Persist URL back to step config
    const { data: step, error: fetchErr } = await db
      .from('nursed_lesson_steps')
      .select('config')
      .eq('id', stepId)
      .single()

    if (fetchErr || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const updatedConfig = {
      ...(step.config as Record<string, unknown> ?? {}),
      [field]: publicUrl,
    }

    const { error: updateErr } = await db
      .from('nursed_lesson_steps')
      .update({ config: updatedConfig })
      .eq('id', stepId)

    if (updateErr) {
      return NextResponse.json({ error: `Config update failed: ${updateErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, field, stepId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
