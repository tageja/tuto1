'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { GraduationCap, Users } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function TeacherClassesPage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        setError(null);
        const headers: HeadersInit = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const res = await fetch(
          `/api/school/teacher/classes?schoolId=${encodedSchoolId}`,
          { headers }
        );
        if (!res.ok) throw new Error('Failed to fetch classes');
        const data = await res.json();
        setClasses(data?.data?.records ?? []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, [encodedSchoolId, accessToken]);

  const handleViewClass = (classId: string) => {
    router.push(`/school/${encodedSchoolId}/teacher/classes/${classId}`);
  };

  if (loading && classes.length === 0) {
    return <LoadingState message={lang === 'vi' ? 'Đang tải lớp học...' : 'Loading classes...'} />;
  }

  if (error && classes.length === 0) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          {lang === 'vi' ? 'Thử lại' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('classes')}</h1>
        <p className="text-gray-600">
          {lang === 'vi' ? 'Các lớp được giao cho bạn' : 'Classes assigned to you'}
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          title={lang === 'vi' ? 'Chưa có lớp nào' : 'No classes assigned'}
          description={
            lang === 'vi'
              ? 'Liên hệ quản trị viên để được giao lớp.'
              : 'Contact the admin to get classes assigned.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <Card key={c.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-semibold">
                  {c.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {c.grade_level ? `${lang === 'vi' ? 'Khối' : 'Grade'} ${c.grade_level}` : '—'}
                {c.room_number ? ` · ${c.room_number}` : ''}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => handleViewClass(c.id)}
              >
                {lang === 'vi' ? 'Xem lớp' : 'View class'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
