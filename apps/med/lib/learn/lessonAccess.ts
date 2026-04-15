import type { NursedCourse, NursedModule, NursedLesson } from '@/lib/supabase'

export type CourseWithModules = NursedCourse & {
  nursed_modules: (NursedModule & { nursed_lessons: NursedLesson[] })[]
}

export function buildPublishedLessonOrder(course: CourseWithModules | null | undefined) {
  const allLessonIds: string[] = []
  const lessonToModule = new Map<string, string>()
  if (!course?.nursed_modules) return { allLessonIds, lessonToModule }

  const modules = [...course.nursed_modules].sort((a, b) => a.order_index - b.order_index)
  for (const mod of modules) {
    const sorted = [...(mod.nursed_lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
    for (const l of sorted) {
      if (l.published) {
        allLessonIds.push(l.id)
        lessonToModule.set(l.id, mod.id)
      }
    }
  }
  return { allLessonIds, lessonToModule }
}

export type LessonLearnStatus = 'completed' | 'unlocked' | 'locked' | 'coming_soon'

export function getLessonLearnStatus(
  lessonId: string,
  lessonPublished: boolean,
  opts: {
    completedLessons: Set<string>
    /** When false, sequential locks are not applied (matches legacy learner behavior). */
    isLoggedIn: boolean
    allLessonIds: string[]
    lessonToModule: Map<string, string>
    moduleGates: Map<string, boolean>
  },
): LessonLearnStatus {
  if (!lessonPublished) return 'coming_soon'
  const { completedLessons, isLoggedIn, allLessonIds, lessonToModule, moduleGates } = opts
  if (completedLessons.has(lessonId)) return 'completed'
  const idx = allLessonIds.indexOf(lessonId)
  if (idx === 0) return 'unlocked'
  if (!isLoggedIn) return 'unlocked'
  const prevId = allLessonIds[idx - 1]
  if (!completedLessons.has(prevId)) return 'locked'

  const prevModuleId = lessonToModule.get(prevId)
  const currModuleId = lessonToModule.get(lessonId)
  if (prevModuleId && currModuleId && prevModuleId !== currModuleId) {
    const prevGateOpen = moduleGates.get(prevModuleId)
    if (prevGateOpen === false) return 'locked'
  }
  return 'unlocked'
}

function lessonById(course: CourseWithModules | null | undefined, lessonId: string): NursedLesson | undefined {
  if (!course?.nursed_modules) return undefined
  for (const mod of course.nursed_modules) {
    const found = mod.nursed_lessons?.find((l) => l.id === lessonId)
    if (found) return found
  }
  return undefined
}

export function getNextLessonAfterCompletion(args: {
  course: CourseWithModules | null | undefined
  currentLessonId: string
  /** Must include the lesson just completed */
  completedLessons: Set<string>
  isLoggedIn: boolean
  moduleGates: Map<string, boolean>
}): {
  nextLesson: NursedLesson | null
  nextLessonModuleId: string | null
  moduleFullyComplete: boolean
} {
  const { course, currentLessonId, completedLessons, isLoggedIn, moduleGates } = args
  if (!course) {
    return { nextLesson: null, nextLessonModuleId: null, moduleFullyComplete: false }
  }

  const { allLessonIds, lessonToModule } = buildPublishedLessonOrder(course)
  const currentModId = lessonToModule.get(currentLessonId)
  const mod = course.nursed_modules?.find((m) => m.id === currentModId)
  const publishedInModule = mod
    ? [...(mod.nursed_lessons ?? [])].filter((l) => l.published).sort((a, b) => a.order_index - b.order_index)
    : []

  const moduleFullyComplete =
    publishedInModule.length > 0 && publishedInModule.every((l) => completedLessons.has(l.id))

  const idx = allLessonIds.indexOf(currentLessonId)
  if (idx < 0 || idx >= allLessonIds.length - 1) {
    return { nextLesson: null, nextLessonModuleId: null, moduleFullyComplete }
  }

  const candidateId = allLessonIds[idx + 1]
  const status = getLessonLearnStatus(candidateId, true, {
    completedLessons,
    isLoggedIn,
    allLessonIds,
    lessonToModule,
    moduleGates,
  })

  if (status !== 'unlocked' && status !== 'completed') {
    return { nextLesson: null, nextLessonModuleId: lessonToModule.get(candidateId) ?? null, moduleFullyComplete }
  }

  const next = lessonById(course, candidateId)
  return {
    nextLesson: next ?? null,
    nextLessonModuleId: lessonToModule.get(candidateId) ?? null,
    moduleFullyComplete,
  }
}

export function getModuleForLesson(
  course: CourseWithModules | null | undefined,
  moduleId: string | null | undefined,
): (NursedModule & { nursed_lessons: NursedLesson[] }) | undefined {
  if (!moduleId || !course?.nursed_modules) return undefined
  return course.nursed_modules.find((m) => m.id === moduleId || m.slug === moduleId) as
    | (NursedModule & { nursed_lessons: NursedLesson[] })
    | undefined
}
