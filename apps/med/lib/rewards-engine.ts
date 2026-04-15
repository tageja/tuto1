/**
 * Server-side rewards engine.
 * All streak and reward logic lives here — never on the client.
 */

import { getServiceClient } from './supabase'
import { DAILY_STAR_CAP, VN_TIMEZONE, type RewardAction } from './rewards-config'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EarnedReward = {
  id: string
  name: string
  name_vi: string | null
  icon: string | null
  points: number
  rule_type: string
}

type RewardRule = {
  id: string
  name: string
  name_vi: string | null
  icon: string | null
  points: number
  rule_type: string
  rule_config: Record<string, unknown>
}

// ─── Streak computation ───────────────────────────────────────────────────────

/**
 * Computes the current streak for a user.
 * Streak = count of consecutive calendar days (Vietnam UTC+7) where the user
 * completed at least one lesson, counted back from today.
 *
 * Returns 0 if no activity, or if the last activity was before yesterday
 * (streak is broken).
 */
export async function computeStreak(userId: string): Promise<number> {
  const db = getServiceClient()

  const { data, error } = await db
    .from('nursed_progress')
    .select('last_active')
    .eq('user_id', userId)
    .eq('completed', true)
    .not('last_active', 'is', null)
    .order('last_active', { ascending: false })

  if (error || !data || data.length === 0) return 0

  // Convert timestamps to VN calendar dates (YYYY-MM-DD)
  const toVnDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE }) // en-CA gives YYYY-MM-DD
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
  })()

  // Collect unique activity dates, sorted descending
  const uniqueDates = [...new Set(data.map(r => toVnDate(r.last_active!)))].sort().reverse()

  if (uniqueDates.length === 0) return 0

  // If the most recent activity day is neither today nor yesterday, streak is 0
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0

  // Count consecutive days
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00')
    const curr = new Date(uniqueDates[i] + 'T00:00:00')
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// ─── Today's completed lessons count (VN timezone) ───────────────────────────

