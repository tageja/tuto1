'use client';

import { useRouter } from 'next/navigation';
import { Card } from '../../ui/Card';
import { StatusBadge } from '../../school/shared/StatusBadge';
import { StudentProfile } from '../../../lib/types/students';
import { useI18n } from '../../../contexts/I18nContext';

interface OverviewTabProps {
  student: StudentProfile;
  schoolId: string;
}

export function OverviewTab({ student, schoolId }: OverviewTabProps) {
  const router = useRouter();
  const { t, lang } = useI18n();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Photo and Basic Info */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
              {student.firstName?.[0]?.toUpperCase() || student.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-gray-600 mb-4">
              {t('dashboard.students.profile.studentCode') || 'Student Code'}: <span className="font-medium">{student.code || 'N/A'}</span>
            </p>
            {student.classDetails && (
              <div className="mb-4">
                <button
                  onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes/${student.classId}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {t('dashboard.students.profile.class') || 'Class'}: {student.classDetails.name}
                </button>
                {student.classDetails.gradeLevel && (
                  <span className="text-gray-600 ml-2">
                    ({t('dashboard.students.profile.grade') || 'Grade'} {student.classDetails.gradeLevel})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.students.profile.personalInfo') || 'Personal Information'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              {t('dashboard.students.profile.dateOfBirth') || 'Date of Birth'}
            </label>
            <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              {t('dashboard.students.profile.age') || 'Age'}
            </label>
            <p className="text-gray-900">{calculateAge(student.dateOfBirth)} {lang === 'vi' ? 'tuổi' : 'years'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              {t('dashboard.students.profile.gender') || 'Gender'}
            </label>
            <p className="text-gray-900">{student.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              {t('dashboard.students.profile.enrollmentDate') || 'Enrollment Date'}
            </label>
            <p className="text-gray-900">{formatDate(student.enrolledAt)}</p>
          </div>
          {student.address && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">
                {t('dashboard.students.profile.address') || 'Address'}
              </label>
              <p className="text-gray-900">{student.address}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Parent Contacts */}
      {(student.parentPrimary || student.parentSecondary) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('dashboard.students.profile.parentContacts') || 'Parent Contacts'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {student.parentPrimary && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('dashboard.students.profile.primaryParent') || 'Primary Parent'}
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">{student.parentPrimary.name || 'N/A'}</p>
                  {student.parentPrimary.phone && (
                    <p className="text-gray-600">
                      <a href={`tel:${student.parentPrimary.phone}`} className="text-blue-600 hover:underline">
                        {student.parentPrimary.phone}
                      </a>
                    </p>
                  )}
                  {student.parentPrimary.email && (
                    <p className="text-gray-600">
                      <a href={`mailto:${student.parentPrimary.email}`} className="text-blue-600 hover:underline">
                        {student.parentPrimary.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
            {student.parentSecondary && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('dashboard.students.profile.secondaryParent') || 'Secondary Parent'}
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">{student.parentSecondary.name || 'N/A'}</p>
                  {student.parentSecondary.phone && (
                    <p className="text-gray-600">
                      <a href={`tel:${student.parentSecondary.phone}`} className="text-blue-600 hover:underline">
                        {student.parentSecondary.phone}
                      </a>
                    </p>
                  )}
                  {student.parentSecondary.email && (
                    <p className="text-gray-600">
                      <a href={`mailto:${student.parentSecondary.email}`} className="text-blue-600 hover:underline">
                        {student.parentSecondary.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Back to Class Link */}
      {student.classId && (
        <div className="text-center">
          <button
            onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes/${student.classId}`)}
            className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {t('dashboard.students.profile.backToClass') || '← Back to Class'}
          </button>
        </div>
      )}
    </div>
  );
}

