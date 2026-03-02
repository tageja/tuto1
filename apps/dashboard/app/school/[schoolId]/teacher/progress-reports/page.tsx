'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';

interface StudentScore {
  student_id: string;
  student_name: string;
  score: number;
  grade_letter: string | null;
}

interface Assessment {
  id: string;
  title: string;
  subject_name: string;
  assessment_type: string | null;
  max_score: number;
  date: string;
  class_id: string;
  class_name: string;
  scores: StudentScore[];
}

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-700 bg-green-50',
  B: 'text-blue-700 bg-blue-50',
  C: 'text-yellow-700 bg-yellow-50',
  D: 'text-orange-700 bg-orange-50',
  F: 'text-red-700 bg-red-50',
};

export default function TeacherProgressReportsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);
  const preselectedClassId = searchParams.get('classId') || '';

  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(preselectedClassId);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const authHeaders = useCallback(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  useEffect(() => {
    if (!accessToken) return;
    fetch(`/api/school/teacher/classes?schoolId=${encodedSchoolId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setClasses(d?.data?.records ?? []))
      .catch(console.error);
  }, [encodedSchoolId, accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    const url = selectedClassId
      ? `/api/school/teacher/progress-reports?schoolId=${encodedSchoolId}&classId=${selectedClassId}`
      : `/api/school/teacher/progress-reports?schoolId=${encodedSchoolId}`;
    fetch(url, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssessments(d.data ?? []);
          // Auto-expand first assessment
          if (d.data?.length > 0) {
            setExpanded({ [d.data[0].id]: true });
          }
        } else {
          setError(d.error || (lang === 'vi' ? 'Không tải được báo cáo tiến độ' : 'Failed to load progress reports'));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [encodedSchoolId, selectedClassId, accessToken]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getAvg = (scores: StudentScore[], maxScore: number) => {
    if (scores.length === 0) return null;
    const avg = scores.reduce((sum, s) => sum + Number(s.score), 0) / scores.length;
    return { raw: avg.toFixed(1), pct: Math.round((avg / maxScore) * 100) };
  };

  // Unique assessment types for filter
  const types = Array.from(new Set(assessments.map((a) => a.assessment_type).filter(Boolean)));

  const filtered = assessments.filter(
    (a) => !selectedType || a.assessment_type === selectedType
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('progressReports')}</h1>
        <p className="text-gray-600">
          {lang === 'vi'
            ? 'Kết quả đánh giá theo lớp và môn học'
            : 'Assessment results by class and subject'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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

        {types.length > 0 && (
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{lang === 'vi' ? 'Tất cả loại' : 'All types'}</option>
            {types.map((tp) => (
              <option key={tp!} value={tp!}>{tp}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <LoadingState message={lang === 'vi' ? 'Đang tải báo cáo...' : 'Loading reports...'} />
      ) : error ? (
        <Card className="p-6 text-center text-red-600">{error}</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title={lang === 'vi' ? 'Chưa có dữ liệu đánh giá' : 'No assessment data'}
          description={
            lang === 'vi'
              ? 'Chưa có bài kiểm tra nào được tạo cho các lớp của bạn.'
              : 'No assessments have been created for your classes yet.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const avg = getAvg(a.scores, a.max_score);
            const isOpen = expanded[a.id];
            return (
              <Card key={a.id} className="overflow-hidden">
                {/* Assessment header */}
                <button
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(a.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      {a.assessment_type && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {a.assessment_type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-600">
                      <span>{a.subject_name}</span>
                      <span>{a.class_name}</span>
                      <span>{formatDate(a.date)}</span>
                      <span>
                        {lang === 'vi' ? 'Điểm tối đa' : 'Max score'}: {a.max_score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {avg && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{avg.raw}</p>
                        <p className="text-xs text-gray-500">{avg.pct}% {lang === 'vi' ? 'trung bình' : 'avg'}</p>
                      </div>
                    )}
                    <div className="text-right text-sm text-gray-500">
                      <p>{a.scores.length} {lang === 'vi' ? 'học sinh' : 'students'}</p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Score table */}
                {isOpen && a.scores.length > 0 && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {lang === 'vi' ? 'Học sinh' : 'Student'}
                          </th>
                          <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {lang === 'vi' ? 'Điểm' : 'Score'}
                          </th>
                          <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            %
                          </th>
                          <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {lang === 'vi' ? 'Xếp loại' : 'Grade'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {a.scores.map((s) => {
                          const pct = a.max_score > 0
                            ? Math.round((Number(s.score) / a.max_score) * 100)
                            : 0;
                          const gradeLetter = s.grade_letter?.charAt(0).toUpperCase() || '';
                          const gradeColor = GRADE_COLORS[gradeLetter] || 'text-gray-700 bg-gray-50';
                          return (
                            <tr key={s.student_id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-4 text-sm font-medium text-gray-900">
                                {s.student_name}
                              </td>
                              <td className="py-2.5 px-4 text-sm text-center text-gray-700">
                                {s.score} / {a.max_score}
                              </td>
                              <td className="py-2.5 px-4 text-sm text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-600">{pct}%</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                {gradeLetter ? (
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${gradeColor}`}>
                                    {s.grade_letter}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {isOpen && a.scores.length === 0 && (
                  <div className="border-t border-gray-100 p-6 text-center text-sm text-gray-500">
                    {lang === 'vi' ? 'Chưa có điểm số.' : 'No scores recorded yet.'}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
