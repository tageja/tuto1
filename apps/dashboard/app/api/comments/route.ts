import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

interface Comment {
  id: string;
  fields: {
    ID?: string;
    'Post ID'?: string;
    'Author ID'?: string;
    'Author Name'?: string;
    Content?: string;
    'Created At'?: string;
  };
}

interface AirtableResponse {
  records: Comment[];
  offset?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId') || '';
    const maxRecords = searchParams.get('maxRecords') || '100';
    const offset = searchParams.get('offset') || '';

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Build filter formula
    const filterFormula = `{Post ID} = '${postId}'`;

    // Build Airtable API URL
    const params = new URLSearchParams({
      maxRecords,
      view: 'Grid view',
      ...(offset && { offset }),
      filterByFormula: filterFormula,
    });

    // Sort by created at ascending (oldest first)
    params.append('sort[0][field]', 'Created At');
    params.append('sort[0][direction]', 'asc');

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoComments?${params}`;

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
        { error: 'Failed to fetch comments', details: response.statusText },
        { status: response.status }
      );
    }

    const data: AirtableResponse = await response.json();

    // Transform data
    const comments = data.records.map((record) => ({
      id: record.id,
      recordId: record.id,
      postId: record.fields['Post ID'] || '',
      author: {
        id: record.fields['Author ID'] || '',
        name: record.fields['Author Name'] || 'Unknown User',
      },
      content: record.fields.Content || '',
      createdAt: record.fields['Created At'] || '',
    }));

    return NextResponse.json({
      comments,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
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
    if (!body.postId || !body.authorId || !body.authorName || !body.content) {
      return NextResponse.json(
        { error: 'Post ID, author ID, author name, and content are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoComments`;

    const now = new Date().toISOString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Post ID': body.postId,
          'Author ID': body.authorId,
          'Author Name': body.authorName,
          Content: body.content,
          'Created At': now,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable error:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Also increment comment count on the post
    try {
      // Fetch current post to get comment count
      const postUrl = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts/${body.postId}`;
      const postResponse = await fetch(postUrl, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (postResponse.ok) {
        const postData: any = await response.json();
        const currentCount = postData.fields?.['Comments Count'] || 0;

        // Update post comment count
        await fetch(postUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Comments Count': currentCount + 1,
            },
          }),
        });
      }
    } catch (err) {
      console.error('Failed to update comment count:', err);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


