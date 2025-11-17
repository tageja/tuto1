'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { Toast } from '../../../../../components/ui/Toast';
import { supabase } from '../../../../../lib/supabase';
import { DailyActivity, ActivityKPI, ClassOption } from '../../../../../components/activities/types';
import { ActivitiesFilters } from '../../../../../components/activities/ActivitiesFilters';
import { ActivitiesKpis } from '../../../../../components/activities/ActivitiesKpis';
import { ActivitiesTimeline } from '../../../../../components/activities/ActivitiesTimeline';
import { ActivityDetailsDrawer } from '../../../../../components/activities/ActivityDetailsDrawer';
import { SuggestActivityModal } from '../../../../../components/activities/SuggestActivityModal';

// Helper: Get today's date in Asia/Ho_Chi_Minh timezone
function getTodayDate(): string {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ParentDailyActivitiesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  // Initialize state from URL params
  const dateParam = searchParams.get('date') || getTodayDate();
  const classIdParams = searchParams.getAll('classId');

  // State
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [kpis, setKpis] = useState<ActivityKPI>({ total: 0, completed: 0, in_progress: 0, pending: 0 });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(dateParam);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    classIdParams.length > 0 ? classIdParams : []
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state with URL params
  useEffect(() => {
    const urlDate = searchParams.get('date') || getTodayDate();
    const urlClassIds = searchParams.getAll('classId');
    setSelectedDate(urlDate);
    setSelectedClassIds(urlClassIds);
  }, [searchParams]);

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when filters change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateURL();
  }, [selectedDate, selectedClassIds, debouncedSearch]);

  function updateURL() {
    const params = new URLSearchParams();
    if (selectedDate) params.set('date', selectedDate);
    if (selectedClassIds.length > 0) {
      selectedClassIds.forEach((id) => params.append('classId', id));
    }
    if (debouncedSearch) params.set('q', debouncedSearch);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl, { scroll: false });
  }

  // Fetch parent's child classes (restricted)
  useEffect(() => {
    if (schoolId) {
      fetchChildClasses();
    }
  }, [schoolId]);

  // Fetch activities with request cancellation
  useEffect(() => {
    if (schoolId && selectedDate) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      fetchActivities(abortController.signal);

      return () => {
        abortController.abort();
      };
    }
  }, [schoolId, selectedDate, selectedClassIds, debouncedSearch]);

  // Update KPIs when activities change
  useEffect(() => {
    computeKPIs();
  }, [activities]);

  async function fetchChildClasses() {
    if (!schoolId) {
      console.warn('No schoolId available for fetching child classes');
      return;
    }

    try {
      // Get current user's email from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.warn('No user email found for parent');
        return;
      }

      // Resolve schoolId to UUID if it's a name
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let resolvedSchoolId = schoolId;
      
      if (!uuidRegex.test(schoolId)) {
        // It's a school name, need to resolve to UUID
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .eq('name', schoolId)
          .maybeSingle();
        
        if (schoolData?.id) {
          resolvedSchoolId = schoolData.id;
        } else {
          // Try case-insensitive
          const { data: schoolData2 } = await supabase
            .from('schools')
            .select('id, name')
            .ilike('name', schoolId)
            .limit(1)
            .maybeSingle();
          
          if (schoolData2?.id) {
            resolvedSchoolId = schoolData2.id;
          } else {
            console.error('Could not resolve school name to UUID:', schoolId);
            return;
          }
        }
      }

      // Fetch children's classes via school_students where parent_email matches
      const { data: students, error: studentsError } = await supabase
        .from('school_students')
        .select('class_id, school_classes(id, name, grade_level)')
        .eq('school_id', resolvedSchoolId)
        .eq('parent_email', user.email);

      if (studentsError) {
        console.error('Failed to fetch child classes:', studentsError);
        setError(`Failed to load classes: ${studentsError.message}`);
        return;
      }

      // Extract unique classes
      const uniqueClasses = new Map<string, ClassOption>();
      (students || []).forEach((student: any) => {
        if (student.school_classes) {
          const classData = student.school_classes;
          if (!uniqueClasses.has(classData.id)) {
            uniqueClasses.set(classData.id, {
              id: classData.id,
              name: classData.name || '',
              grade_level: classData.grade_level,
            });
          }
        }
      });

      const classesList = Array.from(uniqueClasses.values());
      setClasses(classesList);
      
      if (classesList.length === 0) {
        console.warn('No classes found for parent email:', user.email);
      }
    } catch (err: any) {
      console.error('Failed to fetch child classes:', err);
      setError(`Failed to load classes: ${err.message || 'Unknown error'}`);
    }
  }

  async function fetchActivities(signal?: AbortSignal) {
    if (!schoolId || !selectedDate) {
      console.warn('Missing schoolId or selectedDate for fetching activities');
      if (!signal?.aborted) {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Resolve schoolId to UUID if it's a name
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let resolvedSchoolId = schoolId;
      
      if (!uuidRegex.test(schoolId)) {
        // It's a school name, need to resolve to UUID
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .eq('name', schoolId)
          .maybeSingle();
        
        if (schoolData?.id) {
          resolvedSchoolId = schoolData.id;
        } else {
          // Try case-insensitive
          const { data: schoolData2 } = await supabase
            .from('schools')
            .select('id, name')
            .ilike('name', schoolId)
            .limit(1)
            .maybeSingle();
          
          if (schoolData2?.id) {
            resolvedSchoolId = schoolData2.id;
          } else {
            throw new Error(`School not found: ${schoolId}`);
          }
        }
      }

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching activities (parent):', {
          resolvedSchoolId,
          selectedDate,
          selectedClassIds,
          childClasses: classes.map(c => c.id),
          debouncedSearch,
        });
      }

      // Query with filters - only show activities for parent's child classes if classIds are set
      let query = supabase
        .from('school_daily_activities')
        .select('id,date,time,class_id,grade,title,description,type,status,teacher_id,menu_details,outdoor_detail,attachments,updated_at')
        .eq('school_id', resolvedSchoolId)
        .eq('date', selectedDate);

      // Apply class filter (restricted to child's classes)
      if (selectedClassIds.length > 0) {
        query = query.in('class_id', selectedClassIds);
      } else {
        // If no class filter, only show activities from child's classes
        const childClassIds = classes.map((c) => c.id);
        if (childClassIds.length > 0) {
          query = query.in('class_id', childClassIds);
        } else {
          // If no child classes found, return empty result
          if (signal?.aborted) {
            return;
          }
          setActivities([]);
          setLoading(false);
          return;
        }
      }

      // Search filter
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      // Order by time
      query = query.order('time', { ascending: true });

      const { data, error: queryError } = await query;

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Activities query result (parent):', {
          count: data?.length || 0,
          error: queryError?.message,
          sample: data?.[0],
        });
      }

      if (signal?.aborted) {
        return;
      }

      if (queryError) {
        console.error('❌ Activities query error (parent):', queryError);
        throw queryError;
      }

      // Handle empty result
      if (!data || data.length === 0) {
        if (signal?.aborted) {
          return;
        }
        setActivities([]);
        setLoading(false);
        return;
      }

      // Fetch class and teacher names separately
      const mapped = await Promise.all((data || []).map(async (item: any) => {
        let class_name = '';
        let teacher_name = null;

        if (item.class_id) {
          const { data: classData } = await supabase
            .from('school_classes')
            .select('name')
            .eq('id', item.class_id)
            .maybeSingle();
          class_name = classData?.name || '';
        }

        if (item.teacher_id) {
          const { data: teacherData } = await supabase
            .from('school_teachers')
            .select('name')
            .eq('id', item.teacher_id)
            .maybeSingle();
          teacher_name = teacherData?.name || null;
        }

        return {
          ...item,
          class_name: class_name || item.grade || 'Unknown Class',
          teacher_name,
        };
      }));

      if (signal?.aborted) {
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Activities loaded (parent):', mapped.length, 'activities');
      }

      setActivities(mapped);
    } catch (err: any) {
      if (err.name === 'AbortError' || (signal && signal.aborted)) {
        return;
      }
      setError(err.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  function computeKPIs() {
    const total = activities.length;
    const completed = activities.filter((a) => a.status === 'Completed').length;
    const in_progress = activities.filter((a) => a.status === 'In Progress').length;
    const pending = activities.filter((a) => a.status === 'Pending').length;

    const maxUpdatedAt = activities.length > 0
      ? activities.reduce((max, a) => {
          const updated = new Date(a.updated_at).getTime();
          return updated > max ? updated : max;
        }, 0)
      : Date.now();

    setKpis({
      total,
      completed,
      in_progress,
      pending,
      last_updated: new Date(maxUpdatedAt).toISOString(),
    });
  }

  const handleSuggestActivity = () => {
    setIsSuggestModalOpen(true);
  };

  const handleSuggestionSubmitted = () => {
    setIsSuggestModalOpen(false);
    setToast({
      message: t('dashboard.activities.toast.suggestSubmitted') || 'Suggestion submitted successfully! Thank you.',
      type: 'success',
    });
  };


  // Loading state
  if (loading && activities.length === 0 && !error) {
    return <LoadingState message={t('dashboard.activities.loading') || 'Loading activities...'} />;
  }

  // Error state
  if (error && activities.length === 0) {
    return (
      <ErrorState
        title={t('dashboard.activities.error.loadError') || 'Error Loading Activities'}
        message={error}
        onRetry={() => {
          const abortController = new AbortController();
          abortControllerRef.current = abortController;
          fetchActivities(abortController.signal);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Dev Mode Toggle */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-900">Dev Mode - Switch Role:</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/school/${params.schoolId}/admin/daily-activities`)}
          >
            ← Admin
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 text-white"
          >
            Parent
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.activities.title') || 'Daily Activities'}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.activities.subtitle') || 'Track daily activities, meals, and learning progress'}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleSuggestActivity}
        >
          <Lightbulb className="w-4 h-4" />
          {t('dashboard.activities.suggest.title') || 'Suggest an Activity'}
        </Button>
      </div>

      {/* KPIs - Show first */}
      <div className="mb-6">
        <ActivitiesKpis kpis={kpis} loading={loading && activities.length === 0} />
      </div>

      {/* Filters - Date and Class only for parent */}
      <ActivitiesFilters
        selectedDate={selectedDate}
        selectedClassIds={selectedClassIds}
        searchQuery={searchInput}
        classes={classes}
        onDateChange={setSelectedDate}
        onClassIdsChange={setSelectedClassIds}
        onSearchChange={setSearchInput}
        onClearAll={() => {
          setSelectedDate(getTodayDate());
          setSelectedClassIds([]);
          setSearchInput('');
        }}
        isParentView={true}
      />

      {/* Timeline - Read-only for parent */}
      <ActivitiesTimeline
        activities={activities}
        loading={loading}
        currentDate={selectedDate}
        onActivityClick={(activity) => {
          setSelectedActivity(activity);
          setIsDrawerOpen(true);
        }}
        onEdit={() => {}} // No-op for parent
        onDelete={() => {}} // No-op for parent
        onDuplicate={() => {}} // No-op for parent
        onStatusChange={() => {}} // No-op for parent
        schoolId={schoolId}
        isParentView={true}
      />

      {/* Details Drawer - Read-only */}
      {isDrawerOpen && selectedActivity && (
        <ActivityDetailsDrawer
          isOpen={isDrawerOpen}
          activity={selectedActivity}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedActivity(null);
          }}
          onEdit={() => {}} // No-op for parent
          onDelete={() => {}} // No-op for parent
          isParentView={true}
        />
      )}

      {/* Suggest Activity Modal */}
      {isSuggestModalOpen && (
        <SuggestActivityModal
          isOpen={isSuggestModalOpen}
          onClose={() => setIsSuggestModalOpen(false)}
          onSuccess={handleSuggestionSubmitted}
          schoolId={schoolId}
          classes={classes}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

