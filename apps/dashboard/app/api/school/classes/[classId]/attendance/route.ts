import { NextRequest, NextResponse } from 'next/server';
import { getClassAttendanceAgg, getAttendanceForDate } from '../../../../../../lib/airtable/attendance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    
    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await getAttendanceForDate('', classId, today);
    const presentToday = todayAttendance.filter((r: any) => r.fields?.Status === 'Present').length;

    // Get last 7 days average
    const last7Days = await getClassAttendanceAgg(classId, 7);

    return NextResponse.json({
      presentToday,
      last7Days,
    });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

