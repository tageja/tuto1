'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { useI18n } from '../../../contexts/I18nContext';

interface TeacherQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
}

export function TeacherQuickAddModal({ isOpen, onClose, onSuccess, schoolId }: TeacherQuickAddModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    'Teacher Name': '',
    'School Name': schoolId,
    Email: '',
    Phone: '',
    Subjects: '',
    Status: 'Active',
    'Hire Date': new Date().toISOString().split('T')[0],
    Nationality: '',
    Education: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // API expects name, school_id (school comes from page context — admin is already in a school)
      const payload = {
        name: formData['Teacher Name'].trim(),
        school_id: schoolId,
        email: formData.Email?.trim() || null,
        phone: formData.Phone?.trim() || null,
        subjects: formData.Subjects?.trim() || null,
        qualifications: formData.Education?.trim() || null,
        hire_date: formData['Hire Date'] || new Date().toISOString().split('T')[0],
        status: formData.Status || 'active',
      };
      const response = await fetch('/api/school/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create teacher');
      }

      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        'Teacher Name': '',
        'School Name': schoolId,
        Email: '',
        Phone: '',
        Subjects: '',
        Status: 'Active',
        'Hire Date': new Date().toISOString().split('T')[0],
        Nationality: '',
        Education: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('dashboard.teachers.quickAdd')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Teacher Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.teacherName')} *
              </label>
              <input
                type="text"
                required
                value={formData['Teacher Name']}
                onChange={(e) => setFormData({ ...formData, 'Teacher Name': e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.email')}
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.smith@school.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.Phone}
                  onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.subjects')} *
              </label>
              <textarea
                required
                value={formData.Subjects}
                onChange={(e) => setFormData({ ...formData, Subjects: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mathematics, Physics (separate with commas)"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
            </div>

            {/* Status & Hire Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.status')}
                </label>
                <select
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">{t('dashboard.teachers.status.active')}</option>
                  <option value="On Leave">{t('dashboard.teachers.status.onLeave')}</option>
                  <option value="Inactive">{t('dashboard.teachers.status.inactive')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.hireDate')}
                </label>
                <input
                  type="date"
                  value={formData['Hire Date']}
                  onChange={(e) => setFormData({ ...formData, 'Hire Date': e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Nationality & Education */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.nationality')}
                </label>
                <input
                  type="text"
                  value={formData.Nationality}
                  onChange={(e) => setFormData({ ...formData, Nationality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vietnamese"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.qualification')}
                </label>
                <input
                  type="text"
                  value={formData.Education}
                  onChange={(e) => setFormData({ ...formData, Education: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bachelor's in Education"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {t('dashboard.teachers.form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? t('common.loading') : t('dashboard.teachers.form.create')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}














