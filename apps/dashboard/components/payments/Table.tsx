'use client';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { useI18n } from '../../contexts/I18nContext';
import type { PaymentItem } from './types';

interface PaymentTableProps {
  items: PaymentItem[];
  loading?: boolean;
  onRemind?: (itemId: string) => void;
}

export function PaymentTable({ items, loading = false, onRemind }: PaymentTableProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>{t('dashboard.payments.empty.noPayments') || 'No payments found'}</p>
        <p className="text-sm mt-2">
          {t('dashboard.payments.empty.tryDifferentFilters') || 'Try adjusting your filters or date range'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.student') || 'Student'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.class') || 'Class'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.title') || 'Title'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.type') || 'Type'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.amount') || 'Amount'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.dueDate') || 'Due Date'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.paidDate') || 'Paid Date'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.status') || 'Status'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.method') || 'Method'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.payments.table.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.student_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.class_name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {t(`dashboard.payments.type.${item.type}`) || item.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                  {item.amount_cents.toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.method || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  {(item.status === 'pending' || item.status === 'overdue') && onRemind && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemind(item.id)}
                    >
                      {t('dashboard.payments.buttons.remind') || 'Remind'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

