import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '../../../../lib/email/send';
import { platformFeedbackRespondedEmail } from '../../../../lib/email/templates/platformFeedbackResponded';
import { requireBearerAuth } from '../../../../lib/platform-feedback/apiAuth';
import { enrichPlatformFeedbackRows, type PlatformFeedbackRow } from '../../../../lib/platform-feedback/enrich';

const STATUSES = new Set(['open', 'in_progress', 'closed', 'rejected']);

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://tutoglobal.com').replace(/\/$/, '');
}

const SELECT_ROW = `
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
`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireBearerAuth(request);
  if ('error' in auth) return auth.error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }

  const { data: row, error } = await auth.dbUser.from('platform_feedback').select(SELECT_ROW).eq('id', id).maybeSingle();

  if (error) {
    console.error('[platform-feedback] get one failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const enriched = await enrichPlatformFeedbackRows(auth.service, [row as unknown as PlatformFeedbackRow]);
  const data = enriched[0];
  if (!data) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireBearerAuth(request);
  if ('error' in auth) return auth.error;

  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const patch = bodyJson as { status?: string; admin_response?: string };

  const { data: before, error: beforeErr } = await auth.dbUser
    .from('platform_feedback')
    .select(SELECT_ROW)
    .eq('id', id)
    .maybeSingle();

  if (beforeErr || !before) {
    return NextResponse.json({ success: false, error: beforeErr?.message || 'Not found' }, { status: beforeErr ? 500 : 404 });
  }

  const beforeRow = before as unknown as PlatformFeedbackRow;
  const enrichedBefore = await enrichPlatformFeedbackRows(auth.service, [beforeRow]);
  const beforeEnriched = enrichedBefore[0];
  if (!beforeEnriched) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  const updates: Record<string, unknown> = {};

  if (patch.status !== undefined) {
    if (!STATUSES.has(patch.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }
    updates.status = patch.status;
  }
  if (patch.admin_response !== undefined) {
    const ar = patch.admin_response.trim();
    if (ar.length > 5000) {
      return NextResponse.json({ success: false, error: 'admin_response max 5000 characters' }, { status: 400 });
    }
    updates.admin_response = ar.length ? ar : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 });
  }

  updates.responded_by_user_id = auth.profileId;
  updates.responded_at = new Date().toISOString();

  const { error: upErr } = await auth.dbUser.from('platform_feedback').update(updates).eq('id', id);

  if (upErr) {
    console.error('[platform-feedback] patch failed', upErr);
    return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
  }

  const oldStatus = String(beforeEnriched.status);
  const oldResponse = beforeEnriched.admin_response == null ? '' : String(beforeEnriched.admin_response);
  const newStatus = (updates.status as string | undefined) ?? oldStatus;
  const newResponse =
    updates.admin_response !== undefined
      ? updates.admin_response == null
        ? ''
        : String(updates.admin_response)
      : oldResponse;

  const notify = newStatus !== oldStatus || newResponse.trim() !== oldResponse.trim();

  if (notify) {
    try {
      const to = beforeEnriched.submitter_email?.trim();
      const name = beforeEnriched.submitter_name || 'there';
      const bodyText = String(beforeEnriched.body);
      const excerpt = bodyText.length > 200 ? `${bodyText.slice(0, 200)}…` : bodyText;
      const schoolId = String(beforeEnriched.school_id);

      if (to) {
        const { subject, html, text } = platformFeedbackRespondedEmail({
          submitterName: name,
          bodyExcerpt: excerpt,
          status: newStatus,
          adminResponse: newResponse.trim() ? newResponse : null,
          helpUrl: `${appBaseUrl()}/school/${encodeURIComponent(schoolId)}/admin/help`,
        });
        const mail = await sendMail({ to, subject, html, text });
        if (!mail.ok) {
          console.error('[platform-feedback] responder email failed', mail.error);
        }
      }
    } catch (err) {
      console.error('[platform-feedback] responder email failed', err);
    }
  }

  return NextResponse.json({ success: true });
}
