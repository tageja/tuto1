'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, Award, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
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
  fetchedAt: string
}

// ---------- Sub-components -----------------------------------------------

function SkeletonHeroCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-surface rounded w-1/3 mb-4" />
      <div className="h-14 bg-surface rounded w-2/3 mb-2" />
      <div className="h-3 bg-surface rounded w-1/2 mb-4" />
      <div className="h-3 bg-surface rounded w-1/4 mb-6" />
      <div className="h-12 bg-surface rounded w-full" />
    </div>
  )
}

function SkeletonFastFact() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-8 bg-surface rounded w-1/2 mx-auto mb-2" />
      <div className="h-3 bg-surface rounded w-3/4 mx-auto" />
    </div>
  )
}

interface GrowthBadgeProps {
  pct: number
}
function GrowthBadge({ pct }: GrowthBadgeProps) {
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        <TrendingUp size={14} />
        +{pct.toFixed(1)}% vs. last week
      </span>
    )
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <TrendingDown size={14} />
        {pct.toFixed(1)}% vs. last week
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
      <Minus size={14} />
      No change vs. last week
    </span>
  )
}

interface RatingBarProps {
  label: string
  value: number | null
}
function RatingBar({ label, value }: RatingBarProps) {
  const pct = value != null ? (value / 5) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-text w-8 text-right">
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

  // Super-admin only — redirect hospital_admin back to /admin
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

  const { activeLearners, rating, engagement, fastFacts } = metrics

  const fetchedLabel = new Date(metrics.fetchedAt).toLocaleString()

  const ratingBreakdown = [
    { label: tAny.metricsHeroRatingQ1 ?? 'Animation',    value: rating.breakdown.q1_animation },
    { label: tAny.metricsHeroRatingQ2 ?? 'Variety',      value: rating.breakdown.q2_variety },
    { label: tAny.metricsHeroRatingQ3 ?? 'Usefulness',   value: rating.breakdown.q3_usefulness },
    { label: tAny.metricsHeroRatingQ4 ?? 'Confidence',   value: rating.breakdown.q4_confidence },
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
    { label: tAny.metricsFastTotalLearners   ?? 'Total learners',        value: fastFacts.totalLearners },
    { label: tAny.metricsFastTotalRecordings ?? 'Recordings submitted',  value: fastFacts.totalRecordings },
    { label: tAny.metricsFastTotalLessons    ?? 'Lessons completed',     value: fastFacts.totalLessonsCompleted },
    { label: tAny.metricsFastTotalCourses    ?? 'Courses published',     value: fastFacts.totalCoursesPublished },
  ]

  // ---------- Full page render -----------------------------------------

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {tAny.metricsTitle ?? 'Platform Metrics'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {tAny.metricsSubtitle ?? 'Live data, refreshed every 60 seconds'}
          </p>
        </div>
        <p className="text-xs text-text-muted mt-1 shrink-0">
          As of {fetchedLabel}
        </p>
      </div>

      {/* Hero row — 3 large cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Hero 1: Active Learners */}
        <div className="card p-6 flex flex-col">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            {tAny.metricsHeroActiveTitle ?? 'Active Learners'}
          </p>

          <p className="text-5xl font-bold text-primary leading-none mb-1">
            {activeLearners.wau.toLocaleString()}
          </p>
          <p className="text-sm text-text-muted mb-3">
            {tAny.metricsHeroActiveWeek ?? 'Active this week'}
          </p>

          <p className="text-2xl font-semibold text-text mb-1">
            {activeLearners.mau.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted mb-4">
            {tAny.metricsHeroActiveMonth ?? 'Active this month'}
          </p>

          <GrowthBadge pct={activeLearners.growthWau} />

          {/* Sparkline */}
          {activeLearners.weeklyTrend.length > 0 && (
            <div className="mt-auto pt-5">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                {tAny.metricsHeroActiveTrend ?? '12-week trend'}
              </p>
              <ResponsiveContainer width="100%" height={56}>
                <BarChart
                  data={activeLearners.weeklyTrend}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <Bar
                    dataKey="activeLearners"
                    fill="#0B5FFF"
                    opacity={0.8}
                    radius={[2, 2, 0, 0]}
                  />
                  <RechartTooltip
                    cursor={{ fill: 'rgba(11,95,255,0.08)' }}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      padding: '4px 10px',
                    }}
                    formatter={(v: number) => [v, 'Learners']}
                    labelFormatter={(label: string) =>
                      `Week of ${new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Hero 2: Average Rating */}
        <div className="card p-6 flex flex-col">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            {tAny.metricsHeroRatingTitle ?? 'Average Rating'}
          </p>

          {rating.composite == null ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-text-muted text-center leading-relaxed">
                {tAny.metricsRatingEmpty ?? 'Not enough rating data yet — first ratings appear here as learners complete lessons.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-5xl font-bold text-primary leading-none">
                  {rating.composite.toFixed(2)}
                </p>
                <p className="text-lg text-text-muted mb-1">
                  / {tAny.metricsHeroRatingOutOf ?? 'out of 5'}
                </p>
              </div>

              <p className="text-xs text-text-muted mb-4">{footnoteSrc}</p>

              {/* Per-question breakdown bars */}
              <div className="space-y-2 mt-auto">
                {ratingBreakdown.map((q) => (
                  <RatingBar key={q.label} label={q.label} value={q.value} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Hero 3: Engagement */}
        <div className="card p-6 flex flex-col">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            {tAny.metricsHeroEngagementTitle ?? 'Engagement'}
          </p>

          {engagement.activeStreakPct === 0 && engagement.longestStreakRecord === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-text-muted text-center">
                No streak data yet — learners build streaks as they return daily.
              </p>
            </div>
          ) : (
            <>
              <p className="text-5xl font-bold text-primary leading-none mb-1">
                {engagement.activeStreakPct.toFixed(0)}%
              </p>
              <p className="text-sm text-text-muted mb-5">
                {tAny.metricsHeroEngagementStreak ?? 'Learners on a 3+ day streak'}
              </p>

              <p className="text-sm text-text mb-4">
                {sessionsSrc}
              </p>

              <div className="mt-auto inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-sm font-medium">
                <Award size={16} className="text-amber-500 shrink-0" />
                {longestSrc}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fast facts row */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          {tAny.metricsFastFactsTitle ?? 'Fast facts'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fastFactItems.map((item) => (
            <div key={item.label} className="kpi-card text-center">
              <p className="text-3xl font-bold text-text">{item.value.toLocaleString()}</p>
              <p className="text-xs text-text-muted font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-text-muted mt-6 pb-2">
        {tAny.metricsFooterNote ?? 'Data refreshed every 60 seconds. All metrics aggregate across all hospitals.'}
      </p>
    </div>
  )
}
