import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

interface Booking {
  id: string;
  fields: {
    ID?: string;
    'Student ID'?: string;
    'Teacher ID'?: string;
    'Parent ID'?: string;
    Subject?: string;
    Date?: string;
    Time?: string;
    Duration?: number;
    Status?: string;
    Notes?: string;
    'Payment Status'?: string;
    'Created At'?: string;
  };
}

interface AirtableResponse {
  records: Booking[];
  offset?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = searchParams.get('maxRecords') || '100';
    const offset = searchParams.get('offset') || '';
    const parentId = searchParams.get('parentId') || '';
    const teacherId = searchParams.get('teacherId') || '';
    const studentId = searchParams.get('studentId') || '';
    const status = searchParams.get('status') || '';
    const upcoming = searchParams.get('upcoming') === 'true';

    // Build filter formula
    const filters: string[] = [];
    
    if (parentId) {
      filters.push(`{Parent ID} = '${parentId}'`);
    }
    
    if (teacherId) {
      filters.push(`{Teacher ID} = '${teacherId}'`);
    }
    
    if (studentId) {
      filters.push(`{Student ID} = '${studentId}'`);
    }
    
    if (status) {
      filters.push(`{Status} = '${status}'`);
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      filters.push(`{Date} >= '${today}'`);
    }

    const filterFormula = filters.length > 0 
      ? `AND(${filters.join(', ')})`
      : '';

    // Build Airtable API URL
    const params = new URLSearchParams({
      maxRecords,
      view: 'Grid view',
      ...(offset && { offset }),
      ...(filterFormula && { filterByFormula: filterFormula }),
    });

    // Sort by date descending
    params.append('sort[0][field]', 'Date');
    params.append('sort[0][direction]', 'desc');

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoBookings?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Airtable error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: response.statusText },
        { status: response.status }
      );
    }

    const data: AirtableResponse = await response.json();

    // Transform data
    const bookings = data.records.map((record) => ({
      id: record.id,
      recordId: record.id,
      studentId: record.fields['Student ID'] || '',
      teacherId: record.fields['Teacher ID'] || '',
      parentId: record.fields['Parent ID'] || '',
      subject: record.fields.Subject || '',
      date: record.fields.Date || '',
      time: record.fields.Time || '',
      duration: record.fields.Duration || 60,
      status: record.fields.Status || 'Pending',
      notes: record.fields.Notes || '',
      paymentStatus: record.fields['Payment Status'] || 'Pending',
      createdAt: record.fields['Created At'] || '',
    }));

    return NextResponse.json({
      bookings,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.teacherId || !body.parentId || !body.subject || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Teacher ID, Parent ID, subject, date, and time are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoBookings`;

    const now = new Date().toISOString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Teacher ID': body.teacherId,
          'Parent ID': body.parentId,
          'Student ID': body.studentId || '',
          Subject: body.subject,
          Date: body.date,
          Time: body.time,
          Duration: body.duration || 60,
          Status: 'Pending',
          Notes: body.notes || '',
          'Payment Status': 'Pending',
          'Created At': now,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


