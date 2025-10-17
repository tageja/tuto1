import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app34330Do0nm4qvM';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

interface Post {
  id: string;
  fields: {
    ID?: string;
    'Author ID'?: string;
    'Author Name'?: string;
    'Author Role'?: string;
    'Author Avatar'?: string;
    'Content Text'?: string;
    'Content Media Type'?: string;
    'Content Media URL'?: string;
    'Content Media Thumbnail'?: string;
    'Post Type'?: string;
    Subjects?: string[];
    Timestamp?: string;
    'Likes Count'?: number;
    'Comments Count'?: number;
    'Shares Count'?: number;
    'Saves Count'?: number;
    Privacy?: string;
    Status?: string;
    'Is Liked'?: boolean;
    'Is Saved'?: boolean;
    'Created At'?: string;
  };
}

interface AirtableResponse {
  records: Post[];
  offset?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = searchParams.get('maxRecords') || '50';
    const offset = searchParams.get('offset') || '';
    const authorRole = searchParams.get('authorRole') || '';
    const subject = searchParams.get('subject') || '';
    const postType = searchParams.get('postType') || '';
    const status = searchParams.get('status') || 'Active';

    // Build filter formula
    const filters: string[] = [];
    
    if (status) {
      filters.push(`{Status} = '${status}'`);
    }
    
    if (authorRole) {
      filters.push(`{Author Role} = '${authorRole}'`);
    }
    
    if (subject) {
      filters.push(`FIND('${subject}', ARRAYJOIN({Subjects}, ',')) > 0`);
    }
    
    if (postType) {
      filters.push(`{Post Type} = '${postType}'`);
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

    // Sort by timestamp descending
    params.append('sort[0][field]', 'Timestamp');
    params.append('sort[0][direction]', 'desc');

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts?${params}`;

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
        { error: 'Failed to fetch posts', details: response.statusText },
        { status: response.status }
      );
    }

    const data: AirtableResponse = await response.json();

    // Transform data
    const posts = data.records.map((record) => ({
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
    }));

    return NextResponse.json({
      posts,
      offset: data.offset,
      hasMore: !!data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
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
    if (!body.authorId || !body.authorName || !body.contentText) {
      return NextResponse.json(
        { error: 'Author ID, author name, and content text are required' },
        { status: 400 }
      );
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/TutoPosts`;

    const now = new Date().toISOString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Author ID': body.authorId,
          'Author Name': body.authorName,
          'Author Role': body.authorRole || 'parent',
          'Author Avatar': body.authorAvatar || '',
          'Content Text': body.contentText,
          'Content Media Type': body.contentMediaType || '',
          'Content Media URL': body.contentMediaUrl || '',
          'Content Media Thumbnail': body.contentMediaThumbnail || '',
          'Post Type': body.postType || 'text',
          Subjects: body.subjects || [],
          Timestamp: now,
          'Likes Count': 0,
          'Comments Count': 0,
          'Shares Count': 0,
          'Saves Count': 0,
          Privacy: body.privacy || 'public',
          Status: 'Active',
          'Created At': now,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable error:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}



