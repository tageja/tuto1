'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Heart, Sparkles, Stethoscope, Compass, MessageCircleHeart, Mail } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  name: string
  email: string
  age: string
  gender: string
  phone: string
}

interface ProfessionalInfo {
  hospital: string
  position: string
  specialty: string
  experience: string
  hospital_type: string
}

type Answers = Record<string, string | string[]>

interface Option {
  value: string
  emoji?: string
  vi: string
  en: string
}

interface Question {
  id: string
  type: 'emoji_scale' | 'multi_select' | 'single_select'
  phase: 1 | 2 | 3 | 4
  vi: string
  en: string
  required?: boolean
  max?: number
  options: Option[]
}

// ─── 12 Questions across 4 phases ─────────────────────────────────────────────

const QUESTIONS: Question[] = [
  // ─── PHASE 1 — Your everyday (real-world memory triggers) ──────────
  {
    id: 'q1_foreign_patient',
    type: 'emoji_scale',
    phase: 1,
    required: true,
    vi: 'Bạn đã từng gặp tình huống bệnh nhân nước ngoài hỏi bằng tiếng Anh mà bạn không trả lời được?',
    en: 'Have you ever been in a situation where a foreign patient asked you something in English and you could not answer?',
    options: [
      { value: '0', emoji: '😊', vi: 'Chưa bao giờ', en: 'Never' },
      { value: '1', emoji: '🙂', vi: 'Một hai lần', en: 'Once or twice' },
      { value: '2', emoji: '😐', vi: 'Vài lần', en: 'Several times' },
      { value: '3', emoji: '😟', vi: 'Nhiều lần', en: 'Many times' },
      { value: '4', emoji: '😫', vi: 'Xảy ra thường xuyên', en: 'Happens regularly' },
    ],
  },
  {
    id: 'q2_response',
    type: 'multi_select',
    phase: 1,
    required: true,
    max: 3,
    vi: 'Lần gần nhất, bạn xử lý thế nào? (Chọn tối đa 3)',
    en: 'Last time it happened, what did you do? (Pick top 3)',
    options: [
      { value: 'colleague', emoji: '👥', vi: 'Nhờ đồng nghiệp dịch giúp', en: 'Asked a colleague to translate' },
      { value: 'translate_app', emoji: '📱', vi: 'Dùng Google Dịch trên điện thoại', en: 'Used Google Translate on my phone' },
      { value: 'pretend', emoji: '😅', vi: 'Giả vờ hiểu để qua chuyện', en: 'Pretended I understood' },
      { value: 'avoid', emoji: '🚶', vi: 'Tránh phải tiếp xúc với bệnh nhân đó', en: 'Avoided the patient' },
      { value: 'wait', emoji: '⏳', vi: 'Yêu cầu bệnh nhân chờ trong khi tôi tìm cách', en: 'Asked the patient to wait while I figured it out' },
      { value: 'gestures', emoji: '🤲', vi: 'Dùng cử chỉ tay & ngôn ngữ cơ thể', en: 'Used hand gestures' },
      { value: 'family', emoji: '👨‍👩‍👧', vi: 'Nhờ người nhà dịch', en: 'Got the family to translate' },
      { value: 'other', emoji: '✨', vi: 'Cách khác', en: 'Other' },
    ],
  },
  {
    id: 'q3_terminology',
    type: 'multi_select',
    phase: 1,
    required: true,
    max: 3,
    vi: 'Khi đọc nhãn thuốc, y lệnh, hoặc hướng dẫn thiết bị bằng tiếng Anh — phần nào khó nhất?',
    en: 'When reading drug labels, doctor orders, or equipment instructions in English — what is hardest?',
    options: [
      { value: 'abbrev', emoji: '🔤', vi: 'Viết tắt y khoa (PO, BID, PRN, q.d., q.h. ...)', en: 'Medical abbreviations (PO, BID, PRN, q.d., q.h. ...)' },
      { value: 'drugs', emoji: '💊', vi: 'Tên thuốc bằng tiếng Anh', en: 'Drug / medication names' },
      { value: 'equipment', emoji: '🩺', vi: 'Tên thiết bị y tế', en: 'Equipment names' },
      { value: 'symptoms', emoji: '🤕', vi: 'Mô tả triệu chứng của bệnh nhân', en: 'Patient symptom descriptions' },
      { value: 'dosage', emoji: '⚖️', vi: 'Hướng dẫn liều dùng', en: 'Dosage instructions' },
      { value: 'diagnosis', emoji: '📋', vi: 'Thuật ngữ chẩn đoán & tiên lượng', en: 'Diagnostic / prognosis terms' },
      { value: 'procedure', emoji: '🏥', vi: 'Tên thủ thuật / quy trình', en: 'Procedure names' },
      { value: 'fine', emoji: '✅', vi: 'Không có gì khó — tôi đọc tốt', en: 'Nothing — I read them fine' },
    ],
  },

  // ─── PHASE 2 — The tough moments (realisation gap) ─────────────────
  {
    id: 'q4_pain_scale',
    type: 'single_select',
    phase: 2,
    required: true,
    vi: 'Một bệnh nhân nói "throbbing, sharp, radiating to my left arm" — không dùng dịch — bạn có hiểu mức độ khẩn cấp không?\n\n(Đây là dấu hiệu kinh điển của nhồi máu cơ tim.)',
    en: 'A patient says "throbbing, sharp, radiating to my left arm" — without translation help — would you understand the urgency?\n\n(That phrase is the classic sign of a heart attack.)',
    options: [
      { value: 'yes', emoji: '💪', vi: 'Có, tôi hiểu hoàn toàn', en: 'Yes, completely' },
      { value: 'partly', emoji: '🤔', vi: 'Hiểu một phần — tôi sẽ đoán', en: 'Partly — I would guess' },
      { value: 'translate', emoji: '📱', vi: 'Tôi cần dịch trước', en: 'I would need to translate first' },
      { value: 'colleague', emoji: '👥', vi: 'Tôi sẽ hỏi đồng nghiệp', en: 'I would ask a colleague' },
      { value: 'lost', emoji: '😨', vi: 'Tôi sẽ hoàn toàn lúng túng', en: 'No, I would be lost' },
    ],
  },
  {
    id: 'q5_handover_confidence',
    type: 'emoji_scale',
    phase: 2,
    required: true,
    vi: 'Bạn tự tin bàn giao ca cho một bác sĩ nói tiếng Anh ngay bây giờ ở mức nào?',
    en: 'How confident would you be doing a shift handover to an English-speaking doctor right now?',
    options: [
      { value: '5', emoji: '🤩', vi: 'Rất tự tin', en: 'Very confident' },
      { value: '4', emoji: '😊', vi: 'Tự tin', en: 'Confident' },
      { value: '3', emoji: '😐', vi: 'Tạm ổn', en: 'OK' },
      { value: '2', emoji: '😟', vi: 'Hơi lo', en: 'Nervous' },
      { value: '1', emoji: '😰', vi: 'Hoàn toàn không tự tin', en: 'Not confident at all' },
    ],
  },
  {
    id: 'q6_wish_count',
    type: 'single_select',
    phase: 2,
    required: true,
    vi: 'Trong tháng vừa qua, bao nhiêu lần bạn ước mình hiểu tiếng Anh tốt hơn ở chỗ làm?',
    en: 'In the last month, how many times did you wish you understood English better at work?',
    options: [
      { value: '0', emoji: '🌤️', vi: 'Chưa bao giờ', en: 'Never' },
      { value: '1-2', emoji: '☁️', vi: '1–2 lần', en: '1–2 times' },
      { value: '3-5', emoji: '⛅', vi: '3–5 lần', en: '3–5 times' },
      { value: 'daily', emoji: '🌧️', vi: 'Gần như mỗi ngày', en: 'Almost daily' },
      { value: 'multi-daily', emoji: '⛈️', vi: 'Nhiều lần mỗi ngày', en: 'Multiple times a day' },
    ],
  },

  // ─── PHASE 3 — Your future (aspiration + loss framing) ─────────────
  {
    id: 'q7_three_year_vision',
    type: 'multi_select',
    phase: 3,
    required: true,
    max: 2,
    vi: 'Trong 3 năm tới, bạn thấy mình ở đâu? (Chọn tối đa 2)',
    en: 'Where do you see yourself in 3 years? (Pick up to 2)',
    options: [
      { value: 'current', emoji: '🏥', vi: 'Tại bệnh viện / nơi làm việc hiện tại', en: 'At my current hospital / workplace' },
      { value: 'top_private', emoji: '⭐', vi: 'Tại bệnh viện tư cao cấp / quốc tế (FV, Vinmec, Hoàn Mỹ...)', en: 'At a top private / international hospital (FV, Vinmec, Hoan My...)' },
      { value: 'abroad', emoji: '✈️', vi: 'Làm việc nước ngoài (Nhật, Đức, Úc, Anh...)', en: 'Working abroad (Japan, Germany, Australia, UK...)' },
      { value: 'leadership', emoji: '👑', vi: 'Vai trò quản lý hoặc đào tạo điều dưỡng', en: 'Leadership / training role' },
      { value: 'tourism', emoji: '🏖️', vi: 'Du lịch y tế / chăm sóc người nước ngoài', en: 'Healthcare tourism' },
      { value: 'unsure', emoji: '🤷', vi: 'Tôi chưa chắc chắn', en: 'I am not sure yet' },
    ],
  },
  {
    id: 'q8_salary_awareness',
    type: 'single_select',
    phase: 3,
    required: true,
    vi: 'Điều dưỡng tại bệnh viện quốc tế ở Việt Nam thường lương 2–3× so với công lập, và tiếng Anh là yếu tố lọc chính.\n\nBạn cảm thấy thế nào về thông tin này?',
    en: 'Nurses at international hospitals in Vietnam earn 2–3× the public-hospital salary, and English fluency is the main filter.\n\nHow does this affect your thinking?',
    options: [
      { value: 'knew_motivated', emoji: '🔥', vi: 'Tôi biết, và điều này thúc đẩy tôi', en: 'I knew, and it motivates me' },
      { value: 'knew_far', emoji: '😔', vi: 'Tôi biết, nhưng cảm thấy xa vời', en: 'I knew, but it feels out of reach' },
      { value: 'didnt_thinking', emoji: '💡', vi: 'Tôi không biết — giờ tôi đang suy nghĩ về nó', en: 'I did not know — now I am thinking about it' },
      { value: 'didnt_interesting', emoji: '👀', vi: 'Tôi không biết — thật thú vị', en: 'I did not know — that is interesting' },
      { value: 'not_interested', emoji: '🌱', vi: 'Tôi không quan tâm chuyện làm việc quốc tế', en: 'Not interested in international work' },
    ],
  },
  {
    id: 'q9_blockers',
    type: 'multi_select',
    phase: 3,
    required: true,
    max: 3,
    vi: 'Điều gì đang ngăn bạn làm việc tại bệnh viện quốc tế / nước ngoài hôm nay? (Chọn tối đa 3)',
    en: 'What is stopping you from working at an international / overseas hospital today? (Pick top 3)',
    options: [
      { value: 'english', emoji: '🗣️', vi: 'Trình độ tiếng Anh', en: 'English level' },
      { value: 'confidence', emoji: '💭', vi: 'Thiếu tự tin khi nói', en: 'Lack of confidence speaking' },
      { value: 'process', emoji: '📝', vi: 'Tôi không biết quy trình ứng tuyển', en: 'Do not know how to apply' },
      { value: 'family', emoji: '👨‍👩‍👧', vi: 'Trách nhiệm gia đình', en: 'Family obligations' },
      { value: 'salary_gap', emoji: '💰', vi: 'Chênh lệch lương chưa đủ hấp dẫn', en: 'Salary gap not big enough' },
      { value: 'experience', emoji: '⏳', vi: 'Tôi cần thêm kinh nghiệm', en: 'I need more experience first' },
      { value: 'cert', emoji: '📜', vi: 'Chứng chỉ chuyên môn / IELTS', en: 'Professional / IELTS certification' },
      { value: 'already', emoji: '✅', vi: 'Tôi đã làm việc ở đó rồi', en: 'I am already there' },
      { value: 'other', emoji: '✨', vi: 'Khác', en: 'Other' },
    ],
  },

  // ─── PHASE 4 — An invitation (commitment + conversion) ─────────────
  {
    id: 'q10_course_interest',
    type: 'single_select',
    phase: 4,
    required: true,
    vi: 'Hãy tưởng tượng có một khóa học tiếng Anh được thiết kế riêng cho điều dưỡng — giao tiếp với bệnh nhân, tên thuốc, bàn giao ca, các tình huống bệnh nhân nước ngoài.\n\nBạn có muốn thử không?',
    en: 'Imagine a course designed specifically for nurses — patient communication, drug names, shift handovers, foreign patient scenarios.\n\nWould you try it?',
    options: [
      { value: 'definitely', emoji: '🙋', vi: 'Có, chắc chắn — đăng ký cho tôi', en: 'Yes, definitely — sign me up' },
      { value: 'affordable', emoji: '💸', vi: 'Có, nếu giá hợp lý', en: 'Yes, if it is affordable' },
      { value: 'maybe', emoji: '🤔', vi: 'Có thể — tùy lịch của tôi', en: 'Maybe — depends on my time' },
      { value: 'unlikely', emoji: '😶', vi: 'Có lẽ không', en: 'Probably not' },
      { value: 'no', emoji: '🚫', vi: 'Không, cảm ơn', en: 'No, thank you' },
    ],
  },
  {
    id: 'q11_scenarios',
    type: 'multi_select',
    phase: 4,
    required: true,
    max: 3,
    vi: 'Bạn muốn luyện tình huống nào nhất? (Chọn tối đa 3)',
    en: 'Which scenarios would you most want to practice? (Pick top 3)',
    options: [
      { value: 'greeting', emoji: '👋', vi: 'Chào hỏi & tiếp nhận bệnh nhân', en: 'Greeting & patient intake' },
      { value: 'vitals', emoji: '🩻', vi: 'Đo & ghi nhận dấu hiệu sinh tồn', en: 'Taking vital signs in English' },
      { value: 'drug_admin', emoji: '💊', vi: 'Hướng dẫn dùng thuốc cho bệnh nhân', en: 'Drug administration explanation' },
      { value: 'pain', emoji: '🤕', vi: 'Đánh giá cơn đau', en: 'Pain assessment' },
      { value: 'handover', emoji: '🔄', vi: 'Bàn giao ca với bác sĩ', en: 'Shift handover with doctor' },
      { value: 'family', emoji: '👨‍👩‍👧', vi: 'Trao đổi với gia đình bệnh nhân', en: 'Family conversation about patient' },
      { value: 'discharge', emoji: '🏠', vi: 'Hướng dẫn xuất viện', en: 'Discharge instructions' },
      { value: 'emergency', emoji: '🚨', vi: 'Phân loại cấp cứu', en: 'Emergency triage' },
      { value: 'foreign', emoji: '🌐', vi: 'Đánh giá ban đầu cho bệnh nhân nước ngoài', en: 'Foreign patient initial assessment' },
      { value: 'reading', emoji: '📋', vi: 'Đọc nhãn thuốc & y lệnh', en: 'Reading drug labels & orders' },
    ],
  },
  {
    id: 'q12_mvp_signup',
    type: 'single_select',
    phase: 4,
    required: true,
    vi: 'Chúng tôi đang mời 100 điều dưỡng đầu tiên thử MVP miễn phí 30 ngày — đầy đủ tính năng, không cần thẻ tín dụng.\n\nĐổi lại, chúng tôi xin phản hồi trung thực để hoàn thiện sản phẩm.\n\nBạn có muốn tham gia không?',
    en: 'We are inviting the first 100 nurses to try our MVP free for 30 days — full access, no credit card required.\n\nIn exchange, we ask for your honest feedback to improve the product.\n\nWant in?',
    options: [
      { value: 'yes_email', emoji: '🎉', vi: 'Có — gửi email cho tôi khi MVP mở', en: 'Yes — please email me when the MVP opens' },
      { value: 'yes_more_info', emoji: '📩', vi: 'Có, nhưng tôi muốn biết thêm trước', en: 'Yes, but tell me more first' },
      { value: 'maybe_later', emoji: '⏰', vi: 'Có thể sau này', en: 'Maybe later' },
      { value: 'no', emoji: '🙏', vi: 'Không, cảm ơn', en: 'No, thank you' },
    ],
  },
]

