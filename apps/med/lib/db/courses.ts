import { getServiceClient, getAnonClient, NursedCourse, NursedModule, NursedLesson } from '../supabase'
import { generateSlug, isUuid } from '../utils/slug'

// ─── Slug helpers ───────────────────────────────────────────

async function uniqueCourseSlug(db: ReturnType<typeof getServiceClient>, base: string, excludeId?: string) {
  let slug = base
  let counter = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = db.from('nursed_courses').select('id').eq('slug', slug).limit(1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    if (!data?.length) return slug
    slug = `${base}-${counter++}`
  }
}

async function uniqueModuleSlug(db: ReturnType<typeof getServiceClient>, courseId: string, base: string, excludeId?: string) {
  let slug = base
  let counter = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = db.from('nursed_modules').select('id').eq('course_id', courseId).eq('slug', slug).limit(1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    if (!data?.length) return slug
    slug = `${base}-${counter++}`
  }
}

async function uniqueLessonSlug(db: ReturnType<typeof getServiceClient>, moduleId: string, base: string, excludeId?: string) {
  let slug = base
  let counter = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = db.from('nursed_lessons').select('id').eq('module_id', moduleId).eq('slug', slug).limit(1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    if (!data?.length) return slug
    slug = `${base}-${counter++}`
  }
}

// ─── Slug resolvers ─────────────────────────────────────────

