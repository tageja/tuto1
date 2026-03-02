'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CalendarCheck, TrendingUp } from 'lucide-react';
import { Card } from '../../../../../../components/ui/Card';
import { Button } from '../../../../../../components/ui/Button';
import { useI18n } from '../../../../../../contexts/I18nContext';

export default function TeacherClassDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const classId = params.classId as string;
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [classRes, studentsRes] = await Promise.all([
          fetch(`/api/school/classes/${classId}`),
          fetch(
            `/api/school/students?schoolId=${encodedSchoolId}&classId=${classId}&limit=100`
          ),
        ]);
        if (classRes.ok) {
          const c = await classRes.json();
          setClassData(c);
        }
        if (studentsRes.ok) {
          const s = await studentsRes.json();
          const list = s?.data?.records ?? s?.data ?? s?.records ?? [];
          setStudents(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId, encodedSchoolId]);

  if (loading && !classData) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  const displayName =
    classData?.name || classData?.className || 'Class';
  const grade = classData?.grade_level || classData?.grade;
  const room = classData?.room_number || classData?.roomNumber;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/school/${encodedSchoolId}/teacher/classes`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-gray-600">
          {grade ? `${lang === 'vi' ? 'Khối' : 'Grade'} ${grade}` : ''}
          {room ? ` · ${room}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href={`/school/${encodedSchoolId}/teacher/attendance?classId=${classId}`}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-xl text-white">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('attendance')}</h3>
                <p className="text-sm text-gray-600">
                  {lang === 'vi' ? 'Điểm danh lớp' : 'Mark class attendance'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href={`/school/${encodedSchoolId}/teacher/progress-reports?classId=${classId}`}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-xl text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('progressReports')}</h3>
                <p className="text-sm text-gray-600">
                  {lang === 'vi' ? 'Xem / tạo báo cáo' : 'View / create reports'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {lang === 'vi' ? 'Học sinh' : 'Students'} ({students.length})
        </h2>
        {students.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            {lang === 'vi' ? 'Chưa có học sinh trong lớp.' : 'No students in this class.'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s) => {
              const name =
                s.first_name && s.last_name
                  ? `${s.first_name} ${s.last_name}`
                  : s.name || s.student_name || 'Student';
              const id = s.id;
              return (
                <Link
                  key={id}
                  href={`/school/${encodedSchoolId}/teacher/students/${id}`}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{name}</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
