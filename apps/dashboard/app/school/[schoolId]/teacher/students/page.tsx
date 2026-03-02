'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  status: string;
  _className: string;
  _classId: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  Active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-gray-100 text-gray-600',
};

export default function TeacherStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  const authHeaders = useCallback(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      setLoading(true);
      try {
        const classRes = await fetch(
          `/api/school/teacher/classes?schoolId=${encodedSchoolId}`,
          { headers: authHeaders() }
        );
        const classData = await classRes.json();
        const records: any[] = classData?.data?.records ?? [];
        setClasses(records.map((c) => ({ id: c.id, name: c.name })));

        const all: StudentRow[] = [];
        await Promise.all(
          records.map(async (c) => {
            const r = await fetch(
              `/api/school/students?schoolId=${encodedSchoolId}&classId=${c.id}&limit=200`
            );
            const d = await r.json();
            const list: any[] = d?.data?.records ?? [];
            list.forEach((s) => {
              all.push({
                id: s.id,
                first_name: s.first_name || '',
                last_name: s.last_name || '',
                student_number: s.student_number || null,
                status: s.status || 'active',
                _className: c.name,
                _classId: c.id,
              });
            });
          })
        );

        // Deduplicate by student id (students can only be in one class, but safety check)
        const seen = new Set<string>();
        setStudents(all.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; }));
      } catch (e) {
        console.error('Students load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [encodedSchoolId, accessToken]);

  const filtered = useMemo(() => {
    let list = students;
    if (selectedClass) list = list.filter((s) => s._classId === selectedClass);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
          (s.student_number || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, search, selectedClass]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message={lang === 'vi' ? 'Đang tải học sinh...' : 'Loading students...'} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'vi' ? 'Học sinh' : 'Students'}
        </h1>
        <p className="text-gray-600">
          {lang === 'vi' ? 'Tất cả học sinh trong các lớp của bạn' : 'All students in your classes'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'vi' ? 'Tìm học sinh...' : 'Search students...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{lang === 'vi' ? 'Tất cả lớp' : 'All classes'}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} {lang === 'vi' ? 'học sinh' : 'students'}
        {search || selectedClass ? ` (${lang === 'vi' ? 'đã lọc' : 'filtered'})` : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title={lang === 'vi' ? 'Không tìm thấy học sinh' : 'No students found'}
          description={
            search
              ? lang === 'vi' ? 'Thử thay đổi từ khóa tìm kiếm.' : 'Try a different search term.'
              : lang === 'vi' ? 'Chưa có học sinh trong lớp.' : 'No students in your classes.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const name = `${s.first_name} ${s.last_name}`.trim() || 'Student';
            return (
              <Card
                key={s.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/school/${encodedSchoolId}/teacher/students/${s.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-500 truncate">{s._className}</p>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                        {s.status === 'active' ? (lang === 'vi' ? 'Đang học' : 'Active') : s.status === 'inactive' ? (lang === 'vi' ? 'Không hoạt động' : 'Inactive') : s.status}
                      </span>
                    </div>
                    {s.student_number && (
                      <p className="text-xs text-gray-400 mt-0.5">{s.student_number}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
