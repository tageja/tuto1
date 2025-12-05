'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { AttendanceSummary, AttendanceRecord } from '../../../lib/types/students';
import { useI18n } from '../../../contexts/I18nContext';
import { AttendanceSparkline } from '../charts/AttendanceSparkline';
import { EmptyState } from '../../shared/EmptyState';

interface AttendanceTabProps {
  studentId: string;
  schoolId: string;
  attendanceSummary?: AttendanceSummary | null;
}

export function AttendanceTab({ studentId, schoolId, attendanceSummary }: AttendanceTabProps) {
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('3m');
  const [attendanceData, setAttendanceData] = useState<{
    records: AttendanceRecord[];
    percentage: number;
    chartData: Array<{ month: string; percentage: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useI18n();

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/school/students/${studentId}/attendance?schoolId=${encodeURIComponent(schoolId)}&period=${period}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAttendanceData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [studentId, schoolId, period]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!attendanceData || attendanceData.records.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.students.attendance.empty.title') || 'No Attendance Records'}
        description={t('dashboard.students.attendance.empty.description') || 'No attendance records found for this period.'}
        actionLabel=""
        onAction={undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            {t('dashboard.students.attendance.period') || 'Period'}:
          </label>
          <div className="flex gap-2">
            {(['1m', '3m', '6m', '12m'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p === '1m' ? (lang === 'vi' ? '1 tháng' : '1 Month') :
                 p === '3m' ? (lang === 'vi' ? '3 tháng' : '3 Months') :
                 p === '6m' ? (lang === 'vi' ? '6 tháng' : '6 Months') :
                 (lang === 'vi' ? '12 tháng' : '12 Months')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Attendance Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {t('dashboard.students.attendance.summary') || 'Attendance Summary'}
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {attendanceData.percentage}%
          </div>
        </div>
        <div className="mb-4">
          <AttendanceSparkline data={attendanceData.chartData} />
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{t('dashboard.students.attendance.total') || 'Total'}</p>
            <p className="text-lg font-semibold">{attendanceData.records.length}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('dashboard.students.attendance.present') || 'Present'}</p>
            <p className="text-lg font-semibold text-green-600">
              {attendanceData.records.filter((r) => r.status === 'Present').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">{t('dashboard.students.attendance.absent') || 'Absent'}</p>
            <p className="text-lg font-semibold text-red-600">
              {attendanceData.records.filter((r) => r.status === 'Absent').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">{t('dashboard.students.attendance.late') || 'Late'}</p>
            <p className="text-lg font-semibold text-yellow-600">
              {attendanceData.records.filter((r) => r.status === 'Late').length}
            </p>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('dashboard.students.attendance.records') || 'Attendance Records'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('dashboard.students.attendance.date') || 'Date'}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('dashboard.students.attendance.status') || 'Status'}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('dashboard.students.attendance.notes') || 'Notes'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.records.slice().reverse().map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatDate(record.date)}</td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'Absent'
                          ? 'bg-red-100 text-red-700'
                          : record.status === 'Late'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

