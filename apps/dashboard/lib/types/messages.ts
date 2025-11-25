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

export type ThreadCounts = {
  inbox: number;
  sent: number;
  unread: number;
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

