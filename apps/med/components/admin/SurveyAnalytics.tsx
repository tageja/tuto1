'use client'

import { useMemo } from 'react'
import { Printer, Users, CalendarDays, PersonStanding } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { NursedSurveyResponse } from '@/lib/supabase'

// ─── Palette ──────────────────────────────────────────────────────────────────

const PRIMARY = '#0B5FFF'
const PALETTE = ['#0B5FFF', '#3B82F6', '#6366F1', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E', '#EC4899']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countField(
  responses: NursedSurveyResponse[],
  field: string,
  labelMap: Record<string, string>,
): { name: string; count: number }[] {
  const tally: Record<string, number> = {}
  for (const r of responses) {
    const val = (r.answers as Record<string, unknown>)[field]
    const vals = Array.isArray(val) ? val : val != null ? [val] : []
    for (const v of vals) {
      const key = String(v)
      tally[key] = (tally[key] ?? 0) + 1
    }
  }
  return Object.entries(tally)
    .map(([k, count]) => ({ name: labelMap[k] ?? k, count }))
    .sort((a, b) => b.count - a.count)
}

function pct(n: number, total: number) {
  if (total === 0) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

// ─── Label maps (Vietnamese, matching question options) ───────────────────────

const MAJOR_LABELS: Record<string, string> = {
  it: 'IT / Phần mềm',
  cs_electronics: 'Điện tử / IoT',
  mechanical: 'Cơ khí / Robot',
  automotive: 'Ô tô / Năng lượng',
  business: 'Kinh tế / Logistics',
  construction: 'Xây dựng / KT',
  other: 'Khác',
}

const YEAR_LABELS: Record<string, string> = {
  y1: 'Năm 1',
  y2: 'Năm 2',
  y3: 'Năm 3',
  y4: 'Năm 4',
  ypost: 'Sau ĐH',
}

const PAIN_LABELS: Record<string, string> = {
  '0': 'Không bao giờ',
  '1': 'Hiếm khi',
  '2': 'Đôi khi',
  '3': 'Thường xuyên',
  '4': 'Luôn luôn',
}

const SITUATIONS_LABELS: Record<string, string> = {
  lectures: 'Hiểu bài giảng',
  slides: 'Đọc slide/giáo trình',
  assignments: 'Yêu cầu bài tập',
  reports: 'Viết báo cáo',
  presentations: 'Thuyết trình',
  groupwork: 'Thảo luận nhóm',
  exams: 'Đề thi',
  technical_docs: 'Tài liệu kỹ thuật',
  internship: 'Thực tập/đi làm',
  asking_class: 'Đặt câu hỏi lớp',
}

const COPING_LABELS: Record<string, string> = {
  google_translate: 'Google Dịch',
  ask_friend: 'Hỏi bạn bè',
  chatgpt: 'ChatGPT / AI',
  youtube: 'YouTube TV',
  guess: 'Đoán & tiếp tục',
  ask_teacher: 'Hỏi giảng viên',
  give_up: 'Bỏ qua',
}

const COURSE_LABELS: Record<string, string> = {
  lectures: 'Bài giảng & Slide',
  presentations: 'Thuyết trình & ĐÁ',
  workplace: 'Thực tập & Làm việc',
  writing: 'Bài tập & Viết',
  it_prog: 'IT & Lập trình',
  labs: 'Thí nghiệm & Kỹ thuật',
  exams: 'Đề thi & Câu hỏi',
  discussion: 'Thảo luận nhóm',
}

const FORMAT_LABELS: Record<string, string> = {
  micro: '5 phút / bài',
  regular: '20-30 phút',
  gamified: 'Game / Điểm',
  peer: 'Thực hành nhóm',
  mobile: 'Di động',
  laptop: 'Máy tính',
}

const WTP_LABELS: Record<string, string> = {
  try_free: 'Dùng thử miễn phí',
  maybe_try: 'Có thể thử',
  pay_low: 'Trả dưới 50k/tháng',
  pay_mid: 'Trả 100-200k/tháng',
  no_fine: 'Không cần',
  no_ai: 'AI là đủ',
}

const MOTIVATION_LABELS: Record<string, string> = {
  grades: 'Điểm cao hơn',
  job: 'Việc làm / Thực tập',
  abroad: 'Làm việc quốc tế',
  confidence: 'Tự tin nói lớp',
  writing: 'Viết tốt hơn',
  exams: 'IELTS / Sau ĐH',
  fine: 'Tôi ổn rồi',
}

const SUBJECT_SPECIFIC_LABELS: Record<string, string> = {
  yes_a_lot: 'Có — rất nhiều',
  sometimes: 'Đôi khi',
  depends: 'Tùy môn học',
  not_really: 'Không nhiều',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-card flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-primary inline-block" />
      {children}
    </h2>
  )
}

