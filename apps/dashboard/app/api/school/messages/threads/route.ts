import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import {
  getUserByAuthId,
  getUsersByEmails,
  getUsersByIds,
  mapRoleToParticipant,
} from '../../../../../lib/api/messages';
import type {
  MessageAttachment,
  MessagePriority,
  ParticipantRole,
  ThreadSummary,
} from '../../../../../lib/types/messages';

const sanitize = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  return trimmed;
};

type ComposePayload = {
  schoolId: string;
  userAuthId: string;
  subject: string;
  priority?: MessagePriority;
  messageBody: string;
  attachments?: MessageAttachment[];
  clientMessageId?: string;
  clientThreadId?: string;
  to?: {
    userIds?: string[];
    teacherEmails?: string[];
    teacherContacts?: Array<{
      teacherId?: string | null;
      email: string;
      name?: string | null;
    }>;
    parentContacts?: Array<{
      email: string;
      name?: string | null;
    }>;
    classIds?: string[];
    gradeLevels?: string[];
  };
};

type ResolvedParticipant = { user_id: string; role: ParticipantRole };

const dedupe = (values?: (string | null | undefined)[]) => {
  if (!values?.length) return [];
  const set = new Set<string>();
  values.forEach((value) => {
    if (!value) return;
    set.add(value);
  });
  return Array.from(set);
};

const PRIORITIES: MessagePriority[] = ['Normal', 'High', 'N/A'];

const normalizePriority = (value?: string | null): MessagePriority => {
  if (!value) return 'Normal';
  const match = PRIORITIES.find((p) => p.toLowerCase() === value.toLowerCase());
  return match ?? 'Normal';
};

