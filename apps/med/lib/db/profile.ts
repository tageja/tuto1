import { getServiceClient } from '../supabase'
import { getUserStarBalance, getEarnedRewards, getAllRewardDefinitions, getUserRedemptions } from './rewards'
import { getUserProgressSummary } from './progress'
import { computeStreak } from '../rewards-engine'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfileHospital = { id: string; name: string } | null

export type ProfileBadge = {
  id: string
  name: string
  name_vi: string | null
  icon: string | null
  points: number
  earned_at: string
}

export type BadgeDefinition = {
  id: string
  name: string
  name_vi: string | null
  icon: string | null
  points: number
}

export type CourseInProgress = {
  courseId: string
  courseTitle: string
  moduleTitle: string | null
  lessonTitle: string | null
  completionPct: number
  lastActive: string | null
}

export type CourseCompleted = {
  courseId: string
  courseTitle: string
  completedAt: string | null
}

export type RecentRedemption = {
  couponName: string
  brand: string | null
  starsSpent: number
  couponCode: string | null
  redeemedAt: string | null
}

export type GroupJoined = {
  id: string
  name: string | null
  memberCount: number
}

export type EndorsementReceived = {
  from_name: string | null
  message: string
  created_at: string
}

export type ProfileAggregate = {
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
    position: string | null
    date_of_birth: string | null
    bio: string | null
    role: string
    learning_intensity: 'mini' | 'deep' | null
    preferred_days: 'everyday' | 'weekdays' | 'weekends' | null
    onboarding_done: boolean
    created_at: string
    hospital: ProfileHospital
  }
  stats: {
    starBalance: number
    starsEarned: number
    starsSpent: number
    streak: number
    lessonsCompleted: number
  }
  badges: ProfileBadge[]
  allBadgeDefinitions: BadgeDefinition[]
  earnedBadgeIds: string[]
  coursesInProgress: CourseInProgress[]
  coursesCompleted: CourseCompleted[]
  recentRedemptions: RecentRedemption[]
  groupsJoined: GroupJoined[]
  endorsementsReceived: EndorsementReceived[]
}

