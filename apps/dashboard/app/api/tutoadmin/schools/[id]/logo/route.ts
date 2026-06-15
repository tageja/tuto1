import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';

const BUCKET = 'school-logos';
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/**
 * POST /api/tutoadmin/schools/[id]/logo
 * Upload a school logo. Stores in Supabase storage bucket "school-logos"
 * and writes the public URL to schools.logo_url.
 *
 * Accepts multipart/form-data with a single "file" field.
 * Requires tutoadmin auth (@tutoglobal.com only).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const supabase = createServerSupabaseClient();

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Use PNG, JPEG, WebP, or SVG.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 2 MB.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'png';
    const storageKey = `${schoolId}/logo.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage (upsert so re-uploading replaces the existing logo)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storageKey);

    const logoUrl = urlData.publicUrl;

    // Persist to DB
    const { error: dbError } = await supabase
      .from('schools')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    if (dbError) {
      console.error('DB update error:', dbError);
      return NextResponse.json(
        { success: false, error: `DB update failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, logo_url: logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tutoadmin/schools/[id]/logo
 * Remove the school logo (clears logo_url in DB, removes from storage).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const supabase = createServerSupabaseClient();

    // Clear DB first
    const { error: dbError } = await supabase
      .from('schools')
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Best-effort removal from storage (don't fail if file not found)
    const extensions = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
    for (const ext of extensions) {
      await supabase.storage.from(BUCKET).remove([`${schoolId}/logo.${ext}`]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logo delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
