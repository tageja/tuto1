import { NextRequest, NextResponse } from 'next/server'

import { createGoogleGenerativeAI } from '@ai-sdk/google'

import { streamText, type ModelMessage } from 'ai'

import {

  CREATOR_ROLES,

  createSupabaseServiceServerClient,

  getSessionAndProfile,

} from '@/lib/supabase-server'

import { buildChatSystemPrompt } from '@/lib/studio/prompts/chat-system'

import { courseSynopsisSchema } from '@/lib/studio/schemas'

import { getCourseTemplate } from '@/lib/studio/templates'

import { extractCourseSynopsis } from '@/lib/studio/synopsis-json'

import type { CourseSynopsis } from '@/lib/studio/types'



export const maxDuration = 120



type ChatMessage = {

  role: 'user' | 'assistant'

  content: string

}



function toModelMessages(messages: ChatMessage[]): ModelMessage[] {

  return messages

    .filter((message) => message.role === 'user' || message.role === 'assistant')

    .map((message) => ({

      role: message.role,

      content: message.content,

    }))

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

    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : []

    const currentSynopsis = courseSynopsisSchema.parse(body.currentSynopsis) as CourseSynopsis

    const draftId = typeof body.draftId === 'string' ? body.draftId : null



    const db = await createSupabaseServiceServerClient()

    if (draftId) {

      const { data: draft, error: draftError } = await db

        .from('course_drafts')

        .select('id')

        .eq('id', draftId)

        .eq('creator_id', user.id)

        .single()



      if (draftError || !draft) {

        return NextResponse.json({ error: 'Draft not found' }, { status: 404 })

      }

    }



    const template = getCourseTemplate(currentSynopsis.templateId)

    const google = createGoogleGenerativeAI({ apiKey })

    const result = streamText({

      model: google('gemini-2.5-flash'),

      system: buildChatSystemPrompt(currentSynopsis, template),

      messages: toModelMessages(messages),

      onFinish: async ({ text }) => {

        if (!draftId) return



        const updatedSynopsis = extractCourseSynopsis(text)

        if (!updatedSynopsis) return



        await db

          .from('course_drafts')

          .update({

            synopsis: updatedSynopsis,

            chat_history: messages,

            status: 'refining',

          })

          .eq('id', draftId)

          .eq('creator_id', user.id)

      },

    })



    return result.toUIMessageStreamResponse()

  } catch (error) {

    console.error('[studio/chat POST]', error)

    return NextResponse.json({ error: 'Invalid chat request' }, { status: 400 })

  }

}

