'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle,
  Users,
  Star,
  Flame,
  Mic2,
  GraduationCap,
  BookOpenCheck,
  LibraryBig,
  LogIn,
  Calendar,
  CalendarDays,
  Sparkles,
  MessageSquareQuote,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
} from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'

// ---------- Types --------------------------------------------------------

interface WeeklyPoint {
  weekStart: string
  activeLearners: number
}

interface PlatformMetrics {
  activeLearners: {
    wau: number
    mau: number
    growthWau: number
    weeklyTrend: WeeklyPoint[]
  }
  rating: {
    composite: number | null
    lessonAverage: number | null
    peerAverage: number | null
    breakdown: {
      q1_animation: number | null
      q2_variety: number | null
      q3_usefulness: number | null
      q4_confidence: number | null
      q5_continue: number | null
    }
    totalLessonFeedbackRows: number
    totalPeerReviewRows: number
  }
  engagement: {
    activeStreakPct: number
    longestStreakRecord: number
    avgSessionsPerUser: number
  }
  fastFacts: {
    totalLearners: number
    totalRecordings: number
    totalLessonsCompleted: number
    totalCoursesPublished: number
  }
  logins: {
    total: number
    thisMonth: number
    thisWeek: number
  }
  fetchedAt: string
}

// ---------- Helpers ------------------------------------------------------

/**
 * Pad the API trend to a full 12-week series.
 * The DB only returns weeks where there was activity, but the chart should
 * always show 12 bars to communicate "12-week history" — investors expect
 * a complete chart, not 3 lonely bars.
 */
function padToTwelveWeeks(trend: WeeklyPoint[]): WeeklyPoint[] {
  const map = new Map<string, number>()
  trend.forEach((p) => map.set(p.weekStart, p.activeLearners))

  const today = new Date()
  // Find Monday of the current ISO week
  const day = today.getUTCDay() === 0 ? 6 : today.getUTCDay() - 1
  const currentMonday = new Date(today)
  currentMonday.setUTCDate(today.getUTCDate() - day)
  currentMonday.setUTCHours(0, 0, 0, 0)

  const weeks: WeeklyPoint[] = []
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(currentMonday)
    d.setUTCDate(currentMonday.getUTCDate() - i * 7)
    const key = d.toISOString().slice(0, 10)
    weeks.push({ weekStart: key, activeLearners: map.get(key) ?? 0 })
  }
  return weeks
}

// ---------- Sub-components -----------------------------------------------

function SkeletonHeroCard() {
  return (
    <div className="rounded-2xl bg-white border border-border p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 bg-surface rounded w-24" />
        <div className="h-10 w-10 bg-surface rounded-xl" />
      </div>
      <div className="h-16 bg-surface rounded w-2/3 mb-3" />
      <div className="h-3 bg-surface rounded w-1/2 mb-6" />
      <div className="h-14 bg-surface rounded w-full" />
    </div>
  )
}

function SkeletonFastFact() {
  return (
    <div className="rounded-xl bg-white border border-border p-4 animate-pulse">
      <div className="h-9 w-9 bg-surface rounded-lg mb-3" />
      <div className="h-7 bg-surface rounded w-1/2 mb-2" />
      <div className="h-3 bg-surface rounded w-3/4" />
    </div>
  )
}

interface GrowthBadgeProps {
  pct: number
}
function GrowthBadge({ pct }: GrowthBadgeProps) {
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
        <TrendingUp size={13} className="shrink-0" />
        +{pct.toFixed(1)}% vs. last week
      </span>
    )
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
        <TrendingDown size={13} className="shrink-0" />
        {pct.toFixed(1)}% vs. last week
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
      <Minus size={13} className="shrink-0" />
      Steady vs. last week
    </span>
  )
}

