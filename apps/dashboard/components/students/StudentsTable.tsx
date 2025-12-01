'use client';

import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../school/shared/StatusBadge';
import { Student } from '../../lib/types/students';
import { useI18n } from '../../contexts/I18nContext';
import { EmptyState } from '../shared/EmptyState';

interface StudentsTableProps {
  students: Student[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  schoolId: string;
}

export function StudentsTable({
  students,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  schoolId,
}: StudentsTableProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleStudentClick = (studentId: string) => {
    router.push(`/school/${encodeURIComponent(schoolId)}/admin/students/${studentId}`);
  };

  if (loading && students.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.students.empty.title') || 'No Students Found'}
        description={t('dashboard.students.empty.description') || 'No students match your filters or this school has no students yet.'}
        actionLabel=""
        onAction={undefined}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.studentCode') || 'Student Code'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.name') || 'Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.class') || 'Class'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.grade') || 'Grade'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.parent') || 'Parent'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.contact') || 'Contact'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.status') || 'Status'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.students.table.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStudentClick(student.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`${t('dashboard.students.table.viewStudent') || 'View student'}: ${student.code}`}
                  >
                    {student.code || 'N/A'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.className || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.grade || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.parent || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    {student.contactEmail && (
                      <span className="text-xs">{student.contactEmail}</span>
                    )}
                    {student.contactPhone && (
                      <span className="text-xs">{student.contactPhone}</span>
                    )}
                    {!student.contactEmail && !student.contactPhone && 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStudentClick(student.id)}
                    aria-label={`${t('dashboard.students.table.view') || 'View'}: ${student.name}`}
                  >
                    {t('dashboard.students.table.view') || 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('dashboard.students.pagination.page') || 'Page'} {currentPage} {t('dashboard.students.pagination.of') || 'of'} {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={t('dashboard.students.pagination.previous') || 'Previous page'}
            >
              {t('dashboard.students.pagination.previous') || 'Previous'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label={t('dashboard.students.pagination.next') || 'Next page'}
            >
              {t('dashboard.students.pagination.next') || 'Next'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}








