import type { CourseTemplateDefinition } from '@/lib/studio/types'

export const organisationalTraining: CourseTemplateDefinition = {
  id: 'organisational_training',
  version: 2,
  name: 'Organisational Training',
  description: 'Company training, compliance, and soft skills',
  moduleRange: { min: 4, max: 6 },
  promptRules: {
    tone:
      'Clear, authoritative, professional. Brief sentences. Use active voice. Write like a compliance document made readable.',
    vocabLevel:
      'Plain English. No jargon unless the industry term is unavoidable — then define it.',
    scenarioTypes: [
      'workplace policy',
      'process compliance',
      'team procedures',
      'onboarding scenarios',
    ],
    moduleArc:
      'M1: Why this matters (context and stakes). M2-4: Core knowledge (policies, processes). M5-6: Scenario application. M7+: Competency assessment.',
    quizDistractorRule:
      'Distractors must be common misconceptions or process shortcuts employees actually take — not obviously wrong.',
    audioScriptLength: 'N/A — no audio steps in this template.',
    videoScriptLength: 'N/A — no video steps in this template.',
    clozeRule:
      'One blank per sentence. The answer must be the correct policy/process term for that context.',
    spotTheMistakeRule:
      'Mistakes must be real policy violations or process errors that would have actual consequences.',
    forbiddenContent: [
      'Personal opinions',
      'Political content',
      'Non-workplace scenarios',
      'Audio/video steps',
    ],
  },
  lessons: [
    {
      lessonIndex: 1,
      stage: 'intro',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'flash_card',
            'quick_response',
            'cloze',
            'odd_one_out',
            'spot_the_mistake',
            'matching',
          ],
        },
      ],
    },
    {
      lessonIndex: 2,
      stage: 'practice',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'flash_card',
            'cloze',
            'quick_response',
            'spot_the_mistake',
            'drag_order',
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
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 6,
          options: [
            'flash_card',
            'cloze',
            'quick_response',
            'spot_the_mistake',
            'drag_order',
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
        { kind: 'fixed', type: 'drag_order' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'flash_card',
            'cloze',
            'spot_the_mistake',
            'quick_response',
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
        { kind: 'fixed', type: 'drag_order' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'flash_card',
            'cloze',
            'spot_the_mistake',
            'quick_response',
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
        { kind: 'fixed', type: 'quick_response' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'cloze',
            'spot_the_mistake',
            'drag_order',
            'matching',
            'odd_one_out',
            'flash_card',
          ],
        },
      ],
    },
    {
      lessonIndex: 7,
      stage: 'complex',
      slots: [
        { kind: 'fixed', type: 'scenario_intro' },
        { kind: 'fixed', type: 'quick_response' },
        { kind: 'fixed', type: 'quiz' },
        {
          kind: 'pool',
          pick: 5,
          options: [
            'cloze',
            'spot_the_mistake',
            'drag_order',
            'matching',
            'odd_one_out',
            'flash_card',
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
        { kind: 'fixed', type: 'quiz' },
        { kind: 'fixed', type: 'spot_the_mistake' },
        { kind: 'fixed', type: 'spot_the_mistake' },
        { kind: 'fixed', type: 'drag_order' },
        { kind: 'fixed', type: 'self_reflection' },
      ],
    },
  ],
}
