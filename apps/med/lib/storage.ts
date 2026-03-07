import { getServiceClient } from './supabase'

const BUCKET = 'nursed-assets'

export async function uploadAsset(
  file: Buffer | Blob,
  path: string,
  contentType: string
): Promise<string> {
  const db = getServiceClient()
  const { data, error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  })
  if (error) throw error
  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function getPublicUrl(path: string): Promise<string> {
  const db = getServiceClient()
  const { data } = db.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAsset(path: string): Promise<void> {
  const db = getServiceClient()
  const { error } = await db.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export function buildAssetPath(type: 'audio' | 'video' | 'image' | 'pdf', filename: string): string {
  const ts = Date.now()
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${type}s/${ts}_${safe}`
}

export async function saveAssetRecord(payload: {
  lesson_id?: string
  step_id?: string
  type: 'audio' | 'video' | 'image' | 'pdf'
  storage_path: string
  public_url: string
  filename: string
  duration_seconds?: number
  transcript_en?: string
  transcript_vi?: string
  speed_tag?: 'slow' | 'normal' | 'fast'
  accent_tag?: string
}) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_content_assets')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}
