import type { createSupabaseServiceServerClient } from '@/lib/supabase-server'

export type ValidationIssue = {
  stepId: string
  stepType: string
  lessonTitle: string
  moduleTitle: string
  field: string
  reason: string
}

export type ValidationResult = {
  valid: boolean
  totalSteps: number
  issueCount: number
  issues: ValidationIssue[]
}

type Db = Awaited<ReturnType<typeof createSupabaseServiceServerClient>>

const REQUIRED_FIELDS: Record<string, string[]> = {
  scenario_intro: ['title_en', 'body_en'],
  flash_card: ['cards'],
  quiz: ['question_en', 'options'],
  cloze: ['sentence_en'],
  audio_shadow: ['transcript_en'],
  script_read: ['lines'],
  quick_response: ['prompt_en', 'options'],
  spot_the_mistake: ['tokens'],
  drag_order: ['items'],
  matching: ['pairs'],
  sentence_builder: ['sentence_en'],
  odd_one_out: ['groups'],
  recording_submit: ['prompt_en'],
  self_reflection: ['sliders'],
  video: [],
}

const PLACEHOLDER_VALUES = new Set(['PLACEHOLDER', 'TODO'])

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length === 0 || PLACEHOLDER_VALUES.has(trimmed)
  }
  if (Array.isArray(value)) return value.length === 0
  return false
}

function fieldInvalid(config: Record<string, unknown>, field: string): boolean {
  return isEmptyValue(config[field])
}

function pushIssue(
  issues: ValidationIssue[],
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  field: string,
  reason: string,
) {
  issues.push({ ...ctx, field, reason })
}

function validateQuizLike(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const questions = asArray(config.questions)
  if (questions.length > 0) {
    questions.forEach((raw, index) => {
      const question = asRecord(raw)
      const prompt = question.prompt_en ?? question.question_en
      const options = asArray(question.options)
      if (isEmptyValue(prompt)) {
        pushIssue(issues, ctx, `questions[${index}].prompt_en`, 'Question text is missing')
      }
      if (options.length < 2) {
        pushIssue(issues, ctx, `questions[${index}].options`, 'At least 2 options are required')
      }
    })
    return
  }

  if (fieldInvalid(config, 'question_en')) {
    pushIssue(issues, ctx, 'question_en', 'Question text is missing')
  }
  if (asArray(config.options).length < 2) {
    pushIssue(issues, ctx, 'options', 'At least 2 options are required')
  }
}

function validateCloze(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const sentence = config.sentence_en ?? config.clozeText
  if (isEmptyValue(sentence)) {
    pushIssue(issues, ctx, 'sentence_en', 'Cloze sentence is missing')
  }
}

function validateSpotTheMistake(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const topTokens = asArray(config.tokens)
  if (topTokens.length > 0) {
    const hasWrong = topTokens.some((token) => asRecord(token).is_wrong === true)
    if (!hasWrong) {
      pushIssue(issues, ctx, 'tokens', 'At least one token must be marked as wrong')
    }
    return
  }

  const questions = asArray(config.questions)
  if (questions.length === 0) {
    pushIssue(issues, ctx, 'tokens', 'Mistake tokens are missing')
    return
  }

  const hasWrongInQuestions = questions.some((raw) => {
    const tokens = asArray(asRecord(raw).tokens)
    return tokens.some((token) => asRecord(token).is_wrong === true)
  })

  if (!hasWrongInQuestions) {
    pushIssue(issues, ctx, 'tokens', 'At least one token must be marked as wrong')
  }
}

function validateSelfReflection(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const sliders = asArray(config.sliders)
  if (sliders.length > 0) return

  const prompts = asArray(config.prompts)
  const sliderPrompts = prompts.filter((raw) => {
    const prompt = asRecord(raw)
    return prompt.type === 'slider' || prompt.key !== 'notes'
  })

  if (sliderPrompts.length === 0) {
    pushIssue(issues, ctx, 'sliders', 'Reflection sliders are missing')
  }
}

