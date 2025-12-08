'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  student: {
    id: string;
    student_number?: string;
    first_name?: string;
    last_name?: string;
    class_id?: string;
    gender?: string;
    date_of_birth?: string;
    status?: string;
    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
    address?: string;
  } | null;
}

interface ClassOption {
  id: string;
  name: string;
  grade_level: string | null;
}

export function EditStudentModal({ isOpen, onClose, onSuccess, schoolId, student }: EditStudentModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    class_id: '',
    gender: '',
    date_of_birth: '',
    status: 'Active',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    address: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize form with student data when modal opens
  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        student_number: student.student_number || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        class_id: student.class_id || '',
        gender: student.gender || '',
        date_of_birth: student.date_of_birth || '',
        status: student.status || 'Active',
        parent_name: student.parent_name || '',
        parent_email: student.parent_email || '',
        parent_phone: student.parent_phone || '',
        address: student.address || '',
      });
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, student]);

  // Fetch classes when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      fetchClasses();
    }
  }, [isOpen, schoolId]);

  async function fetchClasses() {
    setLoadingClasses(true);
    try {
      const encodedSchoolId = encodeURIComponent(schoolId);
      const response = await fetch(`/api/school/classes?schoolId=${encodedSchoolId}&status=active&limit=100`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.records) {
          setClasses(data.data.records);
        }
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.student_number.trim()) {
      errors.student_number = t('dashboard.students.add.error.required') || 'Required';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = t('dashboard.students.add.error.required') || 'Required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = t('dashboard.students.add.error.required') || 'Required';
    }

    if (!formData.class_id) {
      errors.class_id = t('dashboard.students.add.error.required') || 'Required';
    }

    // Email validation
    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      errors.parent_email = t('dashboard.students.add.error.invalidEmail') || 'Invalid email format';
    }

    // Phone validation (minimum length)
    if (formData.parent_phone && formData.parent_phone.length < 8) {
      errors.parent_phone = t('dashboard.students.add.error.invalidPhone') || 'Phone number too short';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    if (!student?.id) {
      setError('Student ID is missing');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/school/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: formData.student_number.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          class_id: formData.class_id,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth || null,
          status: formData.status,
          parent_name: formData.parent_name.trim() || null,
          parent_email: formData.parent_email.trim() || null,
          parent_phone: formData.parent_phone.trim() || null,
          address: formData.address.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('dashboard.students.edit.error.generic') || 'Failed to update student');
      }

      // Success
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('dashboard.students.edit.error.generic') || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('dashboard.students.edit.title') || 'Edit Student'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
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
            {/* Student Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.students.add.studentCode') || 'Student Code'} *
              </label>
              <input
                type="text"
                required
                value={formData.student_number}
                onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.student_number ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="STU001"
                disabled={loading}
              />
              {fieldErrors.student_number && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.student_number}</p>
              )}
            </div>

            {/* Name - First and Last */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.firstName') || 'First Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John"
                  disabled={loading}
                />
                {fieldErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.lastName') || 'Last Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.last_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Smith"
                  disabled={loading}
                />
                {fieldErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Class and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.class') || 'Class'} *
                </label>
                <select
                  required
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.class_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading || loadingClasses}
                >
                  <option value="">{loadingClasses ? t('common.loading') || 'Loading...' : t('dashboard.students.add.selectClass') || 'Select Class'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.grade_level ? `(${cls.grade_level})` : ''}
                    </option>
                  ))}
                </select>
                {fieldErrors.class_id && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.class_id}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.status') || 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="Active">{t('dashboard.students.statusActive') || 'Active'}</option>
                  <option value="Inactive">{t('dashboard.students.statusInactive') || 'Inactive'}</option>
                </select>
              </div>
            </div>

            {/* Gender and DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.gender') || 'Gender'}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">{t('dashboard.students.add.selectGender') || 'Select Gender'}</option>
                  <option value="Male">{t('dashboard.students.gender.male') || 'Male'}</option>
                  <option value="Female">{t('dashboard.students.gender.female') || 'Female'}</option>
                  <option value="Other">{t('dashboard.students.gender.other') || 'Other'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.dob') || 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.students.add.parentPrimary') || 'Parent Information'}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.students.add.parentName') || 'Parent Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Parent Name"
                    disabled={loading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.students.add.parentEmail') || 'Parent Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.parent_email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="parent@example.com"
                      disabled={loading}
                    />
                    {fieldErrors.parent_email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.parent_email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.students.add.parentPhone') || 'Parent Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.parent_phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+1234567890"
                      disabled={loading}
                    />
                    {fieldErrors.parent_phone && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.parent_phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.students.profile.address') || 'Address'}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address..."
                rows={2}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {t('dashboard.students.add.cancel') || 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (t('common.loading') || 'Saving...') : (t('dashboard.students.edit.save') || 'Save Changes')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}




