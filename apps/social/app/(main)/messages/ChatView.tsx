'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export type ChatMessageVM = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  is_deleted: boolean;
  created_at: string;
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
};

interface Props {
  initialMessages: ChatMessageVM[];
  conversationId: string;
  myProfileId: string;
  conversationTitle: string;
  conversationAvatarUrl: string | null;
  isGroup: boolean;
}

function mapRowToVm(
  row: Record<string, unknown>,
  sender: ChatMessageVM['sender'],
): ChatMessageVM {
  return {
    id: row.id as string,
    conversation_id: row.conversation_id as string,
    sender_id: row.sender_id as string,
    content: (row.content as string | null) ?? null,
    message_type: (row.message_type as string) ?? 'text',
    is_deleted: !!(row.is_deleted as boolean),
    created_at: row.created_at as string,
    sender,
  };
}

function bubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function ChatView({
  initialMessages,
  conversationId,
  myProfileId,
  conversationTitle,
  conversationAvatarUrl,
  isGroup,
}: Props) {
  const [messages, setMessages] = useState<ChatMessageVM[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          const sid = newMsg.sender_id as string;
          const { data: senderRow } = await supabase
            .from('social_profiles')
            .select('id, display_name, avatar_url, username')
            .eq('id', sid)
            .single();
          const sender = senderRow
            ? {
                id: senderRow.id as string,
                display_name: senderRow.display_name as string | null,
                avatar_url: senderRow.avatar_url as string | null,
                username: senderRow.username as string,
              }
            : null;
          const vm = mapRowToVm(newMsg, sender);
          setMessages((prev) => {
            if (prev.some((m) => m.id === vm.id)) return prev;
            return [...prev, vm];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('social_messages').insert({
      conversation_id: conversationId,
      sender_id: myProfileId,
      content: text,
      message_type: 'text',
    });
    setSending(false);
    if (!error) setInput('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex-shrink-0 flex items-center gap-3 px-3 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
        <Link
          href="/messages"
          className="md:hidden p-2 -ml-2 text-text-secondary hover:text-primary"
          aria-label="Quay lại danh sách"
        >
          ←
        </Link>
        <Avatar src={conversationAvatarUrl} name={conversationTitle} size="sm" />
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-text-primary truncate">{conversationTitle}</h1>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-0">
        {messages.map((m) => {
          const own = m.sender_id === myProfileId;
          const showName = isGroup && !own && m.sender;
          return (
            <div key={m.id} className={cn('flex flex-col', own ? 'items-end' : 'items-start')}>
              {showName && (
                <span className="text-xs text-text-secondary mb-0.5 px-1">
                  {m.sender?.display_name || m.sender?.username}
                </span>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  own ? 'bg-primary text-white rounded-br-md' : 'bg-surface text-text-primary rounded-bl-md',
                )}
              >
                {m.is_deleted ? (
                  <p className="italic opacity-80">Tin nhắn đã bị xóa</p>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{m.content ?? ''}</p>
                )}
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    own ? 'text-white/80' : 'text-text-secondary',
                  )}
                >
                  {bubbleTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <footer className="flex-shrink-0 flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nhập tin nhắn…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Nội dung tin nhắn"
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={!input.trim() || sending}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Gửi
        </button>
      </footer>
    </div>
  );
}
