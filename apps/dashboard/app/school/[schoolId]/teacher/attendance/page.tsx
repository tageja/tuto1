'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';

const STATUS_OPTIONS = (lang: string) => [
  { value: 'present', label: lang === 'vi' ? 'Có mặt' : 'Present' },
  { value: 'absent', label: lang === 'vi' ? 'Vắng mặt' : 'Absent' },
  { value: 'late', label: lang === 'vi' ? 'Muộn' : 'Late' },
  { value: 'excused', label: lang === 'vi' ? 'Có phép' : 'Excused' },
];

const TRACK_OPTIONS = (lang: string) => [
  { value: '', label: '—' },
  { value: 'on_track', label: lang === 'vi' ? 'Đúng tiến độ' : 'On track' },
  { value: 'off_track', label: lang === 'vi' ? 'Chậm tiến độ' : 'Off track' },
];

const HW_OPTIONS = (lang: string) => [
  { value: '', label: '—' },
  { value: 'submitted', label: lang === 'vi' ? '✓ Đã làm' : '✓ Done' },
  { value: 'incomplete', label: lang === 'vi' ? '✗ Chưa làm' : '✗ Not done' },
];

const STATUS_COLORS: Record<string, string> = {
  present: 'text-green-700 bg-green-50 border-green-200',
  absent: 'text-red-700 bg-red-50 border-red-200',
  late: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  excused: 'text-blue-700 bg-blue-50 border-blue-200',
};

const HW_COLORS: Record<string, string> = {
  submitted: 'text-green-700 bg-green-50 border-green-200',
  incomplete: 'text-red-700 bg-red-50 border-red-200',
};

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due_date: string;
}

// { studentId: { assignmentId: 'submitted' | 'incomplete' | '' } }
type HwMap = Record<string, Record<string, string>>;

