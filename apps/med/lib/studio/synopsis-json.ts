import { courseSynopsisSchema } from '@/lib/studio/schemas'
import type { CourseSynopsis } from '@/lib/studio/types'

export function extractJsonObject(text: string): unknown | null {
  const cleaned = text
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim()

  const start = cleaned.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') depth += 1
    if (char === '}') depth -= 1

    if (depth === 0) {
      try {
        return JSON.parse(cleaned.slice(start, index + 1))
      } catch {
        return null
      }
    }
  }

  return null
}

export function extractCourseSynopsis(text: string): CourseSynopsis | null {
  const json = extractJsonObject(text)
  const parsed = courseSynopsisSchema.safeParse(json)
  return parsed.success ? (parsed.data as CourseSynopsis) : null
}

export function removeJsonObject(text: string) {
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  if (start === -1) return cleaned

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') depth += 1
    if (char === '}') depth -= 1

    if (depth === 0) {
      return `${cleaned.slice(0, start)}${cleaned.slice(index + 1)}`.trim()
    }
  }

  return cleaned
}
