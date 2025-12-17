/**
 * Daily Activities API Route
 * Handles CRUD operations for school daily activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const date = searchParams.get('date');
    const classIds = searchParams.getAll('classId');
    const types = searchParams.getAll('type');
    const statuses = searchParams.getAll('status');
    const search = searchParams.get('q') || '';

    if (!schoolId || !date) {
      return NextResponse.json(
        { success: false, error: 'schoolId and date are required' },
        { status: 400 }
      );
    }

    // Use server Supabase client with service role to bypass RLS
    const supabase = createServerSupabaseClient();

    // Resolve school name to UUID if needed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedSchoolId = schoolId;

    if (!uuidRegex.test(schoolId)) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolId)
        .single();

      if (schoolData?.id) {
        resolvedSchoolId = schoolData.id;
      } else {
        return NextResponse.json(
          { success: false, error: `School not found: ${schoolId}` },
          { status: 404 }
        );
      }
    }

    // Build query
    let query = supabase
      .from('school_daily_activities')
      .select('id,date,time,class_id,grade,title,description,type,status,teacher_id,menu_details,outdoor_detail,attachments,updated_at')
      .eq('school_id', resolvedSchoolId)
      .eq('date', date);

    // Apply filters
    if (classIds.length > 0) {
      query = query.in('class_id', classIds);
    }
    if (types.length > 0) {
      query = query.in('type', types);
    }
    if (statuses.length > 0) {
      query = query.in('status', statuses);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Order by time
    query = query.order('time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Daily activities query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch class and teacher names
    const enriched = await Promise.all((data || []).map(async (item: any) => {
      let class_name = '';
      let teacher_name = null;

      if (item.class_id) {
        const { data: classData } = await supabase
          .from('school_classes')
          .select('name')
          .eq('id', item.class_id)
          .maybeSingle();
        class_name = classData?.name || '';
      }

      if (item.teacher_id) {
        const { data: teacherData } = await supabase
          .from('school_teachers')
          .select('name')
          .eq('id', item.teacher_id)
          .maybeSingle();
        teacher_name = teacherData?.name || null;
      }

      return {
        ...item,
        class_name: class_name || item.grade || 'Unknown Class',
        teacher_name,
      };
    }));

    console.log(`✅ Fetched ${enriched.length} activities for ${date}`);

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error('Error in daily activities API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, activity } = body;

    if (!schoolId || !activity) {
      return NextResponse.json(
        { success: false, error: 'schoolId and activity are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Resolve school ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedSchoolId = schoolId;

    if (!uuidRegex.test(schoolId)) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolId)
        .single();

      if (schoolData?.id) {
        resolvedSchoolId = schoolData.id;
      } else {
        return NextResponse.json(
          { success: false, error: `School not found: ${schoolId}` },
          { status: 404 }
        );
      }
    }

    const { data, error } = await supabase
      .from('school_daily_activities')
      .insert({ ...activity, school_id: resolvedSchoolId })
      .select()
      .single();

    if (error) {
      console.error('❌ Create activity error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Created activity:', data.id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in create activity API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, updates } = body;

    if (!activityId || !updates) {
      return NextResponse.json(
        { success: false, error: 'activityId and updates are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('school_daily_activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update activity error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Updated activity:', activityId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in update activity API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'activityId is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('school_daily_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('❌ Delete activity error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Deleted activity:', activityId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error in delete activity API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






