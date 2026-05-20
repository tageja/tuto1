'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Mic,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

type PathStatus = 'live' | 'pilot' | 'interest'

type ProfessionalPath = {
  key: string
  title: string
  audience: string
  description: string
  status: PathStatus
  badge: string
  cta: string
  icon: string
  href?: string
  accent: string
  outcomes: string[]
}

type EnrollmentForm = {
  name: string
  email: string
  phone: string
  major: string
}

const FEATURED_PILOT: ProfessionalPath = {
  key: 'hcmute-technical-presentation',
  title: 'Tiếng Anh Thuyết Trình Dự Án Kỹ Thuật',
  audience: 'Dành cho sinh viên HCMUTE và sinh viên khối kỹ thuật',
  description:
    'Luyện nói theo từng tình huống thật: giới thiệu đề tài, giải thích quy trình, demo kết quả và trả lời câu hỏi của giảng viên.',
  status: 'pilot',
  badge: 'Đang mở đăng ký pilot',
  cta: 'Đăng ký pilot miễn phí',
  icon: '🎓',
  accent: 'from-blue-600 to-indigo-600',
  outcomes: ['Mở đầu bài thuyết trình tự tin', 'Giải thích ý tưởng kỹ thuật rõ ràng', 'Trả lời câu hỏi mà không bị khựng'],
}

const LIVE_PATH: ProfessionalPath = {
  key: 'emergency-nursing-communication',
  title: 'Emergency Nursing Communication',
  audience: 'Dành cho điều dưỡng giao tiếp trong bệnh viện',
  description:
    'Khóa học đang live với các tình huống cấp cứu, khai thác triệu chứng, trấn an bệnh nhân và bàn giao lâm sàng.',
  status: 'live',
  badge: 'Đang học được ngay',
  cta: 'Vào khóa học',
  icon: '🩺',
  href: '/learn/courses/emergency-nursing-communication',
  accent: 'from-rose-500 to-red-600',
  outcomes: ['Giao tiếp với bệnh nhân', 'Shadow hội thoại cấp cứu', 'Ghi âm câu trả lời của bạn'],
}

const FUTURE_PATHS: ProfessionalPath[] = [
  {
    key: 'internship-interview-english',
    title: 'Tiếng Anh Phỏng Vấn Thực Tập',
    audience: 'Dành cho sinh viên chuẩn bị đi thực tập',
    description: 'Luyện giới thiệu bản thân, nói về kỹ năng, dự án đã làm và trả lời câu hỏi phỏng vấn phổ biến.',
    status: 'interest',
    badge: 'Đang đo nhu cầu',
    cta: 'Tôi muốn học khóa này',
    icon: '💼',
    accent: 'from-amber-500 to-orange-500',
    outcomes: ['Self-introduction', 'Nói về project', 'Trả lời HR/supervisor'],
  },
  {
    key: 'engineering-lab-communication',
    title: 'Tiếng Anh Giao Tiếp Phòng Lab',
    audience: 'Dành cho sinh viên kỹ thuật, cơ khí, điện tử, xây dựng',
    description: 'Thực hành mô tả thiết bị, quy trình thí nghiệm, lỗi kỹ thuật và kết quả đo đạc bằng tiếng Anh.',
    status: 'interest',
    badge: 'Đang đo nhu cầu',
    cta: 'Tôi muốn học khóa này',
    icon: '⚙️',
    accent: 'from-slate-700 to-slate-900',
    outcomes: ['Mô tả quy trình', 'Báo cáo lỗi', 'Giải thích kết quả'],
  },
  {
    key: 'workplace-communication',
    title: 'Tiếng Anh Công Sở Cho Fresher',
    audience: 'Dành cho sinh viên mới đi làm',
    description: 'Luyện họp ngắn, hỏi lại khi chưa hiểu, cập nhật tiến độ và trao đổi với đồng nghiệp bằng tiếng Anh.',
    status: 'interest',
    badge: 'Đang đo nhu cầu',
    cta: 'Tôi muốn học khóa này',
    icon: '🤝',
    accent: 'from-emerald-500 to-teal-600',
    outcomes: ['Daily update', 'Hỏi lại lịch sự', 'Trao đổi với team'],
  },
]

