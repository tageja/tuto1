import { NextRequest, NextResponse } from 'next/server';
import { getEnrollmentTrend } from '../../../../../lib/school/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');
    const months = parseInt(searchParams.get('months') || '3');

    if (!schoolId) {
      return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
    }

    const trendData = await getEnrollmentTrend(schoolId, months);
    
    return NextResponse.json({ data: trendData });
  } catch (error) {
    console.error('Error fetching enrollment trend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}












