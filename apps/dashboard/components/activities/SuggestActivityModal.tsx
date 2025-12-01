'use client';

import { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { uploadActivityFiles } from '../../lib/supabase/storage';
import { ClassOption } from './types';

interface SuggestActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes: ClassOption[];
}

export function SuggestActivityModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes,
}: SuggestActivityModalProps) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    date: '',
  });

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user record to get parent_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

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

      // Insert suggestion
      const { data: suggestionData, error: insertError } = await supabase
        .from('school_activity_suggestions')
        .insert([{
          school_id: resolvedSchoolId,
          parent_id: userData?.id || null,
          class_id: formData.class_id || null,
          date: formData.date || null,
          title: formData.title,
          description: formData.description || null,
          attachments: [],
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!suggestionData?.id) throw new Error('Failed to create suggestion');

      // Upload files if any
      if (selectedFiles.length > 0) {
        const suggestionId = suggestionData.id;
        const uploadedFiles = await uploadActivityFiles(
          resolvedSchoolId,
          `suggestions/${suggestionId}`,
          selectedFiles
        );
        
        // Update suggestion with attachments
        const { error: attachError } = await supabase
          .from('school_activity_suggestions')
          .update({ attachments: uploadedFiles })
          .eq('id', suggestionId);

        if (attachError) {
          console.error('Failed to update attachments:', attachError);
        }
      }

      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({ title: '', description: '', class_id: '', date: '' });
      setSelectedFiles([]);
    } catch (err: any) {
      console.error('Error submitting suggestion:', err);
      setError(err.message || 'Failed to submit suggestion');
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
              {t('dashboard.activities.suggest.title') || 'Suggest an Activity'}
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
              <p className="text-sm text-gray-600">
                {t('dashboard.activities.suggest.description') || 'Share your ideas for activities with the school administrators.'}
              </p>

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
                  rows={4}
                  placeholder={t('dashboard.activities.suggest.placeholder') || 'Describe the activity you\'d like to suggest...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Optional: Class & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.class') || 'Class'} (optional)
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => handleChange('class_id', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.grade_level && `(${cls.grade_level})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.activities.modal.date') || 'Date'} (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.activities.suggest.attachments') || 'Attachments'} (optional)
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
                ? (t('dashboard.activities.modal.saving') || 'Submitting...')
                : (t('dashboard.activities.suggest.submit') || 'Submit Suggestion')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}







