import type { StepType } from '@/lib/supabase'
import type { TemplateStep } from '@/lib/studio/types'

const STEP_METADATA: Record<string, Omit<TemplateStep, 'type'>> = {
  scenario_intro: {
    fillFields: ['title_en', 'title_vi', 'body_en', 'body_vi'],
  },
  flash_card: {
    fillFields: ['cards[5]'],
  },
  audio_shadow: {
    fillFields: ['transcript_en', 'transcript_vi', 'transcriptSegments'],
    hasAudioScript: true,
  },
  video: {
    fillFields: ['key_phrases', 'line_1_en thru line_8_en', 'line_1_vi thru line_8_vi'],
    hasVideoScript: true,
  },
  script_read: {
    fillFields: ['lines[6]'],
  },
  quick_response: {
    fillFields: ['prompt_en', 'prompt_vi', 'options[4]'],
  },
  quiz: {
    fillFields: ['questions[3]'],
  },
  spot_the_mistake: {
    fillFields: ['questions[2]'],
  },
  cloze: {
    fillFields: ['clozeText', 'decoyPool[10]'],
  },
  drag_order: {
    fillFields: ['items[5]', 'correct_order'],
  },
  matching: {
    fillFields: ['pairs[6]'],
  },
  sentence_builder: {
    fillFields: ['words', 'correct_sentence', 'prompt_en', 'prompt_vi'],
  },
  odd_one_out: {
    fillFields: ['groups[2]'],
  },
  recording_submit: {
    fillFields: ['_instructions', 'rubric'],
  },
  free_speaking: {
    fillFields: ['_instructions', 'rubric', 'prompt_en', 'prompt_vi'],
  },
  self_reflection: {
    fillFields: ['prompts[4_sliders+1_text]'],
  },
  mission: {
    fillFields: ['missionEn', 'missionVi'],
  },
  no_script: {
    fillFields: ['cues[3]', 'context_en', 'context_vi'],
  },
}

/** DB check constraint has no `free_speaking`; store as recording_submit. */
export function normalizeStepType(stepType: string): StepType {
  if (stepType === 'free_speaking') return 'recording_submit'
  return stepType as StepType
}

export function toTemplateSteps(stepTypes: string[]): TemplateStep[] {
  return stepTypes.map((stepType) => {
    const metadata = STEP_METADATA[stepType] ?? { fillFields: ['content'] }
    return {
      type: normalizeStepType(stepType),
      fillFields: metadata.fillFields,
      hasVideoScript: metadata.hasVideoScript,
      hasAudioScript: metadata.hasAudioScript,
    }
  })
}
