'use client'

import SpeakerButton from './SpeakerButton'
import TranslatablePhrase from './TranslatablePhrase'

interface Props {
  text: string
  textVi?: string
  roleLabel: string
  isLeft: boolean          // nurse = left, patient/doctor = right
  audioUrl?: string
  delay?: number           // stagger entrance delay in ms
  accentColor?: string     // tailwind bg class for bubble
  index: number
  onAudioPlayed?: () => void
}

export default function ConversationBubble({
  text,
  textVi,
  roleLabel,
  isLeft,
  audioUrl,
  delay = 0,
  onAudioPlayed,
}: Props) {
  return (
    <div
      className={`flex items-end gap-2.5 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      style={{
        animationName: 'stepEnter',
        animationDuration: '0.4s',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Bubble */}
      <div
        className={`relative max-w-[78%] group ${isLeft ? '' : ''}`}
      >
        {/* Role label */}
        <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
          isLeft ? 'text-primary ml-1' : 'text-text-muted mr-1 text-right'
        }`}>
          {roleLabel}
        </p>

        {/* Bubble body */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isLeft
              ? 'bg-primary/10 text-primary-dark rounded-bl-sm border border-primary/15'
              : 'bg-gray-100 text-gray-800 rounded-br-sm border border-gray-200'
          }`}
        >
          {/* Tail */}
          <span
            className={`absolute bottom-2 w-2.5 h-2.5 ${
              isLeft
                ? '-left-1.5 bg-primary/10 border-l border-b border-primary/15 rotate-45'
                : '-right-1.5 bg-gray-100 border-r border-b border-gray-200 rotate-[-45deg]'
            }`}
          />

          {/* Text with optional translation */}
          {textVi ? (
            <TranslatablePhrase en={text} vi={textVi} />
          ) : (
            <span>{text}</span>
          )}

          {/* Audio button */}
          {audioUrl && (
            <div className={`mt-2 flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
              <SpeakerButton
                audioUrl={audioUrl}
                size={13}
                className="opacity-60 group-hover:opacity-100"
                onPlay={onAudioPlayed}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
