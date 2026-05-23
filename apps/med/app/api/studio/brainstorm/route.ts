import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamObject } from 'ai'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'
import { buildBrainstormPrompt } from '@/lib/studio/prompts/brainstorm'
import { courseIntakeFormSchema, courseSynopsisSchema } from '@/lib/studio/schemas'
import { getCourseTemplate, normalizeTemplateId } from '@/lib/studio/templates'
import type { CourseIntakeForm, CourseSynopsis } from '@/lib/studio/types'

export const maxDuration = 120

function isPdfUrl(url: string) {
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    return pathname.endsWith('.pdf')
  } catch {
    return url.toLowerCase().includes('.pdf')
  }
}

type ReferenceMediaPart =
  | { type: 'image'; image: URL }
  | { type: 'file'; data: URL; mimeType: string }

function buildReferenceContent(urls: string[]): ReferenceMediaPart[] {
  return urls.map((url) => {
    const parsed = new URL(url)
    if (isPdfUrl(url)) {
      return { type: 'file', data: parsed, mimeType: 'application/pdf' }
    }
    return { type: 'image', image: parsed }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const body = await req.json()
    const intake = courseIntakeFormSchema.parse(body.intakeForm) as CourseIntakeForm
    const draftId = typeof body.draftId === 'string' ? body.draftId : null

    const db = await createSupabaseServiceServerClient()
    let templateId = typeof body.templateId === 'string'
      ? normalizeTemplateId(body.templateId)
      : 'professional_communication'

    let referenceImageUrls = intake.referenceImageUrls ?? []

    if (draftId) {
      const { data: draft, error: draftError } = await db
        .from('course_drafts')
        .select('id, template_id, intake_form')
        .eq('id', draftId)
        .eq('creator_id', user.id)
        .single()

      if (draftError || !draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
      }

      templateId = normalizeTemplateId(draft.template_id)
      const draftIntakeForm = draft.intake_form as CourseIntakeForm | null
      referenceImageUrls =
        draftIntakeForm?.referenceImageUrls ?? intake.referenceImageUrls ?? []

      await db.from('course_drafts').update({ status: 'brainstorming' }).eq('id', draftId)
    }

    const intakeWithImages: CourseIntakeForm = { ...intake, referenceImageUrls }
    const template = getCourseTemplate(templateId)
    const { system, prompt, hasImages } = buildBrainstormPrompt(intakeWithImages, template)
    const imageUrls = referenceImageUrls.filter(Boolean)

    const google = createGoogleGenerativeAI({ apiKey })

    const streamArgs =
      hasImages && imageUrls.length > 0
        ? {
            model: google('gemini-2.5-flash'),
            schema: courseSynopsisSchema as never,
            system,
            messages: [
              {
                role: 'user' as const,
                content: [
                  { type: 'text' as const, text: prompt },
                  ...buildReferenceContent(imageUrls),
                ],
              },
            ],
          }
        : {
            model: google('gemini-2.5-flash'),
            schema: courseSynopsisSchema as never,
            system,
            prompt,
          }

    const result = streamObject(streamArgs as never) as {
      partialObjectStream: AsyncIterable<Partial<CourseSynopsis>>
      object: Promise<CourseSynopsis>
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const partial of result.partialObjectStream) {
            controller.enqueue(
              encoder.encode(`${JSON.stringify({ type: 'partial', synopsis: partial })}\n`),
            )
          }

          const synopsis = await result.object

          if (draftId) {
            await db
              .from('course_drafts')
              .update({
                synopsis,
                status: 'refining',
              })
              .eq('id', draftId)
              .eq('creator_id', user.id)
          }

          controller.enqueue(
            encoder.encode(`${JSON.stringify({ type: 'complete', synopsis })}\n`),
          )
          controller.close()
        } catch (error) {
          console.error('[studio/brainstorm stream]', error)
          if (draftId) {
            await db
              .from('course_drafts')
              .update({ status: 'failed' })
              .eq('id', draftId)
              .eq('creator_id', user.id)
          }
          controller.enqueue(
            encoder.encode(`${JSON.stringify({ type: 'error', error: 'Brainstorm failed' })}\n`),
          )
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
  } catch (error) {
    console.error('[studio/brainstorm POST]', error)
    return NextResponse.json({ error: 'Invalid brainstorm request' }, { status: 400 })
  }
}
