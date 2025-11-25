'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { HomeworkFilters } from '../../../../../components/homework/HomeworkFilters';
import { HomeworkKpis } from '../../../../../components/homework/HomeworkKpis';
import { HomeworkList } from '../../../../../components/homework/HomeworkList';
import { HomeworkCharts } from '../../../../../components/homework/HomeworkCharts';
import { HomeworkDetailDrawer } from '../../../../../components/homework/HomeworkDetailDrawer';
import supabase from '../../../../../lib/supabase';
import {
  fetchHomeworkKpis,
  fetchHomeworkList,
  fetchScoresSeries,
  getDateRangeForHomework,
  type DateRange,
  type HomeworkKPIs,
  type HomeworkListItem,
  type ScoreDataPoint,
} from '../../../../../lib/homework';

export default function ParentHomeworkPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const dateParam = searchParams.get('date');
  const rangeParam = (searchParams.get('range') as DateRange) || '1m';
  const childIdParam = searchParams.get('childId') || undefined;
  const statusParam = searchParams.get('status') || 'all';

  // State
  const [selectedDate, setSelectedDate] = useState(() =>
    dateParam ? new Date(dateParam) : new Date()
  );
  const [range, setRange] = useState<DateRange>(rangeParam);
  const [childId, setChildId] = useState<string | undefined>(childIdParam);
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>(
    statusParam as any
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [kpis, setKpis] = useState<HomeworkKPIs>({
    total: 0,
    pending: 0,
    completed: 0,
    completion_rate: 0,
  });
  const [list, setList] = useState<HomeworkListItem[]>([]);
  const [scoresData, setScoresData] = useState<ScoreDataPoint[]>([]);
  const [children, setChildren] = useState<
    Array<{ id: string; first_name: string; last_name: string; class_name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modal/Drawer state
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Calculate date range
  const { from, to } = getDateRangeForHomework(selectedDate, range);

  // Get current user and their children
  useEffect(() => {
    fetchUserChildren();
  }, [schoolId]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate.toISOString().split('T')[0]);
    params.set('range', range);
    if (childId) params.set('childId', childId);
    params.set('status', status);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, range, childId, status, router]);

  // Fetch data
  useEffect(() => {
    if (childId) {
      fetchData();
    }
  }, [schoolId, selectedDate, range, childId, status]);

  async function fetchUserChildren() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's database ID
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userProfile) return;

      // Get children from school_parent_students mapping
      const { data: mappings } = await supabase
        .from('school_parent_students')
        .select(`
          student:school_students(
            id,
            first_name,
            last_name,
            class:school_classes(name)
          )
        `)
        .eq('school_id', schoolId)
        .eq('parent_user_id', userProfile.id);

      if (mappings && mappings.length > 0) {
        const childrenData = mappings.map((m: any) => ({
          id: m.student.id,
          first_name: m.student.first_name,
          last_name: m.student.last_name,
          class_name: m.student.class?.name || 'N/A',
        }));

        setChildren(childrenData);

        // Auto-select first child if no child selected
        if (!childId && childrenData.length > 0) {
          setChildId(childrenData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }

  async function fetchData() {
    if (!childId) return;

    setLoading(true);
    try {
      // Fetch all data in parallel
      const [kpisData, listData, scoresDataRaw] = await Promise.all([
        fetchHomeworkKpis(schoolId, from, to, undefined, undefined, childId, status, supabase),
        fetchHomeworkList(schoolId, from, to, undefined, undefined, childId, status, supabase),
        fetchScoresSeries(schoolId, from, to, undefined, undefined, childId, supabase),
      ]);

      setKpis(kpisData);
      setList(listData);
      setScoresData(scoresDataRaw);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching homework data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowDetailDrawer(true);
  };

  // Filter list by search query
  const filteredList = list.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChild = children.find((c) => c.id === childId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
        {selectedChild && (
          <p className="text-sm text-gray-500 mt-1">
            {selectedChild.first_name} {selectedChild.last_name} • {selectedChild.class_name}
          </p>
        )}
      </div>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>
          <select
            value={childId || ''}
            onChange={(e) => setChildId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name} - {child.class_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Tabs & Range */}
      <div className="mb-6">
        <div className="flex items-center gap-2 border-b border-gray-200 mb-4">
          {(['all', 'pending', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                status === s
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* Date Picker */}
          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Range Selector */}
          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as DateRange)}
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Week</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="course">Full Course</option>
            </select>
          </div>

          {/* Search */}
          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments..."
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6">
        <HomeworkKpis
          total={kpis.total}
          pending={kpis.pending}
          completed={kpis.completed}
          completion_rate={kpis.completion_rate}
          loading={loading}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Charts (child's score trend) */}
      <div className="mb-6">
        <HomeworkCharts
          completionRate={kpis.completion_rate}
          scoresData={scoresData}
          loading={loading}
          showCharts={true}
        />
      </div>

      {/* List */}
      <div>
        <HomeworkList
          items={filteredList}
          onViewAssignment={handleViewAssignment}
          loading={loading}
          isParentView={true}
          showChildPerformance
        />
      </div>

      {/* Detail Drawer (read-only) */}
      <HomeworkDetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId}
        schoolId={schoolId}
        isAdmin={false}
        onUpdate={fetchData}
      />
    </div>
  );
}
