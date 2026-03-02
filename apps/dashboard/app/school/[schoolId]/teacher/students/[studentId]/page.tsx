'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, Phone, Mail, Calendar, BookOpen, CalendarCheck } from 'lucide-react';
import { Card } from '../../../../../../components/ui/Card';
import { Button } from '../../../../../../components/ui/Button';
import { useI18n } from '../../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { LoadingState } from '../../../../../../components/shared/LoadingState';

interface StudentDetail {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: string;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  class?: { name: string };
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

const ATTENDANCE_PERIODS = (lang: string) => [
  { value: '1m', label: lang === 'vi' ? '30 ngày' : '30 days' },
  { value: '3m', label: lang === 'vi' ? '3 tháng' : '3 months' },
  { value: '6m', label: lang === 'vi' ? '6 tháng' : '6 months' },
];

export default function TeacherStudentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const studentId = params.studentId as string;
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [attendancePeriod, setAttendancePeriod] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const authHeaders = useCallback(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  // Load student profile
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/school/students/${studentId}?schoolId=${encodedSchoolId}`
        );
        if (res.ok) {
          const d = await res.json();
          setStudent(d?.data ?? d ?? null);
        }
      } catch (e) {
        console.error('Student load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, encodedSchoolId]);

  // Load attendance summary
  useEffect(() => {
    if (!studentId) return;
    setAttendanceLoading(true);
    fetch(
      `/api/school/students/${studentId}/attendance?schoolId=${encodedSchoolId}&period=${attendancePeriod}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data) {
          setAttendance({
            total: d.data.total ?? 0,
            present: d.data.present ?? 0,
            absent: d.data.absent ?? 0,
            late: d.data.late ?? 0,
            percentage: d.data.percentage ?? 0,
          });
        }
      })
      .catch(console.error)
      .finally(() => setAttendanceLoading(false));
  }, [studentId, encodedSchoolId, attendancePeriod]);

  // Load recent assessment scores from progress-reports
  useEffect(() => {
    if (!accessToken) return;
    fetch(`/api/school/teacher/progress-reports?schoolId=${encodedSchoolId}`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const scores: any[] = [];
          (d.data || []).forEach((assessment: any) => {
            const score = assessment.scores?.find((s: any) => s.student_id === studentId);
            if (score) {
              scores.push({
                assessment_title: assessment.title,
                subject_name: assessment.subject_name,
                date: assessment.date,
                score: score.score,
                max_score: assessment.max_score,
                grade_letter: score.grade_letter,
              });
            }
          });
          setRecentScores(scores.slice(0, 5));
        }
      })
      .catch(console.error);
  }, [studentId, encodedSchoolId, accessToken]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message={lang === 'vi' ? 'Đang tải...' : 'Loading...'} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          {lang === 'vi' ? 'Không tìm thấy học sinh.' : 'Student not found.'}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/school/${encodedSchoolId}/teacher/students`)}
        >
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
      </div>
    );
  }

  const name = `${student.first_name} ${student.last_name}`.trim() || 'Student';
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return d; }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/school/${encodedSchoolId}/teacher/students`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
      </div>

      {/* Profile header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
            {student.student_number && <span>#{student.student_number}</span>}
            {student.class?.name && <span>{student.class.name}</span>}
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                student.status === 'active' || student.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {student.status === 'active' ? (lang === 'vi' ? 'Đang học' : 'Active') : student.status === 'inactive' ? (lang === 'vi' ? 'Không hoạt động' : 'Inactive') : student.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            {lang === 'vi' ? 'Thông tin học sinh' : 'Student Info'}
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 text-gray-500 shrink-0">
                {lang === 'vi' ? 'Ngày sinh' : 'Date of birth'}
              </dt>
              <dd className="text-gray-900">{formatDate(student.date_of_birth)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-gray-500 shrink-0">
                {lang === 'vi' ? 'Giới tính' : 'Gender'}
              </dt>
              <dd className="text-gray-900">{student.gender || '—'}</dd>
            </div>
          </dl>

          {/* Parent info */}
          {(student.parent_name || student.parent_email || student.parent_phone) && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-3">
                {lang === 'vi' ? 'Thông tin phụ huynh' : 'Parent / Guardian'}
              </h3>
              <dl className="space-y-3 text-sm">
                {student.parent_name && (
                  <div className="flex gap-2">
                    <dt className="w-32 text-gray-500 shrink-0">
                      {lang === 'vi' ? 'Tên' : 'Name'}
                    </dt>
                    <dd className="text-gray-900">{student.parent_name}</dd>
                  </div>
                )}
                {student.parent_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${student.parent_email}`} className="text-primary hover:underline text-sm truncate">
                      {student.parent_email}
                    </a>
                  </div>
                )}
                {student.parent_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${student.parent_phone}`} className="text-primary hover:underline text-sm">
                      {student.parent_phone}
                    </a>
                  </div>
                )}
              </dl>
            </>
          )}
        </Card>

        {/* Attendance */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-gray-500" />
              {lang === 'vi' ? 'Điểm danh' : 'Attendance'}
            </h2>
            <select
              value={attendancePeriod}
              onChange={(e) => setAttendancePeriod(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              {ATTENDANCE_PERIODS(lang).map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {attendanceLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ) : attendance ? (
            <>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-900">{attendance.percentage}%</span>
                <span className="text-sm text-gray-500 pb-1">
                  {lang === 'vi' ? 'tỷ lệ tham dự' : 'attendance rate'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${
                    attendance.percentage >= 80 ? 'bg-green-500' : attendance.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${attendance.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-700">{attendance.present}</p>
                  <p className="text-xs text-green-600">{lang === 'vi' ? 'Có mặt' : 'Present'}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-red-700">{attendance.absent}</p>
                  <p className="text-xs text-red-600">{lang === 'vi' ? 'Vắng' : 'Absent'}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-700">{attendance.late}</p>
                  <p className="text-xs text-yellow-600">{lang === 'vi' ? 'Trễ' : 'Late'}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              {lang === 'vi' ? 'Chưa có dữ liệu điểm danh.' : 'No attendance data available.'}
            </p>
          )}
        </Card>

        {/* Recent assessment scores */}
        {recentScores.length > 0 && (
          <Card className="p-5 lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              {lang === 'vi' ? 'Điểm số gần đây' : 'Recent Scores'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      {lang === 'vi' ? 'Bài kiểm tra' : 'Assessment'}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      {lang === 'vi' ? 'Môn' : 'Subject'}
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      {lang === 'vi' ? 'Điểm' : 'Score'}
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">
                      {lang === 'vi' ? 'Xếp loại' : 'Grade'}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      {lang === 'vi' ? 'Ngày' : 'Date'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentScores.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-900">{s.assessment_title}</td>
                      <td className="py-2.5 px-3 text-gray-600">{s.subject_name}</td>
                      <td className="py-2.5 px-3 text-center font-medium">
                        {s.score} / {s.max_score}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {s.grade_letter ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {s.grade_letter}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{formatDate(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
