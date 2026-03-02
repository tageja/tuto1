/**
 * Timetable slot color coding utility.
 * Returns consistent Tailwind color classes based on the subject/slot name.
 */

interface SlotColors {
  bg: string;         // background
  border: string;     // left border accent
  text: string;       // primary text
  badge: string;      // time badge bg
  badgeText: string;  // time badge text
  dot: string;        // indicator dot
}

// Keyword → color palette mapping (checked in order)
const KEYWORD_MAP: [RegExp, SlotColors][] = [
  // Food & meals
  [/breakfast|morning snack|brunch/i, {
    bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900',
    badge: 'bg-orange-100', badgeText: 'text-orange-700', dot: 'bg-orange-400',
  }],
  [/lunch|午餐/i, {
    bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-900',
    badge: 'bg-amber-100', badgeText: 'text-amber-700', dot: 'bg-amber-400',
  }],
  [/snack|afternoon snack/i, {
    bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900',
    badge: 'bg-yellow-100', badgeText: 'text-yellow-700', dot: 'bg-yellow-400',
  }],
  [/dinner|supper/i, {
    bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-900',
    badge: 'bg-rose-100', badgeText: 'text-rose-700', dot: 'bg-rose-400',
  }],

  // Rest & breaks
  [/nap|sleep|rest|break/i, {
    bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900',
    badge: 'bg-purple-100', badgeText: 'text-purple-700', dot: 'bg-purple-300',
  }],

  // Outdoor & physical
  [/outdoor|sport|pe|physical|gym|play|recess|exercise/i, {
    bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900',
    badge: 'bg-green-100', badgeText: 'text-green-700', dot: 'bg-green-400',
  }],

  // Core academic subjects
  [/math|maths|toán/i, {
    bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900',
    badge: 'bg-blue-100', badgeText: 'text-blue-700', dot: 'bg-blue-400',
  }],
  [/english|reading|writing|literacy|language arts/i, {
    bg: 'bg-sky-50', border: 'border-sky-400', text: 'text-sky-900',
    badge: 'bg-sky-100', badgeText: 'text-sky-700', dot: 'bg-sky-400',
  }],
  [/science|biology|chemistry|physics|khoa/i, {
    bg: 'bg-teal-50', border: 'border-teal-400', text: 'text-teal-900',
    badge: 'bg-teal-100', badgeText: 'text-teal-700', dot: 'bg-teal-400',
  }],
  [/history|social|geography|civics|lịch sử/i, {
    bg: 'bg-stone-50', border: 'border-stone-400', text: 'text-stone-900',
    badge: 'bg-stone-100', badgeText: 'text-stone-700', dot: 'bg-stone-400',
  }],
  [/art|craft|drawing|music|drama|creative/i, {
    bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-900',
    badge: 'bg-pink-100', badgeText: 'text-pink-700', dot: 'bg-pink-400',
  }],
  [/life skill|life-skill|social skill/i, {
    bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-900',
    badge: 'bg-cyan-100', badgeText: 'text-cyan-700', dot: 'bg-cyan-400',
  }],
  [/assembly|circle|morning meeting|homeroom/i, {
    bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-900',
    badge: 'bg-indigo-100', badgeText: 'text-indigo-700', dot: 'bg-indigo-400',
  }],
];

// Deterministic fallback colors (cycle through when no keyword matches)
const FALLBACK_COLORS: SlotColors[] = [
  { bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-900',   badge: 'bg-blue-100',   badgeText: 'text-blue-700',   dot: 'bg-blue-400' },
  { bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-900', badge: 'bg-violet-100', badgeText: 'text-violet-700', dot: 'bg-violet-400' },
  { bg: 'bg-emerald-50',border: 'border-emerald-400',text: 'text-emerald-900',badge: 'bg-emerald-100',badgeText: 'text-emerald-700',dot: 'bg-emerald-400' },
  { bg: 'bg-fuchsia-50',border: 'border-fuchsia-400',text: 'text-fuchsia-900',badge: 'bg-fuchsia-100',badgeText: 'text-fuchsia-700',dot: 'bg-fuchsia-400' },
  { bg: 'bg-lime-50',   border: 'border-lime-400',   text: 'text-lime-900',   badge: 'bg-lime-100',   badgeText: 'text-lime-700',   dot: 'bg-lime-400' },
  { bg: 'bg-red-50',    border: 'border-red-400',    text: 'text-red-900',    badge: 'bg-red-100',    badgeText: 'text-red-700',    dot: 'bg-red-400' },
];

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getSlotColors(slotName: string | null | undefined): SlotColors {
  const name = (slotName || '').trim();
  for (const [pattern, colors] of KEYWORD_MAP) {
    if (pattern.test(name)) return colors;
  }
  // Deterministic fallback based on name
  const idx = simpleHash(name.toLowerCase()) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[idx];
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
