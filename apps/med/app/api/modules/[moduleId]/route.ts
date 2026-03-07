import { NextRequest, NextResponse } from 'next/server'
import { getModuleById, updateModule, deleteModule } from '@/lib/db/courses'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params
    const mod = await getModuleById(moduleId)
    return NextResponse.json({ data: mod })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params
    const body = await req.json()
    const mod = await updateModule(moduleId, body)
    return NextResponse.json({ data: mod })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params
    await deleteModule(moduleId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
