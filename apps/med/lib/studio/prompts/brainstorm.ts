import type { CourseIntakeForm, CourseTemplateDefinition } from '@/lib/studio/types'
import { clampModuleCount, templateStageLabel } from '@/lib/studio/template-utils'

function scenarioTypesForTemplate(
  template: CourseTemplateDefinition,
  intake: CourseIntakeForm,
): string[] {
  if (template.id === 'professional_communication') {
    return [
      `${intake.profession} workplace scenarios`,
      `${intake.industry} settings`,
      'client and colleague interactions',
      'professional meetings and handovers',
    ]
  }
  return template.promptRules.scenarioTypes
}

function styleExamples(templateId: string): string {
  switch (templateId) {
    case 'organisational_training':
      return [
        '- "Before you start the shift, complete the safety checklist in the order shown."',
        '- "If you are unsure about a policy step, escalate to your supervisor — do not improvise."',
      ].join('\n')
    case 'student_english':
      return [
        '- "Hey, are you free to study together after class?"',
        '- "I\'m not sure I understood — could you explain that again?"',
      ].join('\n')
    default:
      return [
        '- "I\'ll update the care team and call you back within the hour."',
        '- "Could you walk me through what happened before I arrived?"',
      ].join('\n')
  }
}

export function buildBrainstormPrompt(
  intake: CourseIntakeForm,
  template: CourseTemplateDefinition,
): { system: string; prompt: string; hasImages: boolean } {
  const subtopic = intake.subtopic?.trim() || 'None'
  const additionalContext = intake.additionalContext?.trim() || 'None'
  const moduleCount = clampModuleCount(intake.numModules, template)
  const scenarioTypes = scenarioTypesForTemplate(template, intake)
  const lessonStages = template.lessons
    .map((lesson) => `L${lesson.lessonIndex} ${templateStageLabel(lesson.stage)}`)
    .join(', ')

  const scriptRules = template.id === 'organisational_training'
    ? '- Do not include videoScript or audioScript on any lesson.'
    : [
        `- Video scripts: only on lessons ${[1, 4, 6].join(', ')}. Length: ${template.promptRules.videoScriptLength}`,
        `- Audio scripts: only on lessons ${[1, 3].join(', ')}. Length: ${template.promptRules.audioScriptLength}`,
        '- Do not include videoScript or audioScript on any other lessons.',
      ].join('\n')

  const system = `You are an expert instructional designer creating a course synopsis (titles, objectives, key phrases, and scripts only — NOT step content).

Template: ${template.name}
Tone: ${template.promptRules.tone}
Vocabulary level: ${template.promptRules.vocabLevel}
Forbidden content: ${template.promptRules.forbiddenContent.join('; ')}

You must follow the template rules exactly. Do not invent lesson structures or step types.`

  const prompt = `Create a course synopsis for:

Course details:
- Profession / audience: ${intake.profession}
- Industry / context: ${intake.industry}
- Topic: ${intake.topic}
- Sub-topic: ${subtopic}
- Learner age group: ${intake.targetAgeGroup}
- Level: ${intake.learnerLevel}
- Language: ${intake.language}
- Modules: exactly ${moduleCount} (allowed range ${template.moduleRange.min}-${template.moduleRange.max})
- Estimated minutes per lesson: ${intake.estimatedMinutesPerLesson}
- Additional context: ${additionalContext}

Template ID (fixed): ${template.id}
Scenario types to use: ${scenarioTypes.join('; ')}
Module arc: ${template.promptRules.moduleArc}

Lesson stages in order (8 lessons per module): ${lessonStages}
Map each lesson's stage field to: L1-L2 heads_up, L3-L5 heads_down, L6-L7 heads_together, L8 assessment.

Structure rules:
- Exactly ${moduleCount} modules; each module has exactly 8 lessons.
- Modules build progressively — no repeated scenario across modules.
- Each lesson objective must use this format: "By the end of this lesson, the learner will be able to [specific observable action]."
- Every lesson must include exactly 5 keyPhrases.
- Key phrases must match the template tone and scenario types — not textbook examples.

${scriptRules}

Style examples for this template:
${styleExamples(template.id)}

Output valid JSON matching the CourseSynopsis schema.
Set templateId to "${template.id}" and totalModules to ${moduleCount}.`

  const referenceUrls = intake.referenceImageUrls?.filter(Boolean) ?? []
  const hasImages = referenceUrls.length > 0
  let finalPrompt = prompt

  if (hasImages) {
    finalPrompt += `

Reference materials uploaded (${referenceUrls.length} file(s)):
Analyze ALL uploaded reference materials carefully before generating the synopsis.
- Extract key vocabulary, grammar patterns, topics, and examples directly from the materials
- Course content MUST align with what is shown in the uploaded materials — not generic examples
- Use the exact terminology, difficulty level, and scenarios visible in the materials
- If a textbook page is uploaded: align module topics and key phrases to that curriculum
- If a training manual is uploaded: use the actual procedures and language from the document
- If multiple files: synthesize all into a coherent course structure`
  }

  return { system, prompt: finalPrompt, hasImages }
}
