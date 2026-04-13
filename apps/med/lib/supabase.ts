import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Browser client — use in client components */
export function getBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Service-role client — use ONLY in API routes / server components */
export function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/** Anon client for server components that don't need elevated privileges */
export function getAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

export type Database = {
  public: {
    Tables: {
      nursed_profiles: { Row: NursedProfile; Insert: Omit<NursedProfile, 'created_at'>; Update: Partial<NursedProfile> }
      nursed_hospitals: { Row: NursedHospital; Insert: Omit<NursedHospital, 'id' | 'created_at'>; Update: Partial<NursedHospital> }
      nursed_courses: { Row: NursedCourse; Insert: Omit<NursedCourse, 'id' | 'created_at' | 'updated_at'>; Update: Partial<NursedCourse> }
      nursed_modules: { Row: NursedModule; Insert: Omit<NursedModule, 'id' | 'created_at'>; Update: Partial<NursedModule> }
      nursed_lessons: { Row: NursedLesson; Insert: Omit<NursedLesson, 'id' | 'created_at'> & { stage?: LessonStage | null; objective?: string | null }; Update: Partial<NursedLesson> }
      nursed_lesson_steps: { Row: NursedLessonStep; Insert: Omit<NursedLessonStep, 'id' | 'created_at'> & { title_vi?: string | null }; Update: Partial<NursedLessonStep> }
      nursed_content_assets: { Row: NursedContentAsset; Insert: Omit<NursedContentAsset, 'id' | 'created_at'>; Update: Partial<NursedContentAsset> }
      nursed_quiz_questions: { Row: NursedQuizQuestion; Insert: Omit<NursedQuizQuestion, 'id' | 'created_at'>; Update: Partial<NursedQuizQuestion> }
      nursed_enrollments: { Row: NursedEnrollment; Insert: Omit<NursedEnrollment, 'id' | 'created_at'>; Update: Partial<NursedEnrollment> }
      nursed_progress: { Row: NursedProgress; Insert: Omit<NursedProgress, 'id' | 'created_at'>; Update: Partial<NursedProgress> }
      nursed_submissions: { Row: NursedSubmission; Insert: Omit<NursedSubmission, 'id' | 'created_at'>; Update: Partial<NursedSubmission> }
      nursed_pair_groups: { Row: NursedPairGroup; Insert: Omit<NursedPairGroup, 'id' | 'created_at'>; Update: Partial<NursedPairGroup> }
      nursed_pair_sessions: { Row: NursedPairSession; Insert: Omit<NursedPairSession, 'id' | 'created_at'>; Update: Partial<NursedPairSession> }
    }
  }
}

export type UserRole = 'learner' | 'teacher' | 'hospital_admin' | 'super_admin'

export type NursedProfile = {
  id: string
  full_name: string | null
  hospital_id: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export type NursedHospital = {
  id: string
  name: string
  name_vi: string | null
  city: string | null
  contact_email: string | null
  plan: 'free' | 'pro'
  active: boolean
  invite_code: string | null
  created_at: string
}

export type NursedHospitalAdmin = {
  id: string
  user_id: string
  hospital_id: string
  role: 'admin' | 'viewer'
  created_at: string
}

export type NursedCourse = {
  id: string
  title: string
  title_vi: string | null
  description: string | null
  description_vi: string | null
  level: 'A1' | 'A2' | 'B1' | 'B2'
  cover_image_url: string | null
  published: boolean
  hospital_id: string | null
  created_at: string
  updated_at: string
}

export type NursedModule = {
  id: string
  course_id: string
  title: string
  title_vi: string | null
  description: string | null
  description_vi: string | null
  order_index: number
  created_at: string
}

export type NursedLesson = {
  id: string
  module_id: string
  title: string
  title_vi: string | null
  description: string | null
  est_minutes: number
  order_index: number
  published: boolean
  stage: LessonStage | null
  objective: string | null
  created_at: string
}

export type StepType =
  | 'video'
  | 'audio_shadow'
  | 'script_read'
  | 'cloze'
  | 'no_script'
  | 'recording_submit'
  | 'quiz'
  | 'mission'
  | 'scenario_intro'
  | 'self_reflection'
  | 'conversation_animation'
  | 'matching'
  | 'drag_order'
  | 'flash_card'

/**
 * Config shapes for the three new interactive step types.
 * These are used in NursedLessonStep.config (Record<string, unknown>).
 *
 * matching:   config.pairs    — [{ en: string; vi: string }]
 * drag_order: config.lines    — string[] in correct order; player shuffles on render
 * flash_card: config.cards    — [{ front_en: string; back_vi: string; audio_url?: string }]
 * cloze (enhanced): config.wordBank — boolean; true = chip-tap mode instead of typed input
 */
export type MatchingPair = { en: string; vi: string }
export type FlashCard = { front_en: string; back_vi: string; audio_url?: string }

export type LessonStage = 'heads_up' | 'heads_down' | 'heads_together' | 'assessment'

export type NursedLessonStep = {
  id: string
  lesson_id: string
  type: StepType
  title: string | null
  title_vi: string | null
  order_index: number
  config: Record<string, unknown>
  created_at: string
}

export type NursedContentAsset = {
  id: string
  lesson_id: string | null
  step_id: string | null
  type: 'audio' | 'video' | 'image' | 'pdf'
  storage_path: string
  public_url: string | null
  filename: string
  duration_seconds: number | null
  transcript_en: string | null
  transcript_vi: string | null
  speed_tag: 'slow' | 'normal' | 'fast' | null
  accent_tag: string | null
  created_at: string
}

export type QuizQuestionType = 'mcq' | 'match' | 'fill_blank' | 'listening_mcq' | 'order'

export type NursedQuizQuestion = {
  id: string
  lesson_id: string
  step_id: string | null
  type: QuizQuestionType
  prompt_en: string
  prompt_vi: string | null
  options: { id: string; text: string; text_vi?: string }[]
  answer: string | string[]
  audio_asset_id: string | null
  explanation_en: string | null
  explanation_vi: string | null
  order_index: number
  created_at: string
}

export type NursedEnrollment = {
  id: string
  user_id: string
  course_id: string
  hospital_id: string | null
  enrolled_at: string
  status: 'active' | 'completed' | 'paused'
  created_at: string
}

export type NursedProgress = {
  id: string
  user_id: string
  lesson_id: string
  current_step_index: number
  completion_pct: number
  completed: boolean
  streak_days: number
  last_active: string | null
  created_at: string
}

export type NursedSubmission = {
  id: string
  user_id: string
  lesson_id: string
  step_id: string
  type: 'recording' | 'quiz' | 'mission'
  storage_path: string | null
  transcript: string | null
  keyword_score: number | null
  quiz_score: number | null
  rubric: Record<string, boolean> | null
  pair_session_id: string | null
  created_at: string
}

export type NursedPairGroup = {
  id: string
  hospital_id: string | null
  join_code: string
  name: string | null
  max_size: number
  active: boolean
  created_at: string
}

export type NursedPairSession = {
  id: string
  pair_group_id: string
  lesson_id: string
  status: 'pending' | 'completed'
  recording_path: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}