interface IconBadgeProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  gradient: string
}
function IconBadge({ icon: Icon, gradient }: IconBadgeProps) {
  return (
    <div
      className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-md ${gradient}`}
    >
      <Icon size={22} className="text-white" />
    </div>
  )
}

interface RatingBarProps {
  label: string
  value: number | null
}
function RatingBar({ label, value }: RatingBarProps) {
  const pct = value != null ? (value / 5) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium text-text-muted w-24 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-2 bg-amber-100/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-text w-8 text-right tabular-nums">
        {value != null ? value.toFixed(1) : '—'}
      </span>
    </div>
  )
}

// ---------- Main page ----------------------------------------------------

export default function MetricsPage() {
  const { t } = useLang()
  const tAny = t as Record<string, string>
  const { role, loading: authLoading } = useAuth()
  const router = useRouter()

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (role && role !== 'super_admin') {
      router.replace('/admin')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    if (authLoading) return
    if (role !== 'super_admin') return

    fetch('/api/metrics/platform')
      .then((r) => {
        if (r.status === 403) {
          router.replace('/admin')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        if (data.error) { setError(true); return }
        setMetrics(data as PlatformMetrics)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [authLoading, role, router])

  const paddedTrend = useMemo(
    () => (metrics ? padToTwelveWeeks(metrics.activeLearners.weeklyTrend) : []),
    [metrics],
  )

  // ---------- Access denied --------------------------------------------

  if (!authLoading && role && role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">{tAny.metricsAccessDenied ?? 'This page is for super-admins only.'}</p>
        </div>
      </div>
    )
  }

  // ---------- Loading skeleton -----------------------------------------

  if (loading || authLoading) {
    return (
      <div>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="h-8 bg-surface rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-surface rounded w-72 animate-pulse" />
          </div>
          <div className="h-4 bg-surface rounded w-40 animate-pulse mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonHeroCard />
          <SkeletonHeroCard />
          <SkeletonHeroCard />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonFastFact />
          <SkeletonFastFact />
          <SkeletonFastFact />
          <SkeletonFastFact />
        </div>
      </div>
    )
  }

  // ---------- Error state ----------------------------------------------

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-text-muted">
            {tAny.metricsLoadError ?? "Couldn't load metrics. Please refresh the page."}
          </p>
          <button
            onClick={() => { setError(false); setLoading(true); setMetrics(null) }}
            className="btn-secondary mt-4 text-sm"
          >
            {t.btnRefresh}
          </button>
        </div>
      </div>
    )
  }

  const { activeLearners, rating, engagement, fastFacts, logins } = metrics

  const fetchedLabel = new Date(metrics.fetchedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const ratingBreakdown = [
    { label: tAny.metricsHeroRatingQ1 ?? 'Animation',     value: rating.breakdown.q1_animation },
    { label: tAny.metricsHeroRatingQ2 ?? 'Variety',       value: rating.breakdown.q2_variety },
    { label: tAny.metricsHeroRatingQ3 ?? 'Usefulness',    value: rating.breakdown.q3_usefulness },
    { label: tAny.metricsHeroRatingQ4 ?? 'Confidence',    value: rating.breakdown.q4_confidence },
    { label: tAny.metricsHeroRatingQ5 ?? 'Will continue', value: rating.breakdown.q5_continue },
  ]

  const footnoteSrc = (tAny.metricsHeroRatingFootnote ?? 'from {lesson} lesson surveys + {peer} peer reviews')
    .replace('{lesson}', String(rating.totalLessonFeedbackRows))
    .replace('{peer}', String(rating.totalPeerReviewRows))

  const sessionsSrc = (tAny.metricsHeroEngagementSessions ?? 'Avg. {n} active days/learner this month')
    .replace('{n}', engagement.avgSessionsPerUser.toFixed(1))

  const longestSrc = (tAny.metricsHeroEngagementLongest ?? 'Longest streak: {n} days')
    .replace('{n}', String(engagement.longestStreakRecord))

  const fastFactItems = [
    {
      label: tAny.metricsFastTotalLearners ?? 'Total learners',
      value: fastFacts.totalLearners,
      icon: GraduationCap,
      tint: 'bg-blue-50 text-blue-600',
    },
    {
      label: tAny.metricsFastTotalRecordings ?? 'Recordings submitted',
      value: fastFacts.totalRecordings,
      icon: Mic2,
      tint: 'bg-rose-50 text-rose-600',
    },
    {
      label: tAny.metricsFastTotalLessons ?? 'Lessons completed',
      value: fastFacts.totalLessonsCompleted,
      icon: BookOpenCheck,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: tAny.metricsFastTotalCourses ?? 'Courses published',
      value: fastFacts.totalCoursesPublished,
      icon: LibraryBig,
      tint: 'bg-violet-50 text-violet-600',
    },
  ]

  const ratingHasData = rating.composite != null
  const engagementHasData =
    engagement.activeStreakPct > 0 || engagement.longestStreakRecord > 0 || engagement.avgSessionsPerUser > 0

  // ---------- Full page render -----------------------------------------

  return (
    <div className="pb-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Live</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text leading-tight">
            {tAny.metricsTitle ?? 'Platform Metrics'}
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            {tAny.metricsSubtitle ?? 'Live data, refreshed every 60 seconds'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-text-muted bg-surface border border-border px-3 py-1.5 rounded-full self-start sm:self-end">
          <Sparkles size={12} className="text-primary" />
          As of {fetchedLabel}
        </div>
      </div>

      {/* Hero row — 3 large cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Hero 1 — Active Learners */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-500/5 blur-2xl" aria-hidden />
          <div className="relative flex items-start justify-between mb-4">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              {tAny.metricsHeroActiveTitle ?? 'Active Learners'}
            </p>
            <IconBadge icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
          </div>

          <div className="relative">
            <p className="text-[64px] font-extrabold text-text leading-[0.9] tabular-nums tracking-tight">
              {activeLearners.wau.toLocaleString()}
            </p>
            <p className="text-sm text-text-muted mt-1.5">
              {tAny.metricsHeroActiveWeek ?? 'Active this week'}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-text leading-none">
                {activeLearners.mau.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {tAny.metricsHeroActiveMonth ?? 'Active this month'}
              </p>
            </div>
            <GrowthBadge pct={activeLearners.growthWau} />
          </div>

          {/* Sparkline (always 12 weeks) */}
          <div className="mt-auto pt-4 border-t border-border/60">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-semibold">
              {tAny.metricsHeroActiveTrend ?? '12-week trend'}
            </p>
            <ResponsiveContainer width="100%" height={64}>
              <AreaChart data={paddedTrend} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#0B5FFF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="activeLearners"
                  stroke="#0B5FFF"
                  strokeWidth={2.5}
                  fill="url(#activeGradient)"
                  isAnimationActive
                />
                <RechartTooltip
                  cursor={{ stroke: 'rgba(11,95,255,0.25)', strokeWidth: 1 }}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    padding: '4px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v: number) => [v, 'Learners']}
                  labelFormatter={(label: string) =>
                    `Week of ${new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hero 2 — Average Rating */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/5 blur-2xl" aria-hidden />
          <div className="relative flex items-start justify-between mb-4">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              {tAny.metricsHeroRatingTitle ?? 'Average Rating'}
            </p>
            <IconBadge icon={Star} gradient="bg-gradient-to-br from-amber-400 to-amber-600" />
          </div>

          {!ratingHasData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                <MessageSquareQuote size={26} className="text-amber-500" />
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-[240px]">
                {tAny.metricsRatingEmpty ?? 'Not enough rating data yet — first ratings appear here as learners complete lessons.'}
              </p>
            </div>
          ) : (
            <>
              <div className="relative flex items-baseline gap-2 mb-1">
                <p className="text-[64px] font-extrabold text-text leading-[0.9] tabular-nums tracking-tight">
                  {rating.composite!.toFixed(2)}
                </p>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(rating.composite!) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-muted mb-5">
                {tAny.metricsHeroRatingOutOf ?? 'out of 5'} · {footnoteSrc}
              </p>

              <div className="space-y-2.5 mt-auto">
                {ratingBreakdown.map((q) => (
                  <RatingBar key={q.label} label={q.label} value={q.value} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Hero 3 — Engagement */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl" aria-hidden />
          <div className="relative flex items-start justify-between mb-4">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              {tAny.metricsHeroEngagementTitle ?? 'Engagement'}
            </p>
            <IconBadge icon={Flame} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          </div>

          {!engagementHasData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Flame size={26} className="text-emerald-500" />
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-[240px]">
                Streaks build as learners return daily — the first ones will land here soon.
              </p>
            </div>
          ) : (
            <>
              <div className="relative flex items-baseline gap-1 mb-1">
                <p className="text-[64px] font-extrabold text-text leading-[0.9] tabular-nums tracking-tight">
                  {engagement.activeStreakPct.toFixed(0)}
                </p>
                <p className="text-3xl font-bold text-text-muted">%</p>
              </div>
              <p className="text-sm text-text-muted mb-5">
                {tAny.metricsHeroEngagementStreak ?? 'Learners on a 3+ day streak'}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2.5">
                  <p className="text-lg font-bold text-emerald-700 leading-none tabular-nums">
                    {engagement.avgSessionsPerUser.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 mt-1 font-medium leading-tight">
                    Active days / learner
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50/60 border border-amber-100 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500 shrink-0" />
                    <p className="text-lg font-bold text-amber-700 leading-none tabular-nums">
                      {engagement.longestStreakRecord}
                    </p>
                  </div>
                  <p className="text-[10px] text-amber-700/80 mt-1 font-medium leading-tight">
                    Longest streak (days)
                  </p>
                </div>
              </div>
              {/* Hidden: longestSrc kept for full-text accessibility */}
              <span className="sr-only">{longestSrc}</span>
              <span className="sr-only">{sessionsSrc}</span>
            </>
          )}
        </div>
      </div>

      {/* Fast facts row */}
      <div className="mb-8">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
          {tAny.metricsFastFactsTitle ?? 'Fast facts'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fastFactItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-xl bg-white border border-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${item.tint}`}>
                  <Icon size={18} />
                </div>
                <p className="text-3xl font-bold text-text leading-none tabular-nums">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted font-medium mt-1.5">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Platform Logins row */}
      <div className="mb-2">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
          {tAny.metricsLoginTitle ?? 'Platform Logins'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <LogIn size={22} />
            </div>
            <div>
              <p className="text-3xl font-bold text-text leading-none tabular-nums">
                {logins.total.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted font-medium mt-1.5">
                {tAny.metricsLoginTotal ?? 'Total unique logins'}
              </p>
            </div>
          </div>

          {/* This month */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-3xl font-bold text-text leading-none tabular-nums">
                {logins.thisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted font-medium mt-1.5">
                {tAny.metricsLoginMonth ?? 'Unique logins this month'}
              </p>
            </div>
          </div>

          {/* This week — accent card with gradient */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white p-5 shadow-md flex items-center gap-4">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="relative h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Calendar size={22} className="text-white" />
            </div>
            <div className="relative">
              <p className="text-3xl font-bold leading-none tabular-nums">
                {logins.thisWeek.toLocaleString()}
              </p>
              <p className="text-xs text-white/85 font-medium mt-1.5">
                {tAny.metricsLoginWeek ?? 'Unique logins this week'}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-3">
          {tAny.metricsLoginNote ?? 'Based on most recent sign-in per user (pro.tuto.asia accounts only).'}
        </p>
      </div>

      {/* Footer note */}
      <p className="text-xs text-text-muted mt-8 pt-4 border-t border-border">
        {tAny.metricsFooterNote ?? 'Data refreshed every 60 seconds. All metrics aggregate across all hospitals.'}
      </p>
    </div>
  )
}