function validateSentenceBuilder(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const sentence = config.sentence_en ?? config.correct_sentence
  if (isEmptyValue(sentence)) {
    pushIssue(issues, ctx, 'sentence_en', 'Sentence is missing')
  }
}

function validateRecordingSubmit(
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
  issues: ValidationIssue[],
) {
  const prompt = config.prompt_en ?? config._instructions
  if (isEmptyValue(prompt)) {
    pushIssue(issues, ctx, 'prompt_en', 'Recording prompt is missing')
  }
}

function validateStepConfig(
  stepType: string,
  config: Record<string, unknown>,
  ctx: { stepId: string; stepType: string; lessonTitle: string; moduleTitle: string },
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const required = REQUIRED_FIELDS[stepType]

  if (!required) {
    return issues
  }

  if (stepType === 'quiz') {
    validateQuizLike(config, ctx, issues)
    return issues
  }

  if (stepType === 'cloze') {
    validateCloze(config, ctx, issues)
    return issues
  }

  if (stepType === 'spot_the_mistake') {
    validateSpotTheMistake(config, ctx, issues)
    return issues
  }

  if (stepType === 'self_reflection') {
    validateSelfReflection(config, ctx, issues)
    return issues
  }

  if (stepType === 'sentence_builder') {
    validateSentenceBuilder(config, ctx, issues)
    return issues
  }

  if (stepType === 'recording_submit') {
    validateRecordingSubmit(config, ctx, issues)
    return issues
  }

  for (const field of required) {
    if (fieldInvalid(config, field)) {
      const label = field.replace(/_/g, ' ')
      pushIssue(issues, ctx, field, `Required ${label} is missing or incomplete`)
    }
  }

  return issues
}

export async function validateCourseContent(
  courseId: string,
  db: Db,
): Promise<ValidationResult> {
  const { data: modules, error: modulesError } = await db
    .from('nursed_modules')
    .select('id, title')
    .eq('course_id', courseId)

  if (modulesError) throw modulesError

  const moduleRows = modules ?? []
  if (moduleRows.length === 0) {
    return { valid: true, totalSteps: 0, issueCount: 0, issues: [] }
  }

  const moduleById = new Map(moduleRows.map((mod) => [mod.id, mod.title as string]))
  const moduleIds = moduleRows.map((mod) => mod.id)

  const { data: lessons, error: lessonsError } = await db
    .from('nursed_lessons')
    .select('id, title, module_id')
    .in('module_id', moduleIds)

  if (lessonsError) throw lessonsError

  const lessonRows = lessons ?? []
  if (lessonRows.length === 0) {
    return { valid: true, totalSteps: 0, issueCount: 0, issues: [] }
  }

  const lessonById = new Map(
    lessonRows.map((lesson) => [
      lesson.id,
      {
        title: lesson.title as string,
        moduleTitle: moduleById.get(lesson.module_id as string) ?? 'Module',
      },
    ]),
  )
  const lessonIds = lessonRows.map((lesson) => lesson.id)

  const { data: steps, error: stepsError } = await db
    .from('nursed_lesson_steps')
    .select('id, type, config, lesson_id')
    .in('lesson_id', lessonIds)

  if (stepsError) throw stepsError

  const stepRows = steps ?? []
  const issues: ValidationIssue[] = []

  for (const step of stepRows) {
    const lessonMeta = lessonById.get(step.lesson_id as string)
    const ctx = {
      stepId: step.id as string,
      stepType: step.type as string,
      lessonTitle: lessonMeta?.title ?? 'Lesson',
      moduleTitle: lessonMeta?.moduleTitle ?? 'Module',
    }
    const config = asRecord(step.config)
    issues.push(...validateStepConfig(step.type as string, config, ctx))
  }

  return {
    valid: issues.length === 0,
    totalSteps: stepRows.length,
    issueCount: issues.length,
    issues,
  }
}
