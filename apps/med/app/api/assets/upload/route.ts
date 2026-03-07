import { NextRequest, NextResponse } from 'next/server'
import { uploadAsset, buildAssetPath, saveAssetRecord } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'audio'
    const lessonId = formData.get('lessonId') as string | null
    const stepId = formData.get('stepId') as string | null
    const speedTag = formData.get('speedTag') as string | null
    const accentTag = formData.get('accentTag') as string | null
    const transcriptEn = formData.get('transcriptEn') as string | null
    const transcriptVi = formData.get('transcriptVi') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const validTypes = ['audio', 'video', 'image', 'pdf']
    if (!validTypes.includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const path = buildAssetPath(type as any, file.name)
    const publicUrl = await uploadAsset(buffer, path, file.type)

    const asset = await saveAssetRecord({
      lesson_id: lessonId || undefined,
      step_id: stepId || undefined,
      type: type as any,
      storage_path: path,
      public_url: publicUrl,
      filename: file.name,
      speed_tag: (speedTag as any) || undefined,
      accent_tag: accentTag || undefined,
      transcript_en: transcriptEn || undefined,
      transcript_vi: transcriptVi || undefined,
    })

    return NextResponse.json({ data: asset }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
