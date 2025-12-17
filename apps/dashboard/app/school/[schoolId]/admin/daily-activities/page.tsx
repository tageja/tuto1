'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { Toast } from '../../../../../components/ui/Toast';
import { ActivitiesFilters } from '../../../../../components/activities/ActivitiesFilters';
import { ActivitiesKpis } from '../../../../../components/activities/ActivitiesKpis';
import { ActivitiesTimeline } from '../../../../../components/activities/ActivitiesTimeline';
import { AddActivityModal } from '../../../../../components/activities/AddActivityModal';
import { ActivityDetailsDrawer } from '../../../../../components/activities/ActivityDetailsDrawer';
import { AddDayActivitiesModal } from '../../../../../components/activities/AddDayActivitiesModal';
import { AddWeekActivitiesModal } from '../../../../../components/activities/AddWeekActivitiesModal';
import { DailyActivity, ActivityKPI, ClassOption } from '../../../../../components/activities/types';


// Helper: Get today's date in Asia/Ho_Chi_Minh timezone
function getTodayDate(): string {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Get current time in Asia/Ho_Chi_Minh timezone
function getCurrentTime(): string {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const hours = String(vnTime.getHours()).padStart(2, '0');
  const minutes = String(vnTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function AdminDailyActivitiesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  // Initialize state from URL params on mount
  const dateParam = searchParams.get('date') || getTodayDate();
  const classIdParams = searchParams.getAll('classId');
  const typeParams = searchParams.getAll('type');
  const statusParams = searchParams.getAll('status');
  const searchQuery = searchParams.get('q') || '';

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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(typeParams);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusParams);
  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(searchQuery);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state with URL params on mount (when URL changes externally)
  useEffect(() => {
    const urlDate = searchParams.get('date') || getTodayDate();
    const urlClassIds = searchParams.getAll('classId');
    const urlTypes = searchParams.getAll('type');
    const urlStatuses = searchParams.getAll('status');
    const urlSearch = searchParams.get('q') || '';

    setSelectedDate(urlDate);
    setSelectedClassIds(urlClassIds);
    setSelectedTypes(urlTypes);
    setSelectedStatuses(urlStatuses);
    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [searchParams]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when filters change (skip initial render to avoid double update)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateURL();
  }, [selectedDate, selectedClassIds, selectedTypes, selectedStatuses, debouncedSearch]);

  function updateURL() {
    const params = new URLSearchParams();
    if (selectedDate) params.set('date', selectedDate);
    if (selectedClassIds.length > 0) {
      selectedClassIds.forEach((id) => params.append('classId', id));
    }
    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => params.append('type', type));
    }
    if (selectedStatuses.length > 0) {
      selectedStatuses.forEach((status) => params.append('status', status));
    }
    if (debouncedSearch) params.set('q', debouncedSearch);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl, { scroll: false });
  }

  // Fetch classes
  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  // Fetch activities with request cancellation
  useEffect(() => {
    if (schoolId && selectedDate) {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      fetchActivities(abortController.signal);

      return () => {
        abortController.abort();
      };
    }
  }, [schoolId, selectedDate, selectedClassIds, selectedTypes, selectedStatuses, debouncedSearch]);

  // Update KPIs when activities change
  useEffect(() => {
    computeKPIs();
  }, [activities]);

  async function fetchClasses() {
    if (!schoolId) {
      console.warn('No schoolId available for fetching classes');
      return;
    }

    try {
      // Try API first (API will handle school name → UUID resolution)
      const response = await fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&status=active&limit=100`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.records) {
          // Map API response to our format
          const mappedClasses = data.data.records.map((cls: any) => ({
            id: cls.id,
            name: cls.name || '',
            grade_level: cls.grade_level || null,
          }));
          setClasses(mappedClasses);
          return;
        }
      }
      
      // Fallback: Direct Supabase query - first resolve schoolId to UUID
      // Check if schoolId is UUID or name
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

      // Now query classes with resolved UUID
      const { data: classesData, error } = await supabase
        .from('school_classes')
        .select('id, name, grade_level')
        .eq('school_id', resolvedSchoolId)
        .in('status', ['active', 'Active'])
        .order('grade_level', { ascending: true, nullsLast: true })
        .order('name', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Failed to fetch classes from Supabase:', error);
        setError(`Failed to load classes: ${error.message}`);
        return;
      }

      if (classesData && classesData.length > 0) {
        setClasses(classesData);
      } else {
        console.warn('No classes found for school:', schoolId);
        setClasses([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
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

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching activities via API:', {
          schoolId,
          selectedDate,
          selectedClassIds,
          selectedTypes,
          selectedStatuses,
          debouncedSearch,
        });
      }

      // Build query params
      const params = new URLSearchParams({
        schoolId,
        date: selectedDate,
      });

      selectedClassIds.forEach(id => params.append('classId', id));
      selectedTypes.forEach(type => params.append('type', type));
      selectedStatuses.forEach(status => params.append('status', status));
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      }

      // Call API route
      const response = await fetch(`/api/school/daily-activities?${params.toString()}`, {
        signal,
      });

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const result = await response.json();

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Activities API result:', {
          count: result.data?.length || 0,
          success: result.success,
        });
      }

      // Check if request was aborted before setting state
      if (signal?.aborted) {
        return;
      }

      if (!result.success) {
        setError(result.error || 'Failed to fetch activities');
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Activities loaded:', result.data.length, 'activities');
      }

      setActivities(result.data || []);
    } catch (err: any) {
      // Ignore abort errors
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
    // Aggregate from filtered activities (client-side)
    // This ensures KPIs reflect current filters
    const total = activities.length;
    const completed = activities.filter((a) => a.status === 'Completed').length;
    const in_progress = activities.filter((a) => a.status === 'In Progress').length;
    const pending = activities.filter((a) => a.status === 'Pending').length;

    // Get max updated_at or use current time after mutation
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

  const handleActivityAdded = () => {
    // Create new abort controller for refetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    fetchActivities(abortController.signal);
    setIsAddModalOpen(false);
    setToast({
      message: t('dashboard.activities.toast.created') || 'Activity created successfully',
      type: 'success',
    });
  };

  const handleActivityUpdated = () => {
    // Create new abort controller for refetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    fetchActivities(abortController.signal);
    setIsAddModalOpen(false);
    setSelectedActivity(null);
    setToast({
      message: t('dashboard.activities.toast.updated') || 'Activity updated successfully',
      type: 'success',
    });
  };

  const handleActivityDeleted = () => {
    // Create new abort controller for refetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    fetchActivities(abortController.signal);
    setToast({
      message: t('dashboard.activities.toast.deleted') || 'Activity deleted successfully',
      type: 'success',
    });
  };

  const handleBulkCreated = () => {
    // Create new abort controller for refetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    fetchActivities(abortController.signal);
    setIsDayModalOpen(false);
    setIsWeekModalOpen(false);
    setToast({
      message: t('dashboard.activities.toast.bulkCreated') || 'Activities created successfully',
      type: 'success',
    });
  };

  const handleStatusUpdate = async (activityId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      // Optimistic update
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, status: newStatus } : a))
      );

      const response = await fetch('/api/school/daily-activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          updates: { status: newStatus },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // KPIs will update automatically when activities state updates
      setToast({
        message: t('dashboard.activities.toast.statusUpdated') || 'Status updated successfully',
        type: 'success',
      });
    } catch (err: any) {
      // Rollback on error - refetch activities
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      fetchActivities(abortController.signal);
      setToast({
        message: err.message || t('dashboard.activities.toast.error') || 'An error occurred',
        type: 'error',
      });
    }
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
            variant="default"
            size="sm"
            className="bg-blue-600 text-white"
          >
            Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/school/${params.schoolId}/parent/daily-activities`)}
          >
            Parent →
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
        <div className="relative">
          <div className="flex items-center gap-0">
            <Button
              className="gap-2 rounded-r-none"
              onClick={() => {
                setSelectedActivity(null);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.activities.add.title') || 'Add Activity'}
            </Button>
            <Button
              className="px-2 rounded-l-none border-l border-blue-700"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setIsDayModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.activities.dayModal.title') || "Add Day's Activities"}
                </button>
                <button
                  onClick={() => {
                    setIsWeekModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.activities.weekModal.title') || 'Add Week (Timetable)'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPIs - Show first */}
      <div className="mb-6">
        <ActivitiesKpis kpis={kpis} loading={loading && activities.length === 0} />
      </div>

      {/* Filters */}
      <ActivitiesFilters
        selectedDate={selectedDate}
        selectedClassIds={selectedClassIds}
        selectedTypes={selectedTypes}
        selectedStatuses={selectedStatuses}
        searchQuery={searchInput}
        classes={classes}
        onDateChange={setSelectedDate}
        onClassIdsChange={setSelectedClassIds}
        onTypeChange={setSelectedTypes}
        onStatusChange={setSelectedStatuses}
        onSearchChange={setSearchInput}
        onClearAll={() => {
          setSelectedDate(getTodayDate());
          setSelectedClassIds([]);
          setSelectedTypes([]);
          setSelectedStatuses([]);
          setSearchInput('');
        }}
      />

      {/* Timeline */}
      <ActivitiesTimeline
        activities={activities}
        loading={loading}
        currentDate={selectedDate}
        onActivityClick={(activity) => {
          setSelectedActivity(activity);
          setIsDrawerOpen(true);
        }}
        onEdit={(activity) => {
          setSelectedActivity(activity);
          setIsDrawerOpen(false);
          setIsAddModalOpen(true);
        }}
        onDelete={async (activityId) => {
          try {
            const response = await fetch(`/api/school/daily-activities?activityId=${activityId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to delete activity');
            }

            handleActivityDeleted();
            if (selectedActivity?.id === activityId) {
              setIsDrawerOpen(false);
              setSelectedActivity(null);
            }
          } catch (err: any) {
            setToast({
              message: err.message || t('dashboard.activities.toast.error') || 'An error occurred',
              type: 'error',
            });
          }
        }}
        onDuplicate={(activity) => {
          const duplicated = { ...activity };
          delete (duplicated as any).id;
          
          // Shift time +5 minutes if needed to avoid conflicts
          const [hours, minutes] = activity.time.split(':').map(Number);
          let newMinutes = minutes + 5;
          let newHours = hours;
          if (newMinutes >= 60) {
            newMinutes = newMinutes % 60;
            newHours = (hours + 1) % 24;
          }
          const shiftedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          duplicated.time = shiftedTime;
          
          setSelectedActivity(duplicated as any);
          setIsAddModalOpen(true);
        }}
        onStatusChange={handleStatusUpdate}
        schoolId={schoolId}
      />

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedActivity(null);
          }}
          onSuccess={selectedActivity?.id ? handleActivityUpdated : handleActivityAdded}
          schoolId={schoolId}
          activity={selectedActivity || undefined}
          classes={classes}
        />
      )}

      {/* Add Day's Activities Modal */}
      {isDayModalOpen && (
        <AddDayActivitiesModal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          onSuccess={handleBulkCreated}
          schoolId={schoolId}
          classes={classes}
          selectedDate={selectedDate}
        />
      )}

      {/* Add Week (Timetable) Modal */}
      {isWeekModalOpen && (
        <AddWeekActivitiesModal
          isOpen={isWeekModalOpen}
          onClose={() => setIsWeekModalOpen(false)}
          onSuccess={handleBulkCreated}
          schoolId={schoolId}
          classes={classes}
        />
      )}

      {/* Details Drawer */}
      {isDrawerOpen && selectedActivity && (
        <ActivityDetailsDrawer
          isOpen={isDrawerOpen}
          activity={selectedActivity}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedActivity(null);
          }}
          onEdit={() => {
            setIsDrawerOpen(false);
            setIsAddModalOpen(true);
          }}
          onDelete={async () => {
            try {
              const response = await fetch(`/api/school/daily-activities?activityId=${selectedActivity.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete activity');
              }

              handleActivityDeleted();
              setIsDrawerOpen(false);
              setSelectedActivity(null);
            } catch (err: any) {
              setToast({
                message: err.message || t('dashboard.activities.toast.error') || 'An error occurred',
                type: 'error',
              });
            }
          }}
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