export async function getCourseBySlug(slug: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_courses')
    .select(`
      *,
      nursed_modules (
        *,
        nursed_lessons (*)
      )
    `)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function resolveCourse(slugOrId: string) {
  return isUuid(slugOrId) ? getCourseById(slugOrId) : getCourseBySlug(slugOrId)
}

export async function getModuleBySlug(courseId: string, slug: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_modules')
    .select('*, nursed_lessons(*, nursed_lesson_steps(*))')
    .eq('course_id', courseId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function resolveModule(courseId: string, slugOrId: string) {
  return isUuid(slugOrId) ? getModuleById(slugOrId) : getModuleBySlug(courseId, slugOrId)
}

export async function getLessonBySlug(moduleId: string, slug: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lessons')
    .select(`
      *,
      nursed_lesson_steps (*),
      nursed_content_assets (*),
      nursed_scripts (*),
      nursed_quiz_questions (*)
    `)
    .eq('module_id', moduleId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function resolveLessonInCourse(courseSlugOrId: string, lessonSlugOrId: string) {
  if (isUuid(lessonSlugOrId)) return getLessonById(lessonSlugOrId)
  const course = await resolveCourse(courseSlugOrId)
  if (!course) return null
  const modules = (course as { nursed_modules?: { id: string }[] }).nursed_modules ?? []
  for (const mod of modules) {
    try {
      return await getLessonBySlug(mod.id, lessonSlugOrId)
    } catch { /* not in this module, try next */ }
  }
  return null
}

export async function resolveLesson(slugOrId: string) {
  if (isUuid(slugOrId)) return getLessonById(slugOrId)
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lessons')
    .select(`
      *,
      nursed_lesson_steps (*),
      nursed_content_assets (*),
      nursed_scripts (*),
      nursed_quiz_questions (*)
    `)
    .eq('slug', slugOrId)
    .limit(1)
    .single()
  if (error) throw error
  return data
}

// ─── Courses ────────────────────────────────────────────────

export async function getCourses(published?: boolean) {
  const db = getServiceClient()
  let q = db.from('nursed_courses').select('*').order('created_at', { ascending: false })
  if (published !== undefined) q = q.eq('published', published)
  const { data, error } = await q
  if (error) throw error
  return data as NursedCourse[]
}

export type CourseWithCounts = NursedCourse & {
  modules_count: number
  lessons_count: number
  total_minutes: number
}

export async function getCoursesWithCounts(published?: boolean): Promise<CourseWithCounts[]> {
  const courses = await getCourses(published)
  const db = getServiceClient()

  const withCounts = await Promise.all(
    courses.map(async (c) => {
      const { data: modules } = await db
        .from('nursed_modules')
        .select('id, nursed_lessons(id, est_minutes)')
        .eq('course_id', c.id)

      let lessonsCount = 0
      let totalMinutes = 0
      for (const m of modules ?? []) {
        const lessons = (m as { nursed_lessons?: { id: string; est_minutes: number | null }[] }).nursed_lessons ?? []
        lessonsCount += lessons.length
        totalMinutes += lessons.reduce((s, l) => s + (l.est_minutes ?? 0), 0)
      }

      return {
        ...c,
        modules_count: modules?.length ?? 0,
        lessons_count: lessonsCount,
        total_minutes: totalMinutes,
      } as CourseWithCounts
    })
  )

  return withCounts
}

export async function getCourseById(id: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_courses')
    .select(`
      *,
      nursed_modules (
        *,
        nursed_lessons (*)
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createCourse(payload: Partial<NursedCourse>) {
  const db = getServiceClient()
  if (payload.title && !payload.slug) {
    const base = generateSlug(payload.title) || `untitled`
    payload.slug = await uniqueCourseSlug(db, base)
  }
  const { data, error } = await db
    .from('nursed_courses')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NursedCourse
}

export async function updateCourse(id: string, payload: Partial<NursedCourse>) {
  const db = getServiceClient()
  if (payload.title && !payload.slug) {
    const base = generateSlug(payload.title) || `untitled`
    payload.slug = await uniqueCourseSlug(db, base, id)
  }
  const { data, error } = await db
    .from('nursed_courses')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NursedCourse
}

export async function deleteCourse(id: string) {
  const db = getServiceClient()
  const { error } = await db.from('nursed_courses').delete().eq('id', id)
  if (error) throw error
}

// ─── Modules ────────────────────────────────────────────────

export async function getModules(courseId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_modules')
    .select('*, nursed_lessons(*)')
    .eq('course_id', courseId)
    .order('order_index')
  if (error) throw error
  return data
}

export async function getModuleById(id: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_modules')
    .select('*, nursed_lessons(*, nursed_lesson_steps(*))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createModule(payload: Partial<NursedModule>) {
  const db = getServiceClient()
  if (payload.title && payload.course_id && !payload.slug) {
    const base = generateSlug(payload.title) || `untitled`
    payload.slug = await uniqueModuleSlug(db, payload.course_id, base)
  }
  const { data, error } = await db
    .from('nursed_modules')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NursedModule
}

export async function updateModule(id: string, payload: Partial<NursedModule>) {
  const db = getServiceClient()
  if (payload.title && !payload.slug) {
    const existing = await getModuleById(id)
    const courseId = payload.course_id ?? existing?.course_id
    if (courseId) {
      const base = generateSlug(payload.title) || `untitled`
      payload.slug = await uniqueModuleSlug(db, courseId, base, id)
    }
  }
  const { data, error } = await db
    .from('nursed_modules')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NursedModule
}

export async function deleteModule(id: string) {
  const db = getServiceClient()
  const { error } = await db.from('nursed_modules').delete().eq('id', id)
  if (error) throw error
}

// ─── Lessons ────────────────────────────────────────────────

export async function getLessonById(id: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lessons')
    .select(`
      *,
      nursed_lesson_steps (*),
      nursed_content_assets (*),
      nursed_scripts (*),
      nursed_quiz_questions (*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createLesson(payload: Partial<NursedLesson>) {
  const db = getServiceClient()
  if (payload.title && payload.module_id && !payload.slug) {
    const base = generateSlug(payload.title) || `untitled`
    payload.slug = await uniqueLessonSlug(db, payload.module_id, base)
  }
  const { data, error } = await db
    .from('nursed_lessons')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NursedLesson
}

export async function updateLesson(id: string, payload: Partial<NursedLesson>) {
  const db = getServiceClient()
  if (payload.title && !payload.slug) {
    const existing = await getLessonById(id)
    const moduleId = payload.module_id ?? existing?.module_id
    if (moduleId) {
      const base = generateSlug(payload.title) || `untitled`
      payload.slug = await uniqueLessonSlug(db, moduleId, base, id)
    }
  }
  const { data, error } = await db
    .from('nursed_lessons')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NursedLesson
}

export async function deleteLesson(id: string) {
  const db = getServiceClient()
  const { error } = await db.from('nursed_lessons').delete().eq('id', id)
  if (error) throw error
}

// ─── Steps ──────────────────────────────────────────────────

export async function getStepsByLesson(lessonId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lesson_steps')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index')
  if (error) throw error
  return data
}

export async function createStep(payload: Record<string, unknown>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lesson_steps')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStep(id: string, payload: Record<string, unknown>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lesson_steps')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStep(id: string) {
  const db = getServiceClient()
  const { error } = await db.from('nursed_lesson_steps').delete().eq('id', id)
  if (error) throw error
}

export async function reorderSteps(steps: { id: string; order_index: number }[]) {
  const db = getServiceClient()
  await Promise.all(
    steps.map((s) =>
      db.from('nursed_lesson_steps').update({ order_index: s.order_index }).eq('id', s.id)
    )
  )
}