export type ProfilePatch = {
  full_name?: string
  position?: string
  date_of_birth?: string
  bio?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getGroupsJoined(userId: string): Promise<GroupJoined[]> {
  const db = getServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await db
    .from('nursed_pair_members')
    .select('pair_group_id, nursed_pair_groups(id, name)')
    .eq('user_id', userId) as { data: Array<{ pair_group_id: string; nursed_pair_groups: { id: string; name: string | null } | null }> | null; error: unknown }

  if (error || !data) return []

  const groupIds = data.map(m => m.pair_group_id).filter(Boolean)
  if (groupIds.length === 0) return []

  const { data: memberCounts } = await db
    .from('nursed_pair_members')
    .select('pair_group_id')
    .in('pair_group_id', groupIds)

  const countMap: Record<string, number> = {}
  for (const m of memberCounts ?? []) {
    countMap[m.pair_group_id] = (countMap[m.pair_group_id] ?? 0) + 1
  }

  return data.map(m => ({
    id: m.pair_group_id,
    name: m.nursed_pair_groups?.name ?? null,
    memberCount: countMap[m.pair_group_id] ?? 1,
  }))
}

async function getEndorsementsReceived(userId: string): Promise<EndorsementReceived[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_endorsements')
    .select('message, created_at, nursed_profiles!from_user_id(full_name)')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false }) as {
      data: Array<{ message: string; created_at: string; nursed_profiles: { full_name: string | null } | Array<{ full_name: string | null }> | null }> | null
      error: unknown
    }

  if (error || !data) return []

  return data.map(e => {
    const profileRef = e.nursed_profiles
    const fromName = Array.isArray(profileRef)
      ? (profileRef[0]?.full_name ?? null)
      : (profileRef?.full_name ?? null)
    return {
      from_name: fromName,
      message: e.message,
      created_at: e.created_at,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCourseProgress(progressRows: any[]) {
  if (!progressRows) return { inProgress: [] as CourseInProgress[], completed: [] as CourseCompleted[] }

  // Group by course
  const courseMap = new Map<string, {
    courseId: string
    courseTitle: string
    lessons: Array<{ completed: boolean; lastActive: string | null; lessonTitle: string; moduleTitle: string }>
  }>()

  for (const row of progressRows) {
    const lesson = row.nursed_lessons as { title: string; module_id: string; nursed_modules: { title: string; course_id: string } | null } | null
    if (!lesson?.nursed_modules) continue

    const courseId = lesson.nursed_modules.course_id
    const courseTitle = lesson.nursed_modules.title // best we can get without joining courses
    const moduleTitle = lesson.nursed_modules.title

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, { courseId, courseTitle, lessons: [] })
    }

    courseMap.get(courseId)!.lessons.push({
      completed: row.completed ?? false,
      lastActive: row.last_active ?? null,
      lessonTitle: lesson.title,
      moduleTitle,
    })
  }

  const inProgress: CourseInProgress[] = []
  const completed: CourseCompleted[] = []

  for (const course of courseMap.values()) {
    const total = course.lessons.length
    const done = course.lessons.filter(l => l.completed).length
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0
    const lastActiveDates = course.lessons.map(l => l.lastActive).filter(Boolean) as string[]
    const lastActive = lastActiveDates.length > 0
      ? lastActiveDates.sort().reverse()[0]
      : null

    const lastLesson = course.lessons.find(l => !l.completed) ?? course.lessons[course.lessons.length - 1]

    if (done === total && total > 0) {
      completed.push({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        completedAt: lastActive,
      })
    } else {
      inProgress.push({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        moduleTitle: lastLesson?.moduleTitle ?? null,
        lessonTitle: lastLesson?.lessonTitle ?? null,
        completionPct,
        lastActive,
      })
    }
  }

  return { inProgress, completed }
}

// ─── Safe wrapper — never throws, returns fallback on error ───────────────────

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getFullProfile(userId: string): Promise<ProfileAggregate> {
  const db = getServiceClient()

  const profileRes = await db
    .from('nursed_profiles')
    .select('*, nursed_hospitals(id, name)')
    .eq('id', userId)
    .single()

  if (profileRes.error) {
    // Authenticated user without a nursed_profiles row — avoid crashing /learn/profile.
    if (profileRes.error.code === 'PGRST116') {
      return {
        profile: {
          id: userId,
          full_name: null,
          avatar_url: null,
          position: null,
          date_of_birth: null,
          bio: null,
          role: 'learner',
          learning_intensity: null,
          preferred_days: null,
          onboarding_done: false,
          created_at: new Date().toISOString(),
          hospital: null,
        },
        stats: {
          starBalance: 0,
          starsEarned: 0,
          starsSpent: 0,
          streak: 0,
          lessonsCompleted: 0,
        },
        badges: [],
        allBadgeDefinitions: [],
        earnedBadgeIds: [],
        coursesInProgress: [],
        coursesCompleted: [],
        recentRedemptions: [],
        groupsJoined: [],
        endorsementsReceived: [],
      }
    }
    throw profileRes.error
  }
  const p = profileRes.data

  const [
    balance,
    streak,
    earnedRewards,
    allDefs,
    progressRows,
    redemptions,
    groups,
    endorsements,
  ] = await Promise.all([
    safe(() => getUserStarBalance(userId), { earned: 0, spent: 0, balance: 0 }),
    safe(() => computeStreak(userId), 0),
    safe(() => getEarnedRewards(userId), []),
    safe(() => getAllRewardDefinitions(), []),
    safe(() => getUserProgressSummary(userId), []),
    safe(() => getUserRedemptions(userId), []),
    getGroupsJoined(userId),
    getEndorsementsReceived(userId),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawHospital = p.nursed_hospitals as any
  const hospital: ProfileHospital = rawHospital
    ? { id: rawHospital.id as string, name: rawHospital.name as string }
    : null

  const badges: ProfileBadge[] = earnedRewards
    .filter(r => r.reward != null)
    .map(r => ({
      id: r.reward_id,
      name: r.reward.name,
      name_vi: r.reward.name_vi ?? null,
      icon: r.reward.icon ?? null,
      points: r.points ?? r.reward.points,
      earned_at: r.earned_at,
    }))

  const allBadgeDefinitions: BadgeDefinition[] = allDefs.map(d => ({
    id: d.id,
    name: d.name,
    name_vi: d.name_vi ?? null,
    icon: d.icon ?? null,
    points: d.points,
  }))

  const earnedBadgeIds = earnedRewards.filter(r => r.reward != null).map(r => r.reward_id)

  const { inProgress: coursesInProgress, completed: coursesCompleted } = buildCourseProgress(progressRows ?? [])

  const lessonsCompleted = (progressRows ?? []).filter(r => r.completed).length

  const recentRedemptions: RecentRedemption[] = (redemptions ?? []).slice(0, 5).map((r: {
    stars_spent: number
    coupon_code: string | null
    redeemed_at: string | null
    nursed_coupons: { name: string; brand: string | null } | null
  }) => ({
    couponName: r.nursed_coupons?.name ?? 'Unknown',
    brand: r.nursed_coupons?.brand ?? null,
    starsSpent: r.stars_spent,
    couponCode: r.coupon_code ?? null,
    redeemedAt: r.redeemed_at ?? null,
  }))

  return {
    profile: {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      position: p.position ?? null,
      date_of_birth: p.date_of_birth ?? null,
      bio: p.bio ?? null,
      role: p.role,
      learning_intensity: p.learning_intensity,
      preferred_days: p.preferred_days,
      onboarding_done: p.onboarding_done,
      created_at: p.created_at,
      hospital,
    },
    stats: {
      starBalance: balance.balance,
      starsEarned: balance.earned,
      starsSpent: balance.spent,
      streak,
      lessonsCompleted,
    },
    badges,
    allBadgeDefinitions,
    earnedBadgeIds,
    coursesInProgress,
    coursesCompleted,
    recentRedemptions,
    groupsJoined: groups,
    endorsementsReceived: endorsements,
  }
}

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<void> {
  const db = getServiceClient()
  const { error } = await db
    .from('nursed_profiles')
    .update(patch)
    .eq('id', userId)
  if (error) throw error
}
