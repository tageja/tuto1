import { NextRequest, NextResponse } from 'next/server'

import { createGoogleGenerativeAI } from '@ai-sdk/google'

import { generateText } from 'ai'

import {

  CREATOR_ROLES,

  createSupabaseServiceServerClient,

  getSessionAndProfile,

} from '@/lib/supabase-server'

import { courseIntakeFormSchema, courseSynopsisSchema } from '@/lib/studio/schemas'

import { buildStepConfig } from '@/lib/studio/build-step-config'

import { buildLessonFillPrompt } from '@/lib/studio/prompts/lesson-fill'

import { resolveTemplate } from '@/lib/studio/resolve-template'

import { toTemplateSteps } from '@/lib/studio/step-metadata'

import { extractJsonObject } from '@/lib/studio/synopsis-json'

import { getCourseTemplate } from '@/lib/studio/templates'

import { generateSlug } from '@/lib/utils/slug'

import type { CourseDraft, NursedLessonStep } from '@/lib/supabase'

import type {

  CourseIntakeForm,

  CourseSynopsis,

  LessonSynopsis,

  ModuleSynopsis,

  ResolvedLesson,

  TemplateStep,

} from '@/lib/studio/types'



export const maxDuration = 300



type JsonRecord = Record<string, unknown>



function encodeEvent(event: JsonRecord) {

  return new TextEncoder().encode(`${JSON.stringify(event)}\n`)

}



function contentForStep(aiContent: unknown, templateStep: TemplateStep, stepIndex: number): JsonRecord {

  const root = aiContent && typeof aiContent === 'object' ? aiContent as JsonRecord : {}

  const steps = Array.isArray(root.steps) ? root.steps as JsonRecord[] : []

  const matchedStep = steps.find((step) => Number(step.stepIndex) === stepIndex) ?? steps[stepIndex - 1]



  if (matchedStep) {

    const content = matchedStep.content

    if (content && typeof content === 'object' && !Array.isArray(content)) return content as JsonRecord

  }



  const typeContent = root[templateStep.type]

  if (typeContent && typeof typeContent === 'object' && !Array.isArray(typeContent)) {

    return typeContent as JsonRecord

  }



  return root

}



async function generateLessonContent({

  google,

  intakeForm,

  synopsis,

  module,

  lesson,

  templateSteps,

  template,

  resolvedLesson,

}: {

  google: ReturnType<typeof createGoogleGenerativeAI>

  intakeForm: CourseIntakeForm

  synopsis: CourseSynopsis

  module: ModuleSynopsis

  lesson: LessonSynopsis

  templateSteps: TemplateStep[]

  template: ReturnType<typeof getCourseTemplate>

  resolvedLesson: ResolvedLesson

}) {

  const result = await generateText({

    model: google('gemini-2.5-flash'),

    maxRetries: 2,

    prompt: buildLessonFillPrompt({

      intakeForm,

      synopsis,

      module,

      lesson,

      templateSteps,

      template,

      resolvedLesson,

    }),

  })



  const json = extractJsonObject(result.text)

  if (!json) {

    throw new Error(`Gemini returned invalid JSON for Module ${module.orderIndex}, Lesson ${lesson.orderIndex}`)

  }

  return json

}



async function insertMediaQueueItems({

  db,

  creatorId,

  courseId,

  steps,

}: {

  db: any

  creatorId: string

  courseId: string

  steps: NursedLessonStep[]

}) {

  const queueItems = steps.flatMap((step) => {

    const config = step.config ?? {}

    if (step.type === 'video') {

      const script = String(config.script ?? config.line_1_en ?? '').trim()

      return script

        ? [{

            creator_id: creatorId,

            course_id: courseId,

            step_id: step.id,

            media_type: 'video_request',

            script,

            provider: 'manual',

            status: 'pending',

          }]

        : []

    }



    if (step.type === 'audio_shadow') {

      const script = String(config.transcript_en ?? '').trim()

      return script

        ? [{

            creator_id: creatorId,

            course_id: courseId,

            step_id: step.id,

            media_type: 'audio_generation',

            script,

            provider: 'fish_audio',

            status: 'pending',

          }]

        : []

    }



    return []

  })



  if (!queueItems.length) return



  const { error } = await db.from('media_queue').insert(queueItems)

  if (error) throw error

}



