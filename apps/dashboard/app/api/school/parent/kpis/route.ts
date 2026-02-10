import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

const EMPTY_KPIS = {
  attendanceRate: 0,
  homeworkCompletion: 0,
  averageGrade: 0,
  upcomingEvents: 0,
};

type ParentKpis = typeof EMPTY_KPIS;

/**
 * GET /api/school/parent/kpis?schoolId=xxx
 *
 * Returns parent dashboard KPIs from the database for the authenticated user.
 * All values are 0 when there is no data. Requires auth (cookies or Authorization header).
 */
export const dynamic = 'force-dynamic';

async function getCurrentUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (accessToken) {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!error && user?.email) return { id: user.id, email: user.email };
  }

  try {
    const cookieStore = await cookies();
    const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    });
    const { data: { session } } = await authClient.auth.getSession();
    const user = session?.user;
    if (user?.email) return { id: user.id, email: user.email };
    const { data: { user: getUser } } = await authClient.auth.getUser();
    if (getUser?.email) return { id: getUser.id, email: getUser.email };
  } catch {
    // ignore
  }
  return null;
}

async function getParentChildrenStudentIds(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  resolvedSchoolId: string,
  authUserId: string,
  parentEmail: string
): Promise<string[]> {
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  let studentIds: string[] = [];

  if (userRow?.id) {
    const { data: mappings } = await supabase
      .from('school_parent_students')
      .select('student_id')
      .eq('school_id', resolvedSchoolId)
      .eq('parent_user_id', userRow.id);
    if (mappings?.length) {
      studentIds = mappings.map((m: { student_id: string }) => m.student_id);
    }
  }

  if (studentIds.length === 0) {
    const { data: byEmail } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', resolvedSchoolId)
      .ilike('parent_email', parentEmail)
      .in('status', ['active', 'Active']);
    if (byEmail?.length) {
      studentIds = byEmail.map((s: { id: string }) => s.id);
    }
  }

  return studentIds;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = request.nextUrl.searchParams.get('schoolId');
    if (!schoolId?.trim()) {
      return NextResponse.json(
        { success: true, data: EMPTY_KPIS },
        { status: 200 }
      );
    }

    const supabase = createServerSupabaseClient();
    const resolvedId = await resolveSchoolId(supabase, schoolId.trim());
    if (!resolvedId) {
      return NextResponse.json(
        { success: true, data: EMPTY_KPIS },
        { status: 200 }
      );
    }

    const studentIds = await getParentChildrenStudentIds(
      supabase,
      resolvedId,
      user.id,
      user.email
    );

    const today = new Date().toISOString().split('T')[0];

    if (studentIds.length === 0) {
      const { data: events } = await supabase
        .from('school_events')
        .select('id')
        .eq('school_id', resolvedId)
        .gte('starts_at', today)
        .in('status', ['scheduled', 'in progress']);
      return NextResponse.json({
        success: true,
        data: { ...EMPTY_KPIS, upcomingEvents: events?.length ?? 0 },
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const [attendanceRes, targetsRes, submissionsRes, scoresRes, eventsRes] = await Promise.all([
      supabase
        .from('school_attendance')
        .select('id, status')
        .eq('school_id', resolvedId)
        .in('student_id', studentIds)
        .gte('date', fromDate),
      supabase
        .from('school_homework_targets')
        .select('assignment_id')
        .in('student_id', studentIds),
      supabase
        .from('school_homework_submissions')
        .select('assignment_id, status')
        .in('student_id', studentIds),
      supabase
        .from('school_assessment_scores')
        .select('score')
        .in('student_id', studentIds),
      supabase
        .from('school_events')
        .select('id')
        .eq('school_id', resolvedId)
        .gte('starts_at', today)
        .in('status', ['scheduled', 'in progress']),
    ]);

    const attendanceRows = attendanceRes.data ?? [];
    const totalAttendance = attendanceRows.length;
    const presentCount = attendanceRows.filter(
      (a: { status?: string }) => (a.status || '').toLowerCase() === 'present'
    ).length;
    const attendanceRate =
      totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const targets = targetsRes.data ?? [];
    const assignmentIdsFromTargets = [...new Set(targets.map((t: { assignment_id: string }) => t.assignment_id))];
    let totalAssignments = 0;
    if (assignmentIdsFromTargets.length > 0) {
      const { data: assignments } = await supabase
        .from('school_homework_assignments')
        .select('id')
        .in('id', assignmentIdsFromTargets)
        .eq('school_id', resolvedId)
        .eq('is_active', true)
        .lte('due_date', today);
      totalAssignments = assignments?.length ?? 0;
    }
    const submissions = submissionsRes.data ?? [];
    const completedSubmissions = submissions.filter((s: { status?: string }) =>
      ['submitted', 'graded'].includes((s.status || '').toLowerCase())
    ).length;
    const homeworkCompletion =
      totalAssignments > 0
        ? Math.round((completedSubmissions / totalAssignments) * 100)
        : 0;

    const scores = scoresRes.data ?? [];
    const numericScores = scores
      .map((s: { score?: unknown }) => Number(s.score))
      .filter((n: number) => !Number.isNaN(n));
    const averageGrade =
      numericScores.length > 0
        ? Math.round((numericScores.reduce((a: number, b: number) => a + b, 0) / numericScores.length) * 10) / 10
        : 0;

    const events = eventsRes.data ?? [];
    const upcomingEvents = events.length;

    const data: ParentKpis = {
      attendanceRate,
      homeworkCompletion,
      averageGrade,
      upcomingEvents,
    };

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Parent KPIs API error:', err);
    return NextResponse.json(
      { success: true, data: EMPTY_KPIS },
      { status: 200 }
    );
  }
}
