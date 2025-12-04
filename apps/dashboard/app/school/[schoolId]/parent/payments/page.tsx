'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/school/shared/StatusBadge';
import { PaymentKpis } from '../../../../../components/payments/Kpis';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';
import type { PaymentKPIs, PaymentItem } from '../../../../../components/payments/types';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expires_month?: number;
  expires_year?: number;
  is_primary: boolean;
}

export default function ParentPaymentsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const childIdParam = searchParams.get('childId');

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(childIdParam || undefined);
  const [kpis, setKpis] = useState<PaymentKPIs | null>(null);
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Fetch children
  useEffect(() => {
    fetchChildren();
  }, [schoolId]);

  // Update URL when child changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChildId) params.set('childId', selectedChildId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedChildId, router]);

  // Fetch data when child is selected
  useEffect(() => {
    if (selectedChildId) {
      fetchData();
    }
  }, [schoolId, selectedChildId]);

  async function fetchChildren() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userProfile) return;

      const { data: mappings } = await supabase
        .from('school_parent_students')
        .select(`
          student:school_students(
            id,
            first_name,
            last_name,
            class:school_classes(name)
          )
        `)
        .eq('school_id', schoolId)
        .eq('parent_user_id', userProfile.id);

      if (mappings && mappings.length > 0) {
        const childrenData = mappings.map((m: any) => ({
          id: m.student.id,
          first_name: m.student.first_name,
          last_name: m.student.last_name,
          class_name: m.student.class?.name || 'N/A',
        }));

        setChildren(childrenData);

        if (!selectedChildId && childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }

  async function fetchData() {
    if (!selectedChildId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('schoolId', schoolId);
      params.set('studentId', selectedChildId);

      // Fetch summary for KPIs
      const summaryRes = await fetch(`/api/school/payments/summary?${params.toString()}`);
      const summaryData = await summaryRes.json();

      if (summaryData.success && summaryData.data?.kpis) {
        setKpis(summaryData.data.kpis);
      }

      // Fetch payment items
      const itemsRes = await fetch(`/api/school/payments/items?${params.toString()}`);
      const itemsData = await itemsRes.json();

      if (itemsData.success) {
        setItems(itemsData.data);
      }

      // Fetch payment methods (mock for now)
      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'VISA',
          expires_month: 12,
          expires_year: 2026,
          is_primary: true,
        },
      ]);
    } catch (error) {
      console.error('Error fetching payments data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePay = async (item: PaymentItem) => {
    if (!selectedChildId) return;

    setProcessingPayment(item.id);

    try {
      // 1. Create payment intent
      const intentRes = await fetch('/api/school/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          paymentItemId: item.id,
          amount_cents: item.amount_cents,
          provider: 'mock',
          created_by: 'current_user', // Will be resolved in API
        }),
      });

      const intentData = await intentRes.json();
      if (!intentData.success) throw new Error(intentData.error || 'Failed to create payment intent');

      // 2. Simulate payment processing (mock)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Finalize payment
      const receiptRes = await fetch('/api/school/payments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          paymentItemId: item.id,
          paymentIntentId: intentData.paymentIntentId,
          amount_cents: item.amount_cents,
          method: 'mock_card',
          reference: `mock_${Date.now()}`,
        }),
      });

      const receiptData = await receiptRes.json();
      if (!receiptData.success) throw new Error(receiptData.error || 'Failed to finalize payment');

      alert(t('dashboard.payments.pay.success') || 'Payment successful!');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error processing payment:', error);
              alert(error.message || t('dashboard.payments.pay.error') || 'Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleDownloadReceipt = async (item: PaymentItem) => {
    try {
      // Fetch receipt URL
      const response = await fetch(
        `/api/school/payments/receipt?schoolId=${schoolId}&paymentItemId=${item.id}`
      );
      const data = await response.json();

      if (data.success && data.receiptUrl) {
        window.open(data.receiptUrl, '_blank');
      } else {
        alert('Receipt not available');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // Calculate next due date
  const nextDueItem = items
    .filter((item) => item.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.payments.title') || 'Payments'}
        </h1>
        {selectedChild && (
          <p className="text-sm text-gray-500 mt-1">
            {selectedChild.first_name} {selectedChild.last_name} • {selectedChild.class_name}
          </p>
        )}
      </div>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.payments.selectChild') || 'Select Child'}
          </label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name} - {child.class_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!selectedChildId ? (
        <Card className="p-8 text-center text-gray-500">
          <p>{t('dashboard.payments.selectChildFirst') || 'Please select a child to view payments'}</p>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-green-50">
                <p className="text-sm text-gray-600 mb-1">
                  {t('dashboard.payments.kpis.paid') || 'Paid'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {(kpis?.paid ?? 0).toLocaleString('vi-VN')} ₫
                </p>
              </Card>
              <Card className="p-4 bg-yellow-50">
                <p className="text-sm text-gray-600 mb-1">
                  {t('dashboard.payments.kpis.pending') || 'Pending'}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(kpis?.pending ?? 0).toLocaleString('vi-VN')} ₫
                </p>
              </Card>
              <Card className="p-4 bg-red-50">
                <p className="text-sm text-gray-600 mb-1">
                  {t('dashboard.payments.kpis.overdue') || 'Overdue'}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {(kpis?.overdue ?? 0).toLocaleString('vi-VN')} ₫
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t('dashboard.payments.kpis.nextDue') || 'Next Due'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {nextDueItem
                    ? new Date(nextDueItem.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </Card>
            </div>
          </div>

          {/* Payment History Table */}
          <Card className="overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {t('dashboard.payments.parent.paymentHistory') || 'Payment History'}
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse">Loading...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>{t('dashboard.payments.empty.noPayments') || 'No payments found'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('dashboard.payments.table.title') || 'Description'}
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                          {item.amount_cents.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(item.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.method || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          {item.status === 'paid' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(item)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {t('dashboard.payments.buttons.downloadReceipt') || 'Receipt'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handlePay(item)}
                              disabled={processingPayment === item.id}
                            >
                              {processingPayment === item.id
                                ? t('dashboard.payments.pay.processing') || 'Processing...'
                                : t('dashboard.payments.table.pay') || 'Pay'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('dashboard.payments.methods.title') || 'Payment Methods'}
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        {method.brand || 'CARD'}
                      </div>
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.last4 || '****'}
                        </p>
                        {method.expires_month && method.expires_year && (
                          <p className="text-sm text-gray-600">
                            Expires{' '}
                            {method.expires_month}/{method.expires_year}
                          </p>
                        )}
                      </div>
                    </div>
                    {method.is_primary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {t('dashboard.payments.methods.primary') || 'Primary'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" disabled title="Coming in Phase 2">
                + {t('dashboard.payments.methods.add') || 'Add Payment Method'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
