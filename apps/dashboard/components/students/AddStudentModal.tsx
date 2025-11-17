'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';
import { uploadStudentPhoto } from '../../lib/supabase/storage';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
}

interface ClassOption {
  id: string;
  name: string;
  grade_level: string | null;
}

export function AddStudentModal({ isOpen, onClose, onSuccess, schoolId }: AddStudentModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    class_id: '',
    grade: '',
    gender: '',
    date_of_birth: '',
    contact_phone: '',
    contact_email: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    photo: null as File | null,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  // Check for duplicate student code
  async function checkDuplicate(studentCode: string) {
    if (!studentCode || !schoolId) {
      setDuplicateError(null);
      return false;
    }

    try {
      const encodedSchoolId = encodeURIComponent(schoolId);
      const response = await fetch(
        `/api/school/students?schoolId=${encodedSchoolId}&q=${encodeURIComponent(studentCode)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.records) {
          const existing = data.data.records.find(
            (s: any) => s.code?.toLowerCase() === studentCode.toLowerCase()
          );
          if (existing) {
            setDuplicateError(t('dashboard.students.add.error.duplicateCode') || 'Student Code already exists');
            return true;
          }
        }
      }
      setDuplicateError(null);
      return false;
    } catch (err) {
      console.error('Error checking duplicate:', err);
      return false;
    }
  }

  // Handle student code change with debounce
  useEffect(() => {
    if (!formData.student_number) {
      setDuplicateError(null);
      return;
    }

    const timer = setTimeout(() => {
      checkDuplicate(formData.student_number);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.student_number, schoolId]);

  // Update grade when class changes
  useEffect(() => {
    if (formData.class_id) {
      const selectedClass = classes.find((c) => c.id === formData.class_id);
      if (selectedClass?.grade_level) {
        setFormData((prev) => ({ ...prev, grade: selectedClass.grade_level }));
      }
    }
  }, [formData.class_id, classes]);

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

    // Grade is derived from class, so we don't need to validate it separately
    // But we should ensure a class is selected which will have a grade

    // Email validation
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = t('dashboard.students.add.error.invalidEmail') || 'Invalid email format';
    }

    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      errors.parent_email = t('dashboard.students.add.error.invalidEmail') || 'Invalid email format';
    }

    // Phone validation (minimum length)
    if (formData.contact_phone && formData.contact_phone.length < 8) {
      errors.contact_phone = t('dashboard.students.add.error.invalidPhone') || 'Phone number too short';
    }

    if (formData.parent_phone && formData.parent_phone.length < 8) {
      errors.parent_phone = t('dashboard.students.add.error.invalidPhone') || 'Phone number too short';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && !duplicateError;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    if (duplicateError) {
      setError(duplicateError);
      return;
    }

    setLoading(true);

    try {
      // Upload photo if provided
      let photoUrl: string | null = null;
      if (formData.photo) {
        try {
          photoUrl = await uploadStudentPhoto(schoolId, formData.student_number, formData.photo);
        } catch (photoError: any) {
          console.error('Photo upload error:', photoError);
          // Don't block student creation if photo upload fails
        }
      }

      // Prepare request body
      // Note: grade is stored on school_classes, not sent separately
      // contact_phone/contact_email map to parent fields if parent fields are empty
      const requestBody: any = {
        school_id: schoolId,
        student_number: formData.student_number.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        class_id: formData.class_id,
        status: 'Active',
        // created_at will be set automatically by the database
      };

      // Optional fields
      if (formData.gender) requestBody.gender = formData.gender;
      if (formData.date_of_birth) requestBody.date_of_birth = formData.date_of_birth;
      
      // Parent fields (use contact fields as fallback if parent fields are empty)
      if (formData.parent_name) requestBody.parent_name = formData.parent_name.trim();
      if (formData.parent_email) {
        requestBody.parent_email = formData.parent_email.trim();
      } else if (formData.contact_email) {
        requestBody.contact_email = formData.contact_email.trim();
      }
      if (formData.parent_phone) {
        requestBody.parent_phone = formData.parent_phone.trim();
      } else if (formData.contact_phone) {
        requestBody.contact_phone = formData.contact_phone.trim();
      }
      
      if (photoUrl) requestBody.photo_url = photoUrl;

      const response = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.code === 'DUPLICATE_STUDENT_CODE') {
          setDuplicateError(data.error || t('dashboard.students.add.error.duplicateCode') || 'Student Code already exists');
          setError(data.error || t('dashboard.students.add.error.duplicateCode') || 'Student Code already exists');
        } else {
          throw new Error(data.error || t('dashboard.students.add.error.generic') || 'Failed to create student');
        }
        return;
      }

      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        student_number: '',
        first_name: '',
        last_name: '',
        class_id: '',
        grade: '',
        gender: '',
        date_of_birth: '',
        contact_phone: '',
        contact_email: '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        photo: null,
      });
      setDuplicateError(null);
      setFieldErrors({});
    } catch (err: any) {
      setError(err.message || t('dashboard.students.add.error.generic') || 'Failed to create student');
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
            <h2 className="text-2xl font-bold">{t('dashboard.students.add.title') || 'Add Student'}</h2>
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
                onChange={(e) => {
                  setFormData({ ...formData, student_number: e.target.value });
                  setDuplicateError(null);
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.student_number || duplicateError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="STU001"
                disabled={loading}
              />
              {fieldErrors.student_number && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.student_number}</p>
              )}
              {duplicateError && (
                <p className="mt-1 text-sm text-red-600">{duplicateError}</p>
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

            {/* Class and Grade */}
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
                  {t('dashboard.students.add.grade') || 'Grade'}
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder={t('dashboard.students.add.gradeAuto') || 'Auto-filled from class'}
                  disabled={loading || !formData.class_id}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('dashboard.students.add.gradeHint') || 'Grade is automatically set from the selected class'}
                </p>
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

            {/* Contact Phone/Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.contactPhone') || 'Contact Phone'}
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.contact_phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1234567890"
                  disabled={loading}
                />
                {fieldErrors.contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.contact_phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.students.add.contactEmail') || 'Contact Email'}
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.contact_email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="contact@example.com"
                  disabled={loading}
                />
                {fieldErrors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.contact_email}</p>
                )}
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

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.students.add.photo') || 'Photo'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, photo: file });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('dashboard.students.add.photoHint') || 'Optional: Upload student photo (JPG, PNG)'}
              </p>
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
                disabled={loading || !!duplicateError}
                className="flex-1"
              >
                {loading ? (t('common.loading') || 'Saving...') : (t('dashboard.students.add.save') || 'Save')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

