import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import type { AnimationSegment } from '@/components/animations/types'

const BUCKET = 'nursed-assets'
const MAX_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB

// ── VTT helpers ──────────────────────────────────────────────────

function toVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const wholeS = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(wholeS).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

function buildViVtt(segments: AnimationSegment[]): string {
  const lines: string[] = ['WEBVTT', '']
  let t = 0.5 // 0.5 s lead-in

  segments.forEach((seg) => {
    const words = seg.text.split(/\s+/).length
    const dur = Math.max(1.8, words * 0.38)

    if (seg.vi_text) {
      lines.push(`${toVttTime(t)} --> ${toVttTime(t + dur)}`)
      lines.push(seg.vi_text)
      lines.push('')
    }
    t += dur + 0.35 // gap between lines
  })

  return lines.join('\n')
}

/**
 * GET /api/video/upload
 * Returns a Supabase Storage signed upload URL so the browser can upload
 * directly to Supabase without proxying the file through Vercel.
 * Query params: stepId, ext (default: mp4)
 */
export async function GET(req: NextRequest) {
  try {
    const stepId = req.nextUrl.searchParams.get('stepId')
    const ext = req.nextUrl.searchParams.get('ext')?.toLowerCase() ?? 'mp4'

    if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 })
    if (!['mp4', 'webm', 'mov'].includes(ext)) {
      return NextResponse.json({ error: 'Only mp4, webm, mov accepted' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: step, error: stepErr } = await db
      .from('nursed_lesson_steps')
      .select('id')
      .eq('id', stepId)
      .single()
    if (stepErr || !step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })

    const storagePath = `animation/${stepId}/heygen-video.${ext}`

    const { data, error } = await db.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath)
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

/**
 * POST /api/video/upload
 * multipart/form-data:
 *   file        — video file (mp4 / webm / mov)
 *   stepId      — nursed_lesson_steps.id to attach to
 *   updateStepType — 'true' → change step type to 'video'
 *   segments    — optional JSON string: AnimationSegment[] for auto VTT
 *
 * @deprecated Use GET /api/video/upload for signed URL + POST /api/video/link instead.
 * Kept for local dev compatibility only — Vercel's 4.5 MB body limit blocks large files.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const stepId = formData.get('stepId') as string | null
    const updateStepType = formData.get('updateStepType') === 'true'
    const segmentsJson = formData.get('segments') as string | null

    if (!file || !stepId) {
      return NextResponse.json({ error: 'file and stepId are required' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 200 MB.` },
        { status: 413 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
    if (!['mp4', 'webm', 'mov'].includes(ext)) {
      return NextResponse.json({ error: 'Only mp4, webm, mov files accepted.' }, { status: 400 })
    }

    const db = getServiceClient()

    // Verify step exists
    const { data: step, error: stepErr } = await db
      .from('nursed_lesson_steps')
      .select('config, type')
      .eq('id', stepId)
      .single()

    if (stepErr || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Upload to Supabase Storage
    const storagePath = `animation/${stepId}/heygen-video.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || 'video/mp4',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
    const videoUrl = urlData.publicUrl

    // Parse segments for VTT generation (from form data or existing manifest)
    let segments: AnimationSegment[] = []
    if (segmentsJson) {
      try { segments = JSON.parse(segmentsJson) } catch { /* ignore parse errors */ }
    }
    if (!segments.length) {
      // Fall back to segments already stored in the step's animation_manifest
      const manifest = (step.config as Record<string, unknown> | null)?.animation_manifest as { segments?: AnimationSegment[] } | undefined
      if (manifest?.segments?.length) segments = manifest.segments
    }

    const viVtt = segments.length ? buildViVtt(segments) : null

    // Merge videoUrl into step config
    const updatedConfig: Record<string, unknown> = {
      ...(step.config as Record<string, unknown> ?? {}),
      videoUrl,
      heygen_video: true,
    }
    if (viVtt) updatedConfig.subtitle_vtt_vi = viVtt

    const updatePayload: Record<string, unknown> = { config: updatedConfig }
    if (updateStepType) updatePayload.type = 'video'

    const { error: updateErr } = await db
      .from('nursed_lesson_steps')
      .update(updatePayload)
      .eq('id', stepId)

    if (updateErr) {
      return NextResponse.json(
        { error: `Step update failed: ${updateErr.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      fileSizeMb: (file.size / 1024 / 1024).toFixed(2),
      stepId,
      vttGenerated: !!viVtt,
      segmentsUsed: segments.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Next.js App Router streams multipart bodies natively — no bodyParser config needed
