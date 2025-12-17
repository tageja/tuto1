'use client';

import { useState, useEffect } from 'react';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { uploadActivityFiles } from '../../lib/supabase/storage';
import { DailyActivity, ClassOption } from './types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  activity?: DailyActivity;
  classes: ClassOption[];
}

interface TeacherOption {
  id: string;
  name: string;
}

const ACTIVITY_TYPES = ['Meal', 'Learning', 'Play', 'Rest'] as const;
const ACTIVITY_STATUSES = ['Pending', 'In Progress', 'Completed'] as const;

// Helper: Get today's date in Asia/Ho_Chi_Minh timezone
function getTodayDate(): string {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AddActivityModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  activity,
  classes,
}: AddActivityModalProps) {
  const { t } = useI18n();
  const isEditMode = !!activity?.id;

  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    date: activity?.date || getTodayDate(),
    time: activity?.time || '09:00',
    class_id: activity?.class_id || '',
    grade: activity?.grade || '',
    teacher_id: activity?.teacher_id || '',
    title: activity?.title || '',
    description: activity?.description || '',
    type: activity?.type || 'Learning',
    status: activity?.status || 'Pending',
    menu_details: activity?.menu_details || '',
    outdoor_detail: activity?.outdoor_detail || '',
  });

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      fetchTeachers();
    }
  }, [isOpen, schoolId]);

  // Auto-populate grade when class is selected
  useEffect(() => {
    if (formData.class_id) {
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (selectedClass?.grade_level && !activity?.id) {
        setFormData(prev => ({ ...prev, grade: selectedClass.grade_level || '' }));
      }
    }
  }, [formData.class_id, classes, activity?.id]);

  async function fetchTeachers() {
    try {
      const response = await fetch(`/api/school/teachers?schoolId=${encodeURIComponent(schoolId)}&status=active&limit=100`);
      
      if (!response.ok) {
        console.error('Failed to fetch teachers');
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data?.records) {
        setTeachers(result.data.records.map((t: any) => ({
          id: t.id,
          name: t.name,
        })));
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  }

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build data object
      const dataToSave: any = {
        date: formData.date,
        time: formData.time,
        class_id: formData.class_id,
        grade: formData.grade,
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        status: formData.status,
        teacher_id: formData.teacher_id || null,
        menu_details: formData.menu_details || null,
        outdoor_detail: formData.outdoor_detail || null,
      };

      let activityId = activity?.id;
      let response;

      if (isEditMode) {
        // Update existing activity
        response = await fetch('/api/school/daily-activities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: activity.id,
            updates: dataToSave,
          }),
        });
      } else {
        // Insert new activity
        response = await fetch('/api/school/daily-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId,
            activity: dataToSave,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save activity');
      }

      const result = await response.json();
      
      if (!isEditMode && result.data?.id) {
        activityId = result.data.id;
      }

      // Upload files if any selected
      if (selectedFiles.length > 0 && activityId) {
        // TODO: Implement file upload via API route
        // For now, keep using direct storage upload
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let resolvedSchoolId = schoolId;
        
        if (!uuidRegex.test(schoolId)) {
          // Call API to resolve school ID
          const schoolResponse = await fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&limit=1`);
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json();
            // Extract school ID from the response if needed
            resolvedSchoolId = schoolId; // Keep as is for now
          }
        }
        
        const uploadedFiles = await uploadActivityFiles(resolvedSchoolId, activityId, selectedFiles);
        
        // Update activity with attachments via API
        await fetch('/api/school/daily-activities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId,
            updates: { attachments: uploadedFiles },
          }),
        });
      }

      // Success - close modal and trigger parent refetch
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedFiles([]);
    } catch (err: any) {
      console.error('Error saving activity:', err);
      setError(err.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
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
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode 
                ? (t('dashboard.activities.modal.editTitle') || 'Edit Activity')
                : (t('dashboard.activities.modal.addTitle') || 'Add Activity')
              }
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
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.date') || 'Date'} *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.time') || 'Time'} *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.class') || 'Class'} *
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) => handleChange('class_id', e.target.value)}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">{t('dashboard.activities.modal.selectClass') || 'Select a class'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.grade_level && `(${cls.grade_level})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.grade') || 'Grade'} *
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  placeholder="e.g., Kindergarten, Grade 1"
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Teacher (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.teacher') || 'Teacher'}
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => handleChange('teacher_id', e.target.value)}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('dashboard.activities.modal.selectTeacher') || 'Select a teacher (optional)'}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.title') || 'Title'} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={t('dashboard.activities.modal.titlePlaceholder') || 'e.g., Morning Circle Time'}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.description') || 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  placeholder={t('dashboard.activities.modal.descriptionPlaceholder') || 'Activity details...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.type') || 'Type'} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.status') || 'Status'} *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {ACTIVITY_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Menu Details (conditional on Meal type) */}
              {formData.type === 'Meal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.menuDetails') || 'Menu Details'}
                  </label>
                  <textarea
                    value={formData.menu_details}
                    onChange={(e) => handleChange('menu_details', e.target.value)}
                    rows={2}
                    placeholder={t('dashboard.activities.modal.menuPlaceholder') || 'What\'s on the menu?'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Outdoor Detail (for Play/Rest activities) */}
              {(formData.type === 'Play' || formData.type === 'Rest') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.outdoorDetail') || 'Outdoor Details'}
                  </label>
                  <textarea
                    value={formData.outdoor_detail}
                    onChange={(e) => handleChange('outdoor_detail', e.target.value)}
                    rows={2}
                    placeholder={t('dashboard.activities.modal.outdoorPlaceholder') || 'Outdoor activity details...'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.modal.attachments') || 'Attachments'}
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {isImageFile(file) ? (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                ? (t('dashboard.activities.modal.saving') || 'Saving...')
                : isEditMode
                  ? (t('dashboard.activities.modal.update') || 'Update')
                  : (t('dashboard.activities.modal.create') || 'Create')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