export async function POST(req: NextRequest) {

  const { user, profile } = await getSessionAndProfile()

  if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  }



  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {

    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })

  }



  const body = await req.json().catch(() => ({}))

  const draftId = typeof body.draftId === 'string' ? body.draftId : null

  if (!draftId) {

    return NextResponse.json({ error: 'draftId required' }, { status: 400 })

  }



  const db = await createSupabaseServiceServerClient()

  const google = createGoogleGenerativeAI({ apiKey })



  const stream = new ReadableStream<Uint8Array>({

    async start(controller) {

      try {

        const { data: draft, error: draftError } = await db

          .from('course_drafts')

          .select('*')

          .eq('id', draftId)

          .eq('creator_id', user.id)

          .single()



        if (draftError || !draft) throw new Error('Draft not found')

        const courseDraft = draft as CourseDraft

        const allowedStatuses = ['refining', 'generating', 'failed']
        if (!allowedStatuses.includes(courseDraft.status)) {
          throw new Error('Draft must be in refining status before generation')
        }

        if (!courseDraft.synopsis) throw new Error('Draft is missing synopsis')

        // Clean up any partially-created course from a previous failed attempt
        // (course_id may not be set on draft if generation failed before completing)
        await db.from('nursed_courses').delete().eq('source_draft_id', draftId)
        await db.from('course_drafts').update({ course_id: null }).eq('id', draftId)



        const synopsis = courseSynopsisSchema.parse(courseDraft.synopsis) as CourseSynopsis

        // Sanitize intake form: referenceImageUrls may be stored as "" (empty string) instead of []
        const rawIntake = courseDraft.intake_form as Record<string, unknown>
        if (!Array.isArray(rawIntake.referenceImageUrls)) {
          rawIntake.referenceImageUrls = []
        }
        const intakeForm = courseIntakeFormSchema.parse(rawIntake) as CourseIntakeForm

        // Cap modules to what the intake form requested (AI sometimes generates more)
        const cappedModules = synopsis.modules.slice(0, intakeForm.numModules)
        const cappedSynopsis: CourseSynopsis = { ...synopsis, modules: cappedModules, totalModules: cappedModules.length }

        const template = getCourseTemplate(synopsis.templateId)

        const resolvedLessons = resolveTemplate(template, draftId)



        await db.from('course_drafts').update({ status: 'generating' }).eq('id', draftId)



        const totalLessons = cappedModules.length * 8

        controller.enqueue(encodeEvent({ type: 'start', totalLessons, totalModules: cappedModules.length }))



        const courseSlug = `${generateSlug(cappedSynopsis.courseTitle) || 'course'}-${draftId.slice(0, 8)}`

        const { data: course, error: courseError } = await db

          .from('nursed_courses')

          .insert({

            title: cappedSynopsis.courseTitle,

            title_vi: cappedSynopsis.courseTitleVi,

            description: cappedSynopsis.courseDescription,

            description_vi: null,

            level: synopsis.level,

            published: false,

            hospital_id: null,

            slug: courseSlug,

            cover_image_url: null,

            creator_id: user.id,

            source_draft_id: draftId,

            category_id: courseDraft.category_id,

            review_status: 'draft',

            review_notes: null,

            submitted_at: null,

            approved_at: null,

            approved_by: null,

          })

          .select()

          .single()



        if (courseError || !course) throw courseError ?? new Error('Could not create course')



        for (const module of cappedModules) {

          controller.enqueue(encodeEvent({

            type: 'module_start',

            moduleIndex: module.orderIndex,

            moduleTitle: module.title,

          }))



          const { data: moduleRow, error: moduleError } = await db

            .from('nursed_modules')

            .insert({

              course_id: course.id,

              title: module.title,

              title_vi: module.titleVi,

              description: module.rationale,

              description_vi: null,

              order_index: module.orderIndex,

              slug: `${String(module.orderIndex).padStart(2, '0')}-${generateSlug(module.title) || 'module'}`,

            })

            .select()

            .single()



          if (moduleError || !moduleRow) throw moduleError ?? new Error('Could not create module')



          for (const lesson of module.lessons) {

            controller.enqueue(encodeEvent({

              type: 'lesson_start',

              moduleIndex: module.orderIndex,

              lessonIndex: lesson.orderIndex,

              moduleTitle: module.title,

              lessonTitle: lesson.title,

            }))



            const { data: lessonRow, error: lessonError } = await db

              .from('nursed_lessons')

              .insert({

                module_id: moduleRow.id,

                title: lesson.title,

                title_vi: null,

                description: lesson.scenarioContext,

                objective: lesson.objective,

                est_minutes: intakeForm.estimatedMinutesPerLesson,

                order_index: lesson.orderIndex,

                published: false,

                stage: lesson.stage,

                slug: `${String(lesson.orderIndex).padStart(2, '0')}-${generateSlug(lesson.title) || 'lesson'}`,

              })

              .select()

              .single()



            if (lessonError || !lessonRow) throw lessonError ?? new Error('Could not create lesson')



            const resolvedLesson = resolvedLessons.find((item) => item.lessonIndex === lesson.orderIndex)

            if (!resolvedLesson) {

              throw new Error(`Resolved lesson ${lesson.orderIndex} not found for template ${template.id}`)

            }



            const templateSteps = toTemplateSteps(resolvedLesson.steps)



            const lessonContent = await generateLessonContent({

              google,

              intakeForm,

              synopsis: cappedSynopsis,

              module,

              lesson,

              templateSteps,

              template,

              resolvedLesson,

            })



            const stepPayloads = templateSteps.map((templateStep, index) => ({

              lesson_id: lessonRow.id,

              type: templateStep.type,

              title: `${lesson.title} - ${templateStep.type.replaceAll('_', ' ')}`,

              title_vi: null,

              order_index: index + 1,

              config: buildStepConfig(

                templateStep,

                contentForStep(lessonContent, templateStep, index + 1),

                {

                  module,

                  lesson,

                  profession: intakeForm.profession,

                  industry: intakeForm.industry,

                  level: synopsis.level,

                },

              ),

            }))



            const { data: insertedSteps, error: stepsError } = await db

              .from('nursed_lesson_steps')

              .insert(stepPayloads)

              .select()



            if (stepsError || !insertedSteps) throw stepsError ?? new Error('Could not create steps')



            await insertMediaQueueItems({

              db,

              creatorId: user.id,

              courseId: course.id,

              steps: insertedSteps as NursedLessonStep[],

            })



            controller.enqueue(encodeEvent({

              type: 'lesson_done',

              moduleIndex: module.orderIndex,

              lessonIndex: lesson.orderIndex,

            }))

            // Small delay to avoid hitting Gemini rate limits on sequential calls
            await new Promise((resolve) => setTimeout(resolve, 800))

          }

        }



        await db

          .from('course_drafts')

          .update({ status: 'complete', course_id: course.id })

          .eq('id', draftId)



        controller.enqueue(encodeEvent({ type: 'complete', courseId: course.id }))

        controller.close()

      } catch (error) {

        console.error('[studio/generate stream]', error)

        await db.from('course_drafts').update({ status: 'failed' }).eq('id', draftId)

        controller.enqueue(encodeEvent({

          type: 'error',

          error: error instanceof Error ? error.message : 'Course generation failed',

        }))

        controller.close()

      }

    },

  })



  return new Response(stream, {

    headers: {

      'Content-Type': 'application/x-ndjson; charset=utf-8',

      'Cache-Control': 'no-cache, no-transform',

    },

  })

}

