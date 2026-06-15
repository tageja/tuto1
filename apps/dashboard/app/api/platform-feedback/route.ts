import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '../../../lib/email/send';
import { platformFeedbackCreatedEmail } from '../../../lib/email/templates/platformFeedbackCreated';
import {
  assertSchoolAdminCanAccessSchool,
  requireBearerAuth,
  resolveSchoolUuid,
} from '../../../lib/platform-feedback/apiAuth';
import { enrichPlatformFeedbackRows } from '../../../lib/platform-feedback/enrich';

const CATEGORIES = new Set(['bug', 'feature', 'improvement', 'question', 'other']);

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://tutoglobal.com').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const auth = await requireBearerAuth(request);
  if ('error' in auth) return auth.error;

  if (auth.role !== 'school_admin') {
    return NextResponse.json({ success: false, error: 'Only school admins can submit platform feedback' }, { status: 403 });
  }

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const body = bodyJson as {
    schoolId?: string;
    category?: string;
    body?: string;
  };

  const schoolIdentifier = body.schoolId?.trim();
  const category = body.category?.trim();
  const message = typeof body.body === 'string' ? body.body.trim() : '';

  if (!schoolIdentifier) {
    return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 });
  }
  if (!category || !CATEGORIES.has(category)) {
    return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });
  }
  if (message.length < 1 || message.length > 5000) {
    return NextResponse.json({ success: false, error: 'body must be 1–5000 characters' }, { status: 400 });
  }

  const schoolUuid = await resolveSchoolUuid(auth.service, schoolIdentifier);
  if (!schoolUuid) {
    return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
  }

  const allowed = await assertSchoolAdminCanAccessSchool(auth.service, auth.profileId, auth.role, schoolUuid);
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { data: inserted, error: insertError } = await auth.dbUser
    .from('platform_feedback')
    .insert({
      school_id: schoolUuid,
      submitted_by_user_id: auth.profileId,
      category,
      body: message,
    })
    .select('id')
    .single();

  if (insertError || !inserted?.id) {
    console.error('[platform-feedback] insert failed', insertError);
    return NextResponse.json(
      { success: false, error: insertError?.message || 'Failed to create feedback' },
      { status: 500 }
    );
  }

  const notifyTo = process.env.PLATFORM_FEEDBACK_NOTIFY_EMAIL || 'tarun@tutoglobal.com';

  try {
    const { data: schoolRow } = await auth.service.from('schools').select('name').eq('id', schoolUuid).maybeSingle();
    const { data: userRow } = await auth.service
      .from('users')
      .select('name, email')
      .eq('id', auth.profileId)
      .maybeSingle();

    const { subject, html, text } = platformFeedbackCreatedEmail({
      schoolName: schoolRow?.name || 'Unknown school',
      submitterName: userRow?.name || 'Unknown',
      submitterEmail: userRow?.email || '',
      category,
      body: message,
      detailUrl: `${appBaseUrl()}/tutoadmin/feedback/${inserted.id}`,
    });

    const mail = await sendMail({ to: notifyTo, subject, html, text });
    if (!mail.ok) {
      console.error('[platform-feedback] notify email failed', mail.error);
    }
  } catch (err) {
    console.error('[platform-feedback] notify email failed', err);
  }

  return NextResponse.json({ success: true, id: inserted.id });
}

export async function GET(request: NextRequest) {
  const auth = await requireBearerAuth(request);
  if ('error' in auth) return auth.error;

  if (auth.role !== 'school_admin' && auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const schoolIdentifier = request.nextUrl.searchParams.get('schoolId')?.trim();
  if (!schoolIdentifier) {
    return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 });
  }

  const schoolUuid = await resolveSchoolUuid(auth.service, schoolIdentifier);
  if (!schoolUuid) {
    return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
  }

  if (auth.role === 'school_admin') {
    const allowed = await assertSchoolAdminCanAccessSchool(auth.service, auth.profileId, auth.role, schoolUuid);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
  }

  const { data: rows, error } = await auth.dbUser
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
    `
    )
    .eq('school_id', schoolUuid)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[platform-feedback] list failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const data = await enrichPlatformFeedbackRows(auth.service, (rows || []) as any);
  return NextResponse.json({ success: true, data });
}