export default function TeacherAttendancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);
  const preselectedClassId = searchParams.get('classId');

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(preselectedClassId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; track_status: string }>>({});
  const [classesLoading, setClassesLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Homework state
  const [hwAssignments, setHwAssignments] = useState<Assignment[]>([]);
  const [hwSubmissions, setHwSubmissions] = useState<HwMap>({});
  const [noHomework, setNoHomework] = useState(false);
  const [hwLoading, setHwLoading] = useState(false);

  const authHeaders = useCallback(
    (): Record<string, string> => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  // Load teacher's classes
  useEffect(() => {
    if (!accessToken) return;
    setClassesLoading(true);
    fetch(`/api/school/teacher/classes?schoolId=${encodedSchoolId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const records = d?.data?.records ?? [];
        setClasses(records);
        if (preselectedClassId && records.some((c: any) => c.id === preselectedClassId)) {
          setSelectedClassId(preselectedClassId);
        } else if (records.length > 0 && !selectedClassId) {
          setSelectedClassId(records[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setClassesLoading(false));
  }, [encodedSchoolId, accessToken]);

  // Load students + existing attendance + homework when class or date changes
  useEffect(() => {
    if (!selectedClassId || !accessToken) {
      setStudents([]);
      setHwAssignments([]);
      setHwSubmissions({});
      return;
    }
    setAttendanceLoading(true);
    setHwLoading(true);
    setNoHomework(false);

    Promise.all([
      fetch(
        `/api/school/students?schoolId=${encodedSchoolId}&classId=${selectedClassId}&limit=200`
      ).then((r) => r.json()),
      fetch(
        `/api/school/teacher/attendance?schoolId=${encodedSchoolId}&classId=${selectedClassId}&date=${date}`,
        { headers: authHeaders() }
      ).then((r) => (r.ok ? r.json() : { data: {} })),
      fetch(
        `/api/school/teacher/homework/submissions?schoolId=${encodedSchoolId}&classId=${selectedClassId}&date=${date}`,
        { headers: authHeaders() }
      ).then((r) => (r.ok ? r.json() : { data: { assignments: [], submissions: {} } })),
    ])
      .then(([studentsData, attendanceData, hwData]) => {
        const list = studentsData?.data?.records ?? [];
        setStudents(list);

        // Attendance
        const existing = attendanceData?.data ?? {};
        const initial: Record<string, { status: string; track_status: string }> = {};
        list.forEach((s: any) => {
          const e = existing[s.id];
          initial[s.id] = e
            ? { status: e.status || 'present', track_status: e.track_status || '' }
            : { status: 'present', track_status: '' };
        });
        setAttendance(initial);

        // Homework
        const { assignments = [], submissions = {} } = hwData?.data ?? {};
        setHwAssignments(assignments);
        // Build initial hw state: default '' (unset) for each student × assignment
        const initialHw: HwMap = {};
        list.forEach((s: any) => {
          initialHw[s.id] = {};
          assignments.forEach((a: Assignment) => {
            const existing = submissions[s.id]?.[a.id];
            initialHw[s.id][a.id] = existing?.status === 'submitted' ? 'submitted'
              : existing?.status === 'incomplete' ? 'incomplete'
              : '';
          });
        });
        setHwSubmissions(initialHw);
      })
      .catch(console.error)
      .finally(() => {
        setAttendanceLoading(false);
        setHwLoading(false);
      });
  }, [selectedClassId, encodedSchoolId, date, accessToken]);

  const handleStatusChange = (studentId: string, status: string) =>
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));

  const handleTrackChange = (studentId: string, track_status: string) =>
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], track_status: track_status || '' } }));

  const markAll = (status: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => { next[s.id] = { ...next[s.id], status }; });
      return next;
    });
  };

  const markAllTrack = (track_status: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => { next[s.id] = { ...next[s.id], track_status }; });
      return next;
    });
  };

  // Homework helpers
  const handleHwChange = (studentId: string, assignmentId: string, status: string) => {
    setHwSubmissions((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [assignmentId]: status },
    }));
  };

  const markAllHw = (status: string) => {
    setHwSubmissions((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = { ...next[s.id] };
        hwAssignments.forEach((a) => { next[s.id][a.id] = status; });
      });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      // Build homework records — only those with an explicit status set
      const hwRecords: { student_id: string; assignment_id: string; status: string }[] = [];
      if (!noHomework && hwAssignments.length > 0) {
        students.forEach((s) => {
          hwAssignments.forEach((a) => {
            const status = hwSubmissions[s.id]?.[a.id] ?? '';
            if (status) hwRecords.push({ student_id: s.id, assignment_id: a.id, status });
          });
        });
      }

      const [attRes, hwRes] = await Promise.all([
        fetch(`/api/school/teacher/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            schoolId,
            classId: selectedClassId,
            date,
            attendance: Object.entries(attendance).map(([studentId, v]) => ({
              student_id: studentId,
              status: v.status,
              track_status: v.track_status || null,
            })),
          }),
        }).then((r) => r.json()),
        hwAssignments.length > 0
          ? fetch(`/api/school/teacher/homework/submissions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({
                schoolId,
                classId: selectedClassId,
                noHomework,
                records: hwRecords,
              }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true }),
      ]);

      if (!attRes.success) throw new Error(attRes.error || 'Failed to save attendance');
      if (!hwRes.success) throw new Error(hwRes.error || 'Failed to save homework');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(e?.message || lang === 'vi' ? 'Không thể lưu' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter((a) => a.status === 'absent').length;

  const hasHomework = hwAssignments.length > 0;
  const hwDoneCount = !noHomework && hasHomework
    ? students.filter((s) =>
        hwAssignments.every((a) => hwSubmissions[s.id]?.[a.id] === 'submitted')
      ).length
    : 0;

  if (classesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('attendance')}</h1>
      <p className="text-gray-600 mb-6">
        {lang === 'vi' ? 'Điểm danh theo lớp và ngày' : 'Mark attendance by class and date'}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'vi' ? 'Lớp' : 'Class'}
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">—</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'vi' ? 'Ngày' : 'Date'}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {!selectedClassId ? (
        <Card className="p-8 text-center text-gray-500">
          {lang === 'vi' ? 'Vui lòng chọn một lớp.' : 'Please select a class.'}
        </Card>
      ) : attendanceLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
        </div>
      ) : students.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          {lang === 'vi' ? 'Không có học sinh trong lớp này.' : 'No students in this class.'}
        </Card>
      ) : (
        <>
          {/* ── ATTENDANCE SECTION ── */}
          {/* Summary + bulk actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex gap-4 text-sm">
              <span className="text-green-700 font-medium">
                {lang === 'vi' ? 'Có mặt' : 'Present'}: {presentCount}
              </span>
              <span className="text-red-700 font-medium">
                {lang === 'vi' ? 'Vắng' : 'Absent'}: {absentCount}
              </span>
              <span className="text-gray-600">
                {lang === 'vi' ? 'Tổng' : 'Total'}: {students.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll('present')}>
                {lang === 'vi' ? 'Tất cả có mặt' : 'All present'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll('absent')}>
                {lang === 'vi' ? 'Tất cả vắng' : 'All absent'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAllTrack('on_track')}>
                {lang === 'vi' ? 'Tất cả đúng tiến độ' : 'All on track'}
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      {lang === 'vi' ? 'Học sinh' : 'Student'}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      {lang === 'vi' ? 'Trạng thái' : 'Status'}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      {lang === 'vi' ? 'Tiến độ' : 'Track'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => {
                    const name =
                      s.first_name && s.last_name
                        ? `${s.first_name} ${s.last_name}`
                        : s.name || (lang === 'vi' ? 'Học sinh' : 'Student');
                    const a = attendance[s.id] ?? { status: 'present', track_status: '' };
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                            className={`border rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary ${STATUS_COLORS[a.status] || ''}`}
                          >
                            {STATUS_OPTIONS(lang).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={a.track_status}
                            onChange={(e) => handleTrackChange(s.id, e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          >
                            {TRACK_OPTIONS(lang).map((o) => (
                              <option key={o.value || '_'} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── HOMEWORK SECTION ── */}
          <Card className="mb-6 overflow-hidden">
            {/* Homework header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {lang === 'vi' ? 'Bài tập' : 'Homework'}
                </h2>
                {!noHomework && hasHomework && !hwLoading && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({hwDoneCount}/{students.length} {lang === 'vi' ? 'đã làm' : 'done'})
                  </span>
                )}
              </div>
              {/* "No homework today" toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-gray-600">
                  {lang === 'vi' ? 'Không có bài tập hôm nay' : 'No homework today'}
                </span>
                <div
                  onClick={() => setNoHomework((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${noHomework ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${noHomework ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </div>
              </label>
            </div>

            {/* Body */}
            <div className={`transition-opacity ${noHomework ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {hwLoading ? (
                <div className="px-5 py-4 animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ) : !hasHomework ? (
                <div className="px-5 py-4 text-sm text-gray-500 italic">
                  {lang === 'vi'
                    ? 'Không có bài tập đang hoạt động cho lớp này.'
                    : 'No active homework assignments for this class.'}
                </div>
              ) : (
                <>
                  {/* Assignment headers + bulk action */}
                  <div className="px-5 pt-4 pb-2 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      {hwAssignments.map((a) => (
                        <div key={a.id} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="font-medium text-gray-800">{a.title}</span>
                          <span className="text-gray-400">•</span>
                          <span>{a.subject}</span>
                          <span className="text-gray-400">•</span>
                          <span className={`${new Date(a.due_date) < new Date(date) ? 'text-red-500' : 'text-gray-500'}`}>
                            {lang === 'vi' ? 'Hạn:' : 'Due:'} {new Date(a.due_date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => markAllHw('submitted')}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium"
                      >
                        {lang === 'vi' ? '✓ Tất cả đã làm' : '✓ Mark all done'}
                      </button>
                      <button
                        type="button"
                        onClick={() => markAllHw('incomplete')}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium"
                      >
                        {lang === 'vi' ? '✗ Tất cả chưa làm' : '✗ Mark all not done'}
                      </button>
                      <button
                        type="button"
                        onClick={() => markAllHw('')}
                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium"
                      >
                        {lang === 'vi' ? 'Xóa đánh dấu' : 'Clear all'}
                      </button>
                    </div>
                  </div>

                  {/* Per-student rows */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-100">
                        <tr>
                          <th className="text-left py-2 px-5 text-xs font-medium text-gray-600">
                            {lang === 'vi' ? 'Học sinh' : 'Student'}
                          </th>
                          {hwAssignments.map((a) => (
                            <th key={a.id} className="text-left py-2 px-4 text-xs font-medium text-gray-600">
                              {a.title.length > 20 ? a.title.slice(0, 18) + '…' : a.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {students.map((s) => {
                          const name =
                            s.first_name && s.last_name
                              ? `${s.first_name} ${s.last_name}`
                              : s.name || (lang === 'vi' ? 'Học sinh' : 'Student');
                          return (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                                    {name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm text-gray-900">{name}</span>
                                </div>
                              </td>
                              {hwAssignments.map((a) => {
                                const hwStatus = hwSubmissions[s.id]?.[a.id] ?? '';
                                return (
                                  <td key={a.id} className="py-2.5 px-4">
                                    <select
                                      value={hwStatus}
                                      onChange={(e) => handleHwChange(s.id, a.id, e.target.value)}
                                      className={`border rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary ${HW_COLORS[hwStatus] || 'border-gray-300 bg-white text-gray-600'}`}
                                    >
                                      {HW_OPTIONS(lang).map((o) => (
                                        <option key={o.value || '_'} value={o.value}>{o.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Save feedback */}
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {lang === 'vi' ? 'Đã lưu thành công.' : 'Saved successfully.'}
            </div>
          )}

          <div className="mt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...')
                : hasHomework
                  ? (lang === 'vi' ? 'Lưu điểm danh & bài tập' : 'Save attendance & homework')
                  : (lang === 'vi' ? 'Lưu điểm danh' : 'Save attendance')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
