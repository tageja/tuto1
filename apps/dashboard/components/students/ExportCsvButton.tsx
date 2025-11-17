'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';

interface ExportCsvButtonProps {
  schoolId: string;
  filters: {
    classId?: string | string[];
    grade?: string | string[];
    status?: string | string[];
    q?: string;
  };
}

export function ExportCsvButton({ schoolId, filters }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleExport = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        schoolId: schoolId,
        export: 'csv',
      });

      if (filters.q) {
        params.set('q', filters.q);
      }

      if (filters.classId) {
        const classIds = Array.isArray(filters.classId) ? filters.classId : [filters.classId];
        classIds.forEach((id) => {
          if (id && id !== 'all') {
            params.append('classId', id);
          }
        });
      }

      if (filters.grade) {
        const grades = Array.isArray(filters.grade) ? filters.grade : [filters.grade];
        grades.forEach((grade) => {
          if (grade && grade !== 'all') {
            params.append('grade', grade);
          }
        });
      }

      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach((status) => {
          if (status && status !== 'all') {
            params.append('status', status);
          }
        });
      }

      // Fetch CSV
      const response = await fetch(`/api/school/students?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      // Get CSV content
      const csvContent = await response.text();

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `students-${schoolId}-${dateStr}.csv`;

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert(t('dashboard.students.export.error') || 'Failed to export CSV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
      aria-label={t('dashboard.students.export.button') || 'Export to CSV'}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('dashboard.students.export.exporting') || 'Exporting...'}
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {t('dashboard.students.export.button') || 'Export CSV'}
        </>
      )}
    </Button>
  );
}

