import { NextRequest, NextResponse } from 'next/server';
import { computeKpis } from '../../../../lib/schools.analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolName = searchParams.get('school') || undefined;
    const data = await computeKpis({ schoolName });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}


