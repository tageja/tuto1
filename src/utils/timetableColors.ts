/**
 * Timetable slot color coding for React Native.
 * Same keyword logic as web (apps/dashboard/lib/timetableColors.ts), returns hex colors.
 */

export interface TimetableSlotColors {
  bg: string;
  border: string;
  text: string;
  badge: string;
  badgeText: string;
  dot: string;
}

// Tailwind palette equivalents in hex (bg, border, text, badge, badgeText, dot)
const KEYWORD_MAP: [RegExp, TimetableSlotColors][] = [
  [/breakfast|morning snack|brunch/i, { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', badge: '#ffedd5', badgeText: '#c2410c', dot: '#fb923c' }],
  [/lunch|午餐/i, { bg: '#fffbeb', border: '#fbbf24', text: '#78350f', badge: '#fef3c7', badgeText: '#b45309', dot: '#fbbf24' }],
  [/snack|afternoon snack/i, { bg: '#fefce8', border: '#facc15', text: '#713f12', badge: '#fef9c3', badgeText: '#a16207', dot: '#facc15' }],
  [/dinner|supper/i, { bg: '#fff1f2', border: '#fb7185', text: '#881337', badge: '#ffe4e6', badgeText: '#be123c', dot: '#fb7185' }],
  [/nap|sleep|rest|break/i, { bg: '#faf5ff', border: '#d8b4fe', text: '#581c87', badge: '#f3e8ff', badgeText: '#7e22ce', dot: '#d8b4fe' }],
  [/outdoor|sport|pe|physical|gym|play|recess|exercise/i, { bg: '#f0fdf4', border: '#4ade80', text: '#14532d', badge: '#dcfce7', badgeText: '#15803d', dot: '#4ade80' }],
  [/math|maths|toán/i, { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a', badge: '#dbeafe', badgeText: '#1d4ed8', dot: '#60a5fa' }],
  [/english|reading|writing|literacy|language arts/i, { bg: '#f0f9ff', border: '#38bdf8', text: '#0c4a6e', badge: '#e0f2fe', badgeText: '#0369a1', dot: '#38bdf8' }],
  [/science|biology|chemistry|physics|khoa/i, { bg: '#f0fdfa', border: '#2dd4bf', text: '#134e4a', badge: '#ccfbf1', badgeText: '#0f766e', dot: '#2dd4bf' }],
  [/history|social|geography|civics|lịch sử/i, { bg: '#fafaf9', border: '#a8a29e', text: '#1c1917', badge: '#f5f5f4', badgeText: '#44403c', dot: '#a8a29e' }],
  [/art|craft|drawing|music|drama|creative/i, { bg: '#fdf2f8', border: '#f472b6', text: '#831843', badge: '#fce7f3', badgeText: '#be185d', dot: '#f472b6' }],
  [/life skill|life-skill|social skill/i, { bg: '#ecfeff', border: '#22d3ee', text: '#164e63', badge: '#cffafe', badgeText: '#0e7490', dot: '#22d3ee' }],
  [/assembly|circle|morning meeting|homeroom/i, { bg: '#eef2ff', border: '#818cf8', text: '#312e81', badge: '#e0e7ff', badgeText: '#4338ca', dot: '#818cf8' }],
];

const FALLBACK_COLORS: TimetableSlotColors[] = [
  { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a', badge: '#dbeafe', badgeText: '#1d4ed8', dot: '#60a5fa' },
  { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95', badge: '#ede9fe', badgeText: '#6d28d9', dot: '#a78bfa' },
  { bg: '#ecfdf5', border: '#34d399', text: '#064e3b', badge: '#d1fae5', badgeText: '#047857', dot: '#34d399' },
  { bg: '#fdf4ff', border: '#e879f9', text: '#701a75', badge: '#fae8ff', badgeText: '#a21caf', dot: '#e879f9' },
  { bg: '#f7fee7', border: '#a3e635', text: '#365314', badge: '#ecfccb', badgeText: '#4d7c0f', dot: '#a3e635' },
  { bg: '#fef2f2', border: '#f87171', text: '#7f1d1d', badge: '#fee2e2', badgeText: '#b91c1c', dot: '#f87171' },
];

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getSlotColors(slotName: string | null | undefined): TimetableSlotColors {
  const name = (slotName || '').trim();
  for (const [pattern, colors] of KEYWORD_MAP) {
    if (pattern.test(name)) return colors;
  }
  const idx = simpleHash(name.toLowerCase()) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[idx];
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