const LEARNING_LOOP = [
  { icon: PlayCircle, title: 'Xem tình huống mẫu', desc: 'Hiểu bối cảnh trước khi luyện nói.' },
  { icon: Mail, title: 'Đọc song ngữ Anh - Việt', desc: 'Nắm ý và cụm từ quan trọng.' },
  { icon: Sparkles, title: 'Shadow giọng mẫu', desc: 'Nghe chậm, lặp lại từng câu.' },
  { icon: Mic, title: 'Ghi âm câu trả lời', desc: 'Tập nói như tình huống thật.' },
]

const INITIAL_FORM: EnrollmentForm = {
  name: '',
  email: '',
  phone: '',
  major: '',
}

export default function Home() {
  const [selectedPath, setSelectedPath] = useState<ProfessionalPath | null>(null)
  const [form, setForm] = useState<EnrollmentForm>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedPathKey, setSubmittedPathKey] = useState<string | null>(null)

  const openEnrollment = (path: ProfessionalPath) => {
    setSelectedPath(path)
    setSubmitError('')
  }

  const closeEnrollment = () => {
    setSelectedPath(null)
    setForm(INITIAL_FORM)
    setSubmitError('')
  }

  const updateForm = (field: keyof EnrollmentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitEnrollment = async () => {
    if (!selectedPath || submitting) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pilot_interest',
          courseKey: selectedPath.key,
          courseTitle: selectedPath.title,
          intent: selectedPath.status === 'pilot' ? 'pilot' : 'interest',
          source: 'homepage_professional_paths',
          ...form,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? 'Không thể lưu đăng ký. Vui lòng thử lại.')
      }

      setSubmittedPathKey(selectedPath.key)
      closeEnrollment()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu đăng ký. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[var(--text)]">
      <LandingNav />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full bg-purple-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-24 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Tiếng Anh cho tình huống nghề nghiệp thật
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl md:leading-[1.08]">
                Chọn lộ trình tiếng Anh theo nghề nghiệp của bạn.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                Tuto Pro không dạy tiếng Anh chung chung. Mỗi khóa học là một chuỗi tình huống thật để bạn nghe mẫu, shadow từng câu và ghi âm câu trả lời của mình.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => openEnrollment(FEATURED_PILOT)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  Đăng ký pilot HCMUTE
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/learn/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Xem khóa đang live
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-blue-900/10 backdrop-blur">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Featured Pilot</p>
                    <h2 className="mt-1 text-xl font-bold">HCMUTE Project Q&A</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">200 suất đầu</span>
                </div>

                <div className="space-y-3">
                  {['Giới thiệu đề tài trong 60 giây', 'Giải thích quy trình kỹ thuật', 'Trả lời câu hỏi của giảng viên'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      <span className="text-sm text-white/90">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-blue-500/15 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
                    <Mic className="h-4 w-4" />
                    Audio shadow là trọng tâm
                  </div>
                  <p className="text-sm leading-6 text-white/75">
                    Sinh viên nghe giọng mẫu chậm, lặp lại từng cụm, rồi ghi âm câu trả lời như đang thuyết trình thật.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Professional English Paths</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Học theo mục tiêu nghề nghiệp, không học lan man.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Khóa live có thể học ngay. Khóa pilot và khóa đang đo nhu cầu chỉ dùng để đăng ký, không gây nhầm lẫn là đã có nội dung hoàn chỉnh.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <PathCard path={LIVE_PATH} onEnroll={openEnrollment} submitted={submittedPathKey === LIVE_PATH.key} />
              <FeaturedPilotCard path={FEATURED_PILOT} onEnroll={openEnrollment} submitted={submittedPathKey === FEATURED_PILOT.key} />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Bạn muốn khóa nào tiếp theo?</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Bình chọn bằng cách đăng ký quan tâm.</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Chúng tôi sẽ ưu tiên xây khóa có nhiều sinh viên đăng ký nhất và phản hồi rõ ràng nhất.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FUTURE_PATHS.map((path) => (
                <PathCard key={path.key} path={path} onEnroll={openEnrollment} submitted={submittedPathKey === path.key} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-xl md:grid-cols-[0.85fr_1.15fr] md:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Cách học trong mỗi bài</p>
                <h2 className="mt-2 text-3xl font-extrabold">Một vòng luyện nói rõ ràng, dễ lặp lại.</h2>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  Thiết kế này giữ đúng bản chất của Tuto Pro: tình huống thật, hội thoại mẫu, shadow và ghi âm, thay vì bài ngữ pháp dài.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {LEARNING_LOOP.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <Icon className="mb-3 h-5 w-5 text-blue-200" />
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/65">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {selectedPath && (
        <EnrollmentModal
          path={selectedPath}
          form={form}
          submitting={submitting}
          error={submitError}
          onClose={closeEnrollment}
          onSubmit={submitEnrollment}
          onChange={updateForm}
        />
      )}
    </div>
  )
}

function PathCard({
  path,
  onEnroll,
  submitted,
}: {
  path: ProfessionalPath
  onEnroll: (path: ProfessionalPath) => void
  submitted: boolean
}) {
  const isLive = path.status === 'live'

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent} text-2xl shadow-lg shadow-slate-900/10`}>
          {path.icon}
        </div>
        <StatusBadge status={path.status} label={path.badge} />
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{path.audience}</p>
      <h3 className="text-xl font-extrabold leading-tight text-slate-950">{path.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{path.description}</p>

      <div className="my-5 space-y-2 border-y border-slate-100 py-4">
        {path.outcomes.map((outcome) => (
          <div key={outcome} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {outcome}
          </div>
        ))}
      </div>

      {isLive && path.href ? (
        <Link
          href={path.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          {path.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          onClick={() => onEnroll(path)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          {submitted ? 'Đã ghi nhận' : path.cta}
          {submitted ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      )}
    </article>
  )
}

function FeaturedPilotCard({
  path,
  onEnroll,
  submitted,
}: {
  path: ProfessionalPath
  onEnroll: (path: ProfessionalPath) => void
  submitted: boolean
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-2xl shadow-blue-900/20 md:p-8">
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/15 blur-3xl" />
      <div className="relative grid h-full gap-8 md:grid-cols-[1fr_0.85fr]">
        <div>
          <StatusBadge status={path.status} label={path.badge} inverted />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-blue-100">Featured Pilot</p>
          <h3 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{path.title}</h3>
          <p className="mt-4 text-sm leading-7 text-blue-50/85">{path.description}</p>

          <button
            onClick={() => onEnroll(path)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50"
          >
            {submitted ? 'Đã ghi nhận đăng ký' : path.cta}
            {submitted ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">{path.icon}</div>
            <div>
              <p className="text-sm font-bold">10 phút đầu tiên phải hữu ích</p>
              <p className="text-xs text-blue-100">Không lý thuyết dài dòng</p>
            </div>
          </div>
          <div className="space-y-3">
            {path.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-2xl bg-white/10 p-3 text-sm text-white/90">
                {outcome}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ status, label, inverted = false }: { status: PathStatus; label: string; inverted?: boolean }) {
  const styles = {
    live: inverted ? 'bg-emerald-300/20 text-emerald-50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pilot: inverted ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border-blue-200',
    interest: inverted ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

function EnrollmentModal({
  path,
  form,
  submitting,
  error,
  onClose,
  onSubmit,
  onChange,
}: {
  path: ProfessionalPath
  form: EnrollmentForm
  submitting: boolean
  error: string
  onClose: () => void
  onSubmit: () => void
  onChange: (field: keyof EnrollmentForm, value: string) => void
}) {
  const isPilot = path.status === 'pilot'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
              {isPilot ? 'Đăng ký pilot' : 'Đăng ký quan tâm'}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{path.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Điền thông tin để Tuto Pro mời bạn khi khóa học sẵn sàng.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Họ và tên</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input
              value={form.email}
              onChange={(event) => onChange('email', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="you@email.com"
              type="email"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Số điện thoại/Zalo</span>
              <input
                value={form.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Không bắt buộc"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Ngành học / công việc</span>
              <input
                value={form.major}
                onChange={(event) => onChange('major', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="VD: IT, Cơ khí"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Để sau
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !form.name.trim() || !form.email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Gửi đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}