// ─── Phase metadata ───────────────────────────────────────────────────────────

const PHASE_META = {
  1: { icon: Stethoscope, color: 'text-rose-500', bg: 'bg-rose-50', titleKey: 'nsPhase1Title', captionKey: 'nsPhase1Caption' },
  2: { icon: MessageCircleHeart, color: 'text-amber-500', bg: 'bg-amber-50', titleKey: 'nsPhase2Title', captionKey: 'nsPhase2Caption' },
  3: { icon: Compass, color: 'text-emerald-500', bg: 'bg-emerald-50', titleKey: 'nsPhase3Title', captionKey: 'nsPhase3Caption' },
  4: { icon: Heart, color: 'text-primary', bg: 'bg-primary/10', titleKey: 'nsPhase4Title', captionKey: 'nsPhase4Caption' },
} as const

const HOSPITAL_TYPES = [
  { value: 'public', vi: 'Bệnh viện công lập', en: 'Public hospital' },
  { value: 'private', vi: 'Bệnh viện tư', en: 'Private hospital' },
  { value: 'international', vi: 'Bệnh viện quốc tế (FV, Vinmec, Hoàn Mỹ...)', en: 'International hospital' },
  { value: 'clinic', vi: 'Phòng khám / Trung tâm y tế', en: 'Clinic / Medical center' },
  { value: 'student', vi: 'Tôi đang học, chưa đi làm', en: 'Studying, not yet working' },
  { value: 'other', vi: 'Khác', en: 'Other' },
]

