import type { CourseTemplateId } from '@/lib/supabase'
import type { CourseTemplateDefinition, StudioTemplateId } from '@/lib/studio/types'
import { assertAllTemplates } from '@/lib/studio/validate-templates'
import { organisationalTraining } from './organisational_training'
import { professionalCommunication } from './professional_communication'
import { studentEnglish } from './student_english'

export { professionalCommunication, organisationalTraining, studentEnglish }

export const courseTemplateDefinitions: Record<StudioTemplateId, CourseTemplateDefinition> = {
  professional_communication: professionalCommunication,
  organisational_training: organisationalTraining,
  student_english: studentEnglish,
}

const LEGACY_TEMPLATE_MAP: Record<string, StudioTemplateId> = {
  safety_procedures: 'organisational_training',
  technical_skills: 'organisational_training',
  customer_service: 'professional_communication',
}

export function normalizeTemplateId(templateId: string): StudioTemplateId {
  if (templateId in courseTemplateDefinitions) {
    return templateId as StudioTemplateId
  }
  return LEGACY_TEMPLATE_MAP[templateId] ?? 'professional_communication'
}

export function getCourseTemplate(templateId: CourseTemplateId | string): CourseTemplateDefinition {
  return courseTemplateDefinitions[normalizeTemplateId(templateId)]
}

export const courseTemplateOptions = Object.values(courseTemplateDefinitions).map((template) => ({
  id: template.id as CourseTemplateId,
  name: template.name,
  description: template.description,
  version: template.version,
}))

assertAllTemplates(Object.values(courseTemplateDefinitions))
