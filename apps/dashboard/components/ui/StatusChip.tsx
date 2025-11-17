'use client';

import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

export type ActivityStatus = 'Pending' | 'In Progress' | 'Completed';

interface StatusChipProps {
  status: ActivityStatus;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

const statusVariants: Record<ActivityStatus, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'Completed': 'bg-green-100 text-green-700 hover:bg-green-200',
};

/**
 * StatusChip component for activity status display and toggle
 * Cycles through: Pending → In Progress → Completed → Pending
 */
export function StatusChip({ status, onClick, disabled = false, className = '' }: StatusChipProps) {
  const { t } = useI18n();
  
  // Get translated label
  const statusKey = status.toLowerCase().replace(' ', '');
  const label = t(`dashboard.activities.status.${statusKey}`) || status;

  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium transition-colors';
  const clickableClasses = onClick && !disabled ? 'cursor-pointer select-none' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const variant = statusVariants[status];

  const handleClick = (e?: React.MouseEvent) => {
    if (onClick && !disabled) {
      if (e) {
        e.stopPropagation();
      }
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      handleClick();
    }
  };

  return (
    <span
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${baseClasses} ${variant} ${clickableClasses} ${disabledClasses} ${className}`}
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-label={`${t('dashboard.activities.status.label') || 'Status'}: ${label}. ${onClick && !disabled ? t('dashboard.activities.actions.changeStatus') || 'Click to change' : ''}`}
    >
      {label}
    </span>
  );
}

/**
 * Helper function to get next status in cycle
 * Pending → In Progress → Completed → Pending (cycles back)
 */
export function getNextStatus(currentStatus: ActivityStatus): ActivityStatus {
  const next: Record<ActivityStatus, ActivityStatus> = {
    'Pending': 'In Progress',
    'In Progress': 'Completed',
    'Completed': 'Pending',
  };
  return next[currentStatus];
}

