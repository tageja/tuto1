import { NextRequest, NextResponse } from 'next/server';

/**
 * Teacher Feedback API Route
 * 
 * GET /api/school/teachers/[teacherId]/feedback?schoolId=X&limit=20
 * 
 * Note: Returns empty array until TutoSchoolFeedback table is created
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = params.teacherId;
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    if (!teacherId || !schoolId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID and School ID are required' },
        { status: 400 }
      );
    }

    // TODO: Query TutoSchoolFeedback table once created
    // For now, return empty data
    return NextResponse.json({
      success: true,
      data: [],
      summary: {
        total: 0,
        avgRating: 0,
      }
    });
  } catch (error: any) {
    console.error('Error in teacher feedback API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

