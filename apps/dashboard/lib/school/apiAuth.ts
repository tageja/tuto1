import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../supabase';

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Uses the service-role client so it works even when sessions are stored
 * in localStorage (not cookies).
 */
export async function getUserFromBearer(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!token) return null;
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * Resolves all school_teachers row IDs for a given auth user at a school.
 * Searches by user_id first, then falls back to email to handle unlinked
 * or duplicate teacher profiles.
 */
export async function getTeacherIds(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  schoolId: string,
  authUser: { id: string; email?: string }
): Promise<string[]> {
  const ids: string[] = [];

  // Primary: match by users.id → school_teachers.user_id
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (userRow?.id) {
    const { data: byUserId } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('user_id', userRow.id);
    (byUserId || []).forEach((r) => ids.push(r.id));
  }

  // Fallback: match by email (covers unlinked/duplicate profiles)
  if (authUser.email) {
    const { data: byEmail } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', authUser.email.toLowerCase().trim());
    (byEmail || []).forEach((r) => {
      if (!ids.includes(r.id)) ids.push(r.id);
    });
  }

  return ids;
}

/**
 * Returns the first matching school_teachers row for the auth user.
 * Useful for routes that need a single teacher record for ownership checks.
 */
export async function getSingleTeacherRow(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  schoolId: string,
  authUser: { id: string; email?: string }
): Promise<{ id: string } | null> {
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (userRow?.id) {
    const { data } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('user_id', userRow.id)
      .maybeSingle();
    if (data) return data;
  }

  if (authUser.email) {
    const { data } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', authUser.email.toLowerCase().trim())
      .maybeSingle();
    if (data) return data;
  }

  return null;
}
