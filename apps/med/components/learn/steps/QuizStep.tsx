'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import type { NursedLessonStep, NursedQuizQuestion } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import AudioReplayBar from '@/components/learn/AudioReplayBar'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
}

const EXAMPLE_QUESTIONS: NursedQuizQuestion[] = [
  {
    id: 'ex1',
    lesson_id: '',
    step_id: null,
    type: 'mcq',
    prompt_en: 'What do you say when greeting a patient for the first time?',
    prompt_vi: 'Bạn nói gì khi chào hỏi bệnh nhân lần đầu tiên?',
    options: [
      { id: 'a', text: 'Hello, I\'m your nurse today. How can I help you?' },
      { id: 'b', text: 'What do you want?' },
      { id: 'c', text: 'Please wait outside.' },
      { id: 'd', text: 'Come in quickly.' },
    ],
    answer: 'a',
    audio_asset_id: null,
    explanation_en: 'A professional greeting shows respect and sets a positive tone.',
    explanation_vi: 'Lời chào chuyên nghiệp thể hiện sự tôn trọng và tạo không khí tích cực.',
    order_index: 0,
    created_at: '',
  },
  {
    id: 'ex2',
    lesson_id: '',
    step_id: null,
    type: 'mcq',
    prompt_en: 'A patient says they have chest pain. What is the FIRST thing you do?',
    prompt_vi: 'Bệnh nhân nói bị đau ngực. Điều ĐẦUTIÊN bạn làm là gì?',
    options: [
      { id: 'a', text: 'Tell them to rest.' },
      { id: 'b', text: 'Alert the doctor immediately and assess vital signs.' },
      { id: 'c', text: 'Give them water.' },
      { id: 'd', text: 'Ask them to fill a form.' },
    ],
    answer: 'b',
    audio_asset_id: null,
    explanation_en: 'Chest pain is a priority emergency — always escalate to the doctor immediately.',
    explanation_vi: 'Đau ngực là cấp cứu ưu tiên — luôn báo bác sĩ ngay lập tức.',
    order_index: 1,
    created_at: '',
  },
]

export default function QuizStep({ step, onComplete, contextAudio }: Props) {
  const { t } = useLang()
  const rawQ = step.config?.questions as NursedQuizQuestion[] | undefined
  const questions = rawQ && rawQ.length > 0 ? rawQ : EXAMPLE_QUESTIONS

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const allAnswered = questions.every((q) => selected[q.id] !== undefined)

  const handleCheck = () => {
    const res: Record<string, boolean> = {}
    questions.forEach((q) => {
      const correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer
      res[q.id] = selected[q.id] === correctAnswer
    })
    setResults(res)
    setChecked(true)
  }

  const handleReset = () => {
    setSelected({})
    setChecked(false)
    setResults({})
  }

  const score = Object.values(results).filter(Boolean).length
  const total = questions.length
  const pct = Math.round((score / total) * 100)
  const passed = pct >= 80

  return (
    <div className="space-y-6">
      {contextAudio?.url && (
        <AudioReplayBar
          audioUrl={contextAudio.url}
          transcript={contextAudio.transcript}
          label="Replay audio from previous step"
        />
      )}
      <div>
        <h3 className="text-base font-semibold text-text">🧠 {step.title ?? t.quizTitleFallback}</h3>
        <p className="text-sm text-text-muted mt-1">{t.quizSubtitle.replace('{n}', String(questions.length))}</p>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer
          return (
            <div key={q.id} className="card p-4 space-y-3">
              <p className="font-medium text-text text-sm">
                {qIdx + 1}. {q.prompt_vi ?? q.prompt_en}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isSelected = selected[q.id] === opt.id
                  const isCorrect = opt.id === correctAnswer
                  const showResult = checked

                  let optClass =
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors '

                  if (!showResult) {
                    optClass += isSelected
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-bg hover:bg-surface text-text'
                  } else if (isCorrect) {
                    optClass += 'border-success bg-green-50 text-success'
                  } else if (isSelected && !isCorrect) {
                    optClass += 'border-error bg-red-50 text-error'
                  } else {
                    optClass += 'border-border bg-bg text-text-muted'
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !checked && setSelected((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className={optClass}
                      disabled={checked}
                    >
                      <span className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold border-current">
                        {opt.id.toUpperCase()}
                      </span>
                      <span className="flex-1">{opt.text_vi ?? opt.text}</span>
                      {showResult && isCorrect && <CheckCircle size={16} />}
                      {showResult && isSelected && !isCorrect && <XCircle size={16} />}
                    </button>
                  )
                })}
              </div>
              {checked && q.explanation_vi && (
                <div className="text-xs text-text-muted bg-surface rounded-lg p-2.5">
                  💡 {q.explanation_vi}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Score banner */}
      {checked && (
        <div className={`card p-4 flex items-center gap-3 ${passed ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}>
          <span className="text-3xl">{passed ? '🎉' : '💪'}</span>
          <div>
            <p className="font-semibold text-text">
              {t.scoreLabel
                .replace('{score}', String(score))
                .replace('{total}', String(total))
                .replace('{pct}', String(pct))}
            </p>
            <p className="text-sm text-text-muted">
              {passed ? t.scorePassed : t.scoreFailed}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!allAnswered}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {t.btnCheckQuiz}
          </button>
        ) : passed ? (
          <button onClick={onComplete} className="btn-primary flex-1 justify-center">
            {t.btnNextQuiz} <ChevronRight size={16} />
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              {t.btnRetryQuiz}
            </button>
            <button onClick={onComplete} className="btn-ghost flex items-center gap-2">
              {t.btnSkipQuiz}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
