'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  studentId?: string; // Pre-selected student (for parent view)
  students?: Array<{ id: string; first_name: string; last_name: string; class_id?: string }>;
  classes?: Array<{ id: string; name: string }>;
}

export function AddReminderModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  studentId: preSelectedStudentId,
  students = [],
  classes = [],
}: AddReminderModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [allStudents, setAllStudents] = useState<Array<{ id: string; first_name: string; last_name: string; class_id?: string }>>([]);
  const [filteredStudents, setFilteredStudents] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);

  // Always sync props to state - props take priority when available
  useEffect(() => {
    if (classes.length > 0) {
      setAvailableClasses(classes);
    }
  }, [classes]);

  useEffect(() => {
    if (students.length > 0) {
      setAllStudents(students);
    }
  }, [students]);

  // Form state
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState(preSelectedStudentId || '');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'twice_daily' | 'as_needed'>('daily');
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch classes and students as fallback (if props aren't provided)
  useEffect(() => {
    if (isOpen && !preSelectedStudentId) {
      // Only fetch classes if props are empty AND local state is still empty
      // Classes API returns { data: { records: [...] } }
      if (classes.length === 0 && availableClasses.length === 0) {
        fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}`)
          .then(r => r.json())
          .then(result => {
            if (result.success && result.data?.records) {
              setAvailableClasses(result.data.records.map((c: any) => ({
                id: c.id,
                name: c.name,
              })));
            }
          })
          .catch(console.error);
      }

      // Only fetch students if props are empty AND local state is still empty
      if (students.length === 0 && allStudents.length === 0) {
        fetch(`/api/school/students?schoolId=${encodeURIComponent(schoolId)}&pageSize=500`)
          .then(r => r.json())
          .then(result => {
            if (result.success && result.data?.records) {
              setAllStudents(result.data.records.map((s: any) => ({
                id: s.id,
                first_name: s.first_name || s.firstName,
                last_name: s.last_name || s.lastName,
                class_id: s.classId || s.class_id,
              })));
            }
          })
          .catch(console.error);
      }
    }
  }, [isOpen, schoolId, preSelectedStudentId, classes.length, students.length, availableClasses.length, allStudents.length]);

  // Filter students when class changes
  useEffect(() => {
    if (classId) {
      const filtered = allStudents.filter(s => s.class_id === classId);
      setFilteredStudents(filtered);
      setStudentId(''); // Reset student selection when class changes
    } else {
      setFilteredStudents([]);
    }
  }, [classId, allStudents]);

  useEffect(() => {
    if (preSelectedStudentId) {
      setStudentId(preSelectedStudentId);
    }
  }, [preSelectedStudentId]);

  const handleAddTime = () => {
    setTimeOfDay([...timeOfDay, '13:30']);
  };

  const handleRemoveTime = (index: number) => {
    setTimeOfDay(timeOfDay.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const updated = [...timeOfDay];
    updated[index] = value;
    setTimeOfDay(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !medicineName || !frequency || !startDate) {
      alert(t('dashboard.medicine.form.requiredFields') || 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          medicine_name: medicineName,
          dosage,
          frequency,
          time_of_day: timeOfDay.length > 0 ? timeOfDay : null,
          start_date: startDate,
          end_date: endDate || null,
          notes: notes || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setMedicineName('');
        setDosage('');
        setFrequency('daily');
        setTimeOfDay([]);
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setNotes('');
      } else {
        alert(result.error || 'Failed to create reminder');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('dashboard.medicine.addReminder') || 'Add Medicine Reminder'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Class & Student (only if not pre-selected) */}
            {!preSelectedStudentId && (
              <>
                {/* Class Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.medicine.form.class') || 'Class'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('dashboard.medicine.form.selectClass') || 'Select class'}</option>
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Selector (enabled after class is selected) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.medicine.form.student') || 'Student'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    disabled={!classId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!classId 
                        ? (t('dashboard.medicine.form.selectClassFirst') || 'Select a class first')
                        : (t('dashboard.medicine.form.selectStudent') || 'Select student')
                      }
                    </option>
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Medicine Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.form.medicineName') || 'Medicine Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.medicine.form.medicineNamePlaceholder') || 'e.g., Cough syrup'}
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.form.dosage') || 'Dosage'}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.medicine.form.dosagePlaceholder') || 'e.g., 5 ml'}
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.form.frequency') || 'Frequency'} <span className="text-red-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="once">{t('dashboard.medicine.frequency.once') || 'Once'}</option>
                <option value="daily">{t('dashboard.medicine.frequency.daily') || 'Daily'}</option>
                <option value="twice_daily">{t('dashboard.medicine.frequency.twiceDaily') || 'Twice Daily'}</option>
                <option value="as_needed">{t('dashboard.medicine.frequency.asNeeded') || 'As Needed'}</option>
              </select>
            </div>

            {/* Time of Day (optional for PRN) */}
            {frequency !== 'as_needed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.medicine.form.timeOfDay') || 'Time of Day'}
                </label>
                <div className="space-y-2">
                  {timeOfDay.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveTime(index)}
                      >
                        {t('dashboard.medicine.form.remove') || 'Remove'}
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTime}
                  >
                    {t('dashboard.medicine.form.addTime') || '+ Add Time'}
                  </Button>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.medicine.form.startDate') || 'Start Date'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.medicine.form.endDate') || 'End Date'}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.form.notes') || 'Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.medicine.form.notesPlaceholder') || 'Additional notes...'}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('dashboard.medicine.form.cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (t('dashboard.medicine.form.saving') || 'Saving...') : (t('dashboard.medicine.form.save') || 'Save')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

