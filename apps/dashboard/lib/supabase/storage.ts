/**
 * Supabase Storage Helper Functions
 */

import { supabase } from '../supabase';

const MESSAGE_BUCKET = 'message-attachments';

export type MessageAttachmentMeta = {
  name: string;
  url: string;
  size: number;
  path: string;
  contentType?: string;
};

/**
 * Upload student photo to Supabase Storage
 * @param schoolId - School ID
 * @param studentNumber - Student number/code
 * @param file - File to upload
 * @returns Public URL of uploaded photo
 */
export async function uploadStudentPhoto(
  schoolId: string,
  studentNumber: string,
  file: File
): Promise<string> {
  try {
    // Get file extension
    const ext = file.name.split('.').pop() || 'jpg';
    
    // Generate unique filename: schoolId/studentNumber-timestamp.ext
    const timestamp = Date.now();
    const fileName = `${studentNumber}-${timestamp}.${ext}`;
    const filePath = `${schoolId}/${fileName}`;

    // Upload to student-photos bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded photo');
    }

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadStudentPhoto:', error);
    throw error;
  }
}

/**
 * Upload activity attachments to Supabase Storage
 * @param schoolId - School ID
 * @param activityId - Activity ID (or temporary ID for new activities)
 * @param files - Array of files to upload
 * @returns Array of attachment objects with name, url, and size
 */
export async function uploadActivityFiles(
  schoolId: string,
  activityId: string,
  files: File[]
): Promise<Array<{ name: string; url: string; size: number }>> {
  const out: Array<{ name: string; url: string; size: number }> = [];

  for (const f of files) {
    // Path format: activity-attachments/${schoolId}/${activityId}/${filename}
    // Add timestamp to avoid filename conflicts
    const timestamp = Date.now();
    const filename = `${timestamp}-${f.name}`;
    const path = `${schoolId}/${activityId}/${filename}`;

    const { error } = await supabase.storage
      .from('activity-attachments')
      .upload(path, f, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('activity-attachments').getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new Error(`Failed to get public URL for ${f.name}`);
    }

    out.push({ name: f.name, url: data.publicUrl, size: f.size });
  }

  return out;
}

/**
 * Upload message attachments to Supabase Storage
 */
export async function uploadMessageFiles(params: {
  schoolId: string;
  threadId: string;
  files: File[];
}): Promise<MessageAttachmentMeta[]> {
  const { schoolId, threadId, files } = params;

  if (!files?.length) {
    return [];
  }

  const uploaded: MessageAttachmentMeta[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/\s+/g, '-');
    const filename = `${Date.now()}-${safeName}`;
    const path = `${schoolId}/${threadId}/${filename}`;

    const { error } = await supabase.storage.from(MESSAGE_BUCKET).upload(path, file, {
      upsert: false,
      cacheControl: '300',
    });

    if (error) {
      console.error('uploadMessageFiles error', error);
      throw error;
    }

    const { data } = supabase.storage.from(MESSAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error('Failed to resolve public URL for message attachment');
    }

    uploaded.push({
      name: file.name,
      url: data.publicUrl,
      size: file.size,
      path,
      contentType: file.type,
    });
  }

  return uploaded;
}

/**
 * Create a signed URL for a message attachment (fallback when bucket privacy changes)
 */
export async function getSignedMessageAttachmentUrl(path: string, expiresIn = 120): Promise<string> {
  const { data, error } = await supabase.storage.from(MESSAGE_BUCKET).createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw error || new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
}

