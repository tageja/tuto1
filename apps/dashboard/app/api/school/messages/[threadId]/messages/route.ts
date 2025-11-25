import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { getUserByAuthId } from '../../../../../../lib/api/messages';
import type { MessageAttachment } from '../../../../../../lib/types/messages';

const DEFAULT_LIMIT = 50;

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
    const cursor = sanitize(searchParams.get('cursor'));
    const limitParam = Number(searchParams.get('limit'));
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 200
        ? limitParam
        : DEFAULT_LIMIT;

    if (!threadId || !schoolId || !userAuthId) {
      return NextResponse.json(
        { error: 'threadId, schoolId, and userAuthId are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const user = await getUserByAuthId(supabase, userAuthId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const thread = await getThread(supabase, threadId, schoolId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const canAccess = await isParticipant(supabase, threadId, user.id);
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    let query = supabase
      .from('messages')
      .select('id, thread_id, sender_id, body, attachments, sent_at, client_message_id')
      .eq('thread_id', threadId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('sent_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('messages GET error', error);
      return NextResponse.json(
        { error: 'Failed to load messages' },
        { status: 500 }
      );
    }

    const messages = (data || []).reverse();
    const hasMore = (data || []).length === limit;
    const nextCursor = hasMore ? data?.[data.length - 1]?.sent_at ?? null : null;

    return NextResponse.json({
      success: true,
      data: messages,
      page: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('messages GET unexpected', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const payload = await request.json();
    const threadId = sanitize((await params).threadId);
    const schoolId = sanitize(payload?.schoolId);
    const userAuthId = sanitize(payload?.userAuthId);
    const body = payload?.body?.trim();
    const attachments: MessageAttachment[] = Array.isArray(payload?.attachments)
      ? payload.attachments
      : [];
    const clientMessageId = sanitize(payload?.clientMessageId);

    if (!threadId || !schoolId || !userAuthId || !body) {
      return NextResponse.json(
        { error: 'threadId, schoolId, userAuthId, and body are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const sender = await getUserByAuthId(supabase, userAuthId);

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    const thread = await getThread(supabase, threadId, schoolId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const canAccess = await isParticipant(supabase, threadId, sender.id);
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          thread_id: threadId,
          sender_id: sender.id,
          body,
          attachments,
          client_message_id: clientMessageId,
        },
      ])
      .select('id, thread_id, sender_id, body, attachments, sent_at, client_message_id')
      .single();

    if (error || !message) {
      console.error('messages POST error', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    await supabase
      .from('message_reads')
      .upsert({ message_id: message.id, user_id: sender.id }, { onConflict: 'message_id,user_id' });

    await supabase
      .from('message_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('messages POST unexpected', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const payload = await request.json();
    const threadId = sanitize((await params).threadId);
    const schoolId = sanitize(payload?.schoolId);
    const userAuthId = sanitize(payload?.userAuthId);
    const messageIds: string[] = Array.isArray(payload?.messageIds)
      ? payload.messageIds.filter((id: string) => Boolean(id))
      : [];

    if (!threadId || !schoolId || !userAuthId || !messageIds.length) {
      return NextResponse.json(
        { error: 'threadId, schoolId, userAuthId, and messageIds are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const user = await getUserByAuthId(supabase, userAuthId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const thread = await getThread(supabase, threadId, schoolId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const canAccess = await isParticipant(supabase, threadId, user.id);
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const rows = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('message_reads')
      .upsert(rows, { onConflict: 'message_id,user_id' });

    if (error) {
      console.error('messages PATCH error', error);
      return NextResponse.json({ error: 'Failed to update read receipts' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('messages PATCH unexpected', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

async function getThread(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  threadId: string,
  schoolId: string
) {
  const { data } = await supabase
    .from('message_threads')
    .select('id, school_id')
    .eq('id', threadId)
    .eq('school_id', schoolId)
    .maybeSingle();
  return data || null;
}

async function isParticipant(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  threadId: string,
  userId: string
) {
  const { data } = await supabase
    .from('message_participants')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

