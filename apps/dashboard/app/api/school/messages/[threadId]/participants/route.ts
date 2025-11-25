import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { getUserByAuthId, mapRoleToParticipant } from '../../../../../../lib/api/messages';

const sanitize = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  return trimmed;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { searchParams } = request.nextUrl;
    const threadId = sanitize((await params).threadId);
    const schoolId = sanitize(searchParams.get('schoolId'));
    const userAuthId = sanitize(searchParams.get('userAuthId'));

    if (!threadId || !schoolId || !userAuthId) {
      return NextResponse.json(
        { error: 'threadId, schoolId, and userAuthId are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const requester = await getUserByAuthId(supabase, userAuthId);

    if (!requester) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: thread } = await supabase
      .from('message_threads')
      .select('id, school_id')
      .eq('id', threadId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const requesterRole = mapRoleToParticipant(requester.role);

    if (requesterRole !== 'Admin') {
      const { data: participant } = await supabase
        .from('message_participants')
        .select('user_id')
        .eq('thread_id', threadId)
        .eq('user_id', requester.id)
        .maybeSingle();

      if (!participant) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    const { data: participants, error } = await supabase
      .from('message_participants')
      .select(
        `
        user_id,
        role,
        is_archived,
        users (
          id,
          name,
          email,
          role,
          avatar
        )
      `
      )
      .eq('thread_id', threadId)
      .order('role');

    if (error) {
      console.error('participants GET error', error);
      return NextResponse.json(
        { error: 'Failed to load participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: participants || [],
    });
  } catch (error) {
    console.error('participants GET unexpected', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

