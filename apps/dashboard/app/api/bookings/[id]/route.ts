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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoBookings/${id}`;

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
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: response.status }
      );
    }

    const record: any = await response.json();

    const booking = {
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
    };

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoBookings/${id}`;

    const fields: any = {};
    if (body.teacherId) fields['Teacher ID'] = body.teacherId;
    if (body.parentId) fields['Parent ID'] = body.parentId;
    if (body.studentId) fields['Student ID'] = body.studentId;
    if (body.subject) fields.Subject = body.subject;
    if (body.date) fields.Date = body.date;
    if (body.time) fields.Time = body.time;
    if (body.duration !== undefined) fields.Duration = body.duration;
    if (body.status) fields.Status = body.status;
    if (body.notes !== undefined) fields.Notes = body.notes;
    if (body.paymentStatus) fields['Payment Status'] = body.paymentStatus;

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
        { error: 'Failed to update booking' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ booking: data });
  } catch (error: any) {
    console.error('Error updating booking:', error);
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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoBookings/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}










