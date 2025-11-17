'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Copy, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { ClassOption } from './types';

interface AddDayActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes: ClassOption[];
  selectedDate: string;
}

interface ActivityRow {
  id: string;
  time: string;
  title: string;
  type: 'Meal' | 'Learning' | 'Play' | 'Rest';
  status: 'Pending' | 'In Progress' | 'Completed';
  teacher_id: string;
  description: string;
  menu_details: string;
  outdoor_detail: string;
}

interface TeacherOption {
  id: string;
  name: string;
}

const ACTIVITY_TYPES = ['Meal', 'Learning', 'Play', 'Rest'] as const;
const ACTIVITY_STATUSES = ['Pending', 'In Progress', 'Completed'] as const;

export function AddDayActivitiesModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes,
  selectedDate,
}: AddDayActivitiesModalProps) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [date, setDate] = useState(selectedDate);
  const [classId, setClassId] = useState('');
  const [grade, setGrade] = useState('');
  
  const [rows, setRows] = useState<ActivityRow[]>([
    { id: '1', time: '08:30', title: '', type: 'Meal', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
    { id: '2', time: '09:00', title: '', type: 'Learning', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
    { id: '3', time: '10:00', title: '', type: 'Play', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
    { id: '4', time: '11:00', title: '', type: 'Learning', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
    { id: '5', time: '12:00', title: '', type: 'Meal', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
    { id: '6', time: '14:00', title: '', type: 'Rest', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
  ]);

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      fetchTeachers();
    }
  }, [isOpen, schoolId]);

  // Auto-populate grade when class is selected
  useEffect(() => {
    if (classId) {
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass?.grade_level) {
        setGrade(selectedClass.grade_level);
      }
    }
  }, [classId, classes]);

  async function fetchTeachers() {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let resolvedSchoolId = schoolId;
      
      if (!uuidRegex.test(schoolId)) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .ilike('name', schoolId)
          .limit(1)
          .maybeSingle();
        
        if (schoolData?.id) {
          resolvedSchoolId = schoolData.id;
        } else {
          return;
        }
      }

      const { data } = await supabase
        .from('school_teachers')
        .select('id, name')
        .eq('school_id', resolvedSchoolId)
        .in('status', ['active', 'Active'])
        .order('name', { ascending: true })
        .limit(100);

      setTeachers(data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  }

  if (!isOpen) return null;

  const addRow = () => {
    const newId = String(Math.max(...rows.map(r => parseInt(r.id))) + 1);
    setRows([...rows, {
      id: newId,
      time: '09:00',
      title: '',
      type: 'Learning',
      status: 'Pending',
      teacher_id: '',
      description: '',
      menu_details: '',
      outdoor_detail: '',
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const duplicateRow = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (row) {
      const newId = String(Math.max(...rows.map(r => parseInt(r.id))) + 1);
      setRows([...rows, { ...row, id: newId, title: '' }]);
    }
  };

  const updateRow = (id: string, field: keyof ActivityRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!classId) {
      setError(t('dashboard.activities.validations.classRequired') || 'Please select a class');
      return;
    }

    const validRows = rows.filter(r => r.time && r.title.trim());
    if (validRows.length === 0) {
      setError(t('dashboard.activities.validations.required') || 'At least one activity is required');
      return;
    }

    setLoading(true);

    try {
      // Resolve schoolId to UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let resolvedSchoolId = schoolId;
      
      if (!uuidRegex.test(schoolId)) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .ilike('name', schoolId)
          .limit(1)
          .maybeSingle();
        
        if (schoolData?.id) {
          resolvedSchoolId = schoolData.id;
        } else {
          throw new Error('Could not resolve school ID');
        }
      }

      // Build activities array
      const activitiesToCreate = validRows.map(row => ({
        school_id: resolvedSchoolId,
        date,
        time: row.time,
        class_id: classId,
        grade: grade || 'N/A',
        title: row.title.trim(),
        description: row.description.trim() || null,
        type: row.type,
        status: row.status,
        teacher_id: row.teacher_id || null,
        menu_details: row.menu_details.trim() || null,
        outdoor_detail: row.outdoor_detail.trim() || null,
        attachments: [],
      }));

      // Call bulk API
      const response = await fetch('/api/activities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: activitiesToCreate }),
      });

      if (!response.ok) {
        throw new Error('Failed to create activities');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create activities');
      }

      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setClassId('');
      setGrade('');
      setRows([
        { id: '1', time: '08:30', title: '', type: 'Meal', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
        { id: '2', time: '09:00', title: '', type: 'Learning', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
        { id: '3', time: '10:00', title: '', type: 'Play', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
        { id: '4', time: '11:00', title: '', type: 'Learning', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
        { id: '5', time: '12:00', title: '', type: 'Meal', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
        { id: '6', time: '14:00', title: '', type: 'Rest', status: 'Pending', teacher_id: '', description: '', menu_details: '', outdoor_detail: '' },
      ]);
    } catch (err: any) {
      console.error('Error creating day activities:', err);
      setError(err.message || 'Failed to create activities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.activities.dayModal.title') || "Add Day's Activities"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Date & Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.dayModal.date') || 'Date'} *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.dayModal.class') || 'Class'} *
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.grade_level && `(${cls.grade_level})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activities Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Activities for this day
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('dashboard.activities.dayModal.addRow') || 'Add Row'}
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-24">
                          {t('dashboard.activities.dayModal.time') || 'Time'}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          {t('dashboard.activities.dayModal.activityTitle') || 'Title'} *
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-32">
                          {t('dashboard.activities.dayModal.type') || 'Type'}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-32">
                          {t('dashboard.activities.dayModal.status') || 'Status'}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-40">
                          {t('dashboard.activities.dayModal.teacher') || 'Teacher'}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id} className="border-t border-gray-200">
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              value={row.time}
                              onChange={(e) => updateRow(row.id, 'time', e.target.value)}
                              className="w-full h-9 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                              placeholder="Activity title..."
                              className="w-full h-9 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.type}
                              onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                              className="w-full h-9 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {ACTIVITY_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.status}
                              onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                              className="w-full h-9 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {ACTIVITY_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.teacher_id}
                              onChange={(e) => updateRow(row.id, 'teacher_id', e.target.value)}
                              className="w-full h-9 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">None</option>
                              {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateRow(row.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title={t('dashboard.activities.dayModal.duplicateRow') || 'Duplicate'}
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="p-1 hover:bg-red-100 rounded"
                                title={t('dashboard.activities.dayModal.removeRow') || 'Remove'}
                                disabled={rows.length === 1}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t('dashboard.activities.modal.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading 
                ? (t('dashboard.activities.modal.saving') || 'Creating...')
                : (t('dashboard.activities.dayModal.save') || 'Create Activities')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


