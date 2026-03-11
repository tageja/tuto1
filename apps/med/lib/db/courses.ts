import { getServiceClient, getAnonClient, NursedCourse, NursedModule, NursedLesson } from '../supabase'

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
