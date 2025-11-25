'use client';

import { useState, useRef, useCallback } from 'react';
import { Paperclip, Send, Loader2, X } from 'lucide-react';
import { uploadMessageFiles } from '../../lib/supabase/storage';
import type { MessageAttachment, MessageRecord } from '../../lib/types/messages';

type ChatComposerProps = {
  threadId?: string | null;
  schoolId: string;
  userAuthId: string;
  disabled?: boolean;
  onMessageSent?: (message: MessageRecord) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  placeholder?: string;
  sendLabel?: string;
  sendingLabel?: string;
};

export function ChatComposer({
  threadId,
  schoolId,
  userAuthId,
  disabled,
  onMessageSent,
  onError,
  onSuccess,
  placeholder = 'Write a message...',
  sendLabel = 'Send',
  sendingLabel = 'Sending...',
}: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = Boolean(message.trim()) && !isSending && !disabled && !!threadId;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const uploadAttachments = useCallback(async (): Promise<MessageAttachment[]> => {
    if (!threadId || files.length === 0) return [];
    return uploadMessageFiles({ schoolId, threadId, files });
  }, [files, schoolId, threadId]);

  const sendMessage = async () => {
    if (!canSend || !threadId) return;
    setIsSending(true);

    try {
      const attachments = await uploadAttachments();
      const response = await fetch(`/api/school/messages/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          userAuthId,
          body: message.trim(),
          attachments,
          clientMessageId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const json = await response.json();
      onMessageSent?.(json.data);
      onSuccess?.('Message sent');
      setMessage('');
      setFiles([]);
    } catch (error: any) {
      console.error('ChatComposer send error', error);
      onError?.(error?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            >
              {file.name}
              <button
                onClick={() => removeFile(index)}
                className="p-0.5 rounded-full hover:bg-gray-200"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending || !threadId}
          className="p-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          aria-label="Add attachment"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || !threadId}
          rows={2}
          className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />

        <button
          onClick={sendMessage}
          disabled={!canSend}
          className="px-4 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {sendingLabel}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {sendLabel}
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}





