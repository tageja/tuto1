'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Download, Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { PaymentFilters } from '../../../../../components/payments/Filters';
import { PaymentKpis } from '../../../../../components/payments/Kpis';
import { PaymentDonut } from '../../../../../components/payments/Donut';
import { PaymentTrend } from '../../../../../components/payments/Trend';
import { PaymentTable } from '../../../../../components/payments/Table';
import { CreatePaymentModal } from '../../../../../components/payments/CreatePaymentModal';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';
import { getDateRangeForPayments, formatDateForAPI } from '../../../../../lib/payments';
import type { DateRange, PaymentKPIs, PaymentDonutData, TrendDataPoint, PaymentItem } from '../../../../../components/payments/types';

export default function AdminPaymentsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const dateParam = searchParams.get('date');
  const rangeParam = (searchParams.get('range') as DateRange) || '1m';
  const classIdParam = searchParams.get('classId') || undefined;
  const studentIdParam = searchParams.get('studentId') || undefined;
  const typeParam = searchParams.get('type') || undefined;
  const statusParam = searchParams.get('status') || 'all';

  // State
  const [selectedDate, setSelectedDate] = useState(() =>
    dateParam ? new Date(dateParam) : new Date()
  );
  const [range, setRange] = useState<DateRange>(rangeParam);
  const [classId, setClassId] = useState<string | undefined>(classIdParam);
  const [studentId, setStudentId] = useState<string | undefined>(studentIdParam);
  const [type, setType] = useState<'tuition' | 'trip' | 'club' | 'misc' | undefined>(typeParam as any);
  const [status, setStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>(statusParam as any);

  const [kpis, setKpis] = useState<PaymentKPIs>({
    total_collection: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    total_students: 0,
    revenue_per_student: 0,
  });
  const [donutData, setDonutData] = useState<PaymentDonutData>({
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{ data: [0, 0, 0], values: [0, 0, 0] }],
  });
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<
    Array<{ id: string; first_name: string; last_name: string; class_id?: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate date range
  const { from, to } = getDateRangeForPayments(selectedDate, range);
  const fromStr = formatDateForAPI(from);
  const toStr = formatDateForAPI(to);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate.toISOString().split('T')[0]);
    params.set('range', range);
    if (classId) params.set('classId', classId);
    if (studentId) params.set('studentId', studentId);
    if (type) params.set('type', type);
    params.set('status', status);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, range, classId, studentId, type, status, router]);

  // Fetch classes and students
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [classesResult, studentsResult] = await Promise.all([
          supabase
            .from('school_classes')
            .select('id, name')
            .eq('school_id', schoolId)
            .in('status', ['active', 'Active'])
            .order('name'),
          supabase
            .from('school_students')
            .select('id, first_name, last_name, class_id')
            .eq('school_id', schoolId)
            .in('status', ['active', 'Active'])
            .order('first_name'),
        ]);

        setClasses(classesResult.data || []);
        setStudents(studentsResult.data || []);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    }
    fetchDropdowns();
  }, [schoolId]);

  // Fetch students when class changes
  useEffect(() => {
    async function fetchStudentsForClass() {
      if (classId) {
        try {
          const { data } = await supabase
            .from('school_students')
            .select('id, first_name, last_name, class_id')
            .eq('school_id', schoolId)
            .eq('class_id', classId)
            .in('status', ['active', 'Active'])
            .order('first_name');

          setStudents(data || []);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      } else {
        // Reset to all students
        const { data } = await supabase
          .from('school_students')
          .select('id, first_name, last_name, class_id')
          .eq('school_id', schoolId)
          .in('status', ['active', 'Active'])
          .order('first_name');

        setStudents(data || []);
      }
    }
    fetchStudentsForClass();
  }, [classId, schoolId]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [schoolId, fromStr, toStr, classId, studentId, type, status]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('schoolId', schoolId);
      params.set('from', fromStr);
      params.set('to', toStr);
      if (classId) params.set('classId', classId);
      if (studentId) params.set('studentId', studentId);
      if (type) params.set('type', type);
      params.set('status', status);

      const [summaryRes, trendRes, itemsRes] = await Promise.all([
        fetch(`/api/school/payments/summary?${params.toString()}`),
        fetch(`/api/school/payments/trend?${params.toString()}`),
        fetch(`/api/school/payments/items?${params.toString()}`),
      ]);

      const [summaryData, trendData, itemsData] = await Promise.all([
        summaryRes.json(),
        trendRes.json(),
        itemsRes.json(),
      ]);

      if (summaryData.success) {
        setKpis(summaryData.data.kpis);
        setDonutData(summaryData.data.donut);
      }

      if (trendData.success) {
        setTrendData(trendData.data);
      }

      if (itemsData.success) {
        setItems(itemsData.data);
      }
    } catch (error) {
      console.error('Error fetching payments data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRemind = async (itemId: string) => {
    try {
      const response = await fetch('/api/school/payments/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          payment_item_ids: [itemId],
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(t('dashboard.payments.remind.success') || 'Reminders sent successfully');
      } else {
        throw new Error(data.error || 'Failed to send reminders');
      }
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      alert(error.message || t('dashboard.payments.remind.error') || 'Failed to send reminders');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.set('schoolId', schoolId);
      params.set('from', fromStr);
      params.set('to', toStr);
      if (classId) params.set('classId', classId);
      if (studentId) params.set('studentId', studentId);
      if (type) params.set('type', type);
      params.set('status', status);
      params.set('format', 'csv');

      const response = await fetch(`/api/school/payments/items?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${schoolId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.payments.title') || 'Payments'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{schoolId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            {t('dashboard.payments.buttons.export') || 'Export CSV'}
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            {t('dashboard.payments.buttons.createPayment') || 'Create Payment'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <PaymentFilters
          selectedDate={selectedDate}
          range={range}
          classId={classId}
          studentId={studentId}
          type={type}
          status={status}
          onDateChange={setSelectedDate}
          onRangeChange={setRange}
          onClassChange={setClassId}
          onStudentChange={setStudentId}
          onTypeChange={setType}
          onStatusChange={setStatus}
          classes={classes}
          students={students}
        />
      </div>

      {/* KPIs */}
      <div className="mb-6">
        <PaymentKpis kpis={kpis} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PaymentDonut donutData={donutData} loading={loading} />
        <div className="lg:col-span-2">
          <PaymentTrend trendData={trendData} loading={loading} />
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <PaymentTable items={items} loading={loading} onRemind={handleRemind} />
      </div>

      {/* Create Payment Modal */}
      <CreatePaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchData();
          setShowCreateModal(false);
        }}
        schoolId={schoolId}
        classes={classes}
        students={students}
      />
    </div>
  );
}
