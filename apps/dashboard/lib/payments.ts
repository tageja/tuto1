/**
 * Payments Helper Library
 * Utilities for payments date ranges and calculations
 */

import type { DateRange } from '../components/payments/types';

/**
 * Calculate date range based on filter for payments
 */
export function getDateRangeForPayments(
  date: Date,
  range: DateRange
): { from: Date; to: Date } {
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'week': {
      // Get Monday of current week
      const day = from.getDay();
      const diff = from.getDate() - day + (day === 0 ? -6 : 1);
      from.setDate(diff);
      
      // Get Sunday of current week
      const toDate = new Date(from);
      toDate.setDate(from.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      
      return { from, to: toDate };
    }
    case '1m': {
      from.setMonth(from.getMonth() - 1);
      break;
    }
    case '3m': {
      from.setMonth(from.getMonth() - 3);
      break;
    }
    case '6m': {
      from.setMonth(from.getMonth() - 6);
      break;
    }
    case '12m': {
      from.setMonth(from.getMonth() - 12);
      break;
    }
    case 'custom':
      // For custom, from and to should be set by user
      // This is just a placeholder - actual dates come from filters
      break;
  }
  
  return { from, to };
}

/**
 * Format date as YYYY-MM-DD for API calls
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format currency from cents to dollars
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

