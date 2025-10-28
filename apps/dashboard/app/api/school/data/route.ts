import { NextRequest, NextResponse } from 'next/server';
import { 
  getSchoolStudents, 
  getSchoolTeachers, 
  getAttendanceRecords, 
  getSchoolEvents, 
  getSchoolPayments, 
  getAnnouncements,
  getSchoolDetails,
  getUnreadMessages,
  getUpcomingHomework,
} from '../../../../lib/school/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table');
    const schoolId = searchParams.get('schoolId');
    const userId = searchParams.get('userId');

    if (!schoolId || !table) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let data = [];
    let singleRecord = null;

    switch (table) {
      case 'students':
        data = await getSchoolStudents(schoolId);
        // Transform to simple format
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'teachers':
        data = await getSchoolTeachers(schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'attendance':
        data = await getAttendanceRecords(schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'events':
        data = await getSchoolEvents(schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'payments':
        data = await getSchoolPayments(schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'announcements':
        data = await getAnnouncements(schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'schoolDetails':
        singleRecord = await getSchoolDetails(schoolId);
        return NextResponse.json({ 
          data: singleRecord ? { id: singleRecord.id, ...singleRecord.fields } : null 
        });

      case 'unreadMessages':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        data = await getUnreadMessages(userId, schoolId);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      case 'upcomingHomework':
        data = await getUpcomingHomework(schoolId, 10);
        data = data.map((r: any) => ({
          id: r.id,
          ...r.fields
        }));
        break;

      default:
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching school data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

