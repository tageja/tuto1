import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserStarBalance, getRecentEarnedRewards, getAllRewardDefinitions, getEarnedRewards } from '@/lib/db/rewards'
import { computeStreak, getTodayLessonsCompleted } from '@/lib/rewards-engine'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [balance, streak, todayCount, recentEarned, allDefinitions, earnedRewards] = await Promise.all([
      getUserStarBalance(user.id),
      computeStreak(user.id),
      getTodayLessonsCompleted(user.id),
      getRecentEarnedRewards(user.id, 5),
      getAllRewardDefinitions(),
      getEarnedRewards(user.id),
    ])

    // Build a set of earned reward IDs for badge grid
    const earnedRewardIds = new Set(earnedRewards.map(r => r.reward_id))

    return NextResponse.json({
      success: true,
      data: {
        balance,
        streak,
        todayCount,
        recentEarned,
        allDefinitions,
        earnedRewardIds: [...earnedRewardIds],
      },
    })
  } catch (err) {
    console.error('[rewards/balance]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
