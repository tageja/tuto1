import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserStarBalance, getRecentEarnedRewards, getAllRewardDefinitions, getEarnedRewards, getMonthActivityDates } from '@/lib/db/rewards'
import { computeStreak, getTodayLessonsCompleted } from '@/lib/rewards-engine'
import { getServiceClient } from '@/lib/supabase'

async function getTotalProgress(userId: string): Promise<{ totalLessons: number; totalModules: number }> {
  const db = getServiceClient()
  const { data } = await db
    .from('nursed_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('completed', true)

  return { totalLessons: data?.length ?? 0, totalModules: 0 }
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [balance, streak, todayCount, recentEarned, allDefinitions, earnedRewards, activityDates, profileRow, totalProgress] = await Promise.all([
      getUserStarBalance(user.id),
      computeStreak(user.id),
      getTodayLessonsCompleted(user.id),
      getRecentEarnedRewards(user.id, 5),
      getAllRewardDefinitions(),
      getEarnedRewards(user.id),
      getMonthActivityDates(user.id),
      supabase.from('nursed_profiles').select('preferred_days').eq('id', user.id).single(),
      getTotalProgress(user.id),
    ])

    const earnedRewardIds = new Set(earnedRewards.map(r => r.reward_id))
    const preferredDays = profileRow.data?.preferred_days ?? null

    return NextResponse.json({
      success: true,
      data: {
        balance,
        streak,
        todayCount,
        totalLessonsCompleted: totalProgress.totalLessons,
        recentEarned,
        allDefinitions,
        earnedRewardIds: [...earnedRewardIds],
        activityDates,
        preferredDays,
      },
    })
  } catch (err) {
    console.error('[rewards/balance]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
