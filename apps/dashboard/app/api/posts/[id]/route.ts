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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts/${id}`;

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
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch post' },
        { status: response.status }
      );
    }

    const record: any = await response.json();

    const post = {
      id: record.id,
      recordId: record.id,
      author: {
        id: record.fields['Author ID'] || '',
        name: record.fields['Author Name'] || 'Unknown User',
        role: record.fields['Author Role'] || 'student',
        avatar: record.fields['Author Avatar'] || '',
      },
      content: {
        text: record.fields['Content Text'] || '',
        media: record.fields['Content Media URL'] ? {
          type: record.fields['Content Media Type'] as 'image' | 'video',
          url: record.fields['Content Media URL'],
          thumbnail: record.fields['Content Media Thumbnail'],
        } : undefined,
      },
      type: record.fields['Post Type'] || 'text',
      subjects: record.fields.Subjects || [],
      timestamp: record.fields.Timestamp || record.fields['Created At'] || '',
      interactions: {
        likesCount: record.fields['Likes Count'] || 0,
        commentsCount: record.fields['Comments Count'] || 0,
        sharesCount: record.fields['Shares Count'] || 0,
        savesCount: record.fields['Saves Count'] || 0,
      },
      privacy: record.fields.Privacy || 'public',
      status: record.fields.Status || 'Active',
      isLiked: record.fields['Is Liked'] || false,
      isSaved: record.fields['Is Saved'] || false,
    };

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error fetching post:', error);
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

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts/${id}`;

    const fields: any = {};
    if (body.contentText !== undefined) fields['Content Text'] = body.contentText;
    if (body.subjects) fields.Subjects = body.subjects;
    if (body.privacy) fields.Privacy = body.privacy;
    if (body.status) fields.Status = body.status;
    if (body.likesCount !== undefined) fields['Likes Count'] = body.likesCount;
    if (body.commentsCount !== undefined) fields['Comments Count'] = body.commentsCount;
    if (body.sharesCount !== undefined) fields['Shares Count'] = body.sharesCount;
    if (body.savesCount !== undefined) fields['Saves Count'] = body.savesCount;

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
        { error: 'Failed to update post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ post: data });
  } catch (error: any) {
    console.error('Error updating post:', error);
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

    // Soft delete by updating status
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts/${id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Status: 'Deleted',
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}