export async function getTodayLessonsCompleted(userId: string): Promise<number> {
  const db = getServiceClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
  const todayStart = new Date(today + 'T00:00:00+07:00').toISOString()
  const todayEnd   = new Date(today + 'T23:59:59+07:00').toISOString()

  const { data } = await db
    .from('nursed_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('last_active', todayStart)
    .lte('last_active', todayEnd)

  return data?.length ?? 0
}

// ─── Daily star total ────────────────────────────────────────────────────────

async function getTodayStarsEarned(userId: string): Promise<number> {
  const db = getServiceClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
  const todayStart = new Date(today + 'T00:00:00+07:00').toISOString()

  const { data } = await db
    .from('nursed_user_rewards')
    .select('points')
    .eq('user_id', userId)
    .gte('earned_at', todayStart)

  return data?.reduce((sum, r) => sum + (r.points ?? 0), 0) ?? 0
}

// ─── Reward granting ─────────────────────────────────────────────────────────

/**
 * Checks and grants all applicable rewards for the given action.
 * Returns the list of newly-earned reward objects.
 */
export async function checkAndGrantRewards(
  userId: string,
  action: RewardAction,
  context?: {
    lessonId?: string
    moduleId?: string
    courseId?: string
    quizScore?: number
    streak?: number
  },
): Promise<EarnedReward[]> {
  const db = getServiceClient()

  // Load all reward rules matching this action's relevant rule_types
  const relevantTypes = getRuleTypesForAction(action)
  const { data: rules, error } = await db
    .from('nursed_rewards')
    .select('id, name, name_vi, icon, points, rule_type, rule_config')
    .in('rule_type', relevantTypes)

  if (error || !rules) return []

  const todayStars = await getTodayStarsEarned(userId)
  const remainingCap = DAILY_STAR_CAP - todayStars
  if (remainingCap <= 0) return []

  const streak = context?.streak ?? (action === 'lesson_complete' ? await computeStreak(userId) : 0)
  const todayCount = context?.lessonId ? await getTodayLessonsCompleted(userId) : 0

  const justEarned: EarnedReward[] = []
  let starsGrantedThisCall = 0

  for (const rule of rules as RewardRule[]) {
    if (starsGrantedThisCall >= remainingCap) break

    const eligible = await isEligible(userId, rule, action, {
      ...context,
      streak,
      todayCount,
    })
    if (!eligible) continue

    const contextId = buildContextId(rule, action, context)
    const pointsToGrant = Math.min(rule.points, remainingCap - starsGrantedThisCall)

    const { error: insertError } = await db
      .from('nursed_user_rewards')
      .insert({
        user_id: userId,
        reward_id: rule.id,
        points: pointsToGrant,
        context_id: contextId ?? null,
        earned_at: new Date().toISOString(),
      })

    if (!insertError) {
      justEarned.push({
        id: rule.id,
        name: rule.name,
        name_vi: rule.name_vi,
        icon: rule.icon,
        points: pointsToGrant,
        rule_type: rule.rule_type,
      })
      starsGrantedThisCall += pointsToGrant
    }
    // Unique constraint violation = already earned for this context → skip silently
  }

  return justEarned
}

// ─── Eligibility checks ───────────────────────────────────────────────────────

async function isEligible(
  userId: string,
  rule: RewardRule,
  action: RewardAction,
  context: {
    lessonId?: string
    moduleId?: string
    courseId?: string
    quizScore?: number
    streak?: number
    todayCount?: number
  },
): Promise<boolean> {
  const cfg = rule.rule_config as Record<string, unknown>

  switch (rule.rule_type) {
    case 'lesson_complete':
      return action === 'lesson_complete'

    case 'module_complete':
      return action === 'module_complete'

    case 'course_complete':
      return action === 'course_complete'

    case 'daily_double':
      // Grant when this is the 2nd completed lesson today
      return action === 'lesson_complete' && (context.todayCount ?? 0) >= 2

    case 'streak': {
      const requiredDays = cfg.days as number
      return (context.streak ?? 0) >= requiredDays
    }

    case 'quiz_score': {
      const minScore = cfg.min_score as number
      return action === 'quiz_complete' && (context.quizScore ?? 0) >= minScore
    }

    case 'recording':
      return action === 'recording_submit'

    case 'pair_session':
      return action === 'peer_review'

    case 'feedback':
      return action === 'feedback_submit'

    default:
      return false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRuleTypesForAction(action: RewardAction): string[] {
  switch (action) {
    case 'lesson_complete':  return ['lesson_complete', 'daily_double', 'streak']
    case 'module_complete':  return ['module_complete']
    case 'course_complete':  return ['course_complete']
    case 'recording_submit': return ['recording']
    case 'peer_review':      return ['pair_session']
    case 'feedback_submit':  return ['feedback']
    case 'quiz_complete':    return ['quiz_score']
    default:                 return []
  }
}

function buildContextId(
  rule: RewardRule,
  action: RewardAction,
  context?: {
    lessonId?: string
    moduleId?: string
    courseId?: string
    quizScore?: number
    streak?: number
  },
): string | null {
  // Repeatable per-lesson rewards use lessonId as context so the same lesson
  // can't be counted twice, but different lessons each grant a reward.
  switch (rule.rule_type) {
    case 'lesson_complete':  return context?.lessonId ?? null
    case 'module_complete':  return context?.moduleId ?? null
    case 'course_complete':  return context?.courseId ?? null
    case 'quiz_score':       return context?.lessonId ?? null
    case 'recording':        return context?.lessonId ?? null
    // One-time milestone rewards (streak, first X) use null so UNIQUE prevents duplicates
    case 'streak':           return `streak_${(rule.rule_config as Record<string, unknown>).days}`
    case 'daily_double': {
      // Once per calendar day
      const today = new Date().toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
      return `daily_double_${today}`
    }
    default:                 return null
  }
}
