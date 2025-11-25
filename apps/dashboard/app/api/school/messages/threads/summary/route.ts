import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { getUserByAuthId, mapRoleToParticipant } from '../../../../../../lib/api/messages';
import type { ThreadSummary } from '../../../../../../lib/types/messages';

const sanitizeParam = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }
  return trimmed;
};

const normalizeSearch = (value: string | null) => value?.trim().toLowerCase() ?? '';

const allowedTabs = new Set(['inbox', 'sent', 'unread']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const schoolId = sanitizeParam(searchParams.get('schoolId'));
    const userAuthId = sanitizeParam(searchParams.get('userAuthId'));
    const classId = sanitizeParam(searchParams.get('classId'));
    const grade = sanitizeParam(searchParams.get('grade'));
    const search = normalizeSearch(searchParams.get('q'));

    if (!schoolId || !userAuthId) {
      return NextResponse.json(
        { error: 'schoolId and userAuthId are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const requester = await getUserByAuthId(supabase, userAuthId);

    if (!requester) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('📊 Fetching message summary for:', {
      userAuthId: userAuthId?.slice(0, 8),
      schoolId: schoolId?.slice(0, 8),
      userId: requester.id?.slice(0, 8),
      role: requester.role,
    });

    const { data, error } = await supabase.rpc('get_message_threads_summary', {
      p_user_auth_id: userAuthId,
      p_school_id: schoolId,
      p_class_id: classId,
      p_grade: grade,
    });

    if (error) {
      console.error('❌ get_message_threads_summary error', error);
      return NextResponse.json(
        { error: 'Failed to load message threads' },
        { status: 500 }
      );
    }

    console.log('✅ RPC returned', data?.length || 0, 'threads');

    const summaries: ThreadSummary[] = (data || []).map((row: any) => ({
      thread: row.thread,
      lastMessage: row.last_message || null,
      unreadCount: row.unread_count ?? 0,
      participantRole: mapRoleToParticipant(row.participant_role),
      isArchived: row.is_archived ?? false,
    }));

    // Filter by search only (no tab filtering for chat-style UI)
    const filterBySearch = (summary: ThreadSummary) => {
      if (!search) return true;
      const subject = summary.thread.subject?.toLowerCase() ?? '';
      const body = summary.lastMessage?.body?.toLowerCase() ?? '';
      return subject.includes(search) || body.includes(search);
    };

    // Filter out archived threads and apply search
    const filtered = summaries.filter((item) => !item.isArchived).filter(filterBySearch);

    const counts = {
      inbox: summaries.filter((item) => !item.isArchived).length,
      sent: summaries.filter((item) => item.thread.created_by === requester.id).length,
      unread: summaries.filter((item) => item.unreadCount > 0).length,
    };

    console.log('📤 Returning', filtered.length, 'filtered threads (from', summaries.length, 'total)');
    console.log('📊 Counts:', counts);

    return NextResponse.json({
      success: true,
      data: filtered,
      counts,
    });
  } catch (error) {
    console.error('threads summary GET error', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

