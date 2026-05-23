import { NextRequest, NextResponse } from 'next/server'
import {
  CREATOR_ROLES,
  createSupabaseServiceServerClient,
  getSessionAndProfile,
} from '@/lib/supabase-server'

const BUCKET = 'studio-uploads'
const MAX_FILES = 5
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])

function sanitizeFilename(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
  return base.slice(0, 120) || 'file'
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || !profile || !CREATOR_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const draftId = formData.get('draftId')
    const draftSegment =
      typeof draftId === 'string' && draftId.trim() ? draftId.trim() : 'no-draft'

    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 })
    }

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 },
        )
      }
      const mime = file.type || 'application/octet-stream'
      if (!ALLOWED_TYPES.has(mime)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 },
        )
      }
    }

    const db = await createSupabaseServiceServerClient()
    const urls: string[] = []

    for (const file of files) {
      const uniqueName = `${Date.now()}-${sanitizeFilename(file.name)}`
      const path = `${user.id}/${draftSegment}/${uniqueName}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await db.storage.from(BUCKET).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (uploadError) {
        console.error('[studio/upload]', uploadError)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      const { data } = db.storage.from(BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('[studio/upload POST]', error)
    return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 })
  }
}
