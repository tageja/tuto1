import type { CourseTemplateDefinition, ResolvedLesson, StepSlot } from '@/lib/studio/types'

function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function pickFromPool(options: string[], pick: number, random: () => number): string[] {
  if (pick > options.length) {
    throw new Error(`Pool pick count ${pick} exceeds available options (${options.length})`)
  }

  const remaining = options.map((type, index) => ({ type, index }))
  const selected: string[] = []

  for (let i = 0; i < pick; i += 1) {
    const choiceIndex = Math.floor(random() * remaining.length)
    const [choice] = remaining.splice(choiceIndex, 1)
    selected.push(choice.type)
  }

  return selected
}

function resolveSlots(slots: StepSlot[], random: () => number): string[] {
  const steps: string[] = []

  for (const slot of slots) {
    if (slot.kind === 'fixed') {
      steps.push(slot.type)
      continue
    }

    steps.push(...pickFromPool(slot.options, slot.pick, random))
  }

  return steps
}

export function resolveTemplate(
  template: CourseTemplateDefinition,
  draftId: string,
): ResolvedLesson[] {
  if (template.lessons.length !== 8) {
    throw new Error(`Template ${template.id} must define exactly 8 lessons`)
  }

  const random = createSeededRandom(hashSeed(`${draftId}:${template.id}`))

  return template.lessons.map((lesson) => {
    const steps = resolveSlots(lesson.slots, random)

    if (steps.length !== 8) {
      throw new Error(
        `Template ${template.id} lesson ${lesson.lessonIndex} resolved to ${steps.length} steps (expected 8)`,
      )
    }

    return {
      lessonIndex: lesson.lessonIndex,
      stage: lesson.stage,
      steps,
    }
  })
}
