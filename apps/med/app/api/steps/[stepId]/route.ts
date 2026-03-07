import { NextRequest, NextResponse } from 'next/server'
import { updateStep, deleteStep } from '@/lib/db/courses'
import { getServiceClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ stepId: string }> }) {
  try {
    const { stepId } = await params
    const db = getServiceClient()
    const { data, error } = await db
      .from('nursed_lesson_steps')
      .select('*, nursed_content_assets(*), nursed_scripts(*), nursed_quiz_questions(*)')
      .eq('id', stepId)
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ stepId: string }> }) {
  try {
    const { stepId } = await params
    const body = await req.json()
    const step = await updateStep(stepId, body)
    return NextResponse.json({ data: step })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ stepId: string }> }) {
  try {
    const { stepId } = await params
    await deleteStep(stepId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
