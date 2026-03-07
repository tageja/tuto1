import { getServiceClient, NursedProgress, NursedSubmission } from '../supabase'

export async function getProgress(userId: string, lessonId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as NursedProgress | null
}

export async function upsertProgress(userId: string, lessonId: string, payload: Partial<NursedProgress>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_progress')
    .upsert({ user_id: userId, lesson_id: lessonId, ...payload }, { onConflict: 'user_id,lesson_id' })
    .select()
    .single()
  if (error) throw error
  return data as NursedProgress
}

export async function getUserProgressSummary(userId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_progress')
    .select('*, nursed_lessons(title, module_id, nursed_modules(title, course_id))')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function getCourseProgress(userId: string, courseId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_progress')
    .select(`
      *,
      nursed_lessons!inner(
        id,
        module_id,
        nursed_modules!inner(course_id)
      )
    `)
    .eq('user_id', userId)
    .eq('nursed_lessons.nursed_modules.course_id', courseId)
  if (error) throw error
  return data
}

export async function saveSubmission(payload: Partial<NursedSubmission>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_submissions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NursedSubmission
}

export async function getSubmissionsByStep(userId: string, stepId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('step_id', stepId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as NursedSubmission[]
}

// Analytics helpers

export async function getHospitalAnalytics(hospitalId: string) {
  const db = getServiceClient()

  const [enrollments, submissions, progress] = await Promise.all([
    db.from('nursed_enrollments').select('*').eq('hospital_id', hospitalId),
    db.from('nursed_submissions').select('*').in(
      'user_id',
      (await db.from('nursed_enrollments').select('user_id').eq('hospital_id', hospitalId)).data?.map(e => e.user_id) || []
    ),
    db.from('nursed_progress').select('*').in(
      'user_id',
      (await db.from('nursed_enrollments').select('user_id').eq('hospital_id', hospitalId)).data?.map(e => e.user_id) || []
    ),
  ])

  return {
    totalEnrolled: enrollments.data?.length ?? 0,
    totalSubmissions: submissions.data?.length ?? 0,
    recordingSubmissions: submissions.data?.filter(s => s.type === 'recording').length ?? 0,
    quizSubmissions: submissions.data?.filter(s => s.type === 'quiz').length ?? 0,
    avgQuizScore: submissions.data?.filter(s => s.quiz_score != null).reduce((acc, s, _, arr) => acc + (s.quiz_score / arr.length), 0) ?? 0,
    avgCompletion: progress.data?.reduce((acc, p, _, arr) => acc + (p.completion_pct / arr.length), 0) ?? 0,
    completedLessons: progress.data?.filter(p => p.completed).length ?? 0,
  }
}
