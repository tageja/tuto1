import { NextResponse } from 'next/server';
import { listEvents } from '../../../lib/api/events';

export async function GET() {
  try {
    const data = await listEvents();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}





