/**
 * Formatting utilities for the dashboard
 */

/**
 * Format VND currency
 * @param amount - Amount in thousands (k) - e.g., 350 means 350,000 VND
 * @returns Formatted string like "350.000 ₫"
 */
export function formatVND(amount: number): string {
  // Convert k to full amount (350k -> 350000)
  const fullAmount = amount * 1000;
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fullAmount);
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted string with dots as thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format rating with stars
 * @param rating - Rating value (0-5)
 * @returns Formatted string like "4.8 ⭐"
 */
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)} ⭐`;
}

