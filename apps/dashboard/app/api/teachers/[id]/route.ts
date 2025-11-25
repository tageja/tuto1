import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoTeachers/${id}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Teacher not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch teacher' },
        { status: response.status }
      );
    }

    const record: any = await response.json();

    // Transform to friendly format
    const teacher = {
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
    };

    return NextResponse.json({ teacher });
  } catch (error: any) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoTeachers/${id}`;

    const fields: any = {};
    if (body.name) fields.Name = body.name;
    if (body.email) fields.Email = body.email;
    if (body.phone) fields.Phone = body.phone;
    if (body.avatar) fields.Avatar = body.avatar;
    if (body.subjects) fields.Subjects = body.subjects;
    if (body.qualifications !== undefined) fields.Qualifications = body.qualifications;
    if (body.experience !== undefined) fields.Experience = body.experience;
    if (body.hourlyRate !== undefined) fields['Hourly Rate'] = body.hourlyRate;
    if (body.rating !== undefined) fields.Rating = body.rating;
    if (body.locationAddress) fields['Location Address'] = body.locationAddress;
    if (body.latitude !== undefined) fields.Latitude = body.latitude;
    if (body.longitude !== undefined) fields.Longitude = body.longitude;
    if (body.availabilityDays) fields['Availability Days'] = body.availabilityDays;
    if (body.availabilityTimeSlots) fields['Availability Time Slots'] = body.availabilityTimeSlots;
    if (body.languages) fields.Languages = body.languages;
    if (body.description !== undefined) fields.Description = body.description;
    if (body.status) fields.Status = body.status;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update teacher' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ teacher: data });
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoTeachers/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete teacher' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

























