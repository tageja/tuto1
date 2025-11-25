'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useI18n } from '../../contexts/I18nContext';
import { ThreadList } from './ThreadList';
import { ThreadPane } from './ThreadPane';
import { ChatComposer } from './ChatComposer';
import { ComposeModal } from './ComposeModal';
import { Toast } from '../ui/Toast';
import type {
  MessageRecord,
  ThreadCounts,
  ThreadSummary,
  ThreadParticipant,
  ThreadEntity,
} from '../../lib/types/messages';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ClassRecord = {
  id: string;
  name: string;
  grade_level?: string | null;
};

type TeacherRecord = {
  id: string;
  name: string;
  email?: string;
  user_id?: string;
};

type ParentRecord = {
  id: string;
  name: string;
  email: string;
  user_id?: string | null;
};

type ThreadDetailResponse = {
  thread: ThreadEntity;
  participants: ThreadParticipant[];
  lastMessage?: MessageRecord | null;
};

type MessagesDashboardProps = {
  variant: 'admin' | 'parent';
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network error');
  }
  const json = await response.json();
  return json as T;
};

export function MessagesDashboard({ variant }: MessagesDashboardProps) {
  const { supabaseUser, user } = useAuth();
  const { selectedSchool, schoolIdFromUrl } = useSchool();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || '';
  const userAuthId = supabaseUser?.id || '';
  const userDbId = user?.id || '';

  console.log('🔑 MessagesDashboard IDs:', { 
    userAuthId: userAuthId.slice(0, 8), 
    userDbId: userDbId.slice(0, 8),
    userName: user?.name 
  });

  useEffect(() => {
    const threadId = searchParams.get('threadId');
    const messageId = searchParams.get('messageId');
    setSelectedThreadId(threadId);
    setTargetMessageId(messageId);
  }, [searchParams]);

  const updateUrl = useCallback(
    (threadId?: string | null, messageId?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (threadId) {
        params.set('threadId', threadId);
      } else {
        params.delete('threadId');
      }
      if (messageId) {
        params.set('messageId', messageId);
      } else {
        params.delete('messageId');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const summaryQuery = useQuery({
    queryKey: [
      'messages-summary',
      {
        schoolId,
        userAuthId,
        classFilter,
        gradeFilter,
        search,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        schoolId,
        userAuthId,
        q: search,
      });
      if (classFilter) params.set('classId', classFilter);
      if (gradeFilter) params.set('grade', gradeFilter);
      return fetcher<{ success: boolean; data: ThreadSummary[]; counts: ThreadCounts }>(
        `/api/school/messages/threads/summary?${params.toString()}`
      );
    },
    enabled: Boolean(schoolId && userAuthId),
    refetchInterval: 5_000, // Poll every 5 seconds for new messages
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const classQuery = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const response = await fetcher<ApiResponse<{ records: ClassRecord[] }>>(
        `/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&limit=200`
      );
      return response.data.records;
    },
    enabled: variant === 'admin' && Boolean(schoolId),
  });

  const teacherQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      const response = await fetcher<ApiResponse<{ records: TeacherRecord[] }>>(
        `/api/school/teachers?schoolId=${encodeURIComponent(schoolId)}&limit=200`
      );
      return response.data.records;
    },
    enabled: variant === 'parent' && Boolean(schoolId),
  });

  const parentQuery = useQuery({
    queryKey: ['parents', schoolId],
    queryFn: async () => {
      const response = await fetcher<ApiResponse<{ records: ParentRecord[] }>>(
        `/api/school/parents?schoolId=${encodeURIComponent(schoolId)}&limit=200`
      );
      return response.data.records;
    },
    enabled: variant === 'admin' && Boolean(schoolId),
  });

  const threadDetailQuery = useQuery({
    queryKey: ['thread-detail', selectedThreadId, schoolId, userAuthId],
    queryFn: async () =>
      fetcher<{ success: boolean; data: ThreadDetailResponse }>(
        `/api/school/messages/threads?threadId=${encodeURIComponent(
          selectedThreadId || ''
        )}&schoolId=${encodeURIComponent(schoolId)}&userAuthId=${userAuthId}`
      ),
    enabled: Boolean(selectedThreadId && schoolId && userAuthId),
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: ['thread-messages', selectedThreadId, schoolId, userAuthId],
    queryFn: async ({ pageParam }: { pageParam?: string | null }) => {
      if (!selectedThreadId) return { data: [], page: { hasMore: false, nextCursor: null } };
      const params = new URLSearchParams({
        schoolId,
        userAuthId,
      });
      if (pageParam) params.set('cursor', pageParam);
      const response = await fetcher<{
        success: boolean;
        data: MessageRecord[];
        page: { hasMore: boolean; nextCursor: string | null };
      }>(`/api/school/messages/${selectedThreadId}/messages?${params.toString()}`);
      return response;
    },
    enabled: Boolean(selectedThreadId && schoolId && userAuthId),
    getNextPageParam: (lastPage) =>
      lastPage.page?.hasMore ? (lastPage.page.nextCursor || undefined) : undefined,
  });

  const markReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!selectedThreadId) return null;
      return fetch(`/api/school/messages/${selectedThreadId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          userAuthId,
          messageIds,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages-summary'] });
    },
  });

  const markedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    markedMessagesRef.current = new Set();
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId || !messagesQuery.data || !userDbId) return;
    const allMessages = messagesQuery.data.pages.flatMap((page) => page.data);
    const toMark = allMessages
      .filter((msg) => msg.sender_id !== userDbId && !markedMessagesRef.current.has(msg.id))
      .map((msg) => msg.id);
    if (!toMark.length) return;
    toMark.forEach((id) => markedMessagesRef.current.add(id));
    markReadMutation.mutate(toMark);
  }, [messagesQuery.data, selectedThreadId, userDbId, markReadMutation]);

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setTargetMessageId(null);
    updateUrl(threadId, null);
  };

  const handleMessageSent = async () => {
    console.log('📨 Message sent, refetching queries...');
    
    // Wait a bit for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Directly refetch queries to show new message immediately
    const results = await Promise.all([
      messagesQuery.refetch(),
      summaryQuery.refetch(),
      threadDetailQuery.refetch(),
    ]);
    
    console.log('✅ Queries refetched:', {
      messages: results[0].isSuccess,
      summary: results[1].isSuccess,
      detail: results[2].isSuccess,
    });
  };

  const handleThreadCreated = async (summary: ThreadSummary) => {
    console.log('🆕 Thread created:', summary.thread.id);
    showToast(t('dashboard.messages.messageSent') || 'Message sent successfully', 'success');
    setComposeOpen(false);
    
    // Select the newly created thread first
    setSelectedThreadId(summary.thread.id);
    updateUrl(summary.thread.id, null);
    
    // Wait a bit for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aggressively refetch to show new thread
    const result = await summaryQuery.refetch();
    console.log('✅ Summary refetched after thread creation:', {
      success: result.isSuccess,
      threadCount: result.data?.data?.length || 0,
    });
  };

  const threadList = summaryQuery.data?.data || [];
  const threadCounts = summaryQuery.data?.counts || { inbox: 0, sent: 0, unread: 0 };
  const classOptions = classQuery.data?.map((cls) => ({
    id: cls.id,
    name: cls.name,
    grade: cls.grade_level,
  })) || [];
  const gradeOptions =
    classOptions.length > 0
      ? Array.from(new Set(classOptions.map((cls) => cls.grade).filter(Boolean) as string[]))
      : [];

  const teacherOptions = teacherQuery.data || [];
  const parentOptions = parentQuery.data || [];

  const selectedThread = threadDetailQuery.data?.data?.thread;
  const participants = threadDetailQuery.data?.data?.participants || [];
  
  // Enrich messages with sender info from participants
  const rawMessages = messagesQuery.data?.pages.flatMap((page) => page.data) || [];
  
  console.log('👥 Participants:', participants.length, participants.map(p => ({ 
    user_id: p.user_id?.slice(0, 8), 
    name: p.users?.name 
  })));
  console.log('📨 Raw messages:', rawMessages.length, rawMessages.map(m => ({ 
    id: m.id?.slice(0, 8), 
    sender_id: m.sender_id?.slice(0, 8),
    body: m.body?.slice(0, 20)
  })));

  const messages = rawMessages.map((msg) => {
    const participant = participants.find((p) => p.user_id === msg.sender_id);
    console.log(`🔗 Enriching message ${msg.id?.slice(0, 8)}: sender_id=${msg.sender_id?.slice(0, 8)}, found participant:`, participant ? 'YES' : 'NO', participant?.users?.name);
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
  
  const hasMoreMessages = messagesQuery.hasNextPage;

  const composeLabels = {
    title:
      variant === 'admin'
        ? t('dashboard.messages.composeAdmin') || 'New message'
        : t('dashboard.messages.composeParent') || 'Contact teacher',
    subject: t('dashboard.messages.subject') || 'Subject',
    priority: t('dashboard.messages.priority') || 'Priority',
    recipientsTeachers: t('dashboard.messages.recipientsTeachers') || 'Teachers',
    recipientsParents: t('dashboard.messages.recipientsParents') || 'Parents',
    recipientsClasses: t('dashboard.messages.recipientsClasses') || 'Classes',
    recipientsGrades: t('dashboard.messages.recipientsGrades') || 'Grades',
    message: t('dashboard.messages.message') || 'Message',
    cancel: t('dashboard.messages.cancel') || 'Cancel',
    send: t('dashboard.messages.send') || 'Send',
    attachments: t('dashboard.messages.attachments') || 'Add attachments',
    emptyTeachers: t('dashboard.messages.emptyTeachers') || 'No teachers available',
    emptyParents: t('dashboard.messages.emptyParents') || 'No parents found',
    emptyClasses: t('dashboard.messages.emptyClasses') || 'No classes available',
    emptyGrades: t('dashboard.messages.emptyGrades') || 'No grades available',
    errorNoRecipients: t('dashboard.messages.errorNoRecipients') || 'Select at least one recipient',
  };

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t('dashboard.messages.selectSchool') || 'Select a school to view messages.'}
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-full max-w-md border-r border-gray-200">
        <ThreadList
          threads={threadList}
          totalCount={threadCounts.inbox}
          unreadCount={threadCounts.unread}
          selectedThreadId={selectedThreadId}
          onSelectThread={handleThreadSelect}
          searchValue={search}
          onSearchChange={setSearch}
          loading={summaryQuery.isLoading}
          onCompose={() => setComposeOpen(true)}
          variant={variant}
          showFilters={variant === 'admin'}
          classOptions={classOptions}
          gradeOptions={gradeOptions}
          selectedClassId={classFilter}
          selectedGrade={gradeFilter}
          onClassFilterChange={setClassFilter}
          onGradeFilterChange={setGradeFilter}
          emptyTitle={t('dashboard.messages.emptyTitle') || 'No conversations'}
          emptyDescription={t('dashboard.messages.emptyDescription') || 'Start a new message.'}
          composeLabel={t('dashboard.messages.compose') || 'New'}
          searchPlaceholder={t('dashboard.messages.searchPlaceholder') || 'Search messages'}
          filterLabelClass={t('dashboard.messages.filters.class') || 'Class'}
          filterLabelGrade={t('dashboard.messages.filters.grade') || 'Grade'}
          allClassesLabel={t('dashboard.messages.filters.allClasses') || 'All classes'}
          allGradesLabel={t('dashboard.messages.filters.allGrades') || 'All grades'}
          noPreviewLabel={t('dashboard.messages.noPreview') || 'No message preview yet'}
          conversationsLabel={t('dashboard.messages.conversationsLabel') || 'Messages'}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ThreadPane
          thread={selectedThread || threadList.find((thread) => thread.thread.id === selectedThreadId)?.thread}
          participants={participants}
          messages={messages}
          loading={messagesQuery.isFetching}
          hasMore={hasMoreMessages}
          onLoadMore={() => messagesQuery.fetchNextPage()}
          composer={
            <ChatComposer
              threadId={selectedThreadId}
              schoolId={schoolId}
              userAuthId={userAuthId}
              disabled={!selectedThreadId}
              onMessageSent={handleMessageSent}
              onError={(message) => showToast(message, 'error')}
              onSuccess={(message) => showToast(message, 'success')}
              placeholder={t('dashboard.messages.replyPlaceholder') || 'Write a reply...'}
              sendLabel={t('dashboard.messages.send') || 'Send'}
              sendingLabel={t('dashboard.messages.sending') || 'Sending'}
            />
          }
          currentUserId={userDbId}
          variant={variant}
          emptyTitle={t('dashboard.messages.noThreadTitle') || 'No thread selected'}
          emptyDescription={t('dashboard.messages.noThreadDescription') || 'Select a conversation to begin.'}
          targetMessageId={targetMessageId}
          loadMoreLabel={t('dashboard.messages.loadPrevious') || 'Load previous messages'}
          loadingLabel={t('dashboard.messages.loading') || 'Loading messages...'}
          youLabel={t('dashboard.messages.you') || 'You'}
        />
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        variant={variant}
        schoolId={schoolId}
        userAuthId={userAuthId}
        teacherOptions={teacherOptions}
        parentOptions={parentOptions}
        classOptions={classOptions}
        gradeOptions={gradeOptions}
        onThreadCreated={handleThreadCreated}
        labels={composeLabels}
        priorities={['Normal', 'High', 'N/A']}
        onError={(message) => showToast(message, 'error')}
        onSuccess={(message) => showToast(message, 'success')}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

