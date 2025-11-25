'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { Button } from '../../../../../components/ui/Button';
import { HomeworkFilters } from '../../../../../components/homework/HomeworkFilters';
import { HomeworkKpis } from '../../../../../components/homework/HomeworkKpis';
import { HomeworkList } from '../../../../../components/homework/HomeworkList';
import { HomeworkCharts } from '../../../../../components/homework/HomeworkCharts';
import { CreateHomeworkModal } from '../../../../../components/homework/CreateHomeworkModal';
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

export default function AdminHomeworkPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const dateParam = searchParams.get('date');
  const rangeParam = (searchParams.get('range') as DateRange) || 'week';
  const classIdParam = searchParams.get('classId') || undefined;
  const subjectParam = searchParams.get('subject') || undefined;
  const studentIdParam = searchParams.get('studentId') || undefined;
  const statusParam = searchParams.get('status') || 'all';

  // State
  const [selectedDate, setSelectedDate] = useState(() =>
    dateParam ? new Date(dateParam) : new Date()
  );
  const [range, setRange] = useState<DateRange>(rangeParam);
  const [classId, setClassId] = useState<string | undefined>(classIdParam);
  const [subject, setSubject] = useState<string | undefined>(subjectParam);
  const [studentId, setStudentId] = useState<string | undefined>(studentIdParam);
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
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<
    Array<{ id: string; first_name: string; last_name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modal/Drawer state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Calculate date range
  const { from, to } = getDateRangeForHomework(selectedDate, range);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate.toISOString().split('T')[0]);
    params.set('range', range);
    if (classId) params.set('classId', classId);
    if (subject) params.set('subject', subject);
    if (studentId) params.set('studentId', studentId);
    params.set('status', status);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, range, classId, subject, studentId, status, router]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [schoolId, selectedDate, range, classId, subject, studentId, status]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [kpisData, listData, scoresDataRaw, classesData, studentsData] =
        await Promise.all([
          fetchHomeworkKpis(schoolId, from, to, classId, subject, studentId, status, supabase),
          fetchHomeworkList(schoolId, from, to, classId, subject, studentId, status, supabase),
          fetchScoresSeries(schoolId, from, to, classId, subject, studentId, supabase),
          supabase
            .from('school_classes')
            .select('id, name')
            .eq('school_id', schoolId)
            .ilike('status', 'active')
            .order('name'),
          supabase
            .from('school_students')
            .select('id, first_name, last_name')
            .eq('school_id', schoolId)
            .ilike('status', 'active')
            .order('first_name'),
        ]);

      setKpis(kpisData);
      setList(listData);
      setScoresData(scoresDataRaw);
      setClasses(classesData.data || []);
      setStudents(studentsData.data || []);
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

  const showCharts = !!(classId || subject);

  // Filter list by search query
  const filteredList = list.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.homework.title') || 'Homework Assignments'}</h1>
          <p className="text-sm text-gray-500 mt-1">{schoolId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            disabled
            title="Export feature coming soon"
          >
            <Download className="w-4 h-4" />
            {t('dashboard.homework.exportCsv') || 'Export CSV'}
          </Button>
          <Button
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.homework.createAssignment') || 'Create Assignment'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <HomeworkFilters
          selectedDate={selectedDate}
          range={range}
          classId={classId}
          subject={subject}
          studentId={studentId}
          status={status}
          searchQuery={searchQuery}
          classes={classes}
          students={students}
          showStudentFilter={true}
          onDateChange={setSelectedDate}
          onRangeChange={setRange}
          onClassChange={setClassId}
          onSubjectChange={setSubject}
          onStudentChange={setStudentId}
          onStatusChange={setStatus}
          onSearchChange={setSearchQuery}
        />
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

      {/* Charts */}
      <div className="mb-6">
        <HomeworkCharts
          completionRate={kpis.completion_rate}
          scoresData={scoresData}
          loading={loading}
          showCharts={showCharts}
        />
      </div>

      {/* List */}
      <div>
        <HomeworkList
          items={filteredList}
          onViewAssignment={handleViewAssignment}
          loading={loading}
          isParentView={false}
        />
      </div>

      {/* Create Modal */}
      <CreateHomeworkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchData();
          setShowCreateModal(false);
        }}
        schoolId={schoolId}
        classes={classes}
      />

      {/* Detail Drawer */}
      <HomeworkDetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId}
        schoolId={schoolId}
        isAdmin={true}
        onUpdate={fetchData}
      />
    </div>
  );
}
