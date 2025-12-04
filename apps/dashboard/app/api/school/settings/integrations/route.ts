import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { IntegrationSchema, IntegrationTypeSchema } from '../../../../../lib/validation/settings';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * School Integrations API Route (Admin only)
 * 
 * GET    /api/school/settings/integrations?schoolId=X - Get all integrations
 * POST   /api/school/settings/integrations?schoolId=X - Create/update integration
 * DELETE /api/school/settings/integrations?schoolId=X&type=payments - Delete integration
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

    // Get integrations
    const { data: integrations, error } = await serviceClient
      .from('school_integrations')
      .select('id, type, provider, config, connected_at')
      .eq('school_id', schoolId);

    if (error) {
      throw error;
    }

    // Mask sensitive fields in config
    const maskedIntegrations = (integrations || []).map(int => ({
      ...int,
      config: maskSensitiveConfig(int.config),
    }));

    return NextResponse.json({
      success: true,
      data: maskedIntegrations,
    });
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Get user ID if provided
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
    const validationResult = IntegrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { type, provider, config } = validationResult.data;

    // Upsert integration
    const { data: integration, error: intError } = await serviceClient
      .from('school_integrations')
      .upsert({
        school_id: schoolId,
        type,
        provider,
        config,
        connected_at: new Date().toISOString(),
        connected_by: userData?.id || null,
      }, {
        onConflict: 'school_id,type',
      })
      .select()
      .single();

    if (intError) {
      console.error('Error saving integration:', intError);
      return NextResponse.json(
        { success: false, error: 'Failed to save integration' },
        { status: 500 }
      );
    }

    // Log audit if user is known
    if (userData?.id) {
      await serviceClient.from('audit_logs').insert({
        user_id: userData.id,
        school_id: schoolId,
        action: 'integration.upsert',
        entity_type: 'school_integrations',
        entity_id: integration.id,
        meta: { type, provider },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...integration,
        config: maskSensitiveConfig(integration.config),
      },
    });
  } catch (error: any) {
    console.error('Error saving integration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const integrationType = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    if (!integrationType) {
      return NextResponse.json(
        { success: false, error: 'Integration type is required' },
        { status: 400 }
      );
    }

    const typeValidation = IntegrationTypeSchema.safeParse(integrationType);
    if (!typeValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid integration type' },
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

    // Get user ID if provided
    let userData: { id: string } | null = null;
    if (userId) {
      const { data } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      userData = data;
    }

    // Delete integration
    const { error: deleteError } = await serviceClient
      .from('school_integrations')
      .delete()
      .eq('school_id', schoolId)
      .eq('type', integrationType);

    if (deleteError) {
      console.error('Error deleting integration:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete integration' },
        { status: 500 }
      );
    }

    // Log audit if user is known
    if (userData?.id) {
      await serviceClient.from('audit_logs').insert({
        user_id: userData.id,
        school_id: schoolId,
        action: 'integration.delete',
        entity_type: 'school_integrations',
        meta: { type: integrationType },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Integration deleted',
    });
  } catch (error: any) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to mask sensitive fields
function maskSensitiveConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['api_key', 'secret_key', 'webhook_secret', 'auth_token', 'vapid_private_key'];
  const masked: Record<string, any> = {};

  for (const [key, value] of Object.entries(config || {})) {
    if (sensitiveFields.includes(key) && typeof value === 'string' && value.length > 4) {
      masked[key] = '••••' + value.slice(-4);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