const buildSummaryFromThread = (
  thread: any,
  message: any,
  participantRole: ParticipantRole
): ThreadSummary => ({
  thread,
  lastMessage: message ? {
    id: message.id,
    thread_id: message.thread_id,
    sender_id: message.sender_id,
    body: message.body,
    attachments: message.attachments || [],
    sent_at: message.sent_at,
    client_message_id: message.client_message_id,
  } : null,
  unreadCount: 0,
  participantRole,
  isArchived: false,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const threadId = sanitize(searchParams.get('threadId'));
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

    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('*')
      .eq('id', threadId)
      .eq('school_id', schoolId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const { data: participantCheck } = await supabase
      .from('message_participants')
      .select('user_id')
      .eq('thread_id', threadId)
      .eq('user_id', requester.id)
      .maybeSingle();

    const requesterRole = mapRoleToParticipant(requester.role);
    const isAdmin = requesterRole === 'Admin';

    if (!participantCheck && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized for this thread' }, { status: 403 });
    }

    const { data: participants, error: participantsError } = await supabase
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
      .eq('thread_id', threadId);

    if (participantsError) {
      console.error('Failed to load participants', participantsError);
      return NextResponse.json(
        { error: 'Failed to load participants' },
        { status: 500 }
      );
    }

    const { data: lastMessage } = await supabase
      .from('messages')
      .select('id, thread_id, sender_id, body, attachments, sent_at, client_message_id')
      .eq('thread_id', threadId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        thread,
        participants: participants || [],
        lastMessage: lastMessage || null,
      },
    });
  } catch (error) {
    console.error('threads GET error', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/school/messages/threads - START');
  try {
    const supabase = createServerSupabaseClient();
    const body: ComposePayload = await request.json();
    console.log('📦 Received body:', JSON.stringify(body, null, 2));
    
    const subject = body.subject?.trim();
    const messageBody = body.messageBody?.trim();

    if (!body.schoolId || !body.userAuthId || !subject || !messageBody) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'schoolId, userAuthId, subject, and messageBody are required' },
        { status: 400 }
      );
    }

    const sender = await getUserByAuthId(supabase, body.userAuthId);

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    const senderRole = mapRoleToParticipant(sender.role);

    console.log('📝 Compose request body.to:', JSON.stringify(body.to, null, 2));

    const { recipients, classContext, stats } = await resolveRecipients(
      supabase,
      body.schoolId,
      body.to || {}
    );

    console.log('📝 Resolved recipients:', recipients.length, recipients);

    // Remove sender from recipient list if present
    const recipientMap = new Map<string, ParticipantRole>();
    recipients.forEach((recipient) => {
      if (recipient.user_id === sender.id) return;
      recipientMap.set(recipient.user_id, recipient.role);
    });

    console.log('📝 Final recipient map (excluding sender):', recipientMap.size);

    if (!recipientMap.size) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 422 }
      );
    }

    const threadPayload: Record<string, any> = {
      school_id: body.schoolId,
      subject,
      priority: normalizePriority(body.priority),
      class_id: classContext.classId,
      grade: classContext.grade,
      created_by: sender.id,
    };

    const overrideThreadId = sanitize(body.clientThreadId);
    let thread: any = null;

    // Check if thread already exists (from previous failed attempt)
    if (overrideThreadId) {
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('*')
        .eq('id', overrideThreadId)
        .eq('school_id', body.schoolId)
        .maybeSingle();

      if (existingThread) {
        console.log('♻️ Reusing existing thread:', existingThread.id);
        thread = existingThread;
      } else {
        threadPayload.id = overrideThreadId;
      }
    }

    // Create thread only if it doesn't exist
    if (!thread) {
      const { data: newThread, error: threadError } = await supabase
        .from('message_threads')
        .insert(threadPayload)
        .select('*')
        .single();

      if (threadError) {
        console.error('Failed to create thread', threadError);
        console.error('Thread payload:', threadPayload);
        return NextResponse.json({ 
          error: 'Failed to create thread',
          details: threadError.message,
          code: threadError.code
        }, { status: 500 });
      }

      thread = newThread;
      console.log('✅ Thread created:', thread.id);
    }

    // Get existing participants to avoid duplicates
    const { data: existingParticipants } = await supabase
      .from('message_participants')
      .select('user_id')
      .eq('thread_id', thread.id);

    const existingUserIds = new Set(existingParticipants?.map((p) => p.user_id) || []);

    const participantRows: Array<{ thread_id: string; user_id: string; role: ParticipantRole }> = [
      { thread_id: thread.id, user_id: sender.id, role: senderRole },
      ...Array.from(recipientMap.entries()).map(([userId, role]) => ({
        thread_id: thread.id,
        user_id: userId,
        role,
      })),
    ].filter((p) => !existingUserIds.has(p.user_id));

    // Only insert if there are new participants
    if (participantRows.length > 0) {
      const { error: participantsError } = await supabase
        .from('message_participants')
        .insert(participantRows);

      if (participantsError) {
        console.error('Failed to insert participants', participantsError);
        console.error('Participant rows:', participantRows);
        return NextResponse.json(
          { 
            error: 'Failed to add participants',
            details: participantsError.message,
            code: participantsError.code
          },
          { status: 500 }
        );
      }

      console.log('✅ Participants added:', participantRows.length);
    } else {
      console.log('ℹ️ All participants already exist, skipping insert');
    }

    // Check if message already exists (idempotency via client_message_id)
    let message: any = null;
    if (body.clientMessageId) {
      const { data: existingMessage } = await supabase
        .from('messages')
        .select('id, thread_id, sender_id, body, attachments, sent_at, client_message_id')
        .eq('client_message_id', body.clientMessageId)
        .maybeSingle();

      if (existingMessage) {
        console.log('♻️ Message already exists (idempotent):', existingMessage.id);
        message = existingMessage;
      }
    }

    // Create message only if it doesn't exist
    if (!message) {
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            thread_id: thread.id,
            sender_id: sender.id,
            body: messageBody,
            attachments: body.attachments ?? [],
            client_message_id: body.clientMessageId ?? null,
          },
        ])
        .select(
          `
          id,
          thread_id,
          sender_id,
          body,
          attachments,
          sent_at,
          client_message_id
        `
        )
        .single();

      if (messageError) {
        console.error('Failed to send message', messageError);
        console.error('Message payload:', {
          thread_id: thread.id,
          sender_id: sender.id,
          body: messageBody,
          attachments: body.attachments ?? [],
        });
        return NextResponse.json({ 
          error: 'Failed to send message', 
          details: messageError.message,
          code: messageError.code 
        }, { status: 500 });
      }

      message = newMessage;
      console.log('✅ Message sent:', message.id);
    }

    await supabase
      .from('message_reads')
      .upsert({ message_id: message.id, user_id: sender.id }, { onConflict: 'message_id,user_id' });

    await supabase
      .from('message_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', thread.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          thread,
          participants: participantRows,
          summary: buildSummaryFromThread(thread, message, senderRole),
          stats: {
            totalRecipients: recipientMap.size,
            ...stats,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌❌❌ threads POST CRITICAL ERROR ❌❌❌');
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Unexpected server error',
        details: error?.message || String(error),
        type: typeof error
      },
      { status: 500 }
    );
  }
}