const POSITIONS = [
  { value: 'student', vi: 'Sinh viên / Thực tập sinh', en: 'Student / Intern' },
  { value: 'junior', vi: 'Điều dưỡng (mới ra trường)', en: 'Junior nurse' },
  { value: 'experienced', vi: 'Điều dưỡng có kinh nghiệm', en: 'Experienced nurse' },
  { value: 'senior', vi: 'Điều dưỡng trưởng / cao cấp', en: 'Senior / charge nurse' },
  { value: 'head', vi: 'Trưởng khoa điều dưỡng', en: 'Head nurse / nursing manager' },
  { value: 'specialist', vi: 'Điều dưỡng chuyên khoa', en: 'Specialist nurse' },
  { value: 'other', vi: 'Khác', en: 'Other' },
]

const SPECIALTIES = [
  { value: 'general', vi: 'Đa khoa / Nội tổng quát', en: 'General / Internal medicine' },
  { value: 'emergency', vi: 'Cấp cứu', en: 'Emergency' },
  { value: 'icu', vi: 'Hồi sức tích cực (ICU)', en: 'ICU' },
  { value: 'surgery', vi: 'Ngoại / Phẫu thuật', en: 'Surgery' },
  { value: 'pediatric', vi: 'Nhi', en: 'Pediatric' },
  { value: 'obgyn', vi: 'Sản phụ khoa', en: 'OB-GYN' },
  { value: 'oncology', vi: 'Ung bướu', en: 'Oncology' },
  { value: 'cardiology', vi: 'Tim mạch', en: 'Cardiology' },
  { value: 'outpatient', vi: 'Khám bệnh ngoại trú', en: 'Outpatient' },
  { value: 'other', vi: 'Khác', en: 'Other' },
]

