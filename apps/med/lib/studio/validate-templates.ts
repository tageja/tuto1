import { resolveTemplate } from '@/lib/studio/resolve-template'
import type { CourseTemplateDefinition } from '@/lib/studio/types'

const VALIDATION_SEED = 'studio-template-validation-seed'

export function assertTemplateResolves(template: CourseTemplateDefinition): void {
  if (template.lessons.length !== 8) {
    throw new Error(`Template ${template.id} must define exactly 8 lessons (got ${template.lessons.length})`)
  }

  const resolved = resolveTemplate(template, VALIDATION_SEED)
  if (resolved.length !== 8) {
    throw new Error(`Template ${template.id} resolved to ${resolved.length} lessons`)
  }

  for (const lesson of resolved) {
    if (lesson.steps.length !== 8) {
      throw new Error(
        `Template ${template.id} lesson ${lesson.lessonIndex} resolved to ${lesson.steps.length} steps`,
      )
    }
  }
}

export function assertAllTemplates(templates: CourseTemplateDefinition[]): void {
  for (const template of templates) {
    assertTemplateResolves(template)
  }
}
