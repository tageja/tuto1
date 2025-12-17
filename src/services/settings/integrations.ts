/**
 * School Integrations Service (Admin only)
 * Handles school integrations operations with Supabase
 */

import { supabase } from '../../config/supabase';
import type { Integration, IntegrationInput } from '../../types/settings';

/**
 * Mask sensitive config fields
 */
function maskSensitiveConfig(config: Record<string, any>): Record<string, any> {
  const masked = { ...config };
  const sensitiveKeys = ['api_key', 'secret_key', 'auth_token', 'webhook_secret', 'vapid_private_key'];
  
  for (const key of sensitiveKeys) {
    if (masked[key]) {
      masked[key] = '***masked***';
    }
  }
  
  return masked;
}

/**
 * Get all school integrations
 */
export async function getSchoolIntegrations(schoolId: string): Promise<Integration[]> {
  // Get integrations
  const { data: integrations, error } = await supabase
    .from('school_integrations')
    .select('id, type, provider, config, connected_at')
    .eq('school_id', schoolId);

  if (error) {
    throw error;
  }

  // Mask sensitive fields in config
  const maskedIntegrations = (integrations || []).map(int => ({
    ...int,
    config: maskSensitiveConfig(int.config || {}),
  }));

  return maskedIntegrations as Integration[];
}

/**
 * Connect/Update integration
 */
export async function connectIntegration(
  schoolId: string,
  userId: string,
  integration: IntegrationInput
): Promise<Integration> {
  // Verify school exists
  const { data: schoolData } = await supabase
    .from('schools')
    .select('id')
    .eq('id', schoolId)
    .single();

  if (!schoolData) {
    throw new Error('School not found');
  }

  // Check if integration already exists (by type)
  const { data: existing } = await supabase
    .from('school_integrations')
    .select('id')
    .eq('school_id', schoolId)
    .eq('type', integration.type)
    .maybeSingle();

  let result;
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('school_integrations')
      .update({
        provider: integration.provider,
        config: integration.config,
        connected_by: userId,
        connected_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration:', error);
      throw new Error('Failed to update integration');
    }

    result = data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('school_integrations')
      .insert({
        school_id: schoolId,
        type: integration.type,
        provider: integration.provider,
        config: integration.config,
        connected_by: userId,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      throw new Error('Failed to create integration');
    }

    result = data;
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    school_id: schoolId,
    action: 'integration.connect',
    entity_type: 'school_integrations',
    entity_id: result.id,
    meta: { type: integration.type, provider: integration.provider },
  });

  return {
    ...result,
    config: maskSensitiveConfig(result.config || {}),
  } as Integration;
}

/**
 * Disconnect integration (delete)
 */
export async function disconnectIntegration(
  schoolId: string,
  userId: string,
  type: string
): Promise<void> {
  // Verify school exists
  const { data: schoolData } = await supabase
    .from('schools')
    .select('id')
    .eq('id', schoolId)
    .single();

  if (!schoolData) {
    throw new Error('School not found');
  }

  // Get integration ID before deleting
  const { data: integration } = await supabase
    .from('school_integrations')
    .select('id')
    .eq('school_id', schoolId)
    .eq('type', type)
    .maybeSingle();

  // Delete integration
  const { error } = await supabase
    .from('school_integrations')
    .delete()
    .eq('school_id', schoolId)
    .eq('type', type);

  if (error) {
    console.error('Error disconnecting integration:', error);
    throw new Error('Failed to disconnect integration');
  }

  // Log audit
  if (integration) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      school_id: schoolId,
      action: 'integration.disconnect',
      entity_type: 'school_integrations',
      entity_id: integration.id,
      meta: { type },
    });
  }
}


