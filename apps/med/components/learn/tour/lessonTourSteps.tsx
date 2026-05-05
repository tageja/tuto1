import type { Step } from 'react-joyride'
import type { T } from '@/lib/i18n/translations'
import type { StepType } from '@/lib/supabase'

/**
 * Builds lesson tour steps filtered by which step types exist in the current lesson.
 * Conditional steps (script_read, recording_submit, peer review) are only included
 * when the relevant step type is present — so the tour completes cleanly if absent.
 */
export function buildLessonTourSteps(t: T, presentStepTypes: StepType[]): Step[] {
  const steps: Step[] = [
    {
      target: '[data-tour-target="lesson-step-counter"]',
      placement: 'bottom',
      title: t.tourLessonStep1Title,
      content: t.tourLessonStep1Body,
      disableBeacon: true,
      disableScrolling: false,
    },
    {
      target: '[data-tour-target="lesson-next-button"]',
      placement: 'top',
      title: t.tourLessonStep2Title,
      content: t.tourLessonStep2Body,
      disableBeacon: true,
      disableScrolling: false,
    },
  ]

  if (presentStepTypes.includes('script_read')) {
    steps.push({
      target: '[data-tour-target="script-read-bubbles"]',
      placement: 'top',
      title: t.tourLessonStep3Title,
      content: t.tourLessonStep3Body,
      disableBeacon: true,
      disableScrolling: false,
    })
  }

  if (presentStepTypes.includes('recording_submit')) {
    steps.push({
      target: '[data-tour-target="recording-mic"]',
      placement: 'top',
      title: t.tourLessonStep4Title,
      content: t.tourLessonStep4Body,
      disableBeacon: true,
      disableScrolling: false,
    })
  }

  if (presentStepTypes.includes('script_read') || presentStepTypes.includes('recording_submit')) {
    steps.push({
      target: '[data-tour-target="peer-review-prompt"]',
      placement: 'top',
      title: t.tourLessonStep5Title,
      content: t.tourLessonStep5Body,
      disableBeacon: true,
      disableScrolling: false,
    })
  }

  return steps
}
