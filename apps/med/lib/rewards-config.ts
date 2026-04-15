/**
 * Centralized rewards configuration — single source of truth for all star values.
 * Components and API routes must import from here; never hardcode star values elsewhere.
 *
 * Star economy rationale:
 *  - A learner doing 1 lesson/day earns ~10 stars/day base.
 *  - With streak bonuses they can earn 15–20 stars/day.
 *  - Shopee voucher (200 ⭐) ≈ 10 days of practice.
 *  - Highland Coffee (500 ⭐) ≈ 1 month of daily practice — aspirational but reachable.
 *  - Daily cap of 60 stars prevents gaming on weekends.
 */

export type RewardRuleType =
  | 'lesson_complete'
  | 'streak'
  | 'recording'
  | 'quiz_score'
  | 'pair_session'
  | 'module_complete'
  | 'course_complete'
  | 'daily_double'
  | 'feedback'

export interface RewardMoment {
  stars: number
  /** true = can be earned multiple times (once per unique context_id) */
  repeatable: boolean
  ruleType: RewardRuleType
  /** used for streak milestone checks */
  config?: Record<string, unknown>
  description: string
}

export const REWARD_MOMENTS = {
  LESSON_COMPLETE:   { stars: 10,  repeatable: true,  ruleType: 'lesson_complete', description: 'Complete a lesson' },
  MODULE_COMPLETE:   { stars: 50,  repeatable: true,  ruleType: 'module_complete', description: 'Complete all lessons in a module' },
  COURSE_COMPLETE:   { stars: 200, repeatable: true,  ruleType: 'course_complete', description: 'Complete an entire course' },
  DAILY_DOUBLE:      { stars: 15,  repeatable: true,  ruleType: 'daily_double',    description: '2 lessons in one day' },
  STREAK_3:          { stars: 30,  repeatable: false, ruleType: 'streak',          config: { days: 3  }, description: '3-day streak' },
  STREAK_7:          { stars: 70,  repeatable: false, ruleType: 'streak',          config: { days: 7  }, description: '7-day streak' },
  STREAK_14:         { stars: 150, repeatable: false, ruleType: 'streak',          config: { days: 14 }, description: '14-day streak' },
  STREAK_30:         { stars: 500, repeatable: false, ruleType: 'streak',          config: { days: 30 }, description: '30-day streak' },
  QUIZ_90:           { stars: 25,  repeatable: true,  ruleType: 'quiz_score',      config: { min_score: 90  }, description: 'Score 90%+ on a quiz' },
  QUIZ_100:          { stars: 50,  repeatable: true,  ruleType: 'quiz_score',      config: { min_score: 100 }, description: 'Score 100% on a quiz' },
  RECORDING_SUBMIT:  { stars: 15,  repeatable: true,  ruleType: 'recording',       description: 'Submit an audio recording' },
  PEER_REVIEW:       { stars: 10,  repeatable: true,  ruleType: 'pair_session',    description: 'Review a group member recording' },
  FEEDBACK_SUBMIT:   { stars: 5,   repeatable: true,  ruleType: 'feedback',        description: 'Submit app feedback' },
} as const satisfies Record<string, RewardMoment>

/** Maximum stars a user can earn in a single calendar day (UTC+7). Prevents weekend gaming. */
export const DAILY_STAR_CAP = 60

/** Vietnam timezone offset */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

/** Map of action names used in POST /api/rewards/check */
export type RewardAction =
  | 'lesson_complete'
  | 'module_complete'
  | 'course_complete'
  | 'recording_submit'
  | 'peer_review'
  | 'feedback_submit'
  | 'quiz_complete'
