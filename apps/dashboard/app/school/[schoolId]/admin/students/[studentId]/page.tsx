'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { LoadingState } from '../../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../../contexts/SchoolContext';
import { ProfileTabs } from '../../../../../../components/students/ProfileTabs';
import { OverviewTab } from '../../../../../../components/students/profile/OverviewTab';
import { AttendanceTab } from '../../../../../../components/students/profile/AttendanceTab';
import { FeesTab } from '../../../../../../components/students/profile/FeesTab';
import { NotesTab } from '../../../../../../components/students/profile/NotesTab';
import { ContactsTab } from '../../../../../../components/students/profile/ContactsTab';
import { StudentProfile } from '../../../../../../lib/types/students';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const studentId = params.studentId as string;
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId && studentId) {
      fetchStudent();
    }
  }, [schoolId, studentId]);

  async function fetchStudent() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/school/students/${studentId}?schoolId=${encodeURIComponent(schoolId)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Student not found');
        } else {
          throw new Error('Failed to fetch student');
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        // API already returns properly formatted student with parentPrimary
        setStudent(data.data as StudentProfile);
      } else {
        setError('Failed to load student data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState message={t('dashboard.students.profile.loading') || 'Loading student profile...'} />;
  }

  if (error || !student) {
    return (
      <ErrorState
        title={t('dashboard.students.profile.error.title') || 'Error Loading Student'}
        message={error || 'Student not found'}
        onRetry={fetchStudent}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/students`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboard.students.profile.back') || 'Back to Students'}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
        <p className="text-gray-600">
          {t('dashboard.students.profile.subtitle') || 'Student Profile'}
        </p>
      </div>

      {/* Profile Tabs */}
      <ProfileTabs>
        {(activeTab) => {
          switch (activeTab) {
            case 'overview':
              return <OverviewTab student={student} schoolId={schoolId} />;
            case 'attendance':
              return <AttendanceTab studentId={studentId} schoolId={schoolId} attendanceSummary={student.attendanceSummary} />;
            case 'fees':
              return <FeesTab fees={student.fees || []} />;
            case 'notes':
              return <NotesTab notes={student.notes || []} />;
            case 'contacts':
              return <ContactsTab student={student} />;
            default:
              return <OverviewTab student={student} schoolId={schoolId} />;
          }
        }}
      </ProfileTabs>
    </div>
  );
}
