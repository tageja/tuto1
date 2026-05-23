'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useLang } from '@/contexts/LanguageContext'
import { extractCourseSynopsis, removeJsonObject } from '@/lib/studio/synopsis-json'
import type { CourseIntakeForm, CourseSynopsis } from '@/lib/studio/types'

interface RefinementChatProps {
  draftId: string | null
  currentSynopsis: CourseSynopsis
  intakeForm: CourseIntakeForm
  onSynopsisUpdate: (synopsis: CourseSynopsis) => void
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function RefinementChat({
  draftId,
  currentSynopsis,
  intakeForm,
  onSynopsisUpdate,
}: RefinementChatProps) {
  const { t } = useLang()
  const [input, setInput] = useState('')
  const lastAppliedTextRef = useRef('')

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/studio/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            draftId,
            currentSynopsis,
            intakeForm,
            messages: messages.map((message) => ({
              role: message.role,
              content: getMessageText(message),
            })),
          },
        }),
      }),
    [currentSynopsis, draftId, intakeForm],
  )

  const { messages, sendMessage, status, error } = useChat({ transport })
  const isResponding = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')
    if (!lastAssistantMessage) return

    const text = getMessageText(lastAssistantMessage)
    if (!text || text === lastAppliedTextRef.current) return

    const updatedSynopsis = extractCourseSynopsis(text)
    if (!updatedSynopsis) return

    lastAppliedTextRef.current = text
    onSynopsisUpdate(updatedSynopsis)
  }, [messages, onSynopsisUpdate])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || isResponding) return

    setInput('')
    await sendMessage({ text: trimmedInput })
  }

  return (
    <section className="card h-full min-h-[520px] flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">
          {t.studioRefineChatEyebrow}
        </p>
        <h2 className="mt-1">{t.studioRefineChatTitle}</h2>
        <p className="text-sm text-text-muted mt-2">{t.studioRefineChatDesc}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-text-muted">
            {t.studioRefineChatEmpty}
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} fallback={t.studioRefineUpdatingSynopsis} />
        ))}

        {isResponding && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-surface border border-border px-4 py-3 text-sm text-text-muted">
              <span className="inline-flex gap-1 items-center">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:120ms]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:240ms]" />
                <span className="ml-2">{t.studioRefineTyping}</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-error/30 bg-red-50 p-3 text-sm text-error">
            {t.studioRefineError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-bg">
        <label className="label" htmlFor="refinement-chat-input">
          {t.studioRefineChatInputLabel}
        </label>
        <div className="flex gap-2">
          <textarea
            id="refinement-chat-input"
            className="input min-h-12 max-h-32 resize-y"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.studioRefineChatPlaceholder}
            disabled={isResponding}
          />
          <button
            type="submit"
            className="btn-primary self-end"
            disabled={!input.trim() || isResponding}
            aria-label={t.studioRefineSend}
          >
            <Send size={16} />
            {t.studioRefineSend}
          </button>
        </div>
      </form>
    </section>
  )
}

function MessageBubble({ message, fallback }: { message: UIMessage; fallback: string }) {
  const rawText = getMessageText(message)
  const visibleText = message.role === 'assistant' ? removeJsonObject(rawText) || fallback : rawText
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
          isUser
            ? 'rounded-br-sm bg-primary text-white'
            : 'rounded-bl-sm bg-surface border border-border text-text'
        }`}
      >
        {visibleText}
      </div>
    </div>
  )
}
