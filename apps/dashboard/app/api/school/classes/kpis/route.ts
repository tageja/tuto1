import { NextRequest, NextResponse } from 'next/server';
import { getClassKpis } from '../../../../../lib/airtable/classes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
    }

    const kpis = await getClassKpis(schoolId);
    
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching class KPIs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



