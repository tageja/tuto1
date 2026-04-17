import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getServiceClient } from '@/lib/supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 })
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const storagePath = `${user.id}/avatar.${ext}`

    // Upload using the user's session — respects storage RLS on the avatars bucket
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('[avatar/upload]', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath)
    const avatar_url = urlData.publicUrl

    // Update profile row using service client (bypasses RLS)
    const db = getServiceClient()
    const { error: updateError } = await db
      .from('nursed_profiles')
      .update({ avatar_url })
      .eq('id', user.id)

    if (updateError) {
      console.error('[avatar/profile-update]', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatar_url })
  } catch (err) {
    console.error('[POST /api/profile/avatar]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
