import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const FISH_AUDIO_API = 'https://api.fish.audio/v1/tts'
const BUCKET = 'nursed-assets'

const VOICE_IDS: Record<string, string> = {
  nurse: process.env.FISH_AUDIO_VOICE_NURSE ?? '',
  patient: process.env.FISH_AUDIO_VOICE_PATIENT ?? '',
  doctor: process.env.FISH_AUDIO_VOICE_NURSE ?? '',
}

async function generateAndUpload(
  text: string,
  voice: string,
  storagePath: string,
  apiKey: string,
): Promise<string> {
  const referenceId = VOICE_IDS[voice] ?? VOICE_IDS.nurse
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
    }),
  })

  if (!ttsRes.ok) {
    const err = await ttsRes.text()
    throw new Error(`fish.audio: ${err}`)
  }

  const audioBuffer = await ttsRes.arrayBuffer()
  const db = getServiceClient()

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

  if (uploadError) throw new Error(`Upload: ${uploadError.message}`)

  const { data } = db.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

function extractAudioTasks(step: {
  id: string
  type: string
  config: Record<string, unknown> | null
}): Array<{ text: string; voice: string; field: string; storagePath: string }> {
  const cfg = step.config ?? {}
  const tasks: Array<{ text: string; voice: string; field: string; storagePath: string }> = []

  const isPlaceholder = (val: unknown) =>
    !val || val === 'PLACEHOLDER' || val === '' || val === 'PLACEHOLDER_URL'

  if (step.type === 'scenario_intro') {
    const contextEn = cfg.context_en as string | undefined
    if (contextEn?.trim() && isPlaceholder(cfg.audio_url)) {
      tasks.push({
        text: contextEn,
        voice: 'nurse',
        field: 'audio_url',
        storagePath: `audio/${step.id}/audio_url.mp3`,
      })
    }
    // Key phrases — generate individual audio per phrase
    const keyPhrases = cfg.key_phrases as Array<{ en: string; vi: string }> | undefined
    if (keyPhrases?.length) {
      keyPhrases.forEach((phrase, i) => {
        const fieldKey = `key_phrase_${i}_audioUrl`
        if (phrase.en?.trim() && isPlaceholder((cfg as Record<string, unknown>)[fieldKey])) {
          tasks.push({
            text: phrase.en,
            voice: 'nurse',
            field: fieldKey,
            storagePath: `audio/${step.id}/key_phrase_${i}.mp3`,
          })
        }
      })
    }
  }

  if (step.type === 'audio_shadow') {
    const transcript = (cfg.transcript ?? cfg.transcriptEn) as string | undefined
    if (transcript?.trim() && isPlaceholder(cfg.audioUrl)) {
      tasks.push({
        text: transcript,
        voice: 'nurse',
        field: 'audioUrl',
        storagePath: `audio/${step.id}/audioUrl.mp3`,
      })
    }
  }

  if (step.type === 'script_read') {
    // Support both {lines: [{role,text}]} array AND {script: "Role: text\n..."} string
    let lines = cfg.lines as Array<{ role: string; text: string }> | undefined

    if (!lines?.length && cfg.script) {
      const KNOWN_ROLES = ['Charge Nurse', 'Head Nurse', 'Supervisor', 'Doctor', 'Family', 'Patient', 'Nurse']
      lines = (cfg.script as string).split(/\n/).map((l: string) => l.trim()).filter(Boolean).reduce(
        (acc: Array<{ role: string; text: string }>, line: string) => {
          for (const role of KNOWN_ROLES) {
            if (line.startsWith(`${role}:`)) {
              acc.push({ role: role.toLowerCase(), text: line.slice(role.length + 1).trim() })
              return acc
            }
          }
          if (acc.length > 0) acc[acc.length - 1].text += ' ' + line
          return acc
        },
        []
      )
    }

    if (lines?.length) {
      lines.forEach((line, i) => {
        const fieldKey = `line_${i}_audioUrl`
        if (line.text?.trim() && isPlaceholder((cfg as Record<string, unknown>)[fieldKey])) {
          const r = line.role?.toLowerCase() ?? ''
          const voice = r.includes('patient') ? 'patient'
            : r.includes('doctor') ? 'doctor'
            : 'nurse'
          tasks.push({
            text: line.text,
            voice,
            field: fieldKey,
            storagePath: `audio/${step.id}/line_${i}.mp3`,
          })
        }
      })
    }
  }

  return tasks
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FISH_AUDIO_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { courseId, stepTypes = ['scenario_intro', 'audio_shadow'] } = await req.json()

    const db = getServiceClient()

    // Fetch all steps for the course matching requested types
    const { data: steps, error } = await db
      .from('nursed_lesson_steps')
      .select(`
        id, type, config,
        nursed_lessons!inner(
          nursed_modules!inner(course_id)
        )
      `)
      .in('type', stepTypes)
      .eq('nursed_lessons.nursed_modules.course_id', courseId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!steps?.length) return NextResponse.json({ processed: 0, skipped: 0, errors: [] })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    for (const step of steps) {
      const tasks = extractAudioTasks(step as { id: string; type: string; config: Record<string, unknown> })

      if (!tasks.length) {
        skipped++
        continue
      }

      const updatedConfig = { ...(step.config as Record<string, unknown> ?? {}) }
      let anyGenerated = false

      for (const task of tasks) {
        try {
          const url = await generateAndUpload(task.text, task.voice, task.storagePath, apiKey)
          updatedConfig[task.field] = url
          anyGenerated = true
        } catch (err) {
          errors.push(`Step ${step.id} field ${task.field}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      if (anyGenerated) {
        await db.from('nursed_lesson_steps').update({ config: updatedConfig }).eq('id', step.id)
        processed++
      }
    }

    return NextResponse.json({ processed, skipped, errors, total: steps.length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// GET — preview what would be generated without actually generating
export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const db = getServiceClient()
  const { data: steps, error } = await db
    .from('nursed_lesson_steps')
    .select(`
      id, type, config,
      nursed_lessons!inner(
        title,
        nursed_modules!inner(title, course_id)
      )
    `)
    .in('type', ['scenario_intro', 'audio_shadow', 'script_read'])
    .eq('nursed_lessons.nursed_modules.course_id', courseId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const preview = (steps ?? []).map((s) => ({
    id: s.id,
    type: s.type,
    tasks: extractAudioTasks(s as { id: string; type: string; config: Record<string, unknown> }),
  })).filter((s) => s.tasks.length > 0)

  return NextResponse.json({ total: preview.length, steps: preview })
}
