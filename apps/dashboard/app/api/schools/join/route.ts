import { NextRequest, NextResponse } from 'next/server';
import { Backend } from '../../../../lib/api/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!code) return NextResponse.json({ message: 'Missing code' }, { status: 400 });

    // Validate invitation by code in Airtable via Functions
    const qs = new URLSearchParams({ filterByFormula: `{Invitation Code} = '${code}'`, maxRecords: '1' }).toString();
    const data = await Backend.list<any>('TutoSchoolInvitations', { filterByFormula: `{Invitation Code} = '${code}'`, maxRecords: 1 });
    const rec = (data?.records || [])[0];
    if (!rec) return NextResponse.json({ message: 'Invalid or expired code' }, { status: 404 });

    const fields = rec.fields || {};
    const status = fields['Status'];
    const expiry = fields['Expiry Date'] ? new Date(fields['Expiry Date']) : null;
    const maxUses = typeof fields['Max Uses'] === 'number' ? fields['Max Uses'] : undefined;
    const currentUses = typeof fields['Current Uses'] === 'number' ? fields['Current Uses'] : 0;
    const schoolName = fields['School Name'] as string | undefined;

    if (!schoolName) return NextResponse.json({ message: 'Invalid invitation: no school' }, { status: 400 });
    if (status && String(status).toLowerCase() === 'disabled') return NextResponse.json({ message: 'Invitation disabled' }, { status: 403 });
    if (expiry && expiry.getTime() < Date.now()) return NextResponse.json({ message: 'Invitation expired' }, { status: 403 });
    if (typeof maxUses === 'number' && currentUses >= maxUses) return NextResponse.json({ message: 'Invitation fully used' }, { status: 403 });

    // Update usage counts; append Used By (best-effort, no PII here)
    try {
      await Backend.update('TutoSchoolInvitations', rec.id, {
        'Current Uses': currentUses + 1,
      });
    } catch {}

    return NextResponse.json({ ok: true, schoolName }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}


