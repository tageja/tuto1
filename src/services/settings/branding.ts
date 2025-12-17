/**
 * School Branding Service (Admin only)
 * Handles school branding operations with Supabase
 */

import { supabase } from '../../config/supabase';
import type { BrandingInput, BrandingData } from '../../types/settings';
import * as FileSystem from 'expo-file-system';

/**
 * Resolve school ID (handle Airtable IDs → Supabase UUIDs)
 */
async function resolveSchoolId(schoolId: string): Promise<string> {
  // If it looks like a UUID, use it directly
  if (schoolId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return schoolId;
  }

  // If it's an Airtable ID (starts with 'rec'), resolve to UUID
  if (schoolId.startsWith('rec')) {
    console.log('🔧 Resolving Airtable school ID to UUID:', schoolId);
    // Try to find "Tuto Demo School" as fallback
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('name', 'Tuto Demo School')
      .single();

    if (school) {
      console.log('✅ Resolved to Tuto Demo School UUID:', school.id);
      return school.id;
    }
  }

  // Otherwise, try to find by school name
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('name', schoolId)
    .single();

  if (school) {
    return school.id;
  }

  throw new Error(`Could not resolve school ID: ${schoolId}`);
}

/**
 * Get school branding data
 */
export async function getSchoolBranding(schoolId: string): Promise<BrandingData> {
  // Resolve school ID first (handle Airtable IDs)
  const resolvedSchoolId = await resolveSchoolId(schoolId);
  console.log('🎨 Fetching branding for school:', resolvedSchoolId);

  // Get branding
  const { data: branding } = await supabase
    .from('school_branding')
    .select('*')
    .eq('school_id', resolvedSchoolId)
    .single();

  // Get school info
  const { data: schoolInfo } = await supabase
    .from('schools')
    .select('name, address, phone, email')
    .eq('id', resolvedSchoolId)
    .single();

  if (!schoolInfo) {
    throw new Error('School not found');
  }

  // Return merged branding data with defaults
  const brandingData: BrandingData = {
    school_id: resolvedSchoolId,
    school_name: schoolInfo.name || '',
    school_address: schoolInfo.address || null,
    school_phone: schoolInfo.phone || null,
    school_email: schoolInfo.email || null,
    logo_url: branding?.logo_url || null,
    primary_hex: branding?.primary_hex || '#0B5FFF',
    accent_hex: branding?.accent_hex || '#10B981',
    header_img_url: branding?.header_img_url || null,
    updated_at: branding?.updated_at || null,
  };

  return brandingData;
}

/**
 * Update school branding
 */
export async function updateSchoolBranding(
  schoolId: string,
  userId: string,
  data: BrandingInput
): Promise<BrandingData> {
  // Resolve school ID first
  const resolvedSchoolId = await resolveSchoolId(schoolId);

  // Verify school exists
  const { data: schoolData } = await supabase
    .from('schools')
    .select('id')
    .eq('id', resolvedSchoolId)
    .single();

  if (!schoolData) {
    throw new Error('School not found');
  }

  // Upsert branding
  const { error: brandingError } = await supabase
    .from('school_branding')
    .upsert({
      school_id: resolvedSchoolId,
      ...data,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'school_id',
    });

  if (brandingError) {
    console.error('Error updating branding:', brandingError);
    throw new Error('Failed to update branding');
  }

  // Update school info if provided (note: this assumes schools table has these fields)
  // For now, we'll only update branding table

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    school_id: resolvedSchoolId,
    action: 'branding.update',
    entity_type: 'school_branding',
    entity_id: resolvedSchoolId,
    meta: { fields: Object.keys(data) },
  });

  // Return updated branding
  return getSchoolBranding(resolvedSchoolId);
}

/**
 * Upload school logo
 */
export async function uploadLogo(
  schoolId: string,
  userId: string,
  fileUri: string
): Promise<string> {
  // Resolve school ID first
  const resolvedSchoolId = await resolveSchoolId(schoolId);

  // Verify school exists
  const { data: schoolData } = await supabase
    .from('schools')
    .select('id')
    .eq('id', resolvedSchoolId)
    .single();

  if (!schoolData) {
    throw new Error('School not found');
  }

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('File not found');
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine content type from file extension
  const ext = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  else if (ext === 'webp') contentType = 'image/webp';

  // Convert base64 to blob
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const storageExt = ext === 'jpg' || ext === 'jpeg' ? 'jpg' : ext;
  const filePath = `${resolvedSchoolId}/logo.${storageExt}`;

  // Delete old logo first (if exists)
  await supabase.storage.from('school-branding').remove([
    `${resolvedSchoolId}/logo.jpg`,
    `${resolvedSchoolId}/logo.png`,
    `${resolvedSchoolId}/logo.webp`,
  ]);

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('school-branding')
    .upload(filePath, byteArray, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading logo:', uploadError);
    throw new Error('Failed to upload logo');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('school-branding')
    .getPublicUrl(filePath);

  const logoUrl = urlData.publicUrl;

  // Update branding with new logo URL
  await updateSchoolBranding(resolvedSchoolId, userId, { logo_url: logoUrl });

  return logoUrl;
}

/**
 * Upload school header image
 */
export async function uploadHeaderImage(
  schoolId: string,
  userId: string,
  fileUri: string
): Promise<string> {
  // Resolve school ID first
  const resolvedSchoolId = await resolveSchoolId(schoolId);

  // Verify school exists
  const { data: schoolData } = await supabase
    .from('schools')
    .select('id')
    .eq('id', resolvedSchoolId)
    .single();

  if (!schoolData) {
    throw new Error('School not found');
  }

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('File not found');
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine content type from file extension
  const ext = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  else if (ext === 'webp') contentType = 'image/webp';

  // Convert base64 to blob
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const storageExt = ext === 'jpg' || ext === 'jpeg' ? 'jpg' : ext;
  const filePath = `${resolvedSchoolId}/header.${storageExt}`;

  // Delete old header first (if exists)
  await supabase.storage.from('school-branding').remove([
    `${resolvedSchoolId}/header.jpg`,
    `${resolvedSchoolId}/header.png`,
    `${resolvedSchoolId}/header.webp`,
  ]);

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('school-branding')
    .upload(filePath, byteArray, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading header image:', uploadError);
    throw new Error('Failed to upload header image');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('school-branding')
    .getPublicUrl(filePath);

  const headerUrl = urlData.publicUrl;

  // Update branding with new header URL
  await updateSchoolBranding(resolvedSchoolId, userId, { header_img_url: headerUrl });

  return headerUrl;
}

