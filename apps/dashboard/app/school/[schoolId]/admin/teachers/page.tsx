'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { TeacherKpis } from '../../../../../components/school/teachers/TeacherKpis';
import { TeacherListItem } from '../../../../../components/school/teachers/TeacherListItem';
import { TeacherFilters } from '../../../../../components/school/teachers/TeacherFilters';
import { TeacherQuickAddModal } from '../../../../../components/school/teachers/TeacherQuickAddModal';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { EmptyState } from '../../../../../components/shared/EmptyState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../contexts/I18nContext';

export default function AdminTeachersListPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);

  // State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ total: 0, active: 0, onLeave: 0, avgRating: 0 });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [hasMore, setHasMore] = useState(false);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, selectedSubject, currentPage]);

  function updateURL() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (selectedSubject !== 'all') params.set('subject', selectedSubject);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl, { scroll: false });
  }

  // Fetch data
  useEffect(() => {
    // Fetch KPIs first (doesn't depend on pagination/filters)
    if (schoolId) {
      fetchKPIs();
    }
  }, [schoolId]);

  // Fetch teachers when filters change
  useEffect(() => {
    if (schoolId) {
      fetchTeachers();
    }
  }, [schoolId, searchQuery, selectedStatus, selectedSubject, currentPage]);

  async function fetchKPIs() {
    try {
      const response = await fetch(`/api/school/teachers/kpis?schoolId=${encodeURIComponent(schoolId)}`);
      
      if (!response.ok) {
        console.error('KPIs API error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('KPIs API error data:', errorData);
        // Don't return - let fallback handle it
        return;
      }

      const data = await response.json();
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Teacher KPIs API response:', data);
      }
      
      if (data.success && data.data) {
        // Always set KPIs from API (this is the source of truth)
        // This will overwrite any fallback values from teachers list
        setKpis(data.data);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Teacher KPIs set from API:', data.data);
        }
      } else {
        console.warn('KPIs API response not successful:', data);
        // If API fails, fallback will handle it in fetchTeachers
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
      // Don't throw - fallback will handle it in fetchTeachers
    }
  }

  async function fetchTeachers() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        schoolId: schoolId,
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { q: searchQuery }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedSubject !== 'all' && { subject: selectedSubject }),
      });

      const response = await fetch(`/api/school/teachers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const records = data.data.records || [];
        setTeachers(records);
        setHasMore(data.data.hasMore || false);

        // Update KPIs from teachers list total count (fallback if KPIs API hasn't loaded)
        // The KPIs API queries ALL teachers and should provide accurate counts
        // But if it hasn't loaded yet, use the total count from the teachers list
        const total = data.data.total || 0;
        
        // Update KPIs if they're still 0 (KPIs API hasn't set them yet)
        // This ensures stats are shown even if KPIs API is slow or fails
        setKpis(prev => {
          // If KPIs are still 0, update with data from teachers list
          // This is a fallback - KPIs API should eventually set correct values
          if (prev.total === 0 && total > 0) {
            // Calculate active/onLeave from ALL teachers (use total count)
            // Since we're on first page with no filters, all active teachers should be in records
            // But we can't accurately count active/onLeave from paginated list
            // So we use the total count and assume all are active (fallback)
            // The KPIs API will provide accurate counts
            
            // Debug logging
            if (process.env.NODE_ENV === 'development') {
              console.log('📊 Teacher KPIs (fallback from list - using total count):', {
                total,
                recordsLength: records.length,
                currentPage,
                selectedStatus,
                prevKpis: prev,
              });
            }
            
            // For fallback, use total count and calculate from current page records
            // This is only accurate if we're on first page with no filters
            const active = (currentPage === 1 && selectedStatus === 'all')
              ? records.filter((t: any) => {
                  const isSupabaseStructure = !t.fields;
                  const status = isSupabaseStructure ? t.status : t.fields?.Status;
                  return status && status.toLowerCase() === 'active';
                }).length
              : prev.active;
            
            const onLeave = (currentPage === 1 && selectedStatus === 'all')
              ? records.filter((t: any) => {
                  const isSupabaseStructure = !t.fields;
                  const status = isSupabaseStructure ? t.status : t.fields?.Status;
                  return status && (status.toLowerCase() === 'on leave' || status.toLowerCase() === 'onleave');
                }).length
              : prev.onLeave;
            
            return {
              total: total,
              active: active || prev.active || 0,
              onLeave: onLeave || prev.onLeave || 0,
              avgRating: prev.avgRating || 0, // Rating not available in school_teachers table
            };
          }
          
          return prev;
        });

        // Extract unique subjects for filter
        // Handle both Supabase (flat) and Airtable (nested) structures
        const allSubjects = new Set<string>();
        records.forEach((t: any) => {
          // Check if Supabase structure (flat) or Airtable structure (nested)
          const isSupabaseStructure = !t.fields;
          
          let subjectStr = '';
          if (isSupabaseStructure) {
            // Supabase structure: subjects can be array or string
            if (Array.isArray(t.subjects)) {
              subjectStr = t.subjects.join(', ');
            } else if (typeof t.subjects === 'string') {
              subjectStr = t.subjects;
            }
          } else {
            // Airtable structure: nested fields
            subjectStr = t.fields?.Subjects || '';
          }
          
          subjectStr.split(/[,\n]/).forEach((s: string) => {
            const trimmed = s.trim();
            if (trimmed) allSubjects.add(trimmed);
          });
        });
        setSubjects(Array.from(allSubjects).sort());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedSubject('all');
    setCurrentPage(1);
  }

  function handleViewProfile(teacherId: string) {
    router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers/${teacherId}`);
  }

  function handleQuickAddSuccess() {
    fetchTeachers();
    fetchKPIs();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.teachers.title')}</h1>
          <p className="text-gray-600">Manage teacher profiles and assignments</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowQuickAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('dashboard.teachers.addTeacher')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <TeacherKpis
        total={kpis.total}
        active={kpis.active}
        onLeave={kpis.onLeave}
        avgRating={kpis.avgRating}
        loading={loading && kpis.total === 0}
      />

      {/* Filters */}
      <TeacherFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
        onClear={handleClearFilters}
      />

      {/* Teacher Grid */}
      {teachers.length === 0 ? (
        <EmptyState
          title={t('dashboard.teachers.empty.title')}
          description={t('dashboard.teachers.empty.description')}
          actionLabel={t('dashboard.teachers.empty.action')}
          onAction={() => setShowQuickAdd(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {teachers.map((teacher) => (
              <TeacherListItem
                key={teacher.id}
                teacher={teacher}
                onViewProfile={handleViewProfile}
                showActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {t('dashboard.teachers.pagination.showing')} {teachers.length} {t('dashboard.teachers.pagination.results')}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                {t('dashboard.teachers.pagination.previous')}
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                {t('dashboard.teachers.pagination.page')} {currentPage}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                {t('dashboard.teachers.pagination.next')}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Quick Add Modal */}
      <TeacherQuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
        schoolId={schoolId}
      />
    </div>
  );
}

