import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { BrandingSchema } from '../../../../../lib/validation/settings';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * School Branding API Route (Admin only)
 * 
 * GET  /api/school/settings/branding?schoolId=X - Get school branding
 * PUT  /api/school/settings/branding?schoolId=X - Update school branding
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
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

    // Get branding
    const { data: branding } = await serviceClient
      .from('school_branding')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    // Get school info
    const { data: schoolInfo } = await serviceClient
      .from('schools')
      .select('name, address, phone, email')
      .eq('id', schoolId)
      .single();

    // Return default branding if none exists
    const brandingData = {
      school_id: schoolId,
      school_name: schoolInfo?.name || '',
      school_address: schoolInfo?.address || '',
      school_phone: schoolInfo?.phone || '',
      school_email: schoolInfo?.email || '',
      logo_url: branding?.logo_url || null,
      primary_hex: branding?.primary_hex || '#0B5FFF',
      accent_hex: branding?.accent_hex || '#10B981',
      header_img_url: branding?.header_img_url || null,
      updated_at: branding?.updated_at || null,
    };

    return NextResponse.json({
      success: true,
      data: brandingData,
    });
  } catch (error: any) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const userId = searchParams.get('userId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
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

    // Get user ID if provided (for audit log)
    let userData: { id: string } | null = null;
    if (userId) {
      const { data } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      userData = data;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = BrandingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const brandingData = validationResult.data;

    // Extract school info fields
    const { school_name, school_address, school_phone, school_email, ...brandingFields } = brandingData as any;

    // Update school info if provided
    if (school_name || school_address || school_phone || school_email) {
      const schoolUpdate: any = { updated_at: new Date().toISOString() };
      if (school_name) schoolUpdate.name = school_name;
      if (school_address) schoolUpdate.address = school_address;
      if (school_phone) schoolUpdate.phone = school_phone;
      if (school_email) schoolUpdate.email = school_email;

      const { error: schoolError } = await serviceClient
        .from('schools')
        .update(schoolUpdate)
        .eq('id', schoolId);

      if (schoolError) {
        console.error('Error updating school:', schoolError);
      }
    }

    // Upsert branding
    const { data: branding, error: brandingError } = await serviceClient
      .from('school_branding')
      .upsert({
        school_id: schoolId,
        ...brandingFields,
        updated_by: userData?.id || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'school_id',
      })
      .select()
      .single();

    if (brandingError) {
      console.error('Error updating branding:', brandingError);
      return NextResponse.json(
        { success: false, error: 'Failed to update branding' },
        { status: 500 }
      );
    }

    // Log audit if user is known
    if (userData?.id) {
      await serviceClient.from('audit_logs').insert({
        user_id: userData.id,
        school_id: schoolId,
        action: 'branding.update',
        entity_type: 'school_branding',
        entity_id: schoolId,
        meta: { fields: Object.keys(brandingData) },
      });
    }

    return NextResponse.json({
      success: true,
      data: branding,
    });
  } catch (error: any) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

