import { NextRequest, NextResponse } from 'next/server';
import { requireBearerAuth } from '../../../../lib/platform-feedback/apiAuth';
import { enrichPlatformFeedbackRows } from '../../../../lib/platform-feedback/enrich';

const STATUSES = new Set(['open', 'in_progress', 'closed', 'rejected']);
const CATEGORIES = new Set(['bug', 'feature', 'improvement', 'question', 'other']);

export async function GET(request: NextRequest) {
  const auth = await requireBearerAuth(request);
  if ('error' in auth) return auth.error;

  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const sp = request.nextUrl.searchParams;
  const status = sp.get('status')?.trim();
  const category = sp.get('category')?.trim();
  const limitRaw = sp.get('limit');
  const offsetRaw = sp.get('offset');

  const limit = Math.min(Math.max(Number(limitRaw) || 20, 1), 100);
  const offset = Math.max(Number(offsetRaw) || 0, 0);

  let q = auth.dbUser
    .from('platform_feedback')
    .select(
      `
      id,
      school_id,
      submitted_by_user_id,
      category,
      body,
      status,
      admin_response,
      responded_by_user_id,
      responded_at,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    );

  if (status && status !== 'all' && STATUSES.has(status)) {
    q = q.eq('status', status);
  }
  if (category && category !== 'all' && CATEGORIES.has(category)) {
    q = q.eq('category', category);
  }

  const { data: rows, error, count } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[platform-feedback] admin list failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const data = await enrichPlatformFeedbackRows(auth.service, (rows || []) as any);

  return NextResponse.json({ success: true, data, total: count ?? data.length });
}
