import type {
  CourseIntakeForm,
  CourseSynopsis,
  CourseTemplateDefinition,
  LessonSynopsis,
  ModuleSynopsis,
  ResolvedLesson,
  TemplateStep,
} from '@/lib/studio/types'

function styleExamples(templateId: string): string {
  switch (templateId) {
    case 'organisational_training':
      return [
        'Example phrases:',
        '- "Report the incident to your line manager within one hour."',
        '- "The correct sequence is identify, isolate, notify, document."',
        '- "Personal protective equipment must be worn before entering the area."',
      ].join('\n')
    case 'student_english':
      return [
        'Example phrases:',
        '- "I\'m running late — can we reschedule for tomorrow?"',
        '- "That word sounds similar, but it means something different here."',
        '- "Let me double-check the grammar before I send this message."',
      ].join('\n')
    default:
      return [
        'Example phrases:',
        '- "I\'ll take ownership of this and update you by end of shift."',
        '- "To make sure I understand, you need X by Y — is that correct?"',
        '- "Thank you for your patience while we resolve this."',
      ].join('\n')
  }
}

export function buildLessonFillPrompt({
  intakeForm,
  synopsis,
  module,
  lesson,
  templateSteps,
  template,
  resolvedLesson,
}: {
  intakeForm: CourseIntakeForm
  synopsis: CourseSynopsis
  module: ModuleSynopsis
  lesson: LessonSynopsis
  templateSteps: TemplateStep[]
  template: CourseTemplateDefinition
  resolvedLesson: ResolvedLesson
}): string {
  const fields = templateSteps.map((step, index) => ({
    stepIndex: index + 1,
    type: step.type,
    fillFields: step.fillFields,
    hasVideoScript: step.hasVideoScript ?? false,
    hasAudioScript: step.hasAudioScript ?? false,
  }))

  const audioRule = template.promptRules.audioScriptLength.startsWith('N/A')
    ? '- Do not generate audio or video scripts.'
    : `- Audio scripts (audio_shadow): ${template.promptRules.audioScriptLength}`

  const videoRule = template.promptRules.videoScriptLength.startsWith('N/A')
    ? ''
    : `- Video scripts (video): ${template.promptRules.videoScriptLength}`

  return `Fill in content for this lesson. Return ONLY valid JSON. Do not add commentary. Do not deviate from the output schema.

Lesson context:
- Template: ${template.name}
- Module: "${module.title}" (Module ${module.orderIndex} of ${synopsis.totalModules})
- Lesson: "${lesson.title}" (${resolvedLesson.stage} / ${lesson.stage})
- Objective: ${lesson.objective}
- Key phrases: ${lesson.keyPhrases.join(', ')}
- Scenario context: ${lesson.scenarioContext}
- Profession: ${intakeForm.profession}, Industry: ${intakeForm.industry}, Level: ${synopsis.level}

Resolved step types for this lesson (exactly 8, in order):
${resolvedLesson.steps.join(' → ')}

Template content rules:
- Tone: ${template.promptRules.tone}
- Vocabulary: ${template.promptRules.vocabLevel}
- Quiz distractors: ${template.promptRules.quizDistractorRule}
- Cloze: ${template.promptRules.clozeRule}
- Spot the mistake: ${template.promptRules.spotTheMistakeRule}
- Never include: ${template.promptRules.forbiddenContent.join('; ')}
${audioRule}
${videoRule}

${styleExamples(template.id)}

Fill these steps:
${JSON.stringify(fields, null, 2)}

Step-specific rules:
- All text must match the template tone and scenario context
- For quiz: Return EXACTLY this shape — { "questions": [ { "id": "q1", "type": "mcq", "prompt_en": "non-empty question text here?", "prompt_vi": "", "options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}], "answer": "a", "explanation_en": "..." } ] }; MUST include prompt_en and EXACTLY 4 options
- For spot_the_mistake: Write a sentence with ONE deliberate professional English error; tokenize word-by-word and mark the wrong word with is_wrong: true. Return EXACTLY this shape — { "questions": [ { "id": "stm1", "sentence_en": "full sentence here", "tokens": [{"text":"word1","is_wrong":false},{"text":"WRONG_WORD","is_wrong":true},{"text":"word3","is_wrong":false}], "correction_en": "corrected sentence", "explanation_en": "why it was wrong" } ] }; MUST have is_wrong: true on at least one token
- For cloze: use [answer] bracket format; decoyPool includes plausible wrong answers
- For matching: use key phrases from this lesson only
- For recording_submit: realistic scenario in _instructions
- For self_reflection on L8: 4 sliders + 1 open text prompt

Return ONLY this JSON shape:
{
  "steps": [
    { "stepIndex": 1, "type": "scenario_intro", "content": { } }
  ]
}`
}
