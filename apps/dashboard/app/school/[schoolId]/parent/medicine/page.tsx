'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { AddReminderModal } from '../../../../../components/medicine/AddReminderModal';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';

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

interface Log {
  id: string;
  reminder_id: string | null;
  student_id: string;
  administered_at: string;
  administered_by: string | null;
  status: string;
  note: string | null;
  medicine_reminders: {
    medicine_name: string;
    dosage: string;
  } | null;
}

export default function ParentMedicinePage() {
  const params = useParams();
  const { t } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Get current user and their children
  useEffect(() => {
    async function fetchChildren() {
      try {
        console.log('[Medicine] Fetching children for schoolId:', schoolId);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('[Medicine] Auth user:', authUser?.email, authUser?.id);
        if (!authUser) {
          console.error('[Medicine] No authenticated user');
          return;
        }

        // First, get the users table ID from auth_user_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .eq('auth_user_id', authUser.id)
          .single();

        console.log('[Medicine] Users table lookup:', { userData, userError });
        if (!userData) {
          console.error('[Medicine] User not found in users table');
          return;
        }

        console.log('[Medicine] Querying school_parent_students with:', {
          parent_user_id: userData.id,
          school_id: schoolId,
        });

        // Get children via school_parent_students using the users.id
        const { data: parentStudents, error } = await supabase
          .from('school_parent_students')
          .select(`
            student_id,
            school_students!inner(id, first_name, last_name, school_id)
          `)
          .eq('parent_user_id', userData.id)
          .eq('school_id', schoolId);

        console.log('[Medicine] Parent students query result:', { 
          count: parentStudents?.length || 0,
          error,
          data: parentStudents 
        });

        if (error) {
          console.error('[Medicine] Error fetching parent students:', error);
          return;
        }

        if (parentStudents && parentStudents.length > 0) {
          const childrenList = parentStudents.map((ps: any) => ({
            id: ps.student_id,
            first_name: ps.school_students.first_name,
            last_name: ps.school_students.last_name,
          }));
          console.log('[Medicine] Setting children:', childrenList);
          setChildren(childrenList);
          if (childrenList.length > 0) {
            setSelectedChildId(childrenList[0].id);
          }
        } else {
          console.warn('[Medicine] No children found - parentStudents is empty');
        }
      } catch (error) {
        console.error('[Medicine] Error fetching children:', error);
      }
    }

    fetchChildren();
  }, [schoolId]);

  // Fetch reminders and logs for selected child
  useEffect(() => {
    async function fetchData() {
      if (!selectedChildId) return;

      setLoading(true);
      try {
        // Fetch active reminders
        const remindersResponse = await fetch(
          `/api/school/${encodeURIComponent(schoolId)}/medicine/reminders?studentId=${selectedChildId}&status=active`
        );
        const remindersResult = await remindersResponse.json();
        if (remindersResult.success) {
          setReminders(remindersResult.data || []);
        }

        // Fetch logs
        const logsResponse = await fetch(
          `/api/school/${encodeURIComponent(schoolId)}/medicine/logs?studentId=${selectedChildId}`
        );
        const logsResult = await logsResponse.json();
        if (logsResult.success) {
          setLogs(logsResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching medicine data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [schoolId, selectedChildId]);

  const handleRefresh = () => {
    if (selectedChildId) {
      // Refresh reminders
      fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/reminders?studentId=${selectedChildId}&status=active`)
        .then(r => r.json())
        .then(result => {
          if (result.success) {
            setReminders(result.data || []);
          }
        });

      // Refresh logs
      fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/logs?studentId=${selectedChildId}`)
        .then(r => r.json())
        .then(result => {
          if (result.success) {
            setLogs(result.data || []);
          }
        });
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: t('dashboard.medicine.logStatus.completed') || 'Completed',
      missed: t('dashboard.medicine.logStatus.missed') || 'Missed',
      skipped: t('dashboard.medicine.logStatus.skipped') || 'Skipped',
    };
    return labels[status] || status;
  };

  if (children.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('dashboard.medicine.noChildren') || 'No children found'}</p>
        </div>
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.medicine.title') || 'Medicine Management'}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.medicine.parentSubtitle') || 'View and manage medicine reminders for your child'}
          </p>
        </div>
        {selectedChildId && (
          <Button
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.medicine.addReminder') || 'Add Reminder'}
          </Button>
        )}
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <Card className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.medicine.selectChild') || 'Select Child'}
          </label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('dashboard.medicine.loading') || 'Loading...'}</p>
        </div>
      ) : (
        <>
          {/* Active Medications */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.medicine.activeMedications') || 'Active Medications'}
              {selectedChild && ` - ${selectedChild.first_name} ${selectedChild.last_name}`}
            </h2>

            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('dashboard.medicine.noActiveReminders') || 'No active medications'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{reminder.medicine_name}</h3>
                        <p className="text-sm text-gray-600">
                          {reminder.dosage && `${reminder.dosage} • `}
                          {getFrequencyLabel(reminder.frequency)}
                        </p>
                      </div>
                    </div>
                    {reminder.time_of_day && reminder.time_of_day.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        {t('dashboard.medicine.time') || 'Time'}: {reminder.time_of_day.map(formatTime).join(', ')}
                      </p>
                    )}
                    {reminder.notes && (
                      <p className="text-sm text-gray-600">{reminder.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Administration Log */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.medicine.administrationLog') || 'Administration Log'}
            </h2>

            {logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('dashboard.medicine.noLogs') || 'No administration logs yet'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.medicine_reminders?.medicine_name || t('dashboard.medicine.unknownMedicine') || 'Unknown Medicine'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.administered_at).toLocaleString()}
                        </p>
                        {log.note && (
                          <p className="text-sm text-gray-600 mt-1">{log.note}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'missed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusLabel(log.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && selectedChildId && (
        <AddReminderModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRefresh}
          schoolId={schoolId}
          studentId={selectedChildId}
        />
      )}
    </div>
  );
}
