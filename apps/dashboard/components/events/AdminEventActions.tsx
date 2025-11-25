'use client';

import { StatusBadge } from '../school/shared/StatusBadge';
import type { AdminEventActionsProps } from './types';

export function AdminEventActions({
  event,
  onViewDetails,
  onManage,
}: AdminEventActionsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={event.status} variant={getStatusVariant(event.status) as any} />
    </div>
  );
}

