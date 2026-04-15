'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame, Trophy, Gift, Clock, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { T } from '@/lib/i18n/translations'
import type { NursedCoupon, NursedReward } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

type BalanceData = {
  balance: { earned: number; spent: number; balance: number }
  streak: number
  todayCount: number
  recentEarned: { points: number; earned_at: string; nursed_rewards: { name: string; name_vi: string | null; icon: string | null } | null }[]
  allDefinitions: NursedReward[]
  earnedRewardIds: string[]
}

type Redemption = {
  id: string
  stars_spent: number
  status: string
  coupon_code: string | null
  redeemed_at: string
  nursed_coupons: { name: string; name_vi: string | null; brand: string; image_url: string | null; star_cost: number } | null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const { t, lang } = useLang()

  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [coupons, setCoupons] = useState<NursedCoupon[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemResult, setRedeemResult] = useState<{ couponId: string; code: string } | null>(null)
  const [showRedemptions, setShowRedemptions] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [balRes, couponRes, myRes] = await Promise.all([
        fetch('/api/rewards/balance'),
        fetch('/api/coupons'),
        fetch('/api/coupons/my-redemptions'),
      ])
      const [balJson, couponJson, myJson] = await Promise.all([balRes.json(), couponRes.json(), myRes.json()])
      if (balJson.success) setBalanceData(balJson.data)
      if (couponJson.success) setCoupons(couponJson.data)
      if (myJson.success) setRedemptions(myJson.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRedeem = async (coupon: NursedCoupon) => {
    if (redeeming) return
    setRedeeming(coupon.id)
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId: coupon.id }),
      })
      const json = await res.json()
      if (json.success) {
        setRedeemResult({ couponId: coupon.id, code: json.data.coupon_code })
        await load()
      } else {
        alert(json.error ?? t.rewardsCouponRedeemError)
      }
    } catch {
      alert(t.rewardsCouponRedeemError)
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-surface" />
        <div className="h-24 rounded-2xl bg-surface" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-surface" />)}
        </div>
      </div>
    )
  }

  const balance = balanceData?.balance.balance ?? 0
  const earned  = balanceData?.balance.earned ?? 0
  const spent   = balanceData?.balance.spent ?? 0
  const streak  = balanceData?.streak ?? 0
  const earnedIds = new Set(balanceData?.earnedRewardIds ?? [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text">{t.rewardsPageTitle}</h1>
        <p className="text-sm text-text-muted mt-1">{t.rewardsPageSubtitle}</p>
      </div>

      {/* ── Star balance hero ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-6 sm:p-8 shadow-lg text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-1">{t.rewardsStarBalance}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{balance}</span>
              <span className="text-xl text-white/80">⭐</span>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{earned}</p>
              <p className="text-xs text-white/70 mt-0.5">{t.rewardsStarsEarned}</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{spent}</p>
              <p className="text-xs text-white/70 mt-0.5">{t.rewardsStarsSpent}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Streak + today ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-white p-5 flex flex-col items-center justify-center text-center shadow-sm"
        >
          <Flame className="text-orange-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-text-muted mt-1">{t.rewardsStreakTitle}</p>
          {streak === 0 && <p className="text-xs text-text-muted mt-1">{t.rewardsStreakZero}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-white p-5 flex flex-col items-center justify-center text-center shadow-sm"
        >
          <Star className="text-primary mb-2" size={28} />
          <p className="text-3xl font-bold text-primary">{balanceData?.todayCount ?? 0}</p>
          <p className="text-sm text-text-muted mt-1">{t.statsLessonsCompleted}</p>
          <p className="text-xs text-text-muted">{t.overviewStatsTitle}</p>
        </motion.div>
      </div>

      {/* ── Recent rewards ──────────────────────────────────────── */}
      {(balanceData?.recentEarned?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-base font-semibold text-text mb-3">{t.rewardsRecentTitle}</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {balanceData?.recentEarned.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white shadow-sm"
                >
                  <span className="text-2xl">{r.nursed_rewards?.icon ?? '⭐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {lang === 'vi' ? (r.nursed_rewards?.name_vi || r.nursed_rewards?.name) : r.nursed_rewards?.name}
                    </p>
                    <p className="text-xs text-text-muted">{new Date(r.earned_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                  </div>
                  <span className="text-sm font-bold text-yellow-600 shrink-0">+{r.points} ⭐</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── Achievement badge grid ────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-text mb-3">{t.rewardsAchievementsTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(balanceData?.allDefinitions ?? []).map((def, i) => {
            const isEarned = earnedIds.has(def.id)
            return (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border p-4 text-center ${
                  isEarned
                    ? 'border-yellow-200 bg-yellow-50 shadow-sm'
                    : 'border-border bg-surface opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">
                  {isEarned ? (def.icon ?? '⭐') : '🔒'}
                </div>
                <p className="text-xs font-semibold text-text leading-snug">
                  {lang === 'vi' ? (def.name_vi || def.name) : def.name}
                </p>
                <p className="text-xs text-text-muted mt-1">{def.points} ⭐</p>
                {isEarned && (
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-success">
                    <CheckCircle size={12} />
                    <span className="text-xs font-medium">{t.rewardsAchievementsEarned}</span>
                  </div>
                )}
                {!isEarned && (
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-text-muted">
                    <Lock size={12} />
                    <span className="text-xs">{t.rewardsAchievementsLocked}</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Coupon marketplace ─────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
          <Gift size={18} className="text-primary" />
          {t.rewardsCouponMarketplace}
        </h2>

        {coupons.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">{t.rewardsMyRedemptionsEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((coupon, i) => {
              const canAfford = balance >= coupon.star_cost
              const outOfStock = coupon.remaining !== null && coupon.remaining <= 0
              const justRedeemed = redeemResult?.couponId === coupon.id
              const isRedeeming = redeeming === coupon.id

              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                    outOfStock ? 'opacity-50' : ''
                  }`}
                >
                  {/* Brand image / placeholder */}
                  <div className="h-24 bg-gradient-to-br from-surface to-border flex items-center justify-center">
                    {coupon.image_url ? (
                      <img src={coupon.image_url} alt={coupon.name} className="h-16 w-auto object-contain" />
                    ) : (
                      <span className="text-4xl">🎁</span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold text-text">
                      {lang === 'vi' ? (coupon.name_vi || coupon.name) : coupon.name}
                    </p>
                    {(coupon.description_vi || coupon.description) && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {lang === 'vi' ? (coupon.description_vi || coupon.description) : coupon.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-yellow-600">
                        {t.rewardsCouponCost.replace('{n}', String(coupon.star_cost))} ⭐
                      </span>
                      {coupon.remaining !== null && (
                        <span className="text-xs text-text-muted">
                          {coupon.remaining} left
                        </span>
                      )}
                    </div>

                    {justRedeemed && redeemResult ? (
                      <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
                        <p className="text-xs font-semibold text-green-700">{t.rewardsCouponStatusFulfilled}</p>
                        <p className="text-sm font-bold text-green-800 mt-0.5 tracking-widest">{redeemResult.code}</p>
                      </div>
                    ) : outOfStock ? (
                      <button disabled className="w-full mt-3 py-2 rounded-xl bg-surface text-text-muted text-sm font-medium cursor-not-allowed">
                        {t.rewardsCouponOutOfStock}
                      </button>
                    ) : !canAfford ? (
                      <button disabled className="w-full mt-3 py-2 rounded-xl bg-surface text-text-muted text-sm font-medium cursor-not-allowed">
                        {t.rewardsCouponInsufficientStars.replace('{n}', String(coupon.star_cost - balance))}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRedeem(coupon)}
                        disabled={isRedeeming}
                        className="w-full mt-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {isRedeeming ? '...' : t.rewardsCouponRedeem}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── My redeemed coupons ──────────────────────────────────── */}
      {redemptions.length > 0 && (
        <section>
          <button
            onClick={() => setShowRedemptions(v => !v)}
            className="flex items-center gap-2 text-base font-semibold text-text mb-3 w-full text-left"
          >
            <Clock size={18} className="text-text-muted" />
            {t.rewardsMyRedemptionsTitle}
            <span className="text-xs text-text-muted font-normal ml-1">({redemptions.length})</span>
            <span className="ml-auto">{showRedemptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </button>

          <AnimatePresence>
            {showRedemptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {redemptions.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white shadow-sm">
                    <span className="text-xl">🎁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {lang === 'vi' ? (r.nursed_coupons?.name_vi || r.nursed_coupons?.name) : r.nursed_coupons?.name}
                      </p>
                      <p className="text-xs text-text-muted">{new Date(r.redeemed_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {r.coupon_code && (
                        <p className="text-xs font-bold tracking-widest text-primary">{r.coupon_code}</p>
                      )}
                      <StatusBadge status={r.status} t={t} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status, t }: { status: string; t: T }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: t.rewardsCouponStatusPending,   cls: 'badge-yellow' },
    fulfilled: { label: t.rewardsCouponStatusFulfilled, cls: 'badge-green' },
    expired:   { label: t.rewardsCouponStatusExpired,   cls: 'badge-gray' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'badge-gray' }
  return <span className={`text-xs ${cls}`}>{label}</span>
}
