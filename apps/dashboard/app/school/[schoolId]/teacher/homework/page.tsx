'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';

interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  due_date: string;
  assigned_at: string;
  is_active: boolean;
  is_past_due: boolean;
  class_id: string;
  class_name: string;
  submission_count: number;
  student_count: number;
}

export default function TeacherHomeworkPage() {
  const params = useParams();
  const { t, lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  // Load classes
  useEffect(() => {
    if (!accessToken) return;
    fetch(`/api/school/teacher/classes?schoolId=${encodedSchoolId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setClasses(d?.data?.records ?? []))
      .catch(console.error);
  }, [encodedSchoolId, accessToken]);

  // Load homework assignments
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    const url = selectedClassId
      ? `/api/school/teacher/homework?schoolId=${encodedSchoolId}&classId=${selectedClassId}`
      : `/api/school/teacher/homework?schoolId=${encodedSchoolId}`;
    fetch(url, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssignments(d.data ?? []);
        } else {
          setError(d.error || (lang === 'vi' ? 'Không tải được bài tập' : 'Failed to load homework'));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [encodedSchoolId, selectedClassId, accessToken]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (a: HomeworkAssignment) => {
    if (!a.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <AlertCircle className="w-3 h-3" />
          {lang === 'vi' ? 'Không hoạt động' : 'Inactive'}
        </span>
      );
    }
    if (a.is_past_due) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" />
          {lang === 'vi' ? 'Quá hạn' : 'Past due'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Clock className="w-3 h-3" />
        {lang === 'vi' ? 'Đang hoạt động' : 'Active'}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('homework')}</h1>
        <p className="text-gray-600">
          {lang === 'vi'
            ? 'Bài tập về nhà cho các lớp của bạn'
            : 'Homework assignments for your classes'}
        </p>
      </div>

      {/* Class filter */}
      <div className="mb-6">
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{lang === 'vi' ? 'Tất cả lớp' : 'All classes'}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message={lang === 'vi' ? 'Đang tải bài tập...' : 'Loading homework...'} />
      ) : error ? (
        <Card className="p-6 text-center text-red-600">{error}</Card>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title={lang === 'vi' ? 'Chưa có bài tập' : 'No homework assignments'}
          description={
            lang === 'vi'
              ? 'Chưa có bài tập nào được tạo cho các lớp của bạn.'
              : 'No homework assignments have been created for your classes yet.'
          }
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const submissionPct =
              a.student_count > 0 ? Math.round((a.submission_count / a.student_count) * 100) : 0;
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-base">{a.title}</h3>
                      {getStatusBadge(a)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                      <span>
                        <span className="font-medium text-gray-700">
                          {lang === 'vi' ? 'Môn' : 'Subject'}:
                        </span>{' '}
                        {a.subject}
                      </span>
                      <span>
                        <span className="font-medium text-gray-700">
                          {lang === 'vi' ? 'Lớp' : 'Class'}:
                        </span>{' '}
                        {a.class_name}
                      </span>
                      <span>
                        <span className="font-medium text-gray-700">
                          {lang === 'vi' ? 'Hạn nộp' : 'Due'}:
                        </span>{' '}
                        {formatDate(a.due_date)}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
                    )}
                  </div>

                  {/* Submission stats */}
                  <div className="shrink-0 text-center sm:text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {a.submission_count} / {a.student_count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {lang === 'vi' ? 'đã nộp' : 'submitted'}
                    </p>
                    {a.student_count > 0 && (
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${submissionPct}%` }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{submissionPct}%</p>
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
