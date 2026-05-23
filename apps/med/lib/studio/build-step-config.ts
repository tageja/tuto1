import type { StepType } from '@/lib/supabase'
import type { LessonSynopsis, ModuleSynopsis, TemplateStep } from '@/lib/studio/types'

type JsonRecord = Record<string, unknown>

export interface LessonGenerationContext {
  module: ModuleSynopsis
  lesson: LessonSynopsis
  profession: string
  industry: string
  level: string
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {}
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function asStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean)
    : fallback
}

function asArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? value as T[] : fallback
}

function lineObjectsFromScript(script: string) {
  return script
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line, index) => {
      const [maybeSpeaker, ...rest] = line.split(':')
      const hasSpeaker = rest.length > 0
      return {
        speaker: hasSpeaker ? maybeSpeaker.trim() || `Speaker ${index + 1}` : `Speaker ${index + 1}`,
        text_en: hasSpeaker ? rest.join(':').trim() : line,
        text_vi: '',
      }
    })
}

function numberedLinesFromScript(script: string) {
  const lines = lineObjectsFromScript(script)
  return Object.fromEntries(
    lines.flatMap((line, index) => [
      [`line_${index + 1}_en`, line.text_en],
      [`line_${index + 1}_vi`, line.text_vi],
    ]),
  )
}

function fallbackCards(phrases: string[]) {
  return phrases.slice(0, 5).map((phrase) => ({
    front_en: phrase,
    front_vi: '',
    back_en: phrase,
    back_vi: '',
  }))
}

function fallbackPairs(phrases: string[]) {
  return phrases.map((phrase) => ({ en: phrase, vi: '' }))
}

function fallbackTranscriptSegments(transcript: string) {
  return transcript
    .split(/[.!?\n]+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      start: index * 3,
      end: index * 3 + 3,
      text,
    }))
}

function defaultRubric(phrases: string[]) {
  return {
    clear: true,
    polite: true,
    complete: true,
    keywords: phrases.slice(0, 5),
  }
}

