import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const BUCKET = 'nursed-assets'
const MAX_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB

/**
 * POST /api/video/upload
 * multipart/form-data:
 *   file     — video file (mp4 / webm)
 *   stepId   — nursed_lesson_steps.id to attach to
 *   stepType — optional: if 'video', update step type too (default keeps existing type)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const stepId = formData.get('stepId') as string | null
    const updateStepType = formData.get('updateStepType') === 'true'

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

    // Merge videoUrl into step config
    const updatedConfig = {
      ...(step.config as Record<string, unknown> ?? {}),
      videoUrl,
      heygen_video: true,
    }

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
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Next.js App Router streams multipart bodies natively — no bodyParser config needed
