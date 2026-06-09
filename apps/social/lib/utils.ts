import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class merging utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date/ISO string as a relative time string.
 * Returns Vietnamese by default.
 */
export function formatTimeAgo(date: Date | string, lang: 'vi' | 'en' = 'vi'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (lang === 'vi') {
    if (diffSec < 60)   return 'vừa xong';
    if (diffMin < 60)   return `${diffMin} phút trước`;
    if (diffHr < 24)    return `${diffHr} giờ trước`;
    if (diffDay < 7)    return `${diffDay} ngày trước`;
    if (diffWeek < 4)   return `${diffWeek} tuần trước`;
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (diffSec < 60)   return 'just now';
  if (diffMin < 60)   return `${diffMin}m ago`;
  if (diffHr < 24)    return `${diffHr}h ago`;
  if (diffDay < 7)    return `${diffDay}d ago`;
  if (diffWeek < 4)   return `${diffWeek}w ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Get initials from a display name (max 2 chars) */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
