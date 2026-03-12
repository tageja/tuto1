/**
 * Patch transcriptSegments for the pilot "First emergency contact" dialogue.
 * Run via: POST /api/seed/patch-transcript-segments
 * Body: { courseId?: string } — if courseId provided, patches module 1 lesson 1 step 2; else finds by transcript content
 */

import { getServiceClient } from '../supabase'

const PILOT_TRANSCRIPT_MARKERS = [
  'I am here to help',
  'My chest',
  'it hurts',
  'get help immediately',
]

const PILOT_SEGMENTS = [
  { en: 'Hello', vi: 'Xin chào' },
  { en: 'I am here to help you', vi: 'Tôi ở đây để giúp bạn' },
  { en: 'What happened?', vi: 'Chuyện gì đã xảy ra?' },
  { en: 'Patient:', vi: 'Bệnh nhân:' },
  { en: 'My chest', vi: 'Ngực tôi' },
  { en: 'it hurts so much', vi: 'đau rất nhiều' },
  { en: 'Nurse:', vi: 'Điều dưỡng:' },
  { en: 'I understand', vi: 'Tôi hiểu' },
  { en: 'Can you tell me where exactly it hurts?', vi: 'Bạn có thể nói cho tôi biết chính xác chỗ nào đau không?' },
  { en: 'Here?', vi: 'Ở đây?' },
  { en: 'Yes, here', vi: 'Vâng, ở đây' },
  { en: 'And my left arm', vi: 'Và cánh tay trái của tôi' },
  { en: 'Okay', vi: 'Được rồi' },
  { en: 'Please sit down right here', vi: 'Xin mời ngồi ngay đây' },
  { en: 'I will get help immediately', vi: 'Tôi sẽ gọi trợ giúp ngay lập tức' },
  { en: 'What are your symptoms?', vi: 'Triệu chứng của bạn là gì?' },
]

function transcriptMatches(transcript: string | null | undefined): boolean {
  if (!transcript || typeof transcript !== 'string') return false
  const t = transcript.toLowerCase()
  const matchCount = PILOT_TRANSCRIPT_MARKERS.filter((m) => t.includes(m.toLowerCase())).length
  return matchCount >= 2
}

async function patchStep(db: ReturnType<typeof getServiceClient>, stepId: string): Promise<boolean> {
  const { data: step, error: fetchErr } = await db
    .from('nursed_lesson_steps')
    .select('id, type, config')
    .eq('id', stepId)
    .single()

  if (fetchErr || !step || step.type !== 'audio_shadow') return false

  const config = step.config as Record<string, unknown> | null
  if (!config) return false

  if (Array.isArray(config.transcriptSegments) && config.transcriptSegments.length > 0) {
    return false
  }

  const newConfig = { ...config, transcriptSegments: PILOT_SEGMENTS }
  const { error: updateErr } = await db
    .from('nursed_lesson_steps')
    .update({ config: newConfig })
    .eq('id', stepId)

  return !updateErr
}

export async function patchTranscriptSegments(courseId?: string) {
  const db = getServiceClient()

  // Option 1: Patch module 1, lesson 1, step 2 by courseId
  if (courseId) {
    const { data: mod } = await db
      .from('nursed_modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('order_index', 1)
      .maybeSingle()

    if (mod) {
      const { data: lesson } = await db
        .from('nursed_lessons')
        .select('id')
        .eq('module_id', mod.id)
        .eq('order_index', 1)
        .maybeSingle()

      if (lesson) {
        const { data: step } = await db
          .from('nursed_lesson_steps')
          .select('id')
          .eq('lesson_id', lesson.id)
          .eq('order_index', 2)
          .maybeSingle()

        if (step) {
          const ok = await patchStep(db, step.id)
          if (ok) return { updated: 1, message: 'Patched module 1 lesson 1 step 2' }
        }
      }
    }
  }

  // Option 2: Find by transcript content
  const { data: steps, error } = await db
    .from('nursed_lesson_steps')
    .select('id, type, config')
    .eq('type', 'audio_shadow')

  if (error) throw error
  if (!steps?.length) return { updated: 0, message: 'No audio_shadow steps found' }

  let updated = 0
  for (const step of steps) {
    const config = step.config as Record<string, unknown> | null
    if (!config) continue

    const transcript = (config.transcript ?? config.transcriptEn) as string | undefined
    if (!transcriptMatches(transcript)) continue

    if (Array.isArray(config.transcriptSegments) && config.transcriptSegments.length > 0) {
      continue
    }

    const newConfig = { ...config, transcriptSegments: PILOT_SEGMENTS }
    const { error: updateErr } = await db
      .from('nursed_lesson_steps')
      .update({ config: newConfig })
      .eq('id', step.id)

    if (!updateErr) updated++
  }

  return { updated, message: `Patched ${updated} step(s) with transcriptSegments` }
}
