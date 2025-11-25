'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';

interface HealthFiltersProps {
  schoolId: string;
  classes: Array<{ id: string; name: string }>;
  onFiltersChange?: (filters: { classId?: string; studentId?: string; q: string }) => void;
}

export function HealthFilters({
  schoolId,
  classes,
  onFiltersChange,
}: HealthFiltersProps) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const lastSyncedParams = useRef<string>('');

  const [classId, setClassId] = useState<string>(searchParams.get('classId') || '');
  const [studentId, setStudentId] = useState<string>(searchParams.get('studentId') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(searchParams.get('q') || '');
  const [students, setStudents] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch students when class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        const params = new URLSearchParams({ schoolId, classId });
        const response = await fetch(`/api/health/students?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setStudents(result.data?.map((s: any) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
          })) || []);
        }
      } catch (error) {
        console.error('Error fetching students for filter:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [schoolId, classId]);

  // Update URL when filters change (but avoid infinite loop)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    
    if (classId) {
      params.set('classId', classId);
    }

    if (studentId) {
      params.set('studentId', studentId);
    }

    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    }

    const newParamsString = params.toString();
    
    // Only update URL if params actually changed
    if (newParamsString !== lastSyncedParams.current) {
      lastSyncedParams.current = newParamsString;
      router.replace(`?${newParamsString}`, { scroll: false });
      
      onFiltersChange?.({
        classId: classId || undefined,
        studentId: studentId || undefined,
        q: debouncedSearch,
      });
    }
  }, [classId, studentId, debouncedSearch, router, onFiltersChange]);

  // Reset student when class changes
  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    setStudentId(''); // Reset student selection when class changes
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-3">
        {/* Class Filter */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('dashboard.health.filters.class')}
          </label>
          <select
            value={classId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.health.filters.allClasses')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student Filter */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('dashboard.health.filters.student')}
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={!classId || loadingStudents}
            className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">{loadingStudents ? 'Loading...' : t('dashboard.health.filters.allStudents')}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('common.search')}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.health.filters.search')}
            className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
