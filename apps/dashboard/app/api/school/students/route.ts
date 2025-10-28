import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolName = searchParams.get('schoolName') || '';
    const className = searchParams.get('className') || '';
    const status = searchParams.get('status') || '';
    const maxRecords = searchParams.get('maxRecords') || '100';
    const offset = searchParams.get('offset') || '';

    // Build filter formula
    const filters: string[] = [];
    
    if (schoolName) {
      filters.push(`{School Name} = '${schoolName}'`);
    }
    
    if (className) {
      filters.push(`{Class Name} = '${className}'`);
    }
    
    if (status) {
      filters.push(`{Status} = '${status}'`);
    }

    const filterFormula = filters.length > 0 
      ? `AND(${filters.join(', ')})`
      : '';

    const params = new URLSearchParams({
      maxRecords,
      view: 'Grid view',
      ...(offset && { offset }),
      ...(filterFormula && { filterByFormula: filterFormula }),
    });

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoSchoolStudents?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: response.status }
      );
    }

    const data: any = await response.json();

    const students = data.records.map((record: any) => ({
      id: record.id,
      recordId: record.id,
      studentName: record.fields['Student Name'] || '',
      schoolName: record.fields['School Name'] || '',
      className: record.fields['Class Name'] || '',
      studentId: record.fields['Student ID'] || '',
      dateOfBirth: record.fields['Date of Birth'] || '',
      gender: record.fields.Gender || '',
      gradeLevel: record.fields['Grade Level'] || '',
      parentName: record.fields['Parent Name'] || '',
      parentEmail: record.fields['Parent Email'] || '',
      parentPhone: record.fields['Parent Phone'] || '',
      address: record.fields.Address || '',
      emergencyContact: record.fields['Emergency Contact'] || '',
      emergencyPhone: record.fields['Emergency Phone'] || '',
      medicalNotes: record.fields['Medical Notes'] || '',
      status: record.fields.Status || 'Active',
      enrollmentDate: record.fields['Enrollment Date'] || '',
      createdDate: record.fields['Created Date'] || '',
    }));

    return NextResponse.json({
      students,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.studentName || !body.schoolName) {
      return NextResponse.json(
        { error: 'Student name and school name are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoSchoolStudents`;

    const now = new Date().toISOString().split('T')[0];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Student Name': body.studentName,
          'School Name': body.schoolName,
          'Class Name': body.className || '',
          'Student ID': body.studentId || '',
          'Date of Birth': body.dateOfBirth || '',
          Gender: body.gender || '',
          'Grade Level': body.gradeLevel || '',
          'Parent Name': body.parentName || '',
          'Parent Email': body.parentEmail || '',
          'Parent Phone': body.parentPhone || '',
          Address: body.address || '',
          'Emergency Contact': body.emergencyContact || '',
          'Emergency Phone': body.emergencyPhone || '',
          'Medical Notes': body.medicalNotes || '',
          Status: 'Active',
          'Enrollment Date': now,
          'Created Date': now,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create student' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ student: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}










