'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

// ─── Answer types ─────────────────────────────────────────────────────────────

interface PersonalInfo {
  name: string
  email: string
  age: string
  gender: string
  phone: string
}

type Answers = Record<string, string | string[]>

// ─── Question definitions ──────────────────────────────────────────────────────

interface QuestionBase {
  id: string
  vi: string
  en: string
  required?: boolean
}

interface EmojiScaleQuestion extends QuestionBase {
  type: 'emoji_scale'
  options: { emoji: string; vi: string; en: string }[]
}

interface MultiSelectQuestion extends QuestionBase {
  type: 'multi_select'
  max?: number
  options: { value: string; emoji?: string; vi: string; en: string }[]
}

interface SingleSelectQuestion extends QuestionBase {
  type: 'single_select'
  options: { value: string; emoji?: string; vi: string; en: string }[]
}

interface ConditionalMultiSelectQuestion extends QuestionBase {
  type: 'conditional_multi_select'
  options: { value: string; emoji?: string; vi: string; en: string }[]
  followUp: {
    showIfValues: string[]
    id: string
    vi: string
    en: string
    options: { value: string; vi: string; en: string }[]
  }
}

interface OpenTextQuestion extends QuestionBase {
  type: 'open_text'
  placeholder_vi: string
  placeholder_en: string
}

type Question =
  | EmojiScaleQuestion
  | MultiSelectQuestion
  | SingleSelectQuestion
  | ConditionalMultiSelectQuestion
  | OpenTextQuestion

