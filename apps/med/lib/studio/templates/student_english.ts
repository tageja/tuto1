import type { CourseTemplateDefinition } from '@/lib/studio/types'

export const studentEnglish: CourseTemplateDefinition = {
  id: 'student_english',
  version: 2,
  name: 'Student English',
  description: 'English learning for university students (grammar, reading, listening)',
  moduleRange: { min: 6, max: 10 },
  promptRules: {
    tone:
      'Friendly, encouraging, conversational. Feels like a smart study app, not a textbook. Use relatable scenarios (social media, university, travel, pop culture).',
    vocabLevel:
      'CEFR A2-B2. Scale difficulty gradually across modules. L1-2 modules stay at A2-B1. Later modules reach B2.',
    scenarioTypes: [
      'university life',
      'social situations',
      'travel',
      'everyday conversations',
      'digital communication',
    ],
    moduleArc:
      'M1-2: Core vocabulary for the topic. M3-4: Grammar patterns in context. M5-6: Reading and listening comprehension. M7-8: Speaking and creative use. M9-10: Mixed fluency practice.',
    quizDistractorRule:
      'Distractors must be words/phrases a student at this level would genuinely confuse. Use common false friends and near-synonyms.',
    audioScriptLength:
      '50-70 words. Natural spoken rhythm. Include emotion cues like [excited] or [nervous] where relevant.',
    videoScriptLength:
      '35-50 seconds. Conversational, like a peer explaining something — not a formal lecture.',
    clozeRule:
      'One blank per sentence. Focus on grammar patterns or vocabulary from this lesson. Include hints in the decoy pool that are plausible but wrong.',
    spotTheMistakeRule:
      'Mistakes must be common learner errors for this CEFR level — grammar, vocabulary confusion, or false friends. Nothing too advanced.',
    forbiddenContent: ['Adult content', 'Political content', 'Violence', 'Workplace-specific jargon'],
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
          options: ['flash_card', 'cloze', 'quick_response', 'odd_one_out', 'matching'],
        },
      ],
    },
    {
      lessonIndex: 2,
      stage: 'practice',
      slots: [
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'audio_shadow' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'flash_card',
            'cloze',
            'cloze',
            'quick_response',
            'matching',
            'odd_one_out',
            'sentence_builder',
          ],
        },
      ],
    },
    {
      lessonIndex: 3,
      stage: 'practice',
      slots: [
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'audio_shadow' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'flash_card',
            'cloze',
            'cloze',
            'quick_response',
            'matching',
            'odd_one_out',
            'sentence_builder',
          ],
        },
      ],
    },
    {
      lessonIndex: 4,
      stage: 'application',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'audio_shadow' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 4,
          options: [
            'cloze',
            'script_read',
            'spot_the_mistake',
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
        { kind: 'fixed', type: 'flash_card' },
        { kind: 'fixed', type: 'audio_shadow' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 4,
          options: [
            'cloze',
            'script_read',
            'spot_the_mistake',
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
            'spot_the_mistake',
            'quiz',
            'drag_order',
            'matching',
            'sentence_builder',
            'odd_one_out',
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
            'spot_the_mistake',
            'quiz',
            'drag_order',
            'matching',
            'sentence_builder',
            'odd_one_out',
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
        { kind: 'fixed', type: 'cloze' },
        { kind: 'fixed', type: 'cloze' },
        { kind: 'fixed', type: 'drag_order' },
        { kind: 'fixed', type: 'spot_the_mistake' },
        { kind: 'fixed', type: 'self_reflection' },
      ],
    },
  ],
}
