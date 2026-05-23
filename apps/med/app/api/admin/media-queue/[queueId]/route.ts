import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'

type RouteContext = {
  params: Promise<{ queueId: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { queueId } = await context.params
    const body = await req.json()
    const outputUrl = typeof body.output_url === 'string' ? body.output_url.trim() : ''
    const status = body.status === 'complete' ? 'complete' : null

    if (!status || !outputUrl || outputUrl.length > 2000) {
      return NextResponse.json({ error: 'output_url and status=complete required' }, { status: 400 })
    }

    try {
      new URL(outputUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid output_url' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data: item, error: fetchError } = await db
      .from('media_queue')
      .select('id, step_id, status')
      .eq('id', queueId)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!item.step_id) {
      return NextResponse.json({ error: 'Queue item has no step' }, { status: 400 })
    }

    const { error: queueError } = await db
      .from('media_queue')
      .update({
        status: 'complete',
        output_url: outputUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)

    if (queueError) throw queueError

    const { data: step, error: stepFetchError } = await db
      .from('nursed_lesson_steps')
      .select('config')
      .eq('id', item.step_id)
      .single()

    if (stepFetchError) throw stepFetchError

    const config = (step?.config && typeof step.config === 'object' && !Array.isArray(step.config))
      ? { ...(step.config as Record<string, unknown>) }
      : {}

    const { error: stepError } = await db
      .from('nursed_lesson_steps')
      .update({
        config: { ...config, videoUrl: outputUrl },
      })
      .eq('id', item.step_id)

    if (stepError) throw stepError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/media-queue PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