const QUESTIONS: Question[] = [
  {
    id: 'q1_demographics',
    type: 'multi_select',
    max: 1,
    vi: 'Bạn đang học năm mấy và chuyên ngành gì?',
    en: 'What year are you in and what is your major?',
    required: true,
    options: [
      { value: 'y1', emoji: '1️⃣', vi: 'Năm 1', en: 'Year 1' },
      { value: 'y2', emoji: '2️⃣', vi: 'Năm 2', en: 'Year 2' },
      { value: 'y3', emoji: '3️⃣', vi: 'Năm 3', en: 'Year 3' },
      { value: 'y4', emoji: '4️⃣', vi: 'Năm 4', en: 'Year 4' },
      { value: 'ypost', emoji: '🎓', vi: 'Sau đại học', en: 'Postgraduate' },
    ],
  },
  {
    id: 'q1b_major',
    type: 'single_select',
    vi: 'Bạn đang học chuyên ngành gì?',
    en: 'What is your major?',
    required: true,
    options: [
      { value: 'it', emoji: '💻', vi: 'Công nghệ Thông tin / Kỹ thuật phần mềm', en: 'IT / Software Engineering' },
      { value: 'cs_electronics', emoji: '⚡', vi: 'Điện tử / Nhúng / IoT', en: 'Electronics / Embedded / IoT' },
      { value: 'mechanical', emoji: '⚙️', vi: 'Cơ khí / Cơ điện tử / Robot', en: 'Mechanical / Mechatronics / Robotics' },
      { value: 'automotive', emoji: '🚗', vi: 'Ô tô / Năng lượng / Nhiệt', en: 'Automotive / Energy / Thermal' },
      { value: 'business', emoji: '📊', vi: 'Kinh tế / Logistics / Thương mại điện tử', en: 'Business / Logistics / E-commerce' },
      { value: 'construction', emoji: '🏗️', vi: 'Xây dựng / Kiến trúc', en: 'Construction / Architecture' },
      { value: 'other', emoji: '📚', vi: 'Chuyên ngành khác', en: 'Other' },
    ],
  },
  {
    id: 'q2_pain_level',
    type: 'emoji_scale',
    vi: 'Bạn có thường gặp khó khăn với tiếng Anh trong các môn học không?',
    en: 'How often do you struggle with English in your university subjects?',
    required: true,
    options: [
      { emoji: '😊', vi: 'Không bao giờ — tôi hiểu tốt', en: 'Never — I understand fine' },
      { emoji: '🙂', vi: 'Hiếm khi — đôi khi bỏ lỡ một từ', en: 'Rarely — sometimes I miss a word' },
      { emoji: '😐', vi: 'Thỉnh thoảng — tôi thường phải đọc/nghe lại', en: 'Sometimes — I often have to re-read or re-listen' },
      { emoji: '😟', vi: 'Thường xuyên — tiếng Anh làm khó học hơn', en: 'Often — English makes the subject harder' },
      { emoji: '😫', vi: 'Luôn luôn — tiếng Anh là rào cản lớn nhất', en: 'Always — English is my biggest obstacle' },
    ],
  },
  {
    id: 'q3_hardest_situations',
    type: 'multi_select',
    max: 3,
    vi: 'Tình huống nào là khó nhất với bạn? (Chọn tối đa 3)',
    en: 'Which situations are hardest for you? (Pick top 3)',
    required: true,
    options: [
      { value: 'lectures', emoji: '🎤', vi: 'Hiểu giảng viên nói trong lớp', en: 'Understanding the teacher in class' },
      { value: 'slides', emoji: '📊', vi: 'Đọc slide và giáo trình', en: 'Reading slides and textbooks' },
      { value: 'assignments', emoji: '📝', vi: 'Hiểu yêu cầu bài tập', en: 'Understanding homework instructions' },
      { value: 'reports', emoji: '📄', vi: 'Viết báo cáo và tài liệu', en: 'Writing reports or documentation' },
      { value: 'presentations', emoji: '🎯', vi: 'Thuyết trình và bảo vệ đồ án', en: 'Presentations or project defense' },
      { value: 'groupwork', emoji: '👥', vi: 'Thảo luận nhóm bằng tiếng Anh', en: 'Group work in English' },
      { value: 'exams', emoji: '✏️', vi: 'Hiểu đề thi và câu hỏi', en: 'Understanding exam questions' },
      { value: 'technical_docs', emoji: '💻', vi: 'Đọc tài liệu kỹ thuật/code', en: 'Reading technical docs or code' },
      { value: 'internship', emoji: '💼', vi: 'Giao tiếp khi thực tập/đi làm', en: 'Internship or workplace communication' },
      { value: 'asking_class', emoji: '🙋', vi: 'Đặt câu hỏi trong lớp', en: 'Asking questions in class' },
    ],
  },
  {
    id: 'q4_coping',
    type: 'multi_select',
    max: 4,
    vi: 'Khi không hiểu tiếng Anh trong môn học, bạn thường làm gì? (Chọn tất cả phù hợp)',
    en: 'When you don\'t understand English in class, what do you usually do? (Pick all that apply)',
    required: true,
    options: [
      { value: 'google_translate', emoji: '🔄', vi: 'Dùng Google Dịch', en: 'Use Google Translate' },
      { value: 'ask_friend', emoji: '👫', vi: 'Hỏi bạn bè giải thích bằng tiếng Việt', en: 'Ask a friend to explain in Vietnamese' },
      { value: 'chatgpt', emoji: '🤖', vi: 'Dùng ChatGPT hoặc AI', en: 'Use ChatGPT or AI' },
      { value: 'youtube', emoji: '▶️', vi: 'Tìm video tiếng Việt trên YouTube', en: 'Search YouTube for Vietnamese explanation' },
      { value: 'guess', emoji: '🎲', vi: 'Đoán và tiếp tục', en: 'Just guess and move on' },
      { value: 'ask_teacher', emoji: '✋', vi: 'Hỏi giảng viên (hiếm khi)', en: 'Ask the teacher (rarely)' },
      { value: 'give_up', emoji: '😔', vi: 'Bỏ qua và chấp nhận không hiểu', en: 'Give up and accept I don\'t understand' },
    ],
  },
  {
    id: 'q5_hardest_subject',
    type: 'open_text',
    vi: 'Môn học nào trong chương trình của bạn có nhiều khó khăn tiếng Anh nhất?',
    en: 'Which subject in your programme has the most English difficulty for you?',
    required: true,
    placeholder_vi: 'VD: Cấu trúc dữ liệu, Mạng máy tính, Cơ sở dữ liệu...',
    placeholder_en: 'e.g. Data Structures, Computer Networks, Databases...',
  },
  {
    id: 'q6_subject_specific',
    type: 'conditional_multi_select',
    vi: 'Bạn có hiểu khái niệm bằng tiếng Việt nhưng bị chặn bởi thuật ngữ tiếng Anh không?\n\nVí dụ: Bạn biết "vòng lặp" là gì — nhưng "iteration", "loop condition", "nested loop" trong tiếng Anh làm bạn chậm lại.',
    en: 'Do you understand the concept in Vietnamese — but struggle because the English terms confuse you?\n\nExample: You know what "vòng lặp" is — but "iteration", "loop condition", "nested loop" in English slow you down.',
    required: true,
    options: [
      { value: 'yes_a_lot', emoji: '✅', vi: 'Có — điều này xảy ra rất nhiều. Tôi hiểu khái niệm nhưng thuật ngữ tiếng Anh chặn tôi', en: 'Yes — this happens a lot. I know the concept but English terms block me' },
      { value: 'sometimes', emoji: '🤔', vi: 'Đôi khi — một số môn có từ tiếng Anh tôi không hiểu hết', en: 'Sometimes — certain subjects have English terms I don\'t fully understand' },
      { value: 'depends', emoji: '🔄', vi: 'Tùy môn — có môn ổn, có môn khó', en: 'It depends — some subjects fine, others confusing' },
      { value: 'not_really', emoji: '❌', vi: 'Không nhiều — tôi hiểu thuật ngữ tiếng Anh trong môn học', en: 'Not really — I understand English terms in my subjects' },
    ],
    followUp: {
      showIfValues: ['yes_a_lot', 'sometimes'],
      id: 'q6_followup',
      vi: 'Nếu có khóa học ngắn "Tiếng Anh cho [môn học của bạn]" — ví dụ: Tiếng Anh cho Cấu trúc Dữ liệu hoặc Tiếng Anh cho Mạng máy tính — điều đó có giúp ích hơn so với khóa học tiếng Anh tổng quát không?',
      en: 'If there was a short "English for [your subject]" course — e.g. English for Data Structures or English for Networks — would that help you more than a general English course?',
      options: [
        { value: 'yes_more', vi: '🙋 Có — tiếng Anh chuyên ngành sẽ giúp ích nhiều hơn', en: '🙋 Yes — subject-specific English would help more' },
        { value: 'maybe', vi: '🤔 Có thể — tùy vào chất lượng', en: '🤔 Maybe — depends on quality' },
        { value: 'both', vi: '➡️ Cả hai — tôi cần tiếng Anh tổng quát lẫn chuyên ngành', en: '➡️ Both — I need general AND subject-specific English' },
        { value: 'general_enough', vi: '❌ Không — tiếng Anh tổng quát là đủ', en: '❌ No — general English improvement would be enough' },
      ],
    },
  },
  {
    id: 'q7_course_interest',
    type: 'multi_select',
    max: 2,
    vi: 'Nếu có khóa học ngắn thực tế — bạn sẽ sử dụng khóa nào? (Chọn tối đa 2)',
    en: 'If practical short courses existed — which would you actually use? (Pick top 2)',
    required: true,
    options: [
      { value: 'lectures', emoji: '📚', vi: 'Tiếng Anh để hiểu Bài giảng & Slide', en: 'English for Understanding Lectures & Slides' },
      { value: 'presentations', emoji: '🎤', vi: 'Tiếng Anh cho Thuyết trình & Bảo vệ Đồ án', en: 'English for Presentations & Project Defense' },
      { value: 'workplace', emoji: '💼', vi: 'Tiếng Anh cho Thực tập & Nơi làm việc', en: 'English for Internships & Workplace' },
      { value: 'writing', emoji: '📝', vi: 'Tiếng Anh cho Bài tập & Viết học thuật', en: 'English for Assignments & Academic Writing' },
      { value: 'it_prog', emoji: '💻', vi: 'Tiếng Anh cho IT, Lập trình & Tài liệu kỹ thuật', en: 'English for IT, Programming & Tech Docs' },
      { value: 'labs', emoji: '🧪', vi: 'Tiếng Anh cho Báo cáo Thí nghiệm & Đồ án Kỹ thuật', en: 'English for Lab Reports & Engineering Projects' },
      { value: 'exams', emoji: '❓', vi: 'Tiếng Anh để Hiểu Đề thi & Câu hỏi Kỹ thuật', en: 'English for Understanding Exam Questions' },
      { value: 'discussion', emoji: '🗣️', vi: 'Tiếng Anh cho Thảo luận Nhóm & Lớp học', en: 'English for Classroom Discussion & Group Work' },
    ],
  },
  {
    id: 'q8_format',
    type: 'single_select',
    vi: 'Bạn thích học theo hình thức nào?',
    en: 'How would you prefer to learn?',
    required: true,
    options: [
      { value: 'micro', emoji: '⚡', vi: 'Bài học 5 phút, có thể làm trước/sau giờ học', en: '5-minute micro-lessons before/after class' },
      { value: 'regular', emoji: '📅', vi: 'Bài học 20-30 phút, vài lần mỗi tuần', en: '20-30 min lessons a few times a week' },
      { value: 'gamified', emoji: '🎮', vi: 'Học kiểu game với điểm và thử thách', en: 'Game-style practice with points and challenges' },
      { value: 'peer', emoji: '👥', vi: 'Thực hành với bạn cùng lớp (nói & ghi âm)', en: 'Practice with classmates (speaking + recording)' },
      { value: 'mobile', emoji: '📱', vi: 'Chủ yếu trên điện thoại, bất kỳ lúc nào', en: 'Mostly on my phone, anytime' },
      { value: 'laptop', emoji: '💻', vi: 'Trên máy tính, ở nhà', en: 'On my laptop, at home' },
    ],
  },
  {
    id: 'q9_wtp',
    type: 'single_select',
    vi: 'Nếu công cụ như vậy tồn tại — ngắn, thực tế, được làm cho sinh viên Việt Nam học môn chuyên ngành bằng tiếng Anh — bạn sẽ thế nào?',
    en: 'If a tool like this existed — short, practical, made for Vietnamese students studying in English — which describes you?',
    required: true,
    options: [
      { value: 'try_free', emoji: '🙋', vi: 'Tôi chắc chắn sẽ thử (dùng thử miễn phí)', en: 'I would definitely try it (free trial)' },
      { value: 'maybe_try', emoji: '🤔', vi: 'Có thể thử, tùy vào chất lượng', en: 'I might try it, depends on quality' },
      { value: 'pay_low', emoji: '💰', vi: 'Tôi sẽ trả phí nếu thực sự giúp ích (dưới 50k VND/tháng)', en: 'I would pay if it actually helped (under 50k VND/month)' },
      { value: 'pay_mid', emoji: '💰💰', vi: 'Tôi sẽ trả phí (100k–200k VND/tháng)', en: 'I would pay for it (100k–200k VND/month)' },
      { value: 'no_fine', emoji: '❌', vi: 'Tôi không cần — tôi ổn rồi', en: 'I wouldn\'t use it — I manage fine' },
      { value: 'no_ai', emoji: '🤖', vi: 'Tôi không cần — AI đã đủ', en: 'I wouldn\'t use it — AI tools are enough' },
    ],
  },
  {
    id: 'q10_motivation',
    type: 'multi_select',
    max: 2,
    vi: 'Tại sao bạn muốn cải thiện tiếng Anh? (Chọn tối đa 2)',
    en: 'Why do you want better English? (Pick top 2)',
    required: true,
    options: [
      { value: 'grades', emoji: '🏆', vi: 'Hiểu môn học tốt hơn và đạt điểm cao hơn', en: 'Understand subjects better and get better grades' },
      { value: 'job', emoji: '💼', vi: 'Có được thực tập hoặc việc làm tốt', en: 'Get a good internship or job' },
      { value: 'abroad', emoji: '✈️', vi: 'Làm việc nước ngoài hoặc với công ty quốc tế', en: 'Work abroad or with international companies' },
      { value: 'confidence', emoji: '🗣️', vi: 'Tự tin hơn khi nói trong lớp', en: 'Feel more confident speaking in class' },
      { value: 'writing', emoji: '📄', vi: 'Viết báo cáo và bài tập tốt hơn', en: 'Write better reports and assignments' },
      { value: 'exams', emoji: '🎓', vi: 'Chuẩn bị cho học sau đại học hoặc thi IELTS/TOEIC', en: 'Prepare for graduate study or IELTS/TOEIC' },
      { value: 'fine', emoji: '💡', vi: 'Tôi ổn — không cảm thấy cần cải thiện', en: 'I\'m fine — I don\'t need to improve' },
    ],
  },
  {
    id: 'q11_open',
    type: 'open_text',
    vi: 'Hoàn thành câu này (bằng tiếng Việt hoặc tiếng Anh): "Khoảnh khắc tiếng Anh khó nhất trong học tập của tôi là khi..."',
    en: 'Finish this sentence (in any language): "The hardest English moment in my studies is when..."',
    required: false,
    placeholder_vi: 'Chia sẻ bất kỳ điều gì bạn muốn...',
    placeholder_en: 'Share anything you\'d like...',
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current) / total) * 100)
  return (
    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

function EmojiScaleInput({ question, value, onChange, onAutoAdvance }: {
  question: EmojiScaleQuestion
  value: string
  onChange: (v: string) => void
  onAutoAdvance?: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { onChange(String(i)); onAutoAdvance?.() }}
          className={[
            'flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150',
            value === String(i)
              ? 'border-primary bg-primary/8 shadow-sm'
              : 'border-border bg-white hover:border-primary/40 hover:bg-surface',
          ].join(' ')}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className={`text-sm font-medium ${value === String(i) ? 'text-primary' : 'text-text'}`}>
            {opt.vi}
          </span>
          {value === String(i) && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
        </button>
      ))}
    </div>
  )
}

