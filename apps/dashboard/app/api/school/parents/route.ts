import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const schoolId = searchParams.get('schoolId');
  const limit = parseInt(searchParams.get('limit') || '200', 10);

  if (!schoolId) {
    return NextResponse.json({ success: false, error: 'schoolId required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  try {
    // Get unique parent emails from school_students along with parent name
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('parent_name, parent_email')
      .eq('school_id', schoolId)
      .not('parent_email', 'is', null)
      .limit(limit);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json({ success: false, error: studentsError.message }, { status: 500 });
    }

    // Group by email to get unique parents with their names
    const parentMap = new Map<string, { email: string; name: string }>();
    
    (students || []).forEach((student) => {
      if (student.parent_email) {
        const email = student.parent_email.toLowerCase().trim();
        if (!parentMap.has(email)) {
          parentMap.set(email, {
            email,
            name: student.parent_name || email,
          });
        }
      }
    });

    const uniqueParents = Array.from(parentMap.values());

    // Look up users table to find existing user_ids for these parent emails
    const parentEmails = uniqueParents.map((p) => p.email);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('email', parentEmails);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      // Continue even if users query fails - we can still show emails
    }

    // Create a map of email -> user_id
    const userMap = new Map<string, { id: string; name?: string }>();
    (users || []).forEach((user) => {
      if (user.email) {
        userMap.set(user.email.toLowerCase().trim(), { 
          id: user.id,
          name: user.name 
        });
      }
    });

    // Build parent options with user_id if available
    const parentOptions = uniqueParents.map((parent) => {
      const user = userMap.get(parent.email);
      return {
        id: parent.email, // Use email as ID for non-user parents
        email: parent.email,
        name: user?.name || parent.name || parent.email,
        user_id: user?.id || null,
      };
    });

    // Sort by name
    parentOptions.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: {
        records: parentOptions,
        total: parentOptions.length,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/school/parents:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}





