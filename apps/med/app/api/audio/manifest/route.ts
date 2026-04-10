import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import type { AnimationSegment } from '@/components/animations/types'

const FISH_AUDIO_API = 'https://api.fish.audio/v1/tts'
const BUCKET = 'nursed-assets'

const VOICE_MAP: Record<string, string> = {
  nurse:   process.env.FISH_AUDIO_VOICE_NURSE   ?? '',
  patient: process.env.FISH_AUDIO_VOICE_PATIENT ?? '',
  doctor:  process.env.FISH_AUDIO_VOICE_NURSE   ?? '',
  family:  process.env.FISH_AUDIO_VOICE_PATIENT ?? '',
  default: process.env.FISH_AUDIO_VOICE_NURSE   ?? '',
}

async function generateSegmentAudio(
  segment: AnimationSegment,
  segIdx: number,
  stepId: string,
  apiKey: string,
  db: ReturnType<typeof getServiceClient>
): Promise<AnimationSegment> {
  // Skip if audio already exists
  if (segment.audioUrl) return segment

  const voiceId = VOICE_MAP[segment.speaker] ?? VOICE_MAP.default
  if (!voiceId) {
    console.warn(`No voice ID for speaker: ${segment.speaker}`)
    return segment
  }

  const ttsRes = await fetch(FISH_AUDIO_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      model: 's2-pro',
    },
    body: JSON.stringify({
      text: segment.text,
      reference_id: voiceId,
      format: 'mp3',
      mp3_bitrate: 128,
      latency: 'normal',
    }),
  })

  if (!ttsRes.ok) {
    console.error(`Fish Audio error for segment ${segIdx}: ${await ttsRes.text()}`)
    return segment
  }

  const audioBuffer = await ttsRes.arrayBuffer()
  const storagePath = `animation/${stepId}/seg_${segIdx}_${segment.speaker}.mp3`

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

  if (uploadError) {
    console.error(`Upload error for segment ${segIdx}:`, uploadError.message)
    return segment
  }

  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
  return { ...segment, audioUrl: urlData.publicUrl }
}

/**
 * POST /api/audio/manifest
 * Body: { stepId, segments: AnimationSegment[], scene_setting, characters }
 * Generates Fish Audio for each segment (if missing), builds manifest, saves to step.config.animation_manifest
 */
export async function POST(req: NextRequest) {
  try {
    const { stepId, segments, scene_setting, characters } = await req.json()

    if (!stepId || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'stepId and segments[] are required' }, { status: 400 })
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'FISH_AUDIO_API_KEY not configured' }, { status: 500 })
    }

    const db = getServiceClient()

    // Generate audio for each segment (sequential to avoid rate limits)
    const enrichedSegments: AnimationSegment[] = []
    for (let i = 0; i < segments.length; i++) {
      const enriched = await generateSegmentAudio(segments[i], i, stepId, apiKey, db)
      enrichedSegments.push(enriched)
    }

    // Build manifest
    const manifest = {
      segments: enrichedSegments,
      scene_setting: scene_setting ?? 'Hospital',
      characters: characters ?? Array.from(new Set(segments.map((s: AnimationSegment) => s.speaker))),
    }

    // Fetch existing config
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
      animation_manifest: manifest,
    }

    const { error: updateErr } = await db
      .from('nursed_lesson_steps')
      .update({ config: updatedConfig })
      .eq('id', stepId)

    if (updateErr) {
      return NextResponse.json({ error: `Config update failed: ${updateErr.message}` }, { status: 500 })
    }

    const generated = enrichedSegments.filter(s => s.audioUrl).length
    return NextResponse.json({ success: true, manifest, generated, total: segments.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
