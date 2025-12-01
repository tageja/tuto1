'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { ClassOption } from './types';

interface AddWeekActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes: ClassOption[];
}

interface TimeSlot {
  id: string;
  time: string;
  monday: { title: string; type: string; description: string };
  tuesday: { title: string; type: string; description: string };
  wednesday: { title: string; type: string; description: string };
  thursday: { title: string; type: string; description: string };
  friday: { title: string; type: string; description: string };
  saturday: { title: string; type: string; description: string };
  sunday: { title: string; type: string; description: string };
}

const ACTIVITY_TYPES = ['Meal', 'Learning', 'Play', 'Rest'] as const;
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// Helper: Get next Monday from a date
function getNextMonday(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function AddWeekActivitiesModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes,
}: AddWeekActivitiesModalProps) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(getNextMonday());
  const [classId, setClassId] = useState('');
  const [grade, setGrade] = useState('');
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '08:30', monday: { title: '', type: 'Meal', description: '' }, tuesday: { title: '', type: 'Meal', description: '' }, wednesday: { title: '', type: 'Meal', description: '' }, thursday: { title: '', type: 'Meal', description: '' }, friday: { title: '', type: 'Meal', description: '' }, saturday: { title: '', type: 'Meal', description: '' }, sunday: { title: '', type: 'Meal', description: '' } },
    { id: '2', time: '09:00', monday: { title: '', type: 'Learning', description: '' }, tuesday: { title: '', type: 'Learning', description: '' }, wednesday: { title: '', type: 'Learning', description: '' }, thursday: { title: '', type: 'Learning', description: '' }, friday: { title: '', type: 'Learning', description: '' }, saturday: { title: '', type: 'Learning', description: '' }, sunday: { title: '', type: 'Learning', description: '' } },
    { id: '3', time: '10:00', monday: { title: '', type: 'Play', description: '' }, tuesday: { title: '', type: 'Play', description: '' }, wednesday: { title: '', type: 'Play', description: '' }, thursday: { title: '', type: 'Play', description: '' }, friday: { title: '', type: 'Play', description: '' }, saturday: { title: '', type: 'Play', description: '' }, sunday: { title: '', type: 'Play', description: '' } },
    { id: '4', time: '12:00', monday: { title: '', type: 'Meal', description: '' }, tuesday: { title: '', type: 'Meal', description: '' }, wednesday: { title: '', type: 'Meal', description: '' }, thursday: { title: '', type: 'Meal', description: '' }, friday: { title: '', type: 'Meal', description: '' }, saturday: { title: '', type: 'Meal', description: '' }, sunday: { title: '', type: 'Meal', description: '' } },
  ]);

  // Auto-populate grade when class is selected
  useEffect(() => {
    if (classId) {
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass?.grade_level) {
        setGrade(selectedClass.grade_level);
      }
    }
  }, [classId, classes]);

  if (!isOpen) return null;

  const addTimeSlot = () => {
    const newId = String(Math.max(...timeSlots.map(s => parseInt(s.id))) + 1);
    setTimeSlots([...timeSlots, {
      id: newId,
      time: '09:00',
      monday: { title: '', type: 'Learning', description: '' },
      tuesday: { title: '', type: 'Learning', description: '' },
      wednesday: { title: '', type: 'Learning', description: '' },
      thursday: { title: '', type: 'Learning', description: '' },
      friday: { title: '', type: 'Learning', description: '' },
      saturday: { title: '', type: 'Learning', description: '' },
      sunday: { title: '', type: 'Learning', description: '' },
    }]);
  };

  const updateCell = (slotId: string, day: typeof DAY_KEYS[number], field: 'title' | 'type' | 'description', value: string) => {
    setTimeSlots(slots => slots.map(slot => 
      slot.id === slotId 
        ? { ...slot, [day]: { ...slot[day], [field]: value } }
        : slot
    ));
  };

  const updateTime = (slotId: string, time: string) => {
    setTimeSlots(slots => slots.map(slot => 
      slot.id === slotId ? { ...slot, time } : slot
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!classId) {
      setError(t('dashboard.activities.validations.classRequired') || 'Please select a class');
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

      // Flatten grid to activities array
      const activities: any[] = [];
      const weekStartDate = new Date(weekStart);

      timeSlots.forEach(slot => {
        DAY_KEYS.forEach((day, dayIndex) => {
          const cell = slot[day];
          if (cell.title.trim()) {
            const activityDate = new Date(weekStartDate);
            activityDate.setDate(weekStartDate.getDate() + dayIndex);
            
            activities.push({
              school_id: resolvedSchoolId,
              date: activityDate.toISOString().split('T')[0],
              time: slot.time,
              class_id: classId,
              grade: grade || 'N/A',
              title: cell.title.trim(),
              description: cell.description.trim() || null,
              type: cell.type,
              status: 'Pending',
              teacher_id: null,
              menu_details: null,
              outdoor_detail: null,
              attachments: [],
            });
          }
        });
      });

      if (activities.length === 0) {
        setError('At least one activity cell must be filled');
        setLoading(false);
        return;
      }

      // Call bulk API
      const response = await fetch('/api/activities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      });

      if (!response.ok) {
        throw new Error('Failed to create week activities');
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
      setWeekStart(getNextMonday());
    } catch (err: any) {
      console.error('Error creating week activities:', err);
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
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.activities.weekModal.title') || 'Add Week (Timetable)'}
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
              {/* Week Start & Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.weekModal.weekStart') || 'Week Starting (Monday)'} *
                  </label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.weekModal.class') || 'Class'} *
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

              {/* Week Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Weekly Timetable
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('dashboard.activities.weekModal.addSlot') || 'Add Time Slot'}
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-20">{t('dashboard.activities.weekModal.time') || 'Time'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.monday') || 'Mon'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.tuesday') || 'Tue'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.wednesday') || 'Wed'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.thursday') || 'Thu'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.friday') || 'Fri'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.saturday') || 'Sat'}</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">{t('dashboard.activities.weekModal.sunday') || 'Sun'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot) => (
                        <tr key={slot.id} className="border-t border-gray-200">
                          <td className="px-2 py-2">
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) => updateTime(slot.id, e.target.value)}
                              className="w-full h-9 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          {DAY_KEYS.map(day => (
                            <td key={day} className="px-2 py-2">
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={slot[day].title}
                                  onChange={(e) => updateCell(slot.id, day, 'title', e.target.value)}
                                  placeholder="Title..."
                                  className="w-full h-8 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <select
                                  value={slot[day].type}
                                  onChange={(e) => updateCell(slot.id, day, 'type', e.target.value)}
                                  className="w-full h-8 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  {ACTIVITY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          ))}
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
                : (t('dashboard.activities.weekModal.save') || 'Create Week')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}







