import { NextRequest, NextResponse } from 'next/server';
import { getClasses } from '../../../../lib/airtable/classes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!schoolId) {
      return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
    }

    const result = await getClasses(schoolId, {
      grade: grade || undefined,
      search: search || undefined,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in classes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
