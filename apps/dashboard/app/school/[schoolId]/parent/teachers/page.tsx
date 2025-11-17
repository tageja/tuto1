'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { TeacherListItem } from '../../../../../components/school/teachers/TeacherListItem';
import { TeacherFilters } from '../../../../../components/school/teachers/TeacherFilters';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../contexts/I18nContext';

export default function ParentTeachersListPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);

  // State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL params (limited for parent)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function updateURL() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl, { scroll: false });
  }

  // Fetch data
  useEffect(() => {
    fetchTeachers();
  }, [schoolId, searchQuery]);

  async function fetchTeachers() {
    try {
      setLoading(true);
      setError(null);

      // For parent view, only fetch Active teachers
      // In production, backend should filter by parent's children's classes
      const params = new URLSearchParams({
        schoolId: schoolId,
        status: 'Active', // Parents only see active teachers
        ...(searchQuery && { q: searchQuery }),
      });

      const response = await fetch(`/api/school/teachers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // TODO: Backend should filter by parent's children's classes
        // For now, showing all active teachers
        setTeachers(data.data.records || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleViewProfile(teacherId: string) {
    router.push(`/school/${encodeURIComponent(schoolId)}/parent/teachers/${teacherId}`);
  }

  // Loading state
  if (loading && teachers.length === 0) {
    return <LoadingState message={t('dashboard.teachers.loadingTeachers')} />;
  }

  // Error state
  if (error && teachers.length === 0) {
    return (
      <ErrorState
        title={t('dashboard.teachers.error.title')}
        message={error}
        onRetry={fetchTeachers}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.teachers.title')}</h1>
        <p className="text-gray-600">View your child's teachers</p>
      </div>

      {/* Search Only (no status/subject filters for parents) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('dashboard.teachers.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Teacher Grid */}
      {teachers.length === 0 ? (
        <EmptyState
          title={t('dashboard.teachers.empty.title')}
          description="No teachers assigned to your child's classes yet"
          actionLabel=""
          onAction={undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <TeacherListItem
              key={teacher.id}
              teacher={teacher}
              onViewProfile={handleViewProfile}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

