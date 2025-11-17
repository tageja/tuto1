'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../../../components/ui/Button';
import { Card } from '../../../../../../../components/ui/Card';
import { LoadingState } from '../../../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../../../contexts/I18nContext';

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);
  const teacherId = params.teacherId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    'Teacher Name': '',
    Email: '',
    Phone: '',
    Position: '',
    Subjects: '',
    'Grade Levels': '',
    Status: 'Active',
    'Hire Date': '',
    'Experience Years': 0,
    Nationality: '',
    Education: '',
    Bio: '',
    Hobbies: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTeacher();
  }, [teacherId]);

  async function fetchTeacher() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/school/teachers/${teacherId}?schoolId=${encodeURIComponent(schoolId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch teacher');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const fields = data.data.fields || {};
        setFormData({
          'Teacher Name': fields['Teacher Name'] || '',
          Email: fields.Email || '',
          Phone: fields.Phone || '',
          Position: fields.Position || '',
          Subjects: fields.Subjects || '',
          'Grade Levels': fields['Grade Levels'] || '',
          Status: fields.Status || 'Active',
          'Hire Date': fields['Hire Date'] || '',
          'Experience Years': fields['Experience Years'] || 0,
          Nationality: fields.Nationality || '',
          Education: fields.Education || '',
          Bio: fields.Bio || '',
          Hobbies: fields.Hobbies || '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData['Teacher Name'].trim()) {
      newErrors['Teacher Name'] = t('dashboard.teachers.form.teacherNameRequired');
    }

    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = t('dashboard.teachers.form.emailInvalid');
    }

    if (!formData.Subjects.trim()) {
      newErrors.Subjects = t('dashboard.teachers.form.subjectsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/school/teachers/${teacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update teacher');
      }

      // Success - redirect to teacher profile
      router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers/${teacherId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading teacher details..." />;
  }

  if (error && !formData['Teacher Name']) {
    return (
      <ErrorState
        title="Error Loading Teacher"
        message={error}
        onRetry={fetchTeacher}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers/${teacherId}`)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Button>

      {/* Form */}
      <Card className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{t('dashboard.teachers.editTeacher')}</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            {/* Teacher Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.teacherName')} *
              </label>
              <input
                type="text"
                value={formData['Teacher Name']}
                onChange={(e) => setFormData({ ...formData, 'Teacher Name': e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['Teacher Name'] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors['Teacher Name'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Teacher Name']}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.email')}
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.Email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.Email && (
                  <p className="text-red-500 text-sm mt-1">{errors.Email}</p>
                )}
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
                />
              </div>
            </div>

            {/* Position & Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.position')}
                </label>
                <input
                  type="text"
                  value={formData.Position}
                  onChange={(e) => setFormData({ ...formData, Position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.nationality')}
                </label>
                <input
                  type="text"
                  value={formData.Nationality}
                  onChange={(e) => setFormData({ ...formData, Nationality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Teaching Details Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Teaching Details</h2>
            
            {/* Subjects */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.subjects')} *
              </label>
              <textarea
                value={formData.Subjects}
                onChange={(e) => setFormData({ ...formData, Subjects: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.Subjects ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={2}
              />
              {errors.Subjects && (
                <p className="text-red-500 text-sm mt-1">{errors.Subjects}</p>
              )}
            </div>

            {/* Grade Levels */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.gradeLevels')}
              </label>
              <input
                type="text"
                value={formData['Grade Levels']}
                onChange={(e) => setFormData({ ...formData, 'Grade Levels': e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status, Hire Date, Experience */}
            <div className="grid grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.teachers.form.experienceYears')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData['Experience Years']}
                  onChange={(e) => setFormData({ ...formData, 'Experience Years': parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Background & Qualifications</h2>
            
            {/* Education */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.education')}
              </label>
              <textarea
                value={formData.Education}
                onChange={(e) => setFormData({ ...formData, Education: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.bio')}
              </label>
              <textarea
                value={formData.Bio}
                onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.teachers.form.hobbies')}
              </label>
              <input
                type="text"
                value={formData.Hobbies}
                onChange={(e) => setFormData({ ...formData, Hobbies: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers/${teacherId}`)}
              disabled={saving}
              className="flex-1"
            >
              {t('dashboard.teachers.form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? t('common.loading') : t('dashboard.teachers.form.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

