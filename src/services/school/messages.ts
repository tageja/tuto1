import { supabase } from '../../config/supabase';
import { getCurrentUser } from '../../config/supabase';

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

/**
 * Fetch students for a school
 */
export async function fetchSchoolStudents(schoolId: string): Promise<Array<{
  id: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  grade: string | null;
  parent_email: string | null;
  parent_name: string | null;
}>> {
  try {
    console.log('🔍 fetchSchoolStudents: Input schoolId:', schoolId);
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    console.log('✅ fetchSchoolStudents: Resolved schoolId:', resolvedSchoolId);
    
    if (!resolvedSchoolId) {
      console.error('❌ Could not resolve school ID:', schoolId);
      return [];
    }

    const { data, error } = await supabase
      .from('school_students')
      .select(`
        id,
        first_name,
        last_name,
        class_id,
        parent_email,
        parent_name,
        school_classes (
          name,
          grade_level
        )
      `)
      .eq('school_id', resolvedSchoolId)
      .eq('status', 'Active')
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true });

    if (error) {
      console.error('❌ Error from Supabase:', error);
      throw error;
    }

    console.log('📊 Students fetched:', data?.length || 0);
    
    const students = (data || []).map((student: any) => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`.trim(),
      class_id: student.class_id,
      class_name: student.school_classes?.name || null,
      grade: student.school_classes?.grade_level || null,
      parent_email: student.parent_email,
      parent_name: student.parent_name,
    }));
    
    console.log('📋 Mapped students:', students.length);
    return students;
  } catch (error) {
    console.error('Error fetching school students:', error);
    return [];
  }
}

/**
 * Resolve parent user IDs from students, classes, and grades
 */
export async function resolveParentUserIds(params: {
  schoolId: string;
  studentIds?: string[];
  classIds?: string[];
  grades?: string[];
}): Promise<{
  parentUserIds: string[];
  parentEmails: string[];
}> {
  try {
    const { schoolId, studentIds = [], classIds = [], grades = [] } = params;
    
    console.log('🔍 resolveParentUserIds called with:', { schoolId, studentIds, classIds, grades });
    
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      console.error('❌ Could not resolve school ID');
      return { parentUserIds: [], parentEmails: [] };
    }

    // Collect all students matching the criteria
    let allStudents: any[] = [];

    // 1. Direct student selections
    if (studentIds.length > 0) {
      const { data, error } = await supabase
        .from('school_students')
        .select('id, parent_email')
        .eq('school_id', resolvedSchoolId)
        .eq('status', 'Active')
        .in('id', studentIds)
        .not('parent_email', 'is', null);

      if (!error && data) {
        allStudents.push(...data);
      }
    }

    // 2. Class selections - get all students in those classes
    if (classIds.length > 0) {
      const { data, error } = await supabase
        .from('school_students')
        .select('id, parent_email')
        .eq('school_id', resolvedSchoolId)
        .eq('status', 'Active')
        .in('class_id', classIds)
        .not('parent_email', 'is', null);

      if (!error && data) {
        allStudents.push(...data);
      }
    }

    // 3. Grade selections - get all students in those grades
    if (grades.length > 0) {
      const { data, error } = await supabase
        .from('school_students')
        .select(`
          id,
          parent_email,
          school_classes!inner (grade_level)
        `)
        .eq('school_id', resolvedSchoolId)
        .eq('status', 'Active')
        .in('school_classes.grade_level', grades)
        .not('parent_email', 'is', null);

      if (!error && data) {
        allStudents.push(...data);
      }
    }

    // Get unique parent emails
    const uniqueEmails = [...new Set(allStudents.map((s) => s.parent_email).filter(Boolean))];
    console.log('📧 Unique parent emails found:', uniqueEmails.length, uniqueEmails);

    if (uniqueEmails.length === 0) {
      console.log('⚠️ No parent emails found');
      return { parentUserIds: [], parentEmails: [] };
    }

    // Find user IDs for these parent emails (case-insensitive using RPC)
    const { data: users, error: usersError } = await supabase.rpc('find_users_by_emails', {
      p_emails: uniqueEmails,
    });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log('👥 Users found for emails:', users?.length || 0, users);

    const parentUserIds = (users || []).map((u: any) => u.id);

    console.log('✅ Resolved parent user IDs:', parentUserIds.length, parentUserIds);

    return {
      parentUserIds,
      parentEmails: uniqueEmails,
    };
  } catch (error) {
    console.error('Error resolving parent user IDs:', error);
    return { parentUserIds: [], parentEmails: [] };
  }
}

export type MessagePriority = 'Normal' | 'High' | 'N/A';

export type ParticipantRole = 'Admin' | 'Teacher' | 'Parent';

export type MessageAttachment = {
  name: string;
  url: string;
  size: number;
  path?: string;
  contentType?: string | null;
};

export type MessageSender = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
};

export type MessageRecord = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  attachments: MessageAttachment[];
  sent_at: string;
  client_message_id?: string | null;
  sender?: MessageSender | null;
};

export type ThreadEntity = {
  id: string;
  school_id: string;
  subject: string;
  priority: MessagePriority;
  class_id?: string | null;
  grade?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ThreadSummary = {
  thread: ThreadEntity;
  lastMessage: MessageRecord | null;
  unreadCount: number;
  participantRole: ParticipantRole;
  isArchived: boolean;
};

export type ThreadFilters = {
  classId?: string | null;
  grade?: string | null;
  search?: string;
};

export type ThreadParticipant = {
  user_id: string;
  role: ParticipantRole;
  is_archived: boolean;
  users?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    avatar?: string | null;
  } | null;
};

/**
 * Fetch message threads summary using Supabase RPC
 */
export async function fetchMessageThreads(
  schoolId: string,
  userAuthId: string,
  filters: ThreadFilters = {}
): Promise<ThreadSummary[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    const { data, error } = await supabase.rpc('get_message_threads_summary', {
      p_user_auth_id: userAuthId,
      p_school_id: resolvedSchoolId,
      p_class_id: filters.classId || null,
      p_grade: filters.grade || null,
    });

    if (error) {
      console.error('Error fetching message threads:', error);
      throw error;
    }

    // Transform RPC response to ThreadSummary[]
    const summaries: ThreadSummary[] = (data || []).map((row: any) => ({
      thread: row.thread as ThreadEntity,
      lastMessage: row.last_message ? {
        id: row.last_message.id,
        thread_id: row.thread.id,
        sender_id: row.last_message.sender_id,
        body: row.last_message.body,
        attachments: (row.last_message.attachments || []) as MessageAttachment[],
        sent_at: row.last_message.sent_at,
      } : null,
      unreadCount: row.unread_count ?? 0,
      participantRole: row.participant_role as ParticipantRole,
      isArchived: row.is_archived ?? false,
    }));

    // Apply search filter if provided
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return summaries.filter((item) => {
        const subject = item.thread.subject?.toLowerCase() ?? '';
        const body = item.lastMessage?.body?.toLowerCase() ?? '';
        return subject.includes(searchLower) || body.includes(searchLower);
      });
    }

    // Filter out archived threads
    return summaries.filter((item) => !item.isArchived);
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return [];
  }
}

/**
 * Fetch messages for a thread (paginated)
 */
export async function fetchThreadMessages(
  threadId: string,
  cursor?: string | null,
  limit: number = 50
): Promise<{ messages: MessageRecord[]; hasMore: boolean; nextCursor: string | null }> {
  try {
    const { data, error } = await supabase.rpc('get_thread_messages', {
      p_thread_id: threadId,
      p_cursor: cursor,
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching thread messages:', error);
      throw error;
    }

    const messages = (data || []).reverse(); // Reverse to show oldest first
    const hasMore = (data || []).length === limit;
    const nextCursor = hasMore ? data?.[data.length - 1]?.sent_at ?? null : null;

    return {
      messages: messages.map((msg: any) => ({
        id: msg.id,
        thread_id: msg.thread_id,
        sender_id: msg.sender_id,
        body: msg.body,
        attachments: (msg.attachments || []) as MessageAttachment[],
        sent_at: msg.sent_at,
        client_message_id: msg.client_message_id,
      })),
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return { messages: [], hasMore: false, nextCursor: null };
  }
}

/**
 * Fetch thread participants with user details
 */
export async function fetchThreadParticipants(threadId: string): Promise<ThreadParticipant[]> {
  try {
    const { data, error } = await supabase.rpc('get_thread_participants', {
      p_thread_id: threadId,
    });

    if (error) {
      console.error('Error fetching thread participants:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      user_id: row.user_id,
      role: row.role as ParticipantRole,
      is_archived: row.is_archived,
      users: row.user_data ? {
        id: row.user_data.id,
        name: row.user_data.name,
        email: row.user_data.email,
        role: row.user_data.role,
        avatar: row.user_data.avatar,
      } : null,
    }));
  } catch (error) {
    console.error('Error fetching thread participants:', error);
    return [];
  }
}

/**
 * Enrich messages with sender information
 */
export async function enrichMessagesWithSenders(
  messages: MessageRecord[],
  participants: ThreadParticipant[]
): Promise<MessageRecord[]> {
  return messages.map((msg) => {
    const participant = participants.find((p) => p.user_id === msg.sender_id);
    return {
      ...msg,
      sender: participant?.users ? {
        id: participant.users.id,
        name: participant.users.name,
        email: participant.users.email,
        role: participant.users.role,
        avatar: participant.users.avatar,
      } : undefined,
    };
  });
}

/**
 * Send a message in a thread
 */
export async function sendMessage(
  threadId: string,
  body: string,
  attachments: MessageAttachment[] = [],
  clientMessageId?: string
): Promise<MessageRecord | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data, error } = await supabase.rpc('send_message', {
      p_thread_id: threadId,
      p_sender_id: userData.id,
      p_body: body.trim(),
      p_attachments: attachments.length > 0 ? attachments : [],
      p_client_message_id: clientMessageId || null,
    });

    if (error || !data || data.length === 0) {
      console.error('Error sending message:', error);
      throw error;
    }

    const message = data[0];

    // Create notifications for other participants in the thread
    try {
      // Get thread details for notification
      const { data: threadData } = await supabase
        .from('message_threads')
        .select('subject, school_id')
        .eq('id', threadId)
        .single();

      // Get all participants except the sender
      const { data: participants } = await supabase
        .from('message_participants')
        .select('user_id, role')
        .eq('thread_id', threadId)
        .neq('user_id', userData.id);

      if (participants && participants.length > 0 && threadData?.school_id) {
        // Get sender info for notification
        const { data: senderInfo } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userData.id)
          .single();

        const notificationPromises = participants.map(async (participant) => {
          // Normalize role to lowercase for comparison
          const roleLower = participant.role?.toLowerCase() || '';
          const notifRole: 'parent' | 'admin' = 
            roleLower === 'parent' || roleLower === 'guardian' ? 'parent' : 'admin';
          
          try {
            await supabase.from('notifications').insert({
              school_id: threadData.school_id,
              recipient_user_id: participant.user_id,
              recipient_role: notifRole,
              type: 'message',
              priority: 'urgent',
              title: `New reply: ${threadData?.subject || 'Message'}`,
              body: body.substring(0, 150) + (body.length > 150 ? '...' : ''),
              target_type: 'feedback',
              target_id: threadId,
              is_read: false,
              meta: {
                threadId,
                senderId: userData.id,
                senderName: senderInfo?.name || senderInfo?.email || 'Unknown',
              },
            });
          } catch (notifError) {
            console.error('Failed to create notification for participant:', participant.user_id, notifError);
          }
        });

        await Promise.allSettled(notificationPromises);
        console.log('✅ Mobile: Notifications created for', participants.length, 'participants');
      }
    } catch (notifError) {
      // Don't fail the message send if notification creation fails
      console.error('Error creating message notifications:', notifError);
    }

    return {
      id: message.id,
      thread_id: message.thread_id,
      sender_id: message.sender_id,
      body: message.body,
      attachments: (message.attachments || []) as MessageAttachment[],
      sent_at: message.sent_at,
      client_message_id: message.client_message_id,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  threadId: string,
  messageIds: string[]
): Promise<boolean> {
  try {
    if (messageIds.length === 0) return true;

    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data, error } = await supabase.rpc('mark_messages_read', {
      p_message_ids: messageIds,
      p_user_id: userData.id,
    });

    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }

    return data === true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

/**
 * Get unread message IDs for a thread
 */
export async function getUnreadMessageIds(
  threadId: string,
  userId: string
): Promise<string[]> {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .eq('thread_id', threadId);

    if (messagesError || !messages) return [];

    const messageIds = messages.map((m) => m.id);

    if (messageIds.length === 0) return [];

    const { data: reads, error: readsError } = await supabase
      .from('message_reads')
      .select('message_id')
      .eq('user_id', userId)
      .in('message_id', messageIds);

    if (readsError) return [];

    const readMessageIds = new Set(reads.map((r) => r.message_id));
    return messageIds.filter((id) => !readMessageIds.has(id));
  } catch (error) {
    console.error('Error getting unread message IDs:', error);
    return [];
  }
}

/**
 * Create a new message thread (admin only)
 */
export async function createThread(payload: {
  schoolId: string;
  subject: string;
  priority: MessagePriority;
  classId?: string | null;
  grade?: string | null;
  recipients: {
    studentIds?: string[];
    classIds?: string[];
    grades?: string[];
  };
  messageBody: string;
  attachments?: MessageAttachment[];
}): Promise<{ threadId: string; message: MessageRecord } | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const resolvedSchoolId = await resolveSchoolId(payload.schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Resolve parent user IDs from selected students/classes/grades
    console.log('🎯 createThread: Resolving recipients for:', {
      studentIds: payload.recipients.studentIds,
      classIds: payload.recipients.classIds,
      grades: payload.recipients.grades,
    });

    const { parentUserIds, parentEmails } = await resolveParentUserIds({
      schoolId: resolvedSchoolId,
      studentIds: payload.recipients.studentIds,
      classIds: payload.recipients.classIds,
      grades: payload.recipients.grades,
    });

    console.log('📊 createThread: Resolved recipients:', {
      parentUserIds: parentUserIds.length,
      parentEmails: parentEmails.length,
    });

    if (parentUserIds.length === 0) {
      if (parentEmails.length > 0) {
        throw new Error(`Found ${parentEmails.length} parent(s) but they don't have user accounts yet. Parents need to register first.`);
      } else {
        throw new Error('No parent emails found for selected students/classes/grades.');
      }
    }

    // Create thread
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .insert([
        {
          school_id: resolvedSchoolId,
          subject: payload.subject.trim(),
          priority: payload.priority,
          class_id: payload.classId || null,
          grade: payload.grade || null,
          created_by: userData.id,
        },
      ])
      .select('id')
      .single();

    if (threadError || !thread) {
      console.error('Error creating thread:', threadError);
      throw threadError;
    }

    // Create participants: admin sender + all parent recipients
    const participants = [
      {
        thread_id: thread.id,
        user_id: userData.id,
        school_id: resolvedSchoolId,
        role: 'Admin',
      },
      ...parentUserIds.map((parentUserId) => ({
        thread_id: thread.id,
        user_id: parentUserId,
        school_id: resolvedSchoolId,
        role: 'Parent',
      })),
    ];

    const { error: participantsError } = await supabase
      .from('message_participants')
      .insert(participants);

    if (participantsError) {
      console.error('Error creating participants:', participantsError);
      throw participantsError;
    }

    // Send initial message
    const message = await sendMessage(
      thread.id,
      payload.messageBody,
      payload.attachments || []
    );

    if (!message) {
      throw new Error('Failed to send initial message');
    }

    return {
      threadId: thread.id,
      message,
    };
  } catch (error) {
    console.error('Error creating thread:', error);
    return null;
  }
}

/**
 * Archive a thread
 */
export async function archiveThread(threadId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { error } = await supabase
      .from('message_participants')
      .update({ is_archived: true })
      .eq('thread_id', threadId)
      .eq('user_id', userData.id);

    if (error) {
      console.error('Error archiving thread:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error archiving thread:', error);
    return false;
  }
}

/**
 * Delete a thread (admin only)
 */
export async function deleteThread(threadId: string): Promise<boolean> {
  try {
    // Thread deletion cascades to messages and participants via foreign keys
    const { error } = await supabase
      .from('message_threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting thread:', error);
    return false;
  }
}

