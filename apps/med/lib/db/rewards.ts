import { getServiceClient } from '../supabase'
import type { NursedCoupon, NursedCouponRedemption, NursedReward, NursedUserReward } from '../supabase'

// ─── Star balance ─────────────────────────────────────────────────────────────

export async function getUserStarBalance(userId: string): Promise<{
  earned: number
  spent: number
  balance: number
}> {
  const db = getServiceClient()

  const [rewardsRes, redemptionsRes] = await Promise.all([
    db.from('nursed_user_rewards').select('points').eq('user_id', userId),
    db.from('nursed_coupon_redemptions').select('stars_spent').eq('user_id', userId),
  ])

  const earned = rewardsRes.data?.reduce((sum, r) => sum + (r.points ?? 0), 0) ?? 0
  const spent  = redemptionsRes.data?.reduce((sum, r) => sum + (r.stars_spent ?? 0), 0) ?? 0

  return { earned, spent, balance: earned - spent }
}

// ─── Earned rewards ───────────────────────────────────────────────────────────

export async function getEarnedRewards(userId: string): Promise<(NursedUserReward & { reward: NursedReward })[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_user_rewards')
    .select('*, nursed_rewards(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as (NursedUserReward & { reward: NursedReward })[]
}

export async function getRecentEarnedRewards(userId: string, limit = 5) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_user_rewards')
    .select('*, nursed_rewards(name, name_vi, icon, points)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

// ─── All reward definitions ───────────────────────────────────────────────────

export async function getAllRewardDefinitions(): Promise<NursedReward[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_rewards')
    .select('*')
    .order('points', { ascending: true })

  if (error) throw error
  return (data ?? []) as NursedReward[]
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function getActiveCoupons(): Promise<NursedCoupon[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_coupons')
    .select('*')
    .eq('active', true)
    .order('star_cost', { ascending: true })

  if (error) throw error
  return (data ?? []) as NursedCoupon[]
}

export async function getAllCoupons(): Promise<NursedCoupon[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as NursedCoupon[]
}

export async function getCouponById(id: string): Promise<NursedCoupon | null> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_coupons')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as NursedCoupon | null
}

export async function upsertCoupon(payload: Partial<NursedCoupon> & { name: string; brand: string; star_cost: number }): Promise<NursedCoupon> {
  const db = getServiceClient()
  const now = new Date().toISOString()

  if (payload.id) {
    const { data, error } = await db
      .from('nursed_coupons')
      .update({ ...payload, updated_at: now })
      .eq('id', payload.id)
      .select()
      .single()
    if (error) throw error
    return data as NursedCoupon
  }

  const { data, error } = await db
    .from('nursed_coupons')
    .insert({ ...payload, remaining: payload.total_quantity ?? null, updated_at: now })
    .select()
    .single()
  if (error) throw error
  return data as NursedCoupon
}

export async function deleteCoupon(id: string): Promise<void> {
  const db = getServiceClient()
  const { error } = await db.from('nursed_coupons').delete().eq('id', id)
  if (error) throw error
}

export async function toggleCouponActive(id: string, active: boolean): Promise<void> {
  const db = getServiceClient()
  const { error } = await db
    .from('nursed_coupons')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ─── Coupon redemption ────────────────────────────────────────────────────────

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function redeemCoupon(userId: string, couponId: string): Promise<NursedCouponRedemption> {
  const db = getServiceClient()

  const coupon = await getCouponById(couponId)
  if (!coupon || !coupon.active) throw new Error('Coupon not available')
  if (coupon.remaining !== null && coupon.remaining <= 0) throw new Error('Coupon out of stock')

  const { balance } = await getUserStarBalance(userId)
  if (balance < coupon.star_cost) throw new Error('Insufficient stars')

  const couponCode = generateCouponCode()

  const { data: redemption, error: redemptionError } = await db
    .from('nursed_coupon_redemptions')
    .insert({
      user_id: userId,
      coupon_id: couponId,
      stars_spent: coupon.star_cost,
      status: 'pending',
      coupon_code: couponCode,
    })
    .select()
    .single()

  if (redemptionError) throw redemptionError

  if (coupon.remaining !== null) {
    await db
      .from('nursed_coupons')
      .update({ remaining: coupon.remaining - 1, updated_at: new Date().toISOString() })
      .eq('id', couponId)
  }

  return redemption as NursedCouponRedemption
}

// ─── User redemptions ─────────────────────────────────────────────────────────

export async function getUserRedemptions(userId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_coupon_redemptions')
    .select('*, nursed_coupons(name, name_vi, brand, image_url, star_cost)')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─── Admin: all redemptions ───────────────────────────────────────────────────

export async function getAllRedemptions(limit = 100) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_coupon_redemptions')
    .select('*, nursed_coupons(name, name_vi, brand)')
    .order('redeemed_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
