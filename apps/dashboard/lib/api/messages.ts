import { SupabaseClient } from '@supabase/supabase-js';
import type { ParticipantRole } from '../types/messages';

export type DbUserProfile = {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  avatar?: string | null;
};

const ADMIN_ROLES = new Set(['admin', 'school_admin', 'super_admin']);
const TEACHER_ROLES = new Set(['teacher', 'staff']);
const PARENT_ROLES = new Set(['parent', 'guardian']);
const USER_SELECT = 'id, auth_user_id, email, name, role, avatar';
const BATCH_SIZE = 100;

const dedupe = (values: (string | null | undefined)[]): string[] => {
  const set = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    set.add(value);
  }
  return Array.from(set);
};

export const mapRoleToParticipant = (role?: string | null): ParticipantRole => {
  if (!role) {
    return 'Parent';
  }

  const normalized = role.toLowerCase();

  if (ADMIN_ROLES.has(normalized)) return 'Admin';
  if (TEACHER_ROLES.has(normalized)) return 'Teacher';
  if (PARENT_ROLES.has(normalized)) return 'Parent';

  // Fallback: treat unknown roles as parent for least-privilege
  return 'Parent';
};

export async function getUserByAuthId(
  supabase: SupabaseClient,
  authId?: string | null
): Promise<DbUserProfile | null> {
  if (!authId) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('auth_user_id', authId)
    .single();

  if (error || !data) {
    console.error('getUserByAuthId error', error);
    return null;
  }

  return data;
}

export async function getUsersByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<DbUserProfile[]> {
  const uniqueIds = dedupe(ids);
  if (!uniqueIds.length) return [];

  const batches: DbUserProfile[] = [];

  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const chunk = uniqueIds.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('users')
      .select(USER_SELECT)
      .in('id', chunk);

    if (error) {
      throw error;
    }

    if (data) {
      batches.push(...data);
    }
  }

  return batches;
}

export async function getUsersByEmails(
  supabase: SupabaseClient,
  emails: string[]
): Promise<DbUserProfile[]> {
  const normalized = dedupe(
    emails.map((email) => email?.trim().toLowerCase()).filter(Boolean)
  );

  if (!normalized.length) return [];

  const batches: DbUserProfile[] = [];

  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const chunk = normalized.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('users')
      .select(USER_SELECT)
      .in('email', chunk);

    if (error) {
      throw error;
    }

    if (data) {
      batches.push(...data);
    }
  }

  return batches;
}





