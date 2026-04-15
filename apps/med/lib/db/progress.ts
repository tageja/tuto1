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

export type LessonFeedbackPayload = {
  user_id: string
  lesson_id: string
  q1_animation?: number
  q2_variety?: number
  q3_usefulness?: number
  q4_confidence?: number
  q5_continue?: number
}

export async function saveLessonFeedback(payload: LessonFeedbackPayload) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_lesson_feedback')
    .upsert(
      {
        user_id: payload.user_id,
        lesson_id: payload.lesson_id,
        q1_animation: payload.q1_animation,
        q2_variety: payload.q2_variety,
        q3_usefulness: payload.q3_usefulness,
        q4_confidence: payload.q4_confidence,
        q5_continue: payload.q5_continue,
      },
      { onConflict: 'user_id,lesson_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Existing analytics helper (kept for /admin/analytics page) ─

export async function getHospitalAnalytics(hospitalId: string) {
  const db = getServiceClient()

  const { data: enrolledUsers } = await db
    .from('nursed_enrollments')
    .select('user_id')
    .eq('hospital_id', hospitalId)

  const userIds = enrolledUsers?.map(e => e.user_id) ?? []

  const [enrollments, submissions, progress] = await Promise.all([
    db.from('nursed_enrollments').select('*').eq('hospital_id', hospitalId),
    userIds.length > 0
      ? db.from('nursed_submissions').select('*').in('user_id', userIds)
      : Promise.resolve({ data: [] }),
    userIds.length > 0
      ? db.from('nursed_progress').select('*').in('user_id', userIds)
      : Promise.resolve({ data: [] }),
  ])

  const quizSubs = submissions.data?.filter(s => s.quiz_score != null) ?? []
  const avgQuizScore = quizSubs.length > 0
    ? quizSubs.reduce((acc, s) => acc + (s.quiz_score ?? 0), 0) / quizSubs.length
    : 0

  return {
    totalEnrolled: enrollments.data?.length ?? 0,
    totalSubmissions: submissions.data?.length ?? 0,
    recordingSubmissions: submissions.data?.filter(s => s.type === 'recording').length ?? 0,
    quizSubmissions: submissions.data?.filter(s => s.type === 'quiz').length ?? 0,
    avgQuizScore,
    avgCompletion: progress.data?.length
      ? progress.data.reduce((acc, p) => acc + p.completion_pct, 0) / progress.data.length
      : 0,
    completedLessons: progress.data?.filter(p => p.completed).length ?? 0,
  }
}

// ─── Hospital Overview (extended KPIs) ──────────────────────

export type HospitalOverview = {
  totalEnrolled: number
  activeThisWeek: number
  atRisk: number
  avgQuizScore: number
  avgCompletion: number
  completedLessons: number
  recordingSubmissions: number
  pairSessionsCount: number
}

export async function getHospitalOverview(hospitalId: string): Promise<HospitalOverview> {
  const db = getServiceClient()

  const { data: enrolledUsers } = await db
    .from('nursed_enrollments')
    .select('user_id')
    .eq('hospital_id', hospitalId)

  const userIds = enrolledUsers?.map(e => e.user_id) ?? []

  const [submissions, progress, pairGroups] = await Promise.all([
    userIds.length > 0
      ? db.from('nursed_submissions').select('user_id, type, quiz_score, created_at').in('user_id', userIds)
      : Promise.resolve({ data: [] }),
    userIds.length > 0
      ? db.from('nursed_progress').select('user_id, completion_pct, completed, last_active').in('user_id', userIds)
      : Promise.resolve({ data: [] }),
    db.from('nursed_pair_groups').select('id').eq('hospital_id', hospitalId),
  ])

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoIso = weekAgo.toISOString()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoIso = sevenDaysAgo.toISOString()

  const activeSet = new Set<string>()
  const recentSet = new Set<string>()

  progress.data?.forEach(p => {
    if (p.last_active && p.last_active >= weekAgoIso) activeSet.add(p.user_id)
    if (p.last_active && p.last_active < sevenDaysAgoIso) recentSet.add(p.user_id)
  })
  submissions.data?.forEach(s => {
    if (s.created_at >= weekAgoIso) activeSet.add(s.user_id)
  })

  const atRisk = userIds.filter(id => !activeSet.has(id)).length

  const quizSubs = submissions.data?.filter(s => s.quiz_score != null) ?? []
  const avgQuizScore = quizSubs.length > 0
    ? quizSubs.reduce((acc, s) => acc + (s.quiz_score ?? 0), 0) / quizSubs.length
    : 0

  const pairGroupIds = pairGroups.data?.map(g => g.id) ?? []
  const pairSessionsResult = pairGroupIds.length > 0
    ? await db.from('nursed_pair_sessions').select('id').in('pair_group_id', pairGroupIds)
    : { data: [] }

  return {
    totalEnrolled: userIds.length,
    activeThisWeek: activeSet.size,
    atRisk,
    avgQuizScore,
    avgCompletion: progress.data?.length
      ? (progress.data.map(p => p.completion_pct as number).reduce((a, b) => a + b, 0)) / progress.data.length
      : 0,
    completedLessons: progress.data?.filter(p => p.completed).length ?? 0,
    recordingSubmissions: submissions.data?.filter(s => s.type === 'recording').length ?? 0,
    pairSessionsCount: pairSessionsResult.data?.length ?? 0,
  }
}

// ─── Hospital nurse roster ───────────────────────────────────

export type HospitalNurseRosterRow = {
  user_id: string
  email: string | null
  display_name: string | null
  course_id: string
  course_title: string | null
  status: string
  enrolled_at: string
  completed_lessons: number
  last_active: string | null
}

export async function getHospitalNurseRoster(hospitalId: string): Promise<HospitalNurseRosterRow[]> {
  const db = getServiceClient()
  const { data, error } = await db.rpc('get_hospital_nurse_roster', { p_hospital_id: hospitalId })
  if (error) throw error
  return (data ?? []) as HospitalNurseRosterRow[]
}

// ─── Hospital course funnel ──────────────────────────────────

export type HospitalCourseFunnelRow = {
  course_id: string
  course_title: string | null
  enrolled: number
  started: number
  completed_module1: number
  completed_full: number
  avg_completion: number
  avg_quiz_score: number
}

export async function getHospitalCourseFunnel(hospitalId: string): Promise<HospitalCourseFunnelRow[]> {
  const db = getServiceClient()

  const { data: enrollments } = await db
    .from('nursed_enrollments')
    .select('user_id, course_id')
    .eq('hospital_id', hospitalId)

  if (!enrollments?.length) return []

  const userIds = [...new Set(enrollments.map(e => e.user_id))]
  const courseIds = [...new Set(enrollments.map(e => e.course_id))]

  const [courses, lessons, progress, submissions] = await Promise.all([
    db.from('nursed_courses').select('id, title').in('id', courseIds),
    db.from('nursed_lessons').select('id, nursed_modules!inner(course_id, order_index)'),
    db.from('nursed_progress').select('user_id, lesson_id, completed, completion_pct').in('user_id', userIds),
    db.from('nursed_submissions').select('user_id, quiz_score, lesson_id').in('user_id', userIds).not('quiz_score', 'is', null),
  ])

  const lessonMeta = new Map<string, { courseId: string; moduleOrder: number }>()
  lessons.data?.forEach((l: { id: string; nursed_modules: { course_id: string; order_index: number } | { course_id: string; order_index: number }[] }) => {
    const mod = Array.isArray(l.nursed_modules) ? l.nursed_modules[0] : l.nursed_modules
    if (mod) lessonMeta.set(l.id, { courseId: mod.course_id, moduleOrder: mod.order_index })
  })

  return courseIds.map(courseId => {
    const enrolled = enrollments.filter(e => e.course_id === courseId).map(e => e.user_id)
    const started = new Set<string>()
    const completedM1 = new Set<string>()
    const completedFull = new Set<string>()
    const completionPcts: number[] = []
    const quizScores: number[] = []

    progress.data?.forEach(p => {
      const meta = lessonMeta.get(p.lesson_id)
      if (!meta || meta.courseId !== courseId) return
      if (!enrolled.includes(p.user_id)) return
      started.add(p.user_id)
      completionPcts.push(p.completion_pct)
      if (p.completed && meta.moduleOrder === 0) completedM1.add(p.user_id)
      if (p.completed) completedFull.add(p.user_id)
    })

    submissions.data?.forEach(s => {
      if (!enrolled.includes(s.user_id) || s.quiz_score == null) return
      const meta = lessonMeta.get(s.lesson_id)
      if (meta?.courseId === courseId) quizScores.push(s.quiz_score)
    })

    return {
      course_id: courseId,
      course_title: courses.data?.find(c => c.id === courseId)?.title ?? null,
      enrolled: enrolled.length,
      started: started.size,
      completed_module1: completedM1.size,
      completed_full: completedFull.size,
      avg_completion: completionPcts.length ? completionPcts.reduce((a, b) => a + b, 0) / completionPcts.length : 0,
      avg_quiz_score: quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0,
    }
  })
}

// ─── Hospital speaking stats ─────────────────────────────────

export type HospitalSpeakingStats = {
  totalRecordings: number
  totalQuizSubmissions: number
  totalMissionSubmissions: number
  pairGroupsCount: number
  pairSessionsCount: number
  pairGroups: { id: string; name: string | null; join_code: string; memberCount: number; sessionsCount: number }[]
}

export async function getHospitalSpeakingStats(hospitalId: string): Promise<HospitalSpeakingStats> {
  const db = getServiceClient()

  const { data: enrolledUsers } = await db
    .from('nursed_enrollments')
    .select('user_id')
    .eq('hospital_id', hospitalId)

  const userIds = enrolledUsers?.map(e => e.user_id) ?? []

  const [submissions, pairGroups] = await Promise.all([
    userIds.length > 0
      ? db.from('nursed_submissions').select('type').in('user_id', userIds)
      : Promise.resolve({ data: [] }),
    db.from('nursed_pair_groups')
      .select('id, name, join_code, nursed_pair_members(user_id), nursed_pair_sessions(id)')
      .eq('hospital_id', hospitalId),
  ])

  const groups = (pairGroups.data ?? []).map((g: {
    id: string
    name: string | null
    join_code: string
    nursed_pair_members?: { user_id: string }[]
    nursed_pair_sessions?: { id: string }[]
  }) => ({
    id: g.id,
    name: g.name,
    join_code: g.join_code,
    memberCount: g.nursed_pair_members?.length ?? 0,
    sessionsCount: g.nursed_pair_sessions?.length ?? 0,
  }))

  return {
    totalRecordings: submissions.data?.filter(s => s.type === 'recording').length ?? 0,
    totalQuizSubmissions: submissions.data?.filter(s => s.type === 'quiz').length ?? 0,
    totalMissionSubmissions: submissions.data?.filter(s => s.type === 'mission').length ?? 0,
    pairGroupsCount: groups.length,
    pairSessionsCount: groups.reduce((acc, g) => acc + g.sessionsCount, 0),
    pairGroups: groups,
  }
}
