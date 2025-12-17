import { supabase } from '../../config/supabase';
import { DailyActivity, ActivityKPI, ClassOption } from '../../types/school/activities';

// Helper to resolve school identifier (name or UUID) to UUID
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      return schoolIdentifier;
    }

    if (schoolIdentifier.startsWith('rec')) {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .eq('name', 'Tuto Demo School')
        .single();

      if (error || !data) return null;
      return data.id;
    }

    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch (error) {
    console.error('Error resolving school ID:', error);
    return null;
  }
}

export interface ActivityFilters {
  date: string;
  classIds?: string[];
  types?: string[];
  statuses?: string[];
  search?: string;
}

export async function fetchDailyActivities(
  schoolId: string,
  filters: ActivityFilters
): Promise<DailyActivity[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    let query = supabase
      .from('school_daily_activities')
      .select('id,date,time,class_id,grade,title,description,type,status,teacher_id,menu_details,outdoor_detail,attachments')
      .eq('school_id', resolvedSchoolId)
      .eq('date', filters.date);

    if (filters.classIds && filters.classIds.length > 0) {
      query = query.in('class_id', filters.classIds);
    }
    if (filters.types && filters.types.length > 0) {
      query = query.in('type', filters.types);
    }
    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('time', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Enrich with class and teacher names
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
      } as DailyActivity;
    }));

    return enriched;
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    return [];
  }
}

export async function fetchActivityKPIs(
  schoolId: string,
  date: string,
  classIds?: string[]
): Promise<ActivityKPI> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    let query = supabase
      .from('school_daily_activities')
      .select('status')
      .eq('school_id', resolvedSchoolId)
      .eq('date', date);

    if (classIds && classIds.length > 0) {
      query = query.in('class_id', classIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const kpis: ActivityKPI = {
      total: data?.length || 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
    };

    data?.forEach((item) => {
      if (item.status === 'Completed') kpis.completed++;
      else if (item.status === 'In Progress') kpis.inProgress++;
      else if (item.status === 'Pending') kpis.pending++;
    });

    return kpis;
  } catch (error) {
    console.error('Error fetching activity KPIs:', error);
    return { total: 0, completed: 0, inProgress: 0, pending: 0 };
  }
}

export async function fetchClassesForSchool(schoolId: string): Promise<ClassOption[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    const { data, error } = await supabase
      .from('school_classes')
      .select('id, name, grade_level')
      .eq('school_id', resolvedSchoolId)
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

export async function fetchParentChildClasses(schoolId: string, parentEmail: string): Promise<ClassOption[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // 1. Find students for this parent in this school
    const { data: students, error: studentError } = await supabase
      .from('school_students')
      .select('class_id')
      .eq('school_id', resolvedSchoolId)
      .eq('parent_email', parentEmail);

    if (studentError) throw studentError;

    if (!students || students.length === 0) return [];

    const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))];

    if (classIds.length === 0) return [];

    // 2. Fetch class details
    const { data: classes, error: classesError } = await supabase
      .from('school_classes')
      .select('id, name, grade_level')
      .in('id', classIds)
      .order('name');

    if (classesError) throw classesError;

    return classes || [];
  } catch (error) {
    console.error('Error fetching parent child classes:', error);
    return [];
  }
}

