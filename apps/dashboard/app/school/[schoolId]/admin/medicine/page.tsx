'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Plus, Eye, ClipboardCheck } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { MedicineKPIs } from '../../../../../components/medicine/MedicineKPIs';
import { AddReminderModal } from '../../../../../components/medicine/AddReminderModal';
import { LogAdministrationModal } from '../../../../../components/medicine/LogAdministrationModal';
import { useI18n } from '../../../../../contexts/I18nContext';

interface Reminder {
  id: string;
  student_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[] | null;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
  school_students: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function AdminMedicinePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const studentIdParam = searchParams.get('studentId');

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [students, setStudents] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [kpiRefreshKey, setKpiRefreshKey] = useState(0);

  // Fetch reminders
  useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (studentIdParam) params.append('studentId', studentIdParam);

        const response = await fetch(
          `/api/school/${encodeURIComponent(schoolId)}/medicine/reminders?${params.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          setReminders(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReminders();
  }, [schoolId, studentIdParam]);

  // Fetch classes and students for modal
  useEffect(() => {
    async function fetchClassesAndStudents() {
      try {
        // Fetch classes - API returns { data: { records: [...] } }
        const classesRes = await fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}`);
        const classesResult = await classesRes.json();
        if (classesResult.success && classesResult.data?.records) {
          setClasses(classesResult.data.records.map((c: any) => ({
            id: c.id,
            name: c.name,
          })));
        }

        // Fetch students - API returns { data: { records: [...], total, ... } }
        const studentsRes = await fetch(`/api/school/students?schoolId=${encodeURIComponent(schoolId)}&pageSize=500`);
        const studentsResult = await studentsRes.json();
        if (studentsResult.success && studentsResult.data?.records) {
          setStudents(studentsResult.data.records.map((s: any) => ({
            id: s.id,
            first_name: s.first_name || s.firstName,
            last_name: s.last_name || s.lastName,
            class_id: s.classId || s.class_id,
          })));
        }
      } catch (error) {
        console.error('[AdminMedicine] Error fetching classes/students:', error);
      }
    }
    fetchClassesAndStudents();
  }, [schoolId]);

  const handleRefresh = () => {
    // Refresh reminders
    const params = new URLSearchParams();
    if (studentIdParam) params.append('studentId', studentIdParam);

    fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/reminders?${params.toString()}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setReminders(result.data || []);
        }
      });
    
    // Refresh KPIs by incrementing the key
    setKpiRefreshKey(prev => prev + 1);
  };

  const handleLogClick = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowLogModal(true);
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      once: t('dashboard.medicine.frequency.once') || 'Once',
      daily: t('dashboard.medicine.frequency.daily') || 'Daily',
      twice_daily: t('dashboard.medicine.frequency.twiceDaily') || 'Twice Daily',
      as_needed: t('dashboard.medicine.frequency.asNeeded') || 'As Needed',
    };
    return labels[freq] || freq;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      active: {
        label: t('dashboard.medicine.status.active') || 'Active',
        className: 'bg-green-100 text-green-800',
      },
      paused: {
        label: t('dashboard.medicine.status.paused') || 'Paused',
        className: 'bg-yellow-100 text-yellow-800',
      },
      ended: {
        label: t('dashboard.medicine.status.ended') || 'Ended',
        className: 'bg-gray-100 text-gray-800',
      },
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.medicine.title') || 'Medicine Management'}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.medicine.subtitle') || 'Manage medicine reminders and administration logs'}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.medicine.addReminder') || 'Add Reminder'}
        </Button>
      </div>

      {/* KPIs */}
      <MedicineKPIs key={kpiRefreshKey} schoolId={schoolId} loading={loading} />

      {/* Reminders Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t('dashboard.medicine.remindersList') || 'Reminders'}
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('dashboard.medicine.loading') || 'Loading...'}</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('dashboard.medicine.noReminders') || 'No reminders found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.student') || 'Student'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.medicine') || 'Medicine'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.dosage') || 'Dosage'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.frequency') || 'Frequency'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.time') || 'Time'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.status') || 'Status'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('dashboard.medicine.table.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => {
                  const statusBadge = getStatusBadge(reminder.status);
                  return (
                    <tr key={reminder.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {reminder.school_students?.first_name} {reminder.school_students?.last_name}
                      </td>
                      <td className="py-3 px-4">{reminder.medicine_name}</td>
                      <td className="py-3 px-4">{reminder.dosage || '-'}</td>
                      <td className="py-3 px-4">{getFrequencyLabel(reminder.frequency)}</td>
                      <td className="py-3 px-4">
                        {reminder.time_of_day && reminder.time_of_day.length > 0
                          ? reminder.time_of_day.map(formatTime).join(', ')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {reminder.status === 'active' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleLogClick(reminder)}
                              title={t('dashboard.medicine.table.logAdmin') || 'Log administration'}
                            >
                              <ClipboardCheck className="w-4 h-4 mr-1" />
                              {t('dashboard.medicine.table.log') || 'Log'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReminder(reminder);
                              router.push(
                                `/school/${encodeURIComponent(schoolId)}/admin/medicine?studentId=${reminder.student_id}&reminderId=${reminder.id}`
                              );
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t('dashboard.medicine.table.view') || 'View'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <AddReminderModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRefresh}
          schoolId={schoolId}
          students={students}
          classes={classes}
        />
      )}

      {/* Log Administration Modal */}
      {showLogModal && selectedReminder && (
        <LogAdministrationModal
          isOpen={showLogModal}
          onClose={() => {
            setShowLogModal(false);
            setSelectedReminder(null);
          }}
          onSuccess={handleRefresh}
          schoolId={schoolId}
          reminder={selectedReminder}
        />
      )}
    </div>
  );
}
