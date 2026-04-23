import type { createServerSupabaseClient } from '../supabase';

type ServiceClient = ReturnType<typeof createServerSupabaseClient>;

export type PlatformFeedbackRow = {
  id: string;
  school_id: string;
  submitted_by_user_id: string;
  category: string;
  body: string;
  status: string;
  admin_response: string | null;
  responded_by_user_id: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function enrichPlatformFeedbackRows(
  service: ServiceClient,
  rows: PlatformFeedbackRow[]
): Promise<
  (PlatformFeedbackRow & { school_name: string; submitter_name: string; submitter_email: string })[]
> {
  if (!rows.length) return [];

  const schoolIds = Array.from(new Set(rows.map((r) => r.school_id)));
  const userIds = Array.from(new Set(rows.map((r) => r.submitted_by_user_id)));

  const [{ data: schools }, { data: users }] = await Promise.all([
    service.from('schools').select('id,name').in('id', schoolIds),
    service.from('users').select('id,name,email').in('id', userIds),
  ]);

  const schoolById = new Map((schools || []).map((s: { id: string; name: string }) => [s.id, s.name]));
  const userById = new Map(
    (users || []).map((u: { id: string; name: string | null; email: string }) => [u.id, u])
  );

  return rows.map((r) => {
    const u = userById.get(r.submitted_by_user_id);
    return {
      ...r,
      school_name: schoolById.get(r.school_id) || '',
      submitter_name: u?.name || '',
      submitter_email: u?.email || '',
    };
  });
}