export function buildStepConfig(
  templateStep: TemplateStep,
  aiContent: JsonRecord,
  lessonContext: LessonGenerationContext,
): JsonRecord {
  const { lesson, module } = lessonContext
  const keyPhrases = lesson.keyPhrases ?? []
  const content = asRecord(aiContent)
  const type = templateStep.type as StepType

  switch (type) {
    case 'scenario_intro':
      return {
        title_en: asString(content.title_en, lesson.title),
        title_vi: asString(content.title_vi),
        body_en: asString(content.body_en, lesson.scenarioContext),
        body_vi: asString(content.body_vi),
        imageUrl: asString(content.imageUrl),
      }
    case 'flash_card':
      return {
        cards: asArray(content.cards, fallbackCards(keyPhrases)),
      }
    case 'audio_shadow': {
      const transcriptEn = asString(content.transcript_en, lesson.audioScript ?? keyPhrases.join('\n'))
      return {
        audioUrl: asString(content.audioUrl),
        transcript_en: transcriptEn,
        transcript_vi: asString(content.transcript_vi),
        transcriptSegments: asArray(content.transcriptSegments, fallbackTranscriptSegments(transcriptEn)),
      }
    }
    case 'video':
      return {
        videoUrl: asString(content.videoUrl),
        audioUrl: asString(content.audioUrl),
        subtitleUrl: asString(content.subtitleUrl),
        subtitle_vtt_vi: asString(content.subtitle_vtt_vi),
        key_phrases: asStringArray(content.key_phrases, keyPhrases),
        script: asString(content.script, lesson.videoScript ?? ''),
        ...numberedLinesFromScript(asString(content.script, lesson.videoScript ?? keyPhrases.join('\n'))),
        ...content,
      }
    case 'script_read': {
      const rawScriptLines = asArray<Record<string, unknown>>(
        content.lines,
        lineObjectsFromScript(lesson.audioScript ?? lesson.videoScript ?? keyPhrases.join('\n')),
      )
      // Normalise to {role, text, text_vi} — AI may use {speaker, text_en} or correct {role, text}
      const normalisedLines = rawScriptLines.map((l) => ({
        role: asString((l.role ?? l.speaker) as unknown, 'nurse').toLowerCase().replace(/[\s_]+/g, '_'),
        text: asString((l.text ?? l.text_en) as unknown, ''),
        text_vi: asString(l.text_vi as unknown, ''),
      }))
      return { lines: normalisedLines }
    }
    case 'quick_response':
      return {
        prompt_en: asString(content.prompt_en, lesson.scenarioContext),
        prompt_vi: asString(content.prompt_vi),
        options: asArray(content.options, [
          { rating: 'best', text_en: keyPhrases[0] ?? 'I can help with that.', text_vi: '', feedback_en: 'Clear and professional.', feedback_vi: '' },
          { rating: 'acceptable', text_en: keyPhrases[1] ?? 'Please wait.', text_vi: '', feedback_en: 'Acceptable but could be clearer.', feedback_vi: '' },
          { rating: 'poor', text_en: keyPhrases[2] ?? 'Not sure.', text_vi: '', feedback_en: 'Too vague for this situation.', feedback_vi: '' },
          { rating: 'incorrect', text_en: keyPhrases[3] ?? 'No.', text_vi: '', feedback_en: 'Not appropriate for the scenario.', feedback_vi: '' },
        ]),
      }
    case 'quiz': {
      const fallbackQuizQuestion = {
        id: 'q1',
        type: 'mcq',
        answer: 'a',
        options: keyPhrases.slice(0, 4).map((phrase, index) => ({
          id: String.fromCharCode(97 + index),
          text: phrase,
          text_vi: '',
        })),
        prompt_en: `Which phrase best applies to: ${lesson.scenarioContext}`,
        prompt_vi: '',
        explanation_en: 'Choose the most practical professional phrase.',
        explanation_vi: '',
      }
      const rawQuestions = asArray<Record<string, unknown>>(content.questions, [fallbackQuizQuestion])
      const sanitisedQuestions = rawQuestions.map((q, qi) => {
        const prompt = asString(q.prompt_en ?? q.question_en, fallbackQuizQuestion.prompt_en)
        const options = asArray<unknown>(q.options, fallbackQuizQuestion.options)
        const safeOptions = options.length >= 2 ? options : fallbackQuizQuestion.options
        return { ...q, id: q.id ?? `q${qi + 1}`, prompt_en: prompt, prompt_vi: q.prompt_vi ?? '', options: safeOptions }
      })
      return { questions: sanitisedQuestions.length ? sanitisedQuestions : [fallbackQuizQuestion] }
    }
    case 'spot_the_mistake': {
      const fallbackStmQuestion = {
        id: 'stm1',
        sentence_en: keyPhrases[0] ?? 'I need you to wait there.',
        sentence_vi: '',
        tokens: (() => {
          const words = (keyPhrases[0] ?? 'I need you to wait there').split(' ')
          return words.map((text, i) => ({ text, is_wrong: i === words.length - 1 }))
        })(),
        correction_en: keyPhrases[1] ?? 'Please wait here.',
        correction_vi: '',
        explanation_en: 'Use clear, polite professional wording.',
        explanation_vi: '',
      }
      const rawStmQuestions = asArray<Record<string, unknown>>(content.questions, [fallbackStmQuestion])
      const sanitisedStm = rawStmQuestions.map((q, qi) => {
        const tokens = asArray<Record<string, unknown>>(q.tokens, fallbackStmQuestion.tokens)
        const hasWrong = tokens.some((t) => t.is_wrong === true)
        const safeTokens = hasWrong ? tokens : tokens.map((t, i) => ({ ...t, is_wrong: i === tokens.length - 1 }))
        return { ...q, id: q.id ?? `stm${qi + 1}`, tokens: safeTokens }
      })
      return { questions: sanitisedStm.length ? sanitisedStm : [fallbackStmQuestion] }
    }
    case 'cloze':
      return {
        clozeText: asString(content.clozeText, `[${keyPhrases[0] ?? 'Please'}] continue.`),
        decoyPool: asStringArray(content.decoyPool, keyPhrases),
        instructions_en: asString(content.instructions_en, 'Choose the correct phrase to complete the sentence.'),
        instructions_vi: asString(content.instructions_vi),
        wordBank: true,
      }
    case 'drag_order': {
      const items = asArray<{ id: string; text: string }>(content.items, keyPhrases.slice(0, 5).map((phrase, index) => ({
        id: `item-${index + 1}`,
        text: phrase,
      })))
      return {
        items,
        lines: asArray(content.lines, items.map((item) => item.text)),
        correct_order: asArray(content.correct_order, items.map((item) => item.id)),
        instructions_en: asString(content.instructions_en, 'Put the conversation in the best order.'),
        instructions_vi: asString(content.instructions_vi),
      }
    }
    case 'matching':
      return {
        pairs: asArray(content.pairs, fallbackPairs(keyPhrases)),
      }
    case 'recording_submit':
      return {
        _instructions: asString(content._instructions, `Record your response for this situation: ${lesson.scenarioContext}`),
        rubric: asRecord(content.rubric) && Object.keys(asRecord(content.rubric)).length
          ? asRecord(content.rubric)
          : defaultRubric(keyPhrases),
      }
    case 'self_reflection':
      return {
        prompts: asArray(content.prompts, [
          { key: 'confidence', type: 'slider', label_en: 'I feel confident using these phrases.', label_vi: '' },
          { key: 'clarity', type: 'slider', label_en: 'I can communicate clearly in this situation.', label_vi: '' },
          { key: 'politeness', type: 'slider', label_en: 'I can sound polite and professional.', label_vi: '' },
          { key: 'readiness', type: 'slider', label_en: 'I am ready to try this at work.', label_vi: '' },
          { key: 'notes', type: 'text', label_en: 'What will you practice next?', label_vi: '' },
        ]),
      }
    case 'no_script':
      return {
        cues: asStringArray(content.cues, keyPhrases.slice(0, 3)),
        context_en: asString(content.context_en, lesson.scenarioContext),
        context_vi: asString(content.context_vi),
        reference_script: asString(content.reference_script, lesson.audioScript ?? ''),
      }
    case 'mission':
      return {
        missionEn: asString(content.missionEn, `Use one phrase from ${module.title} in a real or simulated work conversation.`),
        missionVi: asString(content.missionVi),
        mission_en: asString(content.mission_en, asString(content.missionEn)),
        mission_vi: asString(content.mission_vi, asString(content.missionVi)),
      }
    case 'sentence_builder': {
      const correctSentence = asString(content.correct_sentence, keyPhrases[0] ?? lesson.title)
      return {
        words: asStringArray(content.words, correctSentence.split(' ')),
        correct_sentence: correctSentence,
        prompt_en: asString(content.prompt_en, 'Build the correct professional sentence.'),
        prompt_vi: asString(content.prompt_vi),
        chunks: asStringArray(content.chunks, correctSentence.split(' ')),
        correct_order: asArray(content.correct_order, correctSentence.split(' ').map((_, index) => index)),
      }
    }
    case 'odd_one_out':
      return {
        groups: asArray(content.groups, [
          {
            words: keyPhrases.slice(0, 4),
            odd_one_out: keyPhrases[3] ?? '',
          },
        ]),
      }
    default:
      return content
  }
}