const EXPERIENCE = [
  { value: 'student', vi: 'Đang học', en: 'Studying' },
  { value: '<2', vi: 'Dưới 2 năm', en: 'Less than 2 years' },
  { value: '2-5', vi: '2–5 năm', en: '2–5 years' },
  { value: '5-10', vi: '5–10 năm', en: '5–10 years' },
  { value: '10+', vi: 'Trên 10 năm', en: 'More than 10 years' },
]

// ─── Validation cards (between phases) ───────────────────────────────────────

interface ValidationCard {
  afterStep: number  // step index after which this card appears (steps include personal=0, professional=1, then questions)
  icon: typeof Heart
  textKey: 'nsValidationNotAlone' | 'nsValidationGap' | 'nsValidationFuture' | 'nsValidationPreOffer'
  color: string
  bg: string
}

const VALIDATION_CARDS: ValidationCard[] = [
  // After Q3 (step 4 = personal+professional+Q1+Q2+Q3)
  { afterStep: 4, icon: Heart, textKey: 'nsValidationNotAlone', color: 'text-rose-500', bg: 'bg-rose-50' },
  // After Q6 (step 7)
  { afterStep: 7, icon: Sparkles, textKey: 'nsValidationGap', color: 'text-amber-500', bg: 'bg-amber-50' },
  // After Q9 (step 10)
  { afterStep: 10, icon: Compass, textKey: 'nsValidationFuture', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  // Before Q12 (step 13 — i.e. after Q11)
  { afterStep: 12, icon: Mail, textKey: 'nsValidationPreOffer', color: 'text-primary', bg: 'bg-primary/10' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

function PhaseChip({ phase }: { phase: 1 | 2 | 3 | 4 }) {
  const meta = PHASE_META[phase]
  const Icon = meta.icon
  const { t } = useLang()
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg} text-xs font-semibold ${meta.color} mb-3`}>
      <Icon size={12} />
      {(t as Record<string, string>)[meta.titleKey]}
    </div>
  )
}

// ─── Input components ────────────────────────────────────────────────────────

function EmojiScaleInput({ question, value, onChange, onAutoAdvance }: {
  question: Question
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
          onClick={() => { onChange(opt.value); onAutoAdvance?.() }}
          className={[
            'flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150',
            value === opt.value
              ? 'border-primary bg-primary/8 shadow-sm'
              : 'border-border bg-white hover:border-primary/40 hover:bg-surface',
          ].join(' ')}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className={`text-sm font-medium ${value === opt.value ? 'text-primary' : 'text-text'}`}>
            {opt.vi}
          </span>
          {value === opt.value && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
        </button>
      ))}
    </div>
  )
}

function MultiSelectInput({ question, values, onChange }: {
  question: Question
  values: string[]
  onChange: (v: string[]) => void
}) {
  const isSingle = question.max === 1
  const toggle = (val: string) => {
    if (isSingle) { onChange([val]); return }
    if (values.includes(val)) onChange(values.filter((v) => v !== val))
    else if (!question.max || values.length < question.max) onChange([...values, val])
  }
  return (
    <div className="flex flex-col gap-2.5">
      {!isSingle && question.max && (
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-text-muted">
            Chọn tối đa {question.max} đáp án — nhấn <strong>Tiếp tục</strong> khi xong
          </p>
          {values.length > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {values.length}/{question.max}
            </span>
          )}
        </div>
      )}
      {question.options.map((opt) => {
        const selected = values.includes(opt.value)
        const disabled = !selected && !!question.max && !isSingle && values.length >= question.max
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
            <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-text'}`}>{opt.vi}</span>
            {selected && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

function SingleSelectInput({ question, value, onChange, onAutoAdvance }: {
  question: Question
  value: string
  onChange: (v: string) => void
  onAutoAdvance?: () => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {question.options.map((opt) => {
        const selected = value === opt.value
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
            {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
            <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-text'}`}>{opt.vi}</span>
            {selected && <CheckCircle2 size={15} className="text-primary ml-auto flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── Personal / Professional steps ───────────────────────────────────────────

function PersonalStep({ info, onChange }: {
  info: PersonalInfo
  onChange: (field: keyof PersonalInfo, value: string) => void
}) {
  const { t } = useLang()
  const genders = [
    { value: 'male', label: t.nsGenderMale },
    { value: 'female', label: t.nsGenderFemale },
    { value: 'other', label: t.nsGenderOther },
    { value: 'prefer_not', label: t.nsGenderPreferNot },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.nsFieldName} *
        </label>
        <input
          type="text"
          value={info.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nguyễn Thị A"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.nsFieldEmail} *
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
            {t.nsFieldAge} *
          </label>
          <input
            type="number"
            value={info.age}
            onChange={(e) => onChange('age', e.target.value)}
            placeholder="28"
            min="18"
            max="80"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            Zalo / SĐT
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
          {t.nsFieldGender} *
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

function ProfessionalStep({ info, onChange }: {
  info: ProfessionalInfo
  onChange: (field: keyof ProfessionalInfo, value: string) => void
}) {
  const { t } = useLang()

  const Select = ({ label, field, options, required }: {
    label: string
    field: keyof ProfessionalInfo
    options: { value: string; vi: string; en: string }[]
    required?: boolean
  }) => (
    <div>
      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
        {label} {required && '*'}
      </label>
      <select
        value={info[field]}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
      >
        <option value="">— Chọn —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.vi}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.nsFieldHospital} *
        </label>
        <input
          type="text"
          value={info.hospital}
          onChange={(e) => onChange('hospital', e.target.value)}
          placeholder="VD: Bệnh viện Chợ Rẫy / Vinmec / FV..."
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <Select label={t.nsFieldHospitalType} field="hospital_type" options={HOSPITAL_TYPES} required />
      <Select label={t.nsFieldPosition} field="position" options={POSITIONS} required />
      <Select label={t.nsFieldSpecialty} field="specialty" options={SPECIALTIES} required />
      <Select label={t.nsFieldExperience} field="experience" options={EXPERIENCE} required />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onComplete: (mvpInterested: boolean) => void
}

// Step layout:
// 0 = personal info
// 1 = professional info
// 2..13 = questions Q1..Q12
const TOTAL_STEPS = 2 + QUESTIONS.length

export default function NurseSurveyForm({ onComplete }: Props) {
  const { t } = useLang()
  const tAny = t as Record<string, string>
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState<ValidationCard | null>(null)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [personal, setPersonal] = useState<PersonalInfo>({
    name: '', email: '', age: '', gender: '', phone: '',
  })
  const [professional, setProfessional] = useState<ProfessionalInfo>({
    hospital: '', position: '', specialty: '', experience: '', hospital_type: '',
  })
  const [answers, setAnswers] = useState<Answers>({})

  const updatePersonal = useCallback((field: keyof PersonalInfo, value: string) => {
    setPersonal((p) => ({ ...p, [field]: value }))
  }, [])
  const updateProfessional = useCallback((field: keyof ProfessionalInfo, value: string) => {
    setProfessional((p) => ({ ...p, [field]: value }))
  }, [])
  const updateAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const scheduleAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = setTimeout(() => {
      setStep((s) => {
        const nextStep = s + 1
        if (nextStep >= TOTAL_STEPS) return s
        // Check validation card after this step
        const validation = VALIDATION_CARDS.find((v) => v.afterStep === s)
        if (validation) {
          setShowValidation(validation)
          return s
        }
        setDirection(1)
        return nextStep
      })
    }, 450)
  }, [])

  const dismissValidation = () => {
    if (!showValidation) return
    setShowValidation(null)
    setDirection(1)
    setStep((s) => s + 1)
  }

  const canProceed = (): boolean => {
    if (step === 0) {
      return !!(personal.name.trim() && personal.email.includes('@') && personal.age && personal.gender)
    }
    if (step === 1) {
      return !!(professional.hospital.trim() && professional.hospital_type && professional.position && professional.specialty && professional.experience)
    }
    const q = QUESTIONS[step - 2]
    if (!q) return true
    if (!q.required) return true
    const ans = answers[q.id]
    if (q.type === 'multi_select') return Array.isArray(ans) && ans.length > 0
    if (q.type === 'single_select' || q.type === 'emoji_scale') return typeof ans === 'string' && ans !== ''
    return true
  }

  const goNext = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (!canProceed()) return
    if (step < TOTAL_STEPS - 1) {
      const validation = VALIDATION_CARDS.find((v) => v.afterStep === step)
      if (validation) {
        setShowValidation(validation)
        return
      }
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
      const combinedAnswers = {
        ...answers,
        // Embed professional info in answers JSONB
        prof_hospital: professional.hospital,
        prof_hospital_type: professional.hospital_type,
        prof_position: professional.position,
        prof_specialty: professional.specialty,
        prof_experience: professional.experience,
      }
      const res = await fetch('/api/surveys/nurses', {
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
      const mvpAnswer = answers.q12_mvp_signup
      const mvpInterested = mvpAnswer === 'yes_email' || mvpAnswer === 'yes_more_info'
      onComplete(mvpInterested)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  const currentQuestion = step >= 2 ? QUESTIONS[step - 2] : null
  const currentPhase = currentQuestion?.phase
  const phaseMeta = currentPhase ? PHASE_META[currentPhase] : null

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  }

  // Header label
  const headerLabel = (() => {
    if (step === 0) return tAny.nsPersonalTitle
    if (step === 1) return tAny.nsProfTitle
    return phaseMeta ? tAny[phaseMeta.titleKey] : ''
  })()

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <div className="max-w-lg mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <img src="/images/tuto-logo.png" alt="tuto." className="h-7 w-auto" />
          <span className="text-xs text-text-muted font-medium">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <ProgressBar current={step + 1} total={TOTAL_STEPS} />
        {headerLabel && (
          <p className="text-xs font-semibold text-text-muted mt-2 uppercase tracking-wider">
            {headerLabel}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-lg">
          {/* Validation card overlay */}
          <AnimatePresence>
            {showValidation && (
              <motion.div
                key="validation"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className={`bg-white rounded-2xl border border-border shadow-card p-6 mb-4`}
              >
                <div className={`w-14 h-14 rounded-2xl ${showValidation.bg} flex items-center justify-center mb-4`}>
                  <showValidation.icon size={26} className={showValidation.color} />
                </div>
                <p className="text-base font-semibold text-text leading-relaxed mb-5">
                  {tAny[showValidation.textKey]}
                </p>
                <button
                  onClick={dismissValidation}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  {t.nsNext}
                  <ChevronRight size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question card */}
          {!showValidation && (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              >
                <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                  {step === 0 && (
                    <>
                      <h2 className="text-lg font-bold text-text mb-1">{t.nsPersonalTitle}</h2>
                      <p className="text-sm text-text-muted mb-5">{t.nsPersonalSubtitle}</p>
                      <PersonalStep info={personal} onChange={updatePersonal} />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <h2 className="text-lg font-bold text-text mb-1">{t.nsProfTitle}</h2>
                      <p className="text-sm text-text-muted mb-5">{t.nsProfSubtitle}</p>
                      <ProfessionalStep info={professional} onChange={updateProfessional} />
                    </>
                  )}
                  {currentQuestion && currentPhase && (
                    <>
                      <PhaseChip phase={currentPhase} />
                      <h2 className="text-base font-bold text-text mb-5 leading-snug whitespace-pre-line">
                        {currentQuestion.vi}
                      </h2>

                      {currentQuestion.type === 'emoji_scale' && (
                        <EmojiScaleInput
                          question={currentQuestion}
                          value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                          onChange={(v) => updateAnswer(currentQuestion.id, v)}
                          onAutoAdvance={currentQuestion.id !== 'q12_mvp_signup' ? scheduleAutoAdvance : undefined}
                        />
                      )}
                      {currentQuestion.type === 'multi_select' && (
                        <MultiSelectInput
                          question={currentQuestion}
                          values={Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : []}
                          onChange={(v) => updateAnswer(currentQuestion.id, v)}
                        />
                      )}
                      {currentQuestion.type === 'single_select' && (
                        <SingleSelectInput
                          question={currentQuestion}
                          value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                          onChange={(v) => updateAnswer(currentQuestion.id, v)}
                          onAutoAdvance={currentQuestion.id !== 'q12_mvp_signup' ? scheduleAutoAdvance : undefined}
                        />
                      )}
                    </>
                  )}

                  {error && (
                    <p className="mt-4 text-sm text-error bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Navigation */}
          {!showValidation && (
            <div className="flex items-center gap-3 mt-5">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface transition-all"
                >
                  <ChevronLeft size={16} />
                  {t.nsBack}
                </button>
              )}
              <motion.button
                onClick={goNext}
                disabled={!canProceed() || submitting}
                className={[
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  canProceed() && !submitting
                    ? 'bg-gradient-to-r from-primary to-indigo-500 text-white shadow-md hover:shadow-lg'
                    : 'bg-surface text-text-muted border border-border cursor-not-allowed',
                ].join(' ')}
                whileTap={canProceed() && !submitting ? { scale: 0.98 } : undefined}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.nsSubmitting}
                  </>
                ) : step === TOTAL_STEPS - 1 ? (
                  <>
                    <Send size={15} />
                    {t.nsSubmit}
                  </>
                ) : (
                  <>
                    {t.nsNext}
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
