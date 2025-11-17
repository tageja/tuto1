import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if user is a school admin/teacher
    const teachersUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolTeachers?filterByFormula=SEARCH("${uid}",{Email})`;
    const teachersResponse = await fetch(teachersUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    });

    if (teachersResponse.ok) {
      const teachersData = await teachersResponse.json();
      if (teachersData.records && teachersData.records.length > 0) {
        return NextResponse.json({ role: 'admin' });
      }
    }

    // Check if user is a parent (has children in school)
    const studentsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolStudents?filterByFormula=SEARCH("${uid}",{Parent Email})`;
    const studentsResponse = await fetch(studentsUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    });

    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      if (studentsData.records && studentsData.records.length > 0) {
        return NextResponse.json({ role: 'parent' });
      }
    }

    return NextResponse.json({ role: null });
  } catch (error) {
    console.error('Error detecting user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}














