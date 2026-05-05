import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import {
  createSupabaseServerClient,
  createSupabaseServiceServerClient,
} from '@/lib/supabase-server'

// ---------- Types --------------------------------------------------------

interface WeeklyPoint {
  weekStart: string
  activeLearners: number
}

interface RawMetrics {
  activeLearners: {
    wau: number
    mau: number
    growthWau: number
    weeklyTrend: WeeklyPoint[]
  }
  rating: {
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
}

// ---------- Cached data fetcher ------------------------------------------
// Revalidates every 60 seconds — safe for investor/pitch-meeting use.
// Auth check happens per-request BEFORE calling this.

const fetchPlatformMetrics = unstable_cache(
  async (): Promise<RawMetrics> => {
    const db = await createSupabaseServiceServerClient()
    const { data, error } = await db.rpc('nursed_get_platform_metrics')
    if (error) throw new Error(`metrics rpc: ${error.message}`)
    return data as RawMetrics
  },
  ['platform-metrics'],
  { revalidate: 60, tags: ['platform-metrics'] },
)

// ---------- Route handler ------------------------------------------------

export async function GET() {
  // 1. Auth: session client (respects cookies, no RLS bypass)
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Role gate: super_admin ONLY (hospital_admin → 403)
  const { data: profile } = await supabase
    .from('nursed_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Fetch metrics (cached 60 s)
  try {
    const raw = await fetchPlatformMetrics()

    // Composite rating: mean of lesson + peer; gracefully handles missing data
    const lessonAvg = raw.rating.lessonAverage ?? 0
    const peerAvg = raw.rating.peerAverage ?? 0
    const hasLesson = raw.rating.totalLessonFeedbackRows > 0
    const hasPeer = raw.rating.totalPeerReviewRows > 0

    let composite: number | null = null
    if (hasLesson && hasPeer) {
      composite = Math.round(((lessonAvg + peerAvg) / 2) * 100) / 100
    } else if (hasLesson) {
      composite = lessonAvg
    } else if (hasPeer) {
      composite = peerAvg
    }

    return NextResponse.json({
      ...raw,
      rating: { ...raw.rating, composite },
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[api/metrics/platform]', err)
    return NextResponse.json(
      { error: 'Failed to load metrics' },
      { status: 500 },
    )
  }
}
