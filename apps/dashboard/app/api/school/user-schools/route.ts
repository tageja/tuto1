import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const role = searchParams.get('role');

    if (!uid || !role) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const schools = [];

    if (role === 'admin') {
      // Get schools where user is a teacher
      const teachersUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolTeachers?filterByFormula=SEARCH("${uid}",{Email})`;
      const response = await fetch(teachersUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
      });

      if (response.ok) {
        const data = await response.json();
        const schoolNames = new Set();
        
        for (const record of data.records || []) {
          const schoolName = record.fields['School Name'];
          if (schoolName && !schoolNames.has(schoolName)) {
            schoolNames.add(schoolName);
            schools.push({
              id: schoolName,
              name: schoolName,
              type: 'School',
              studentCount: 0,
            });
          }
        }
      }
    } else if (role === 'parent') {
      // Get schools through student enrollment
      const studentsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolStudents?filterByFormula=SEARCH("${uid}",{Parent Email})`;
      const response = await fetch(studentsUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
      });

      if (response.ok) {
        const data = await response.json();
        const schoolNames = new Set();
        
        for (const record of data.records || []) {
          const schoolName = record.fields['School Name'];
          if (schoolName && !schoolNames.has(schoolName)) {
            schoolNames.add(schoolName);
            schools.push({
              id: schoolName,
              name: schoolName,
              type: 'School',
              studentCount: 0,
            });
          }
        }
      }
    }

    return NextResponse.json({ schools });
  } catch (error) {
    console.error('Error fetching user schools:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




