import React from 'react'
import type { Step } from 'react-joyride'
import type { T } from '@/lib/i18n/translations'

interface WelcomeStep1ContentProps {
  t: T
  introVideoUrl: string | null
}

function WelcomeStep1Content({ t, introVideoUrl }: WelcomeStep1ContentProps) {
  return (
    <div className="space-y-3 text-left">
      {introVideoUrl ? (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
          <video
            src={introVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={(e) => {
              const video = (e.currentTarget.parentElement as HTMLElement).querySelector('video')
              if (video) video.muted = !video.muted
              e.currentTarget.textContent = (e.currentTarget.textContent === '🔊') ? '🔇' : '🔊'
            }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
            aria-label="Toggle mute"
          >
            🔇
          </button>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center py-8">
          <span className="text-5xl">🏥</span>
        </div>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{t.tourWelcomeStep1Body}</p>
    </div>
  )
}

export function buildWelcomeTourSteps(
  t: T,
  introVideoUrl: string | null,
): Step[] {
  return [
    {
      target: 'body',
      placement: 'center',
      title: t.tourWelcomeStep1Title,
      content: <WelcomeStep1Content t={t} introVideoUrl={introVideoUrl} />,
      disableBeacon: true,
    },
    {
      target: '[data-tour-target="my-courses"]',
      placement: 'right',
      title: t.tourWelcomeStep2Title,
      content: t.tourWelcomeStep2Body,
      disableBeacon: true,
      disableScrolling: false,
    },
    {
      target: '[data-tour-target="practice-groups"]',
      placement: 'right',
      title: t.tourWelcomeStep3Title,
      content: t.tourWelcomeStep3Body,
      disableBeacon: true,
      disableScrolling: false,
    },
    {
      target: '[data-tour-target="rewards"]',
      placement: 'right',
      title: t.tourWelcomeStep4Title,
      content: t.tourWelcomeStep4Body,
      disableBeacon: true,
      disableScrolling: false,
    },
    {
      target: '[data-tour-target="feedback-button"]',
      placement: 'top',
      title: t.tourWelcomeStep5Title,
      content: t.tourWelcomeStep5Body,
      disableBeacon: true,
      disableScrolling: false,
    },
    {
      target: 'body',
      placement: 'center',
      title: t.tourWelcomeFinalTitle,
      content: (
        <div className="space-y-2 text-left">
          <p className="text-sm text-gray-600 leading-relaxed">{t.tourWelcomeFinalBody}</p>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            → {t.tourWelcomeFinalCta}
          </p>
        </div>
      ),
      disableBeacon: true,
    },
  ]
}
