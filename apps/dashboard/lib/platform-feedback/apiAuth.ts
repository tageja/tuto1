import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedSupabaseClient, createBearerSupabaseClient, createServerSupabaseClient } from '../supabase';
import { resolveSchoolId } from '../school/resolveSchoolId';

export type BearerAuth =
  | {
      accessToken: string;
      userId: string;
      profileId: string;
      role: string;
      dbUser: ReturnType<typeof createBearerSupabaseClient>;
      service: ReturnType<typeof createServerSupabaseClient>;
    }
  | { error: NextResponse };

export async function requireBearerAuth(request: NextRequest): Promise<BearerAuth> {
  let accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')?.trim();
  if (!accessToken) {
    const cookieClient = await createAuthenticatedSupabaseClient(request);
    const {
      data: { session },
    } = await cookieClient.auth.getSession();
    accessToken = session?.access_token ?? undefined;
  }
  if (!accessToken) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const service = createServerSupabaseClient();
  const { data: userData, error: authError } = await service.auth.getUser(accessToken);
  const user = userData?.user;
  if (authError || !user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await service
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 }) };
  }

  return {
    accessToken,
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
    dbUser: createBearerSupabaseClient(accessToken),
    service,
  };
}

export async function assertSchoolAdminCanAccessSchool(
  service: ReturnType<typeof createServerSupabaseClient>,
  profileId: string,
  role: string,
  schoolUuid: string
): Promise<boolean> {
  if (role === 'admin') return true;
  if (role !== 'school_admin') return false;
  // Canonical school-admin link table is `school_users` with role='admin'.
  // (`school_admins` is legacy and unused — confirmed during MP-A QA on 2026-04-23.)
  const { data } = await service
    .from('school_users')
    .select('school_id')
    .eq('user_id', profileId)
    .eq('school_id', schoolUuid)
    .eq('role', 'admin')
    .maybeSingle();
  return !!data;
}

export async function resolveSchoolUuid(
  service: ReturnType<typeof createServerSupabaseClient>,
  schoolIdentifier: string
): Promise<string | null> {
  return resolveSchoolId(service, schoolIdentifier);
}