function ChartCard({ title, children, className = '' }: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-border shadow-card p-5 ${className}`}>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">{title}</p>
      {children}
    </div>
  )
}

// Horizontal bar chart with percentage labels
function HBar({ data, height = 280 }: {
  data: { name: string; count: number }[]
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 11, fill: '#666' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(v: number) => [`${v} (${pct(v, total)})`, 'Phản hồi']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Bar dataKey="count" fill={PRIMARY} radius={[0, 6, 6, 0]} barSize={18}>
          <LabelList
            dataKey="count"
            position="right"
            formatter={(v: number) => `${v} (${pct(v, total)})`}
            style={{ fontSize: 11, fill: '#888' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Vertical bar chart
function VBar({ data, height = 220 }: {
  data: { name: string; count: number }[]
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v: number) => [`${v} (${pct(v, total)})`, 'Phản hồi']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? PRIMARY : `${PRIMARY}${Math.max(40, 100 - i * 15).toString(16)}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Donut pie chart
function Donut({ data, height = 220 }: {
  data: { name: string; count: number }[]
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`${v} (${pct(v, total)})`, 'Phản hồi']}
            contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <ul className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-text">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="font-semibold text-text-muted">{pct(d.count, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  responses: NursedSurveyResponse[]
}

export default function SurveyAnalytics({ responses }: Props) {
  const n = responses.length

  // ── Aggregations ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (n === 0) return null

    // Average age
    const ages = responses.map((r) => r.age).filter((a): a is number => a != null)
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : null

    // Gender split
    const genderCount: Record<string, number> = {}
    for (const r of responses) {
      const g = r.gender ?? 'unknown'
      genderCount[g] = (genderCount[g] ?? 0) + 1
    }

    return { avgAge, genderCount }
  }, [responses, n])

  const majorData = useMemo(() => countField(responses, 'q1b_major', MAJOR_LABELS), [responses])
  const yearData = useMemo(() => {
    const raw = countField(responses, 'q1_demographics', YEAR_LABELS)
    const order = ['Năm 1', 'Năm 2', 'Năm 3', 'Năm 4', 'Sau ĐH']
    return [...raw].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  }, [responses])

  const painData = useMemo(() => {
    const raw = countField(responses, 'q2_pain_level', PAIN_LABELS)
    const order = Object.values(PAIN_LABELS)
    return [...raw].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  }, [responses])

  const subjectSpecificData = useMemo(() => countField(responses, 'q6_subject_specific', SUBJECT_SPECIFIC_LABELS), [responses])
  const wtpData = useMemo(() => countField(responses, 'q9_wtp', WTP_LABELS), [responses])
  const courseData = useMemo(() => countField(responses, 'q7_course_interest', COURSE_LABELS), [responses])
  const situationsData = useMemo(() => countField(responses, 'q3_hardest_situations', SITUATIONS_LABELS).slice(0, 7), [responses])
  const copingData = useMemo(() => countField(responses, 'q4_coping', COPING_LABELS), [responses])
  const motivationData = useMemo(() => countField(responses, 'q10_motivation', MOTIVATION_LABELS).slice(0, 6), [responses])

  const openResponses = useMemo(() =>
    responses
      .filter((r) => {
        const v = (r.answers as Record<string, unknown>).q11_open
        return typeof v === 'string' && v.trim().length > 0
      })
      .slice(-10)
      .reverse()
      .map((r) => ({
        name: r.name,
        text: String((r.answers as Record<string, unknown>).q11_open),
      })),
  [responses])

  // Gender pill bar
  const genderTotal = stats ? Object.values(stats.genderCount).reduce((s, v) => s + v, 0) : 0
  const genderParts = stats
    ? [
        { key: 'male', label: 'Nam', color: PRIMARY },
        { key: 'female', label: 'Nữ', color: '#8B5CF6' },
        { key: 'other', label: 'Khác', color: '#10B981' },
        { key: 'prefer_not', label: 'N/A', color: '#D1D5DB' },
      ].filter((g) => stats.genderCount[g.key])
    : []

  if (n === 0) {
    return (
      <section className="bg-white rounded-2xl border border-border p-8 shadow-card text-center text-text-muted text-sm">
        No data yet — analytics will appear once responses come in.
      </section>
    )
  }

  return (
    <div className="space-y-8 print:space-y-6">
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <SectionTitle>Survey Analytics</SectionTitle>
          <p className="text-xs text-text-muted -mt-3 ml-4">{n} responses collected</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface transition-all"
        >
          <Printer size={14} />
          Print / Export PDF
        </button>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Responses"
          value={String(n)}
          sub="HCMUTE Survey 2026"
        />
        <StatCard
          icon={CalendarDays}
          label="Average Age"
          value={stats?.avgAge != null ? `${stats.avgAge} yrs` : '—'}
          sub="of respondents"
        />
        <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PersonStanding size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Gender split</p>
              {/* Stacked pill bar */}
              <div className="flex rounded-full overflow-hidden h-3 mt-2 mb-2">
                {genderParts.map((g) => {
                  const w = pct(stats?.genderCount[g.key] ?? 0, genderTotal)
                  return (
                    <div key={g.key} style={{ width: w, backgroundColor: g.color }} title={`${g.label}: ${w}`} />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {genderParts.map((g) => (
                  <span key={g.key} className="text-[11px] text-text-muted flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: g.color }} />
                    {g.label} {pct(stats?.genderCount[g.key] ?? 0, genderTotal)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Respondent profile ─────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Respondent Profile</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Major / Department (Q1b)">
            <HBar data={majorData} height={majorData.length * 38 + 20} />
          </ChartCard>
          <ChartCard title="Year of Study (Q1)">
            <VBar data={yearData} height={220} />
          </ChartCard>
        </div>
      </div>

      {/* ── The Problem ────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>The Problem — How Serious Is It?</SectionTitle>
        <ChartCard title="How often do you struggle with English in your subjects? (Q2)">
          <VBar data={painData} height={240} />
          <p className="text-xs text-text-muted mt-3 text-center">
            {(() => {
              const struggling = painData.filter((d) =>
                ['Thường xuyên', 'Luôn luôn'].includes(d.name)
              ).reduce((s, d) => s + d.count, 0)
              return `${pct(struggling, n)} of respondents struggle often or always`
            })()}
          </p>
        </ChartCard>
      </div>

      {/* ── Solution validation ────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Solution Validation</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Subject-specific terminology blocks me (Q6)">
            <Donut data={subjectSpecificData} height={200} />
          </ChartCard>
          <ChartCard title="Willingness to pay (Q9)">
            <Donut data={wtpData} height={200} />
          </ChartCard>
        </div>
      </div>

      {/* ── Market interest ────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Market Interest — Courses They Would Actually Use</SectionTitle>
        <ChartCard title="Which short course would you use? (Q7 — pick top 2)">
          <HBar data={courseData} height={courseData.length * 38 + 20} />
        </ChartCard>
      </div>

      {/* ── Behaviour insights ─────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Behaviour Insights</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Hardest situations in English (Q3 — top 7)">
            <HBar data={situationsData} height={situationsData.length * 38 + 20} />
          </ChartCard>
          <ChartCard title="Top motivations to improve (Q10)">
            <HBar data={motivationData} height={motivationData.length * 38 + 20} />
          </ChartCard>
        </div>
      </div>

      {/* ── Coping methods ─────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Current Coping Methods</SectionTitle>
        <ChartCard title="What do you do when you don't understand English? (Q4)">
          <HBar data={copingData} height={copingData.length * 38 + 20} />
        </ChartCard>
      </div>

      {/* ── Open text responses ────────────────────────────────────────────── */}
      {openResponses.length > 0 && (
        <div>
          <SectionTitle>In Their Own Words (Q11)</SectionTitle>
          <div className="space-y-3">
            {openResponses.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                <p className="text-sm text-text leading-relaxed">
                  <span className="text-primary font-medium mr-1">"</span>
                  {r.text}
                  <span className="text-primary font-medium ml-1">"</span>
                </p>
                <p className="text-xs text-text-muted mt-1.5">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-only footer */}
      <div className="hidden print:block text-center text-xs text-text-muted pt-6 border-t border-border">
        tuto. Pro · HCMUTE Survey 2026 · {new Date().toLocaleDateString('en-GB')} · {n} responses
      </div>
    </div>
  )
}
