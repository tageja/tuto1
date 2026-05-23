import { z } from 'zod'

export const lessonStageSchema = z.enum([
  'heads_up',
  'heads_down',
  'heads_together',
  'assessment',
])

export const courseTemplateIdSchema = z.enum([
  'professional_communication',
  'organisational_training',
  'student_english',
  'safety_procedures',
  'technical_skills',
  'customer_service',
])

export const courseIntakeFormSchema = z.object({
  profession: z.string().min(2).max(120),
  industry: z.string().min(2).max(120),
  topic: z.string().min(2).max(160),
  subtopic: z.string().max(160).optional(),
  targetAgeGroup: z.string().min(2).max(120),
  learnerLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['en', 'vi', 'bilingual']),
  courseSize: z.enum(['starter', 'standard', 'full']),
  numModules: z.number().int().min(3).max(12),
  estimatedMinutesPerLesson: z.number().int().min(10).max(20),
  additionalContext: z.string().max(1200).optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).optional().default([]),
})

export const lessonSynopsisSchema = z.object({
  orderIndex: z.number().int().min(1).max(8),
  title: z.string().min(2),
  stage: lessonStageSchema,
  objective: z.string().min(5),
  keyPhrases: z.array(z.string().min(1)).length(5),
  videoScript: z.string().optional(),
  audioScript: z.string().optional(),
  scenarioContext: z.string().min(5),
})

export const moduleSynopsisSchema = z.object({
  orderIndex: z.number().int().min(1).max(12),
  title: z.string().min(2),
  titleVi: z.string().min(2),
  rationale: z.string().min(5),
  lessons: z.array(lessonSynopsisSchema).length(8),
})

export const courseSynopsisSchema = z.object({
  courseTitle: z.string().min(2),
  courseTitleVi: z.string().min(2),
  courseDescription: z.string().min(10),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  templateId: courseTemplateIdSchema,
  totalModules: z.number().int().min(3).max(12),
  estimatedHours: z.number().min(1),
  modules: z.array(moduleSynopsisSchema).min(3).max(12),
})
