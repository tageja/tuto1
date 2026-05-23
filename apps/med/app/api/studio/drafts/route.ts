import { NextRequest, NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'
import type { CourseSize, CourseTemplateId } from '@/lib/supabase'
import { COURSE_SIZE_MODULES, type CourseIntakeForm } from '@/lib/studio/types'
import { getCourseTemplate, normalizeTemplateId } from '@/lib/studio/templates'

const LEARNER_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
const LANGUAGES = ['en', 'vi', 'bilingual'] as const
const COURSE_SIZES: CourseSize[] = ['starter', 'standard', 'full']
const TEMPLATE_IDS: CourseTemplateId[] = [
  'professional_communication',
  'organisational_training',
  'student_english',
  'safety_procedures',
  'technical_skills',
  'customer_service',
]

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function parseReferenceImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .slice(0, 5)
}

function parseIntake(body: Record<string, unknown>): {
  intakeForm: CourseIntakeForm
  categoryId: string | null
  categorySuggestionId: string | null
  templateId: CourseTemplateId
} | null {
  const courseSize = COURSE_SIZES.includes(body.course_size as CourseSize)
    ? body.course_size as CourseSize
    : 'starter'
  const learnerLevel = LEARNER_LEVELS.includes(body.learner_level as typeof LEARNER_LEVELS[number])
    ? body.learner_level as CourseIntakeForm['learnerLevel']
    : 'beginner'
  const language = LANGUAGES.includes(body.language as typeof LANGUAGES[number])
    ? body.language as CourseIntakeForm['language']
    : 'bilingual'
  const rawTemplateId = TEMPLATE_IDS.includes(body.template_id as CourseTemplateId)
    ? body.template_id as CourseTemplateId
    : 'professional_communication'
  const templateId = normalizeTemplateId(rawTemplateId) as CourseTemplateId

  const profession = cleanText(body.profession, 120)
  const industry = cleanText(body.industry, 120)
  const topic = cleanText(body.topic, 160)
  const targetAgeGroup = cleanText(body.target_age_group, 120)
  const estimatedMinutes = Number(body.estimated_minutes_per_lesson)

  if (!profession || !industry || !topic || !targetAgeGroup) return null

  return {
    categoryId: cleanText(body.category_id, 80) || null,
    categorySuggestionId: cleanText(body.category_suggestion_id, 80) || null,
    templateId,
    intakeForm: {
      profession,
      industry,
      topic,
      subtopic: cleanText(body.subtopic, 160) || undefined,
      targetAgeGroup,
      learnerLevel,
      language,
      courseSize,
      numModules: COURSE_SIZE_MODULES[courseSize],
      estimatedMinutesPerLesson: Number.isFinite(estimatedMinutes)
        ? Math.min(20, Math.max(10, estimatedMinutes))
        : 15,
      additionalContext: cleanText(body.additional_context, 1200) || undefined,
      referenceImageUrls: parseReferenceImageUrls(body.reference_image_urls),
    },
  }
}

export async function GET() {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('course_drafts')
      .select('*, course_categories(id, name, slug)')
      .eq('creator_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[studio/drafts GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = parseIntake(body)
    if (!parsed) {
      return NextResponse.json({ error: 'Missing required intake fields' }, { status: 400 })
    }

    if (!parsed.categoryId && !parsed.categorySuggestionId) {
      return NextResponse.json({ error: 'Choose a category or suggest a new one' }, { status: 400 })
    }

    const template = getCourseTemplate(parsed.templateId)
    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db
      .from('course_drafts')
      .insert({
        creator_id: user.id,
        course_size: parsed.intakeForm.courseSize,
        category_id: parsed.categoryId,
        category_suggestion_id: parsed.categorySuggestionId,
        template_id: parsed.templateId,
        template_version: template.version,
        intake_form: {
          ...parsed.intakeForm,
          plannedModules: COURSE_SIZE_MODULES[parsed.intakeForm.courseSize],
        },
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('[studio/drafts POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
