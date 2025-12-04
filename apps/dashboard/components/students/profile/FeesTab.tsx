'use client';

import { Card } from '../../ui/Card';
import { FeeSummary } from '../../../lib/types/students';
import { useI18n } from '../../../contexts/I18nContext';
import { EmptyState } from '../../shared/EmptyState';

interface FeesTabProps {
  fees: FeeSummary[];
}

export function FeesTab({ fees }: FeesTabProps) {
  const { t, lang } = useI18n();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (fees.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.students.fees.empty.title') || 'No Fees Records'}
        description={t('dashboard.students.fees.empty.description') || 'No fee records found for this student.'}
        actionLabel=""
        onAction={undefined}
      />
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('dashboard.students.fees.title') || 'Fee Records'}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.students.fees.dueDate') || 'Due Date'}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.students.fees.amount') || 'Amount'}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.students.fees.status') || 'Status'}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                {t('dashboard.students.fees.description') || 'Description'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{formatDate(fee.dueDate)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(fee.amount)}</td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fee.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : fee.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : fee.status === 'Overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{fee.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