function MultiSelectInput({ question, values, onChange, onAutoAdvance }: {
  question: MultiSelectQuestion
  values: string[]
  onChange: (v: string[]) => void
  onAutoAdvance?: () => void
}) {
  const isEffectivelySingle = question.max === 1

  const toggle = (val: string) => {
    if (isEffectivelySingle) {
      // single-answer mode: select and auto-advance
      onChange([val])
      onAutoAdvance?.()
      return
    }
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val))
    } else if (!question.max || values.length < question.max) {
      onChange([...values, val])
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {!isEffectivelySingle && question.max && (
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-text-muted">
            Chọn tối đa {question.max} đáp án — nhấn <strong>Tiếp theo</strong> khi xong
          </p>
          {values.length > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {values.length}/{question.max} đã chọn
            </span>
          )}
        </div>
      )}
      {question.options.map((opt) => {
        const selected = values.includes(opt.value)
        const disabled = !selected && !!question.max && !isEffectivelySingle && values.length >= question.max
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            disabled={disabled}
            className={[
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
              selected
                ? 'border-primary bg-primary/8 shadow-sm'
                : disabled
                  ? 'border-border bg-surface text-text-muted opacity-40 cursor-not-allowed'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-surface',
            ].join(' ')}
          >
            {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
            <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-text'}`}>
              {opt.vi}
            </span>
            {selected && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

function SingleSelectInput({ question, value, onChange, onAutoAdvance }: {
  question: SingleSelectQuestion | { options: { value: string; vi: string; en: string }[] }
  value: string
  onChange: (v: string) => void
  onAutoAdvance?: () => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {question.options.map((opt) => {
        const selected = value === opt.value
        const optWithEmoji = opt as { value: string; vi: string; en: string; emoji?: string }
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); onAutoAdvance?.() }}
            className={[
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
              selected
                ? 'border-primary bg-primary/8 shadow-sm'
                : 'border-border bg-white hover:border-primary/40 hover:bg-surface',
            ].join(' ')}
          >
            {optWithEmoji.emoji && <span className="text-xl">{optWithEmoji.emoji}</span>}
            <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-text'}`}>
              {opt.vi}
            </span>
            {selected && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

function OpenTextInput({ question, value, onChange }: {
  question: OpenTextQuestion
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder_vi}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
      />
      <span className="absolute bottom-3 right-3 text-xs text-text-muted">{value.length}</span>
    </div>
  )
}

function ConditionalQuestion({ question, values, followUpValue, onChange, onFollowUpChange }: {
  question: ConditionalMultiSelectQuestion
  values: string[]
  followUpValue: string
  onChange: (v: string[]) => void
  onFollowUpChange: (v: string) => void
}) {
  const showFollowUp = values.some((v) => question.followUp.showIfValues.includes(v))
  return (
    <div className="space-y-4">
      <SingleSelectInput
        question={{ options: question.options }}
        value={values[0] ?? ''}
        onChange={(v) => onChange([v])}
      />
      <AnimatePresence>
        {showFollowUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold text-text mb-3 leading-snug whitespace-pre-line">
                {question.followUp.vi}
              </p>
              <SingleSelectInput
                question={{ options: question.followUp.options }}
                value={followUpValue}
                onChange={onFollowUpChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Personal info step ───────────────────────────────────────────────────────

function PersonalStep({ info, onChange }: {
  info: PersonalInfo
  onChange: (field: keyof PersonalInfo, value: string) => void
}) {
  const { t } = useLang()
  const genders = [
    { value: 'male', label: t.surveyGenderMale },
    { value: 'female', label: t.surveyGenderFemale },
    { value: 'other', label: t.surveyGenderOther },
    { value: 'prefer_not', label: t.surveyGenderPreferNot },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.surveyFieldName} *
        </label>
        <input
          type="text"
          value={info.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.surveyFieldEmail} *
        </label>
        <input
          type="email"
          value={info.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="ten@email.com"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            {t.surveyFieldAge} *
          </label>
          <input
            type="number"
            value={info.age}
            onChange={(e) => onChange('age', e.target.value)}
            placeholder="20"
            min="15"
            max="60"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            {t.surveyFieldPhone}
          </label>
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="0901 234 567"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
          {t.surveyFieldGender} *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {genders.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onChange('gender', g.value)}
              className={[
                'px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                info.gender === g.value
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border bg-white text-text hover:border-primary/40',
              ].join(' ')}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main SurveyForm component ────────────────────────────────────────────────

interface Props {
  onComplete: () => void
}

const TOTAL_STEPS = QUESTIONS.length + 1 // +1 for personal info

export default function SurveyForm({ onComplete }: Props) {
  const { t } = useLang()
  const [step, setStep] = useState(0) // 0 = personal info, 1..N = questions
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [personal, setPersonal] = useState<PersonalInfo>({
    name: '', email: '', age: '', gender: '', phone: '',
  })

  const [answers, setAnswers] = useState<Answers>({})
  const [conditionalFollowUps, setConditionalFollowUps] = useState<Record<string, string>>({})

  const updatePersonal = useCallback((field: keyof PersonalInfo, value: string) => {
    setPersonal((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const updateFollowUp = useCallback((id: string, value: string) => {
    setConditionalFollowUps((prev) => ({ ...prev, [id]: value }))
  }, [])

  // Auto-advance after 450ms for single-answer question types
  const scheduleAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = setTimeout(() => {
      setStep((s) => {
        if (s < TOTAL_STEPS - 1) {
          setDirection(1)
          return s + 1
        }
        return s
      })
    }, 450)
  }, [])

  const canProceed = (): boolean => {
    if (step === 0) {
      return !!(personal.name.trim() && personal.email.includes('@') && personal.age && personal.gender)
    }
    const q = QUESTIONS[step - 1]
    if (!q.required) return true
    const ans = answers[q.id]
    if (q.type === 'open_text') return (typeof ans === 'string' && ans.trim().length > 0)
    if (q.type === 'multi_select' || q.type === 'single_select') {
      return Array.isArray(ans) ? ans.length > 0 : (typeof ans === 'string' && ans.length > 0)
    }
    if (q.type === 'emoji_scale') return typeof ans === 'string' && ans !== ''
    if (q.type === 'conditional_multi_select') {
      const v = Array.isArray(ans) ? ans : []
      return v.length > 0
    }
    return true
  }

  const goNext = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (!canProceed()) return
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }

  const goBack = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const combinedAnswers = { ...answers, ...conditionalFollowUps }
      const res = await fetch('/api/surveys/hcmute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personal.name.trim(),
          email: personal.email.trim(),
          age: personal.age ? parseInt(personal.age, 10) : null,
          gender: personal.gender || null,
          phone: personal.phone.trim() || null,
          answers: combinedAnswers,
        }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? 'Submission failed')
      }
      onComplete()
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  const currentQuestion = step > 0 ? QUESTIONS[step - 1] : null

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header */}
      <div className="max-w-lg mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src="/images/tuto-logo.png" alt="tuto." className="h-7 w-auto" />
          </div>
          <span className="text-xs text-text-muted font-medium">
            {t.surveyProgressLabel} {Math.max(step, 1)} {t.surveyOf} {TOTAL_STEPS}
          </span>
        </div>
        <ProgressBar current={step} total={TOTAL_STEPS} />
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                {step === 0 ? (
                  <>
                    <h2 className="text-lg font-bold text-text mb-1">{t.surveyPersonalTitle}</h2>
                    <p className="text-sm text-text-muted mb-5">{t.surveyPersonalSubtitle}</p>
                    <PersonalStep info={personal} onChange={updatePersonal} />
                  </>
                ) : currentQuestion ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {step}/{QUESTIONS.length}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-text mb-5 leading-snug whitespace-pre-line">
                      {currentQuestion.vi}
                    </h2>

                    {currentQuestion.type === 'emoji_scale' && (
                      <EmojiScaleInput
                        question={currentQuestion}
                        value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                        onChange={(v) => updateAnswer(currentQuestion.id, v)}
                        onAutoAdvance={scheduleAutoAdvance}
                      />
                    )}
                    {currentQuestion.type === 'multi_select' && (
                      <MultiSelectInput
                        question={currentQuestion}
                        values={Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : []}
                        onChange={(v) => updateAnswer(currentQuestion.id, v)}
                        onAutoAdvance={scheduleAutoAdvance}
                      />
                    )}
                    {currentQuestion.type === 'single_select' && (
                      <SingleSelectInput
                        question={currentQuestion}
                        value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                        onChange={(v) => updateAnswer(currentQuestion.id, v)}
                        onAutoAdvance={scheduleAutoAdvance}
                      />
                    )}
                    {currentQuestion.type === 'open_text' && (
                      <OpenTextInput
                        question={currentQuestion}
                        value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                        onChange={(v) => updateAnswer(currentQuestion.id, v)}
                      />
                    )}
                    {currentQuestion.type === 'conditional_multi_select' && (
                      <ConditionalQuestion
                        question={currentQuestion}
                        values={Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : []}
                        followUpValue={conditionalFollowUps[currentQuestion.followUp.id] ?? ''}
                        onChange={(v) => updateAnswer(currentQuestion.id, v)}
                        onFollowUpChange={(v) => updateFollowUp(currentQuestion.followUp.id, v)}
                      />
                    )}
                  </>
                ) : null}

                {error && (
                  <p className="mt-4 text-sm text-error bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                    {error}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-5">
            {step > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface transition-all"
              >
                <ChevronLeft size={16} />
                {t.surveyBack}
              </button>
            )}
            <motion.button
              onClick={goNext}
              disabled={!canProceed() || submitting}
              className={[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                canProceed() && !submitting
                  ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                  : 'bg-surface text-text-muted border border-border cursor-not-allowed',
              ].join(' ')}
              whileTap={canProceed() && !submitting ? { scale: 0.98 } : undefined}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.surveySubmitting}
                </>
              ) : step === TOTAL_STEPS - 1 ? (
                <>
                  <Send size={15} />
                  {t.surveySubmit}
                </>
              ) : (
                <>
                  {t.surveyNext}
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
