import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const KNOWN_ROLES = ['Charge Nurse', 'Head Nurse', 'Supervisor', 'Doctor', 'Family', 'Patient', 'Nurse']

function parseScriptToLines(script: string): Array<{ role: string; text: string }> {
  const rawLines = script.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const result: Array<{ role: string; text: string }> = []
  for (const line of rawLines) {
    let matched = false
    for (const role of KNOWN_ROLES) {
      if (line.startsWith(`${role}:`)) {
        result.push({ role: role.toLowerCase(), text: line.slice(role.length + 1).trim() })
        matched = true
        break
      }
    }
    if (!matched && result.length > 0) {
      result[result.length - 1].text += ' ' + line
    }
  }
  return result
}

async function translateEnToVi(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return text
    const data = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number }
    const translated = data.responseData?.translatedText
    // MyMemory returns the source text on error
    if (!translated || translated === text || data.responseStatus === 403) return text
    return translated
  } catch {
    return text
  }
}

// Small delay to avoid rate limiting
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(req: NextRequest) {
  try {
    const { courseId, stepTypes = ['script_read'] } = await req.json()
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

    const db = getServiceClient()

    const { data: steps, error } = await db
      .from('nursed_lesson_steps')
      .select(`
        id, type, config,
        nursed_lessons!inner(nursed_modules!inner(course_id))
      `)
      .in('type', stepTypes)
      .eq('nursed_lessons.nursed_modules.course_id', courseId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!steps?.length) return NextResponse.json({ processed: 0, skipped: 0, errors: [] })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    for (const step of steps) {
      const cfg = step.config as Record<string, unknown> ?? {}

      // Get lines from either array or script string
      let lines = cfg.lines as Array<{ role: string; text: string; text_vi?: string }> | undefined
      const fromScript = !lines?.length && cfg.script
        ? parseScriptToLines(cfg.script as string)
        : null

      const sourceLines = lines?.length ? lines : fromScript ?? []
      if (!sourceLines.length) { skipped++; continue }

      // Check if all lines already have vi translations
      const alreadyDone = sourceLines.every((_, i) => !!cfg[`line_${i}_vi`])
      if (alreadyDone) { skipped++; continue }

      const updatedConfig = { ...cfg }
      let anyTranslated = false

      for (let i = 0; i < sourceLines.length; i++) {
        const line = sourceLines[i]
        const viKey = `line_${i}_vi`

        // Skip if already translated
        if (cfg[viKey]) continue

        try {
          const vi = await translateEnToVi(line.text)
          if (vi && vi !== line.text) {
            updatedConfig[viKey] = vi
            anyTranslated = true
          }
          await delay(300) // ~3 req/sec to stay within free tier
        } catch (err) {
          errors.push(`Step ${step.id} line ${i}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      if (anyTranslated) {
        const { error: updateErr } = await db
          .from('nursed_lesson_steps')
          .update({ config: updatedConfig })
          .eq('id', step.id)

        if (updateErr) {
          errors.push(`Step ${step.id} update: ${updateErr.message}`)
        } else {
          processed++
        }
      } else {
        skipped++
      }
    }

    return NextResponse.json({ processed, skipped, errors, total: steps.length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// GET: preview how many lines need translation
export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const db = getServiceClient()
  const { data: steps, error } = await db
    .from('nursed_lesson_steps')
    .select(`id, type, config, nursed_lessons!inner(nursed_modules!inner(course_id))`)
    .in('type', ['script_read'])
    .eq('nursed_lessons.nursed_modules.course_id', courseId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let totalLines = 0
  let translatedLines = 0

  for (const step of steps ?? []) {
    const cfg = step.config as Record<string, unknown> ?? {}
    const lines = cfg.lines as Array<unknown> | undefined
    const fromScript = !lines?.length && cfg.script
      ? parseScriptToLines(cfg.script as string)
      : null
    const sourceLines = lines?.length ? lines : fromScript ?? []
    totalLines += sourceLines.length
    for (let i = 0; i < sourceLines.length; i++) {
      if (cfg[`line_${i}_vi`]) translatedLines++
    }
  }

  return NextResponse.json({
    totalSteps: steps?.length ?? 0,
    totalLines,
    translatedLines,
    pendingLines: totalLines - translatedLines,
  })
}
