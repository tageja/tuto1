import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import type { AnimationSegment } from '@/components/animations/types'

const BUCKET = 'nursed-assets'

function toVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const wholeS = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(wholeS).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

function buildViVtt(segments: AnimationSegment[]): string {
  const lines: string[] = ['WEBVTT', '']
  let t = 0.5
  segments.forEach((seg) => {
    const words = seg.text.split(/\s+/).length
    const dur = Math.max(1.8, words * 0.38)
    if (seg.vi_text) {
      lines.push(`${toVttTime(t)} --> ${toVttTime(t + dur)}`)
      lines.push(seg.vi_text)
      lines.push('')
    }
    t += dur + 0.35
  })
  return lines.join('\n')
}

/**
 * POST /api/video/link
 * Called after the browser has uploaded a video directly to Supabase Storage.
 * Updates the step config with videoUrl, optional VTT, and optionally changes step type.
 *
 * Body: { stepId, storagePath, updateStepType?, segments? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stepId, storagePath, updateStepType, segments } = body as {
      stepId: string
      storagePath: string
      updateStepType?: boolean
      segments?: AnimationSegment[]
    }

    if (!stepId || !storagePath) {
      return NextResponse.json({ error: 'stepId and storagePath are required' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: step, error: stepErr } = await db
      .from('nursed_lesson_steps')
      .select('config, type')
      .eq('id', stepId)
      .single()

    if (stepErr || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
    const videoUrl = urlData.publicUrl

    const viVtt = segments?.length ? buildViVtt(segments) : null

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
      return NextResponse.json({ error: `Step update failed: ${updateErr.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      vttGenerated: !!viVtt,
      segmentsUsed: segments?.length ?? 0,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
