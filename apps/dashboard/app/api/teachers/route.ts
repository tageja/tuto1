import { NextRequest, NextResponse } from 'next/server';

// Server-side Airtable access (no client secrets)
const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

interface Teacher {
  id: string;
  fields: {
    ID?: string;
    Name: string;
    Email?: string;
    Phone?: string;
    Avatar?: string;
    Subjects?: string[];
    Qualifications?: string;
    Experience?: number;
    'Hourly Rate'?: number;
    Rating?: number;
    'Review Count'?: number;
    'Location Address'?: string;
    Latitude?: number;
    Longitude?: number;
    'Availability Days'?: string[];
    'Availability Time Slots'?: string;
    Languages?: string[];
    Description?: string;
    Status?: string;
    Location?: string;
    Availability?: string;
  };
}

interface AirtableResponse {
  records: Teacher[];
  offset?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = searchParams.get('maxRecords') || '100';
    const offset = searchParams.get('offset') || '';
    const subject = searchParams.get('subject') || '';
    const location = searchParams.get('location') || '';
    const minRating = searchParams.get('minRating') || '';
    const maxRate = searchParams.get('maxRate') || '';
    const status = searchParams.get('status') || 'Active';

    // Build filter formula
    const filters: string[] = [];
    
    if (status) {
      filters.push(`{Status} = '${status}'`);
    }
    
    if (subject) {
      filters.push(`FIND('${subject}', ARRAYJOIN({Subjects}, ',')) > 0`);
    }
    
    if (location) {
      filters.push(`FIND('${location}', {Location Address}) > 0`);
    }
    
    if (minRating) {
      filters.push(`{Rating} >= ${minRating}`);
    }
    
    if (maxRate) {
      filters.push(`{Hourly Rate} <= ${maxRate}`);
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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoTeachers?${params}`;

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
        { error: 'Failed to fetch teachers', details: response.statusText },
        { status: response.status }
      );
    }

    const data: AirtableResponse = await response.json();

    // Transform data to friendly format
    const teachers = data.records.map((record) => ({
      id: record.id,
      recordId: record.id,
      name: record.fields.Name || 'Unknown',
      email: record.fields.Email || '',
      phone: record.fields.Phone || '',
      avatar: record.fields.Avatar || '',
      subjects: record.fields.Subjects || [],
      qualifications: record.fields.Qualifications || '',
      experience: record.fields.Experience || 0,
      hourlyRate: record.fields['Hourly Rate'] || 0,
      rating: record.fields.Rating || 0,
      reviewCount: record.fields['Review Count'] || 0,
      location: {
        address: record.fields['Location Address'] || '',
        latitude: record.fields.Latitude,
        longitude: record.fields.Longitude,
      },
      availability: {
        days: record.fields['Availability Days'] || [],
        timeSlots: record.fields['Availability Time Slots'] || '',
      },
      languages: record.fields.Languages || [],
      description: record.fields.Description || '',
      status: record.fields.Status || 'Active',
    }));

    return NextResponse.json({
      teachers,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
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
    if (!body.name || !body.subjects || body.subjects.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one subject are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoTeachers`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Name: body.name,
          Email: body.email || '',
          Phone: body.phone || '',
          Avatar: body.avatar || '',
          Subjects: body.subjects,
          Qualifications: body.qualifications || '',
          Experience: body.experience || 0,
          'Hourly Rate': body.hourlyRate || 0,
          Rating: body.rating || 0,
          'Review Count': 0,
          'Location Address': body.locationAddress || '',
          Latitude: body.latitude,
          Longitude: body.longitude,
          'Availability Days': body.availabilityDays || [],
          'Availability Time Slots': body.availabilityTimeSlots || '',
          Languages: body.languages || [],
          Description: body.description || '',
          Status: 'Pending',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable error:', error);
      return NextResponse.json(
        { error: 'Failed to create teacher' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ teacher: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