async function resolveRecipients(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  schoolId: string,
  to: ComposePayload['to']
): Promise<{
  recipients: ResolvedParticipant[];
  classContext: { classId: string | null; grade: string | null };
  stats: { parents: number; teachers: number; admins: number };
}> {
  const recipients = new Map<string, ParticipantRole>();
  const stats = { parents: 0, teachers: 0, admins: 0 };

  const addRecipient = (userId: string, role: ParticipantRole) => {
    if (!userId) return;
    if (!recipients.has(userId)) {
      recipients.set(userId, role);
      if (role === 'Parent') stats.parents += 1;
      if (role === 'Teacher') stats.teachers += 1;
      if (role === 'Admin') stats.admins += 1;
    }
  };

  const directUserIds = dedupe(to?.userIds);
  const teacherEmails = dedupe(to?.teacherEmails?.map((email) => email?.toLowerCase()));
  if (directUserIds.length) {
    const directProfiles = await getUsersByIds(supabase, directUserIds);
    directProfiles.forEach((profile) => addRecipient(profile.id, mapRoleToParticipant(profile.role)));
  }

  if (teacherEmails.length) {
    console.log('📧 Looking up teachers by email:', teacherEmails);
    const teacherProfiles = await getUsersByEmails(supabase, teacherEmails);
    console.log('📧 Found teacher profiles:', teacherProfiles.length, teacherProfiles.map(p => ({ id: p.id, email: p.email })));
    teacherProfiles.forEach((profile) => addRecipient(profile.id, mapRoleToParticipant(profile.role)));
  }

  if (to?.teacherContacts?.length) {
    console.log('👥 Ensuring users for teacher contacts:', to.teacherContacts.length);
    const contactRecipients = await ensureUsersForTeacherContacts(supabase, to.teacherContacts);
    console.log('👥 Provisioned teacher users:', contactRecipients.length, contactRecipients);
    contactRecipients.forEach((recipient) => addRecipient(recipient.user_id, 'Teacher'));
  }

  if (to?.parentContacts?.length) {
    console.log('👥 Ensuring users for parent contacts:', to.parentContacts.length);
    const parentRecipients = await ensureUsersForParentContacts(supabase, to.parentContacts);
    console.log('👥 Provisioned parent users:', parentRecipients.length, parentRecipients);
    parentRecipients.forEach((recipient) => addRecipient(recipient.user_id, 'Parent'));
  }

  const classIds = dedupe(to?.classIds);
  const gradeLevels = dedupe(to?.gradeLevels);

  const classContext = { classId: null as string | null, grade: null as string | null };

  const classesToLoad = new Set<string>();

  if (classIds.length) {
    classIds.forEach((id) => classesToLoad.add(id));
  }

  if (gradeLevels.length) {
    const { data: gradeClasses, error } = await supabase
      .from('school_classes')
      .select('id, grade_level')
      .eq('school_id', schoolId)
      .in('grade_level', gradeLevels);

    if (!error && gradeClasses) {
      gradeClasses.forEach((cls) => classesToLoad.add(cls.id));
      classContext.grade = gradeClasses[0]?.grade_level ?? gradeLevels[0] ?? null;
    }
  }

  const classIdList = Array.from(classesToLoad);

  if (classIdList.length) {
    const { data: classes, error: classError } = await supabase
      .from('school_classes')
      .select('id, grade_level, teacher_id')
      .eq('school_id', schoolId)
      .in('id', classIdList);

    if (!classError && classes?.length) {
      classContext.classId = classes[0].id;
      if (!classContext.grade) {
        classContext.grade = classes[0].grade_level;
      }

      const teacherIds = dedupe(classes.map((cls) => cls.teacher_id).filter(Boolean));

      if (teacherIds.length) {
        const { data: teacherRows } = await supabase
          .from('school_teachers')
          .select('user_id')
          .in('id', teacherIds);

        const teacherUserIds = dedupe(teacherRows?.map((row) => row.user_id).filter(Boolean));
        if (teacherUserIds.length) {
          const teacherProfiles = await getUsersByIds(supabase, teacherUserIds);
          teacherProfiles.forEach((profile) => addRecipient(profile.id, 'Teacher'));
        }
      }

      const { data: studentsRows } = await supabase
        .from('school_students')
        .select('parent_email')
        .in('class_id', classes.map((cls) => cls.id))
        .eq('school_id', schoolId);

      const parentEmails = dedupe(studentsRows?.map((row) => row.parent_email) ?? []);
      if (parentEmails.length) {
        const parentProfiles = await getUsersByEmails(supabase, parentEmails);
        parentProfiles.forEach((profile) => addRecipient(profile.id, 'Parent'));
      }
    }
  }

  return {
    recipients: Array.from(recipients.entries()).map(([user_id, role]) => ({ user_id, role })),
    classContext,
    stats,
  };
}

