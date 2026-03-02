import { NextRequest, NextResponse } from 'next/server';

/**
 * Teacher Teaching Hours API Route
 * 
 * GET /api/school/teachers/[teacherId]/teaching-hours?schoolId=X&weeks=12
 * 
 * Note: Returns empty array until TutoSchoolTeachingHours table is created
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    if (!teacherId || !schoolId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID and School ID are required' },
        { status: 400 }
      );
    }

    // TODO: Query TutoSchoolTeachingHours table once created
    // For now, return empty data
    return NextResponse.json({
      success: true,
      data: [],
      summary: {
        weeksRecorded: 0,
        avgWeeklyHours: 0,
        totalHours: 0,
      }
    });
  } catch (error: any) {
    console.error('Error in teaching hours API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

