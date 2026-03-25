/** XP thresholds per level — matches migration 075 and mobile AchievementBadge.tsx exactly.
 *  L1=0, L2=100, L3=300, L4=700, L5=1500 */
export const XP_THRESHOLDS = [0, 100, 300, 700, 1500] as const;

export const SHIELD_RANK_COLOR: Record<string, string> = {
  beginner: '#6B7280',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

/** Podium ring colours: rank 1, 2, 3 */
export const PODIUM_COLOR = ['#FFD700', '#C0C0C0', '#CD7F32'] as const;

/** Minimum shield_count for each rank (matches migration 080). */
export const SHIELD_RANK_THRESHOLDS: Record<string, number> = {
  beginner: 0,
  bronze: 50,
  silver: 150,
  gold: 400,
  elite: 1000,
};

const RANK_ORDER = ['beginner', 'bronze', 'silver', 'gold', 'elite'] as const;

export function getLevelFromXp(xp: number): number {
  if (xp >= XP_THRESHOLDS[4]) return 5;
  if (xp >= XP_THRESHOLDS[3]) return 4;
  if (xp >= XP_THRESHOLDS[2]) return 3;
  if (xp >= XP_THRESHOLDS[1]) return 2;
  return 1;
}

export function getXpProgressForLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  isMax: boolean;
  nextThreshold: number | null;
} {
  const level = getLevelFromXp(xp);
  if (level >= 5) {
    return { level: 5, current: xp, needed: 0, isMax: true, nextThreshold: null };
  }
  const idx = level - 1;
  const current = xp - XP_THRESHOLDS[idx];
  const needed = XP_THRESHOLDS[idx + 1] - XP_THRESHOLDS[idx];
  return {
    level,
    current,
    needed,
    isMax: false,
    nextThreshold: XP_THRESHOLDS[level],
  };
}

/** Shields still needed to reach the next rank (0 if already elite). */
export function shieldsToNextRank(shieldCount: number, shieldRank: string): number | null {
  const r = (shieldRank ?? 'beginner').toLowerCase();
  let i = RANK_ORDER.indexOf(r as (typeof RANK_ORDER)[number]);
  if (i < 0) i = 0;
  if (i >= RANK_ORDER.length - 1) return null;
  const nextKey = RANK_ORDER[i + 1];
  const target = SHIELD_RANK_THRESHOLDS[nextKey];
  return Math.max(0, target - shieldCount);
}

export function nextRankLabel(shieldRank: string): string | null {
  const r = (shieldRank ?? 'beginner').toLowerCase();
  let i = RANK_ORDER.indexOf(r as (typeof RANK_ORDER)[number]);
  if (i < 0) i = 0;
  if (i >= RANK_ORDER.length - 1) return null;
  return RANK_ORDER[i + 1];
}
