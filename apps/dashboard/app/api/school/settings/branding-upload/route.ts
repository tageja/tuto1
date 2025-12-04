import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * School Branding Upload API Route (Admin only)
 * 
 * POST /api/school/settings/branding-upload?schoolId=X&type=logo|header
 */

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const uploadType = searchParams.get('type') as 'logo' | 'header';

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    if (!uploadType || !['logo', 'header'].includes(uploadType)) {
      return NextResponse.json(
        { success: false, error: 'Upload type must be "logo" or "header"' },
        { status: 400 }
      );
    }

    const serviceClient = createServerSupabaseClient();

    // Resolve school ID
    const schoolId = await resolveSchoolId(serviceClient, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max for branding images)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Generate file path
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filePath = `${schoolId}/${uploadType}-${timestamp}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old file if exists (optional cleanup)
    const { data: existingFiles } = await serviceClient.storage
      .from('school-branding')
      .list(schoolId, { search: `${uploadType}-` });
    
    if (existingFiles && existingFiles.length > 0) {
      const oldPaths = existingFiles
        .filter(f => f.name.startsWith(`${uploadType}-`))
        .map(f => `${schoolId}/${f.name}`);
      
      if (oldPaths.length > 0) {
        await serviceClient.storage
          .from('school-branding')
          .remove(oldPaths);
      }
    }

    // Upload new file using service client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('school-branding')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = serviceClient.storage
      .from('school-branding')
      .getPublicUrl(filePath);

    // Update school_branding table
    const updateField = uploadType === 'logo' ? 'logo_url' : 'header_img_url';
    
    const { error: brandingError } = await serviceClient
      .from('school_branding')
      .upsert({
        school_id: schoolId,
        [updateField]: publicUrl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'school_id',
      });

    if (brandingError) {
      console.error('Branding update error:', brandingError);
      // Don't fail - the file was uploaded successfully
    }

    // Log audit
    await serviceClient.from('audit_logs').insert({
      school_id: schoolId,
      action: `branding.upload.${uploadType}`,
      entity_type: 'school_branding',
      entity_id: schoolId,
      meta: { file_path: filePath },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        type: uploadType,
      },
    });
  } catch (error: any) {
    console.error('Error uploading branding:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
