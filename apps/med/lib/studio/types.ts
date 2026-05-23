import type { CourseSize, CourseTemplateId, LessonStage, StepType } from '@/lib/supabase'

export interface CourseIntakeForm {
  profession: string
  industry: string
  topic: string
  subtopic?: string
  targetAgeGroup: string
  learnerLevel: 'beginner' | 'intermediate' | 'advanced'
  language: 'en' | 'vi' | 'bilingual'
  courseSize: CourseSize
  numModules: number
  estimatedMinutesPerLesson: number
  additionalContext?: string
  referenceImageUrls?: string[]
}

export interface LessonSynopsis {
  orderIndex: number
  title: string
  stage: LessonStage
  objective: string
  keyPhrases: string[]
  videoScript?: string
  audioScript?: string
  scenarioContext: string
}

export interface ModuleSynopsis {
  orderIndex: number
  title: string
  titleVi: string
  rationale: string
  lessons: LessonSynopsis[]
}

export interface CourseSynopsis {
  courseTitle: string
  courseTitleVi: string
  courseDescription: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  templateId: CourseTemplateId
  totalModules: number
  estimatedHours: number
  modules: ModuleSynopsis[]
}

export interface TemplateStep {
  type: StepType
  fillFields: string[]
  hasVideoScript?: boolean
  hasAudioScript?: boolean
}

export interface TemplateLesson {
  stage: LessonStage
  steps: TemplateStep[]
}

export interface CourseTemplate {
  id: CourseTemplateId
  version: number
  name: string
  description: string
  recommendedFor: string[]
  lessons: Record<string, TemplateLesson>
}

export const COURSE_SIZE_MODULES: Record<CourseSize, number> = {
  starter: 3,
  standard: 6,
  full: 9,
}

export type StepSlot =
  | { kind: 'fixed'; type: string }
  | { kind: 'pool'; options: string[]; pick: number }

export type TemplateLessonStage =
  | 'intro'
  | 'practice'
  | 'application'
  | 'complex'
  | 'assessment'

export type LessonTemplateDefinition = {
  lessonIndex: number
  stage: TemplateLessonStage
  slots: StepSlot[]
}

export type TemplatePromptRules = {
  tone: string
  vocabLevel: string
  scenarioTypes: string[]
  moduleArc: string
  quizDistractorRule: string
  audioScriptLength: string
  videoScriptLength: string
  clozeRule: string
  spotTheMistakeRule: string
  forbiddenContent: string[]
}

export type CourseTemplateDefinition = {
  id: string
  version: number
  name: string
  description: string
  moduleRange: { min: number; max: number }
  lessons: LessonTemplateDefinition[]
  promptRules: TemplatePromptRules
}

export type ResolvedLesson = {
  lessonIndex: number
  stage: string
  steps: string[]
}

export type StudioTemplateId =
  | 'professional_communication'
  | 'organisational_training'
  | 'student_english'
