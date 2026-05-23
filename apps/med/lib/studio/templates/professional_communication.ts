import type { CourseTemplateDefinition } from '@/lib/studio/types'

export const professionalCommunication: CourseTemplateDefinition = {
  id: 'professional_communication',
  version: 2,
  name: 'Professional Communication',
  description: 'Workplace English for adults in specific roles',
  moduleRange: { min: 9, max: 12 },
  promptRules: {
    tone:
      'Professional, clear, scenario-driven. Use real workplace language. Never use textbook examples.',
    vocabLevel: 'CEFR B1-B2. Avoid idioms unless they are standard workplace phrases.',
    scenarioTypes: [],
    moduleArc:
      'M1-2: Foundational greetings and role-specific vocabulary. M3-6: Core workplace scenarios (reporting, handovers, meetings, emails). M7-10: Complex situations (complaints, emergencies, negotiations). M11-12: Mastery and full-scenario simulations.',
    quizDistractorRule:
      'Distractors must be plausible workplace phrases a learner might actually say — not obviously wrong. Avoid absurd options.',
    audioScriptLength:
      '60-80 words. Use clear pronunciation. Include natural pauses marked with [pause].',
    videoScriptLength:
      '40-60 seconds of spoken content. Written as a natural monologue, not a script header.',
    clozeRule:
      'One blank per sentence. The answer word must be a key phrase introduced earlier in this lesson.',
    spotTheMistakeRule:
      'Errors must be communication mistakes or safety protocol violations — never grammar-only mistakes. The mistake must be something that would cause real harm or misunderstanding in the workplace.',
    forbiddenContent: [
      'Fictional characters',
      'Non-workplace scenarios',
      'Casual slang',
      'Political content',
    ],
  },
  lessons: [
    {
      lessonIndex: 1,
      stage: 'intro',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'audio_shadow' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 4,
          options: ['flash_card', 'cloze', 'quick_response', 'script_read', 'odd_one_out'],
        },
      ],
    },
    {
      lessonIndex: 2,
      stage: 'practice',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'cloze',
            'audio_shadow',
            'script_read',
            'quick_response',
            'matching',
            'odd_one_out',
          ],
        },
      ],
    },
    {
      lessonIndex: 3,
      stage: 'practice',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'cloze',
            'audio_shadow',
            'script_read',
            'quick_response',
            'matching',
            'odd_one_out',
          ],
        },
      ],
    },
    {
      lessonIndex: 4,
      stage: 'application',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'flash_card',
            'cloze',
            'script_read',
            'spot_the_mistake',
            'quick_response',
            'drag_order',
            'matching',
            'sentence_builder',
          ],
        },
      ],
    },
    {
      lessonIndex: 5,
      stage: 'application',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'flash_card',
            'cloze',
            'script_read',
            'spot_the_mistake',
            'quick_response',
            'drag_order',
            'matching',
            'sentence_builder',
          ],
        },
      ],
    },
    {
      lessonIndex: 6,
      stage: 'complex',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'recording_submit' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'cloze',
            'script_read',
            'quiz',
            'spot_the_mistake',
            'drag_order',
            'quick_response',
            'sentence_builder',
            'free_speaking',
          ],
        },
      ],
    },
    {
      lessonIndex: 7,
      stage: 'complex',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'recording_submit' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'cloze',
            'script_read',
            'quiz',
            'spot_the_mistake',
            'drag_order',
            'quick_response',
            'sentence_builder',
            'free_speaking',
          ],
        },
      ],
    },
    {
      lessonIndex: 8,
      stage: 'assessment',
      slots: [
        { kind: 'fixed', type: 'quiz' },
        { kind: 'fixed', type: 'quiz' },
        { kind: 'fixed', type: 'quiz' },
        { kind: 'fixed', type: 'spot_the_mistake' },
        { kind: 'fixed', type: 'cloze' },
        { kind: 'fixed', type: 'drag_order' },
        { kind: 'fixed', type: 'recording_submit' },
        { kind: 'fixed', type: 'self_reflection' },
      ],
    },
  ],
}
