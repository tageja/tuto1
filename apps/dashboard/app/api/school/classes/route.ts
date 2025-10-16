import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolName = searchParams.get('schoolName') || '';
    const maxRecords = searchParams.get('maxRecords') || '100';
    const offset = searchParams.get('offset') || '';

    // Build filter formula
    const filters: string[] = [];
    
    if (schoolName) {
      filters.push(`{School Name} = '${schoolName}'`);
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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoSchoolClasses?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: response.status }
      );
    }

    const data: any = await response.json();

    const classes = data.records.map((record: any) => ({
      id: record.id,
      recordId: record.id,
      className: record.fields['Class Name'] || '',
      schoolName: record.fields['School Name'] || '',
      gradeLevel: record.fields['Grade Level'] || '',
      academicYear: record.fields['Academic Year'] || '',
      studentCount: record.fields['Student Count'] || 0,
      schedule: record.fields.Schedule || '',
      roomNumber: record.fields['Room Number'] || '',
      status: record.fields.Status || 'Active',
      createdDate: record.fields['Created Date'] || '',
    }));

    return NextResponse.json({
      classes,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.className || !body.schoolName) {
      return NextResponse.json(
        { error: 'Class name and school name are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoSchoolClasses`;

    const now = new Date().toISOString().split('T')[0];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Class Name': body.className,
          'School Name': body.schoolName,
          'Grade Level': body.gradeLevel || '',
          'Academic Year': body.academicYear || '',
          'Student Count': body.studentCount || 0,
          Schedule: body.schedule || '',
          'Room Number': body.roomNumber || '',
          Status: 'Active',
          'Created Date': now,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create class' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ class: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