async function ensureUsersForTeacherContacts(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  contacts: Array<{ teacherId?: string | null; email: string; name?: string | null }>
): Promise<Array<{ user_id: string }>> {
  const normalized = contacts
    .map((contact) => ({
      teacherId: contact.teacherId,
      email: contact.email?.trim().toLowerCase(),
      name: contact.name?.trim(),
    }))
    .filter((contact) => Boolean(contact.email));

  console.log('👤 Normalized teacher contacts:', normalized);

  if (!normalized.length) {
    console.log('⚠️ No valid teacher contacts to provision');
    return [];
  }

  const emails = dedupe(normalized.map((contact) => contact.email));
  const emailToUserId = new Map<string, string>();

  const { data: existingUsers, error: existingError } = await supabase
    .from('users')
    .select('id, email')
    .in('email', emails);

  if (existingError) {
    console.error('❌ Error fetching existing users:', existingError);
    throw existingError;
  }

  console.log('✅ Found existing users:', existingUsers?.length || 0);

  existingUsers?.forEach((user) => {
    if (user.email) {
      emailToUserId.set(user.email.toLowerCase(), user.id);
    }
  });

  for (const email of emails) {
    if (emailToUserId.has(email)) {
      console.log(`✓ User already exists for ${email}`);
      continue;
    }

    const contact = normalized.find((c) => c.email === email);
    const displayName = contact?.name || email.split('@')[0];
    
    console.log(`🆕 Creating new user for ${email} (${displayName})`);
    
    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        name: displayName,
        role: 'teacher',
      })
      .select('id, email')
      .single();

    if (insertError) {
      console.error(`❌ Failed to create user for ${email}:`, insertError);
      throw insertError;
    }

    console.log(`✅ Created user for ${email}:`, createdUser?.id);

    if (createdUser?.email) {
      emailToUserId.set(createdUser.email.toLowerCase(), createdUser.id);
    }
  }

  // Link school_teachers rows to the resolved user ids when needed
  for (const contact of normalized) {
    if (!contact.teacherId) continue;
    const userId = emailToUserId.get(contact.email!);
    if (!userId) continue;

    await supabase
      .from('school_teachers')
      .update({ user_id: userId })
      .eq('id', contact.teacherId)
      .is('user_id', null);
  }

  return normalized
    .map((contact) => {
      const userId = emailToUserId.get(contact.email!);
      return userId ? { user_id: userId } : null;
    })
    .filter(Boolean) as Array<{ user_id: string }>;
}

async function ensureUsersForParentContacts(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  contacts: Array<{ email: string; name?: string | null }>
): Promise<Array<{ user_id: string }>> {
  const normalized = contacts
    .map((contact) => ({
      email: contact.email?.trim().toLowerCase(),
      name: contact.name?.trim(),
    }))
    .filter((contact) => Boolean(contact.email));

  console.log('👤 Normalized parent contacts:', normalized);

  if (!normalized.length) {
    console.log('⚠️ No valid parent contacts to provision');
    return [];
  }

  const emails = dedupe(normalized.map((contact) => contact.email));
  const emailToUserId = new Map<string, string>();

  const { data: existingUsers, error: existingError } = await supabase
    .from('users')
    .select('id, email')
    .in('email', emails);

  if (existingError) {
    console.error('❌ Error fetching existing users:', existingError);
    throw existingError;
  }

  console.log('✅ Found existing users:', existingUsers?.length || 0);

  existingUsers?.forEach((user) => {
    if (user.email) {
      emailToUserId.set(user.email.toLowerCase(), user.id);
    }
  });

  for (const email of emails) {
    if (emailToUserId.has(email)) {
      console.log(`✓ User already exists for ${email}`);
      continue;
    }

    const contact = normalized.find((c) => c.email === email);
    const displayName = contact?.name || email.split('@')[0];
    
    console.log(`🆕 Creating new user for ${email} (${displayName})`);
    
    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        name: displayName,
        role: 'parent',
      })
      .select('id, email')
      .single();

    if (insertError) {
      console.error(`❌ Failed to create user for ${email}:`, insertError);
      throw insertError;
    }

    console.log(`✅ Created user for ${email}:`, createdUser?.id);

    if (createdUser?.email) {
      emailToUserId.set(createdUser.email.toLowerCase(), createdUser.id);
    }
  }

  return normalized
    .map((contact) => {
      const userId = emailToUserId.get(contact.email!);
      return userId ? { user_id: userId } : null;
    })
    .filter(Boolean) as Array<{ user_id: string }>;
}

