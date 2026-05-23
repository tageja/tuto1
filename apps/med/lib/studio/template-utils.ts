import type { LessonStage } from '@/lib/supabase'
import type { CourseTemplateDefinition, TemplateLessonStage } from '@/lib/studio/types'

export function lessonIndexToStage(lessonIndex: number): LessonStage {
  if (lessonIndex >= 8) return 'assessment'
  if (lessonIndex >= 6) return 'heads_together'
  if (lessonIndex >= 3) return 'heads_down'
  return 'heads_up'
}

export function templateStageLabel(stage: TemplateLessonStage): string {
  const labels: Record<TemplateLessonStage, string> = {
    intro: 'intro',
    practice: 'practice',
    application: 'application',
    complex: 'complex',
    assessment: 'assessment',
  }
  return labels[stage]
}

export function clampModuleCount(
  requestedModules: number,
  template: CourseTemplateDefinition,
): number {
  return Math.min(
    template.moduleRange.max,
    Math.max(template.moduleRange.min, requestedModules),
  )
}

export function lessonNeedsVideoScript(lessonIndex: number, templateId: string): boolean {
  if (templateId === 'organisational_training') return false
  return lessonIndex === 1 || lessonIndex === 4 || lessonIndex === 6
}

export function lessonNeedsAudioScript(lessonIndex: number, templateId: string): boolean {
  if (templateId === 'organisational_training') return false
  return lessonIndex === 1 || lessonIndex === 3
}
