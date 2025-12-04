import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Avatar Upload API Route
 * 
 * POST /api/school/settings/avatar?userId=X - Upload avatar and get signed URL
 * 
 * Expects multipart form data with 'file' field
 * Max file size: 1.5MB
 * Allowed types: image/jpeg, image/png, image/webp
 */

const MAX_FILE_SIZE = 1572864; // 1.5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServerSupabaseClient();

    // Verify user exists
    const { data: userData } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 1.5MB' },
        { status: 400 }
      );
    }

    // Determine file extension
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filePath = `${userData.id}/avatar.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old avatar first (if exists)
    await serviceClient.storage.from('user-avatars').remove([
      `${userData.id}/avatar.jpg`,
      `${userData.id}/avatar.png`,
      `${userData.id}/avatar.webp`,
    ]);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('user-avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: profileError } = await serviceClient
      .from('user_profiles')
      .upsert({
        user_id: userData.id,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (profileError) {
      console.error('Error updating profile with avatar:', profileError);
    }

    // Also update users table avatar
    await serviceClient
      .from('users')
      .update({ avatar: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', userData.id);

    // Log audit
    await serviceClient.from('audit_logs').insert({
      user_id: userData.id,
      action: 'avatar.upload',
      entity_type: 'user_profiles',
      entity_id: userData.id,
      meta: { file_type: file.type, file_size: file.size },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatar_url: avatarUrl,
        path: uploadData.path,
      },
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
