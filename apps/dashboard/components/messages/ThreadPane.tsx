'use client';

import { useEffect, useMemo } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import type { MessageAttachment, MessageRecord, ThreadEntity, ThreadParticipant } from '../../lib/types/messages';

type ThreadPaneProps = {
  thread?: ThreadEntity | null;
  participants?: ThreadParticipant[];
  messages: MessageRecord[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  composer?: React.ReactNode;
  currentUserId?: string | null;
  variant: 'admin' | 'parent';
  emptyTitle?: string;
  emptyDescription?: string;
  targetMessageId?: string | null;
  loadMoreLabel?: string;
  loadingLabel?: string;
  youLabel?: string;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export function ThreadPane({
  thread,
  participants = [],
  messages,
  loading,
  hasMore,
  onLoadMore,
  composer,
  currentUserId,
  variant,
  emptyTitle = 'Select a message',
  emptyDescription = 'Choose a conversation to start viewing messages.',
  targetMessageId,
  loadMoreLabel = 'Load previous messages',
  loadingLabel = 'Loading messages...',
  youLabel = 'You',
}: ThreadPaneProps) {
  console.log('🔍 ThreadPane debug:', { currentUserId, sampleMessage: messages[0] });
  useEffect(() => {
    if (!targetMessageId) return;
    const element = document.getElementById(`message-${targetMessageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-blue-400');
      const timeout = setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-400');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [targetMessageId, messages]);

  const groupedMessages = useMemo(() => {
    const groups: Record<string, MessageRecord[]> = {};
    messages.forEach((message) => {
      const dateKey = new Date(message.sent_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return Object.entries(groups).map(([day, dayMessages]) => ({
      day,
      dateLabel: formatDate(dayMessages[0].sent_at),
      items: dayMessages,
    }));
  }, [messages]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-center flex-col gap-2 text-gray-500">
        <p className="text-base font-semibold text-gray-700">{emptyTitle}</p>
        <p className="text-sm text-gray-500 max-w-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">{thread.subject}</p>
            <div className="text-sm text-gray-500">
              {thread.grade && <span className="mr-2">{thread.grade}</span>}
              {thread.class_id && <span className="mr-2">• #{thread.class_id.slice(0, 6)}</span>}
              <span>{messages.length} messages</span>
            </div>
          </div>
          <span className="text-xs uppercase font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {thread.priority}
          </span>
        </div>
        {participants.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {participants.map((participant) => (
              <span
                key={participant.user_id}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                {participant.users?.name || participant.users?.email || 'Participant'}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {hasMore && onLoadMore && (
          <div className="flex justify-center">
            <button
              onClick={onLoadMore}
              className="text-xs px-3 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
            >
              {loadMoreLabel}
            </button>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.day}>
            <div className="text-center mb-3">
              <span className="inline-block text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {group.dateLabel}
              </span>
            </div>
            <div className="space-y-4">
              {group.items.map((message) => {
                const isMine = message.sender_id === currentUserId;
                console.log('💬 Message:', { 
                  id: message.id.slice(0, 8), 
                  sender_id: message.sender_id?.slice(0, 8), 
                  currentUserId: currentUserId?.slice(0, 8), 
                  isMine,
                  senderName: message.sender?.name 
                });
                return (
                  <div
                    key={message.id}
                    id={`message-${message.id}`}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                        isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold">
                          {isMine ? youLabel : message.sender?.name || message.sender?.email || 'Unknown'}
                        </p>
                        <span className="text-[11px] opacity-80">{formatTime(message.sent_at)}</span>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed">{message.body}</p>
                      {message.attachments?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment: MessageAttachment, index) => (
                            <a
                              key={`${attachment.path || attachment.url}-${index}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 text-xs border rounded-lg px-3 py-2 transition-colors ${
                                isMine
                                  ? 'border-white/40 text-white hover:bg-white/10'
                                  : 'border-gray-200 text-gray-700 hover:bg-white'
                              }`}
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span className="truncate flex-1">{attachment.name}</span>
                              {attachment.size && (
                                <span className="opacity-70">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {loadingLabel}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white px-6 py-4">{composer}</div>
    </div>
  );
}

