'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import supabase from '../../../../../lib/supabase';
import { Button } from '../../../../../components/ui/Button';
import { Download } from 'lucide-react';
import { ProgressKPIs, ClassOverviewItem, RecentReport, StudentTimelineItem, PRFiltersState, ProgressReportSnapshot } from '../../../../../components/progress/types';
import { useI18n } from '../../../../../contexts/I18nContext';
import { calculateDateRange } from '../../../../../lib/supabase/progress';

import { PRFilters } from '../../../../../components/progress/PRFilters';
import { PRKpis } from '../../../../../components/progress/PRKpis';
import { PRClassOverview } from '../../../../../components/progress/PRClassOverview';
import { PRRecentReports } from '../../../../../components/progress/PRRecentReports';
import { PRStudentPanel } from '../../../../../components/progress/PRStudentPanel';
import { PRGenerateModal } from '../../../../../components/progress/PRGenerateModal';

export default function AdminProgressReportsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const { t } = useI18n();

  // URL-driven filters
  const [filters, setFilters] = useState<PRFiltersState>({
    classId: searchParams.get('classId') || null,
    studentId: searchParams.get('studentId') || null,
    range: (searchParams.get('range') as '3m' | '6m' | '12m') || '3m',
  });

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [kpis, setKpis] = useState<ProgressKPIs>({ total_students: 0, avg_grade: 0, improvement_rate: 0, at_risk_count: 0 });
  const [classOverview, setClassOverview] = useState<ClassOverviewItem[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [studentTimeline, setStudentTimeline] = useState<StudentTimelineItem[]>([]);
  const [studentLatestReport, setStudentLatestReport] = useState<ProgressReportSnapshot | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Update URL when filters change
  const handleFilterChange = (newFilters: PRFiltersState) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.classId) params.set('classId', newFilters.classId);
    if (newFilters.studentId) params.set('studentId', newFilters.studentId);
    params.set('range', newFilters.range);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Classes
        if (classes.length === 0) {
          const { data: cls } = await supabase
            .from('school_classes')
            .select('id, name')
            .eq('school_id', schoolId)
            .eq('status', 'active');
          if (cls) setClasses(cls);
        }

        // Calculate Date Range
        const { from, to } = calculateDateRange(filters.range);

        // 2. Fetch KPIs
        const { data: kpiData } = await supabase.rpc('pr_school_kpis', {
          p_school: schoolId,
          p_from: from,
          p_to: to,
        });
        if (kpiData && kpiData[0]) setKpis(kpiData[0]);

        // 3. Fetch Students (if class selected)
        if (filters.classId) {
          const { data: st } = await supabase
            .from('school_students')
            .select('id, first_name, last_name')
            .eq('class_id', filters.classId)
            .eq('status', 'active');
          
          if (st) setStudents(st.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));

          // 4. Fetch Class Overview
          const { data: overview } = await supabase.rpc('pr_class_overview', {
            p_school: schoolId,
            p_class: filters.classId,
            p_from: from,
            p_to: to,
          });
          if (overview) setClassOverview(overview);
        } else {
          setStudents([]);
          setClassOverview([]);
        }

        // 5. Fetch Recent Reports
        const { data: reportsData } = await supabase.rpc('pr_recent_reports', {
          p_school: schoolId,
          p_class: filters.classId || null,
          p_limit: 20,
        });
        
        // Enrich with student and class names
        if (reportsData) {
          const enrichedReports = await Promise.all(
            reportsData.map(async (report: any) => {
              const { data: student } = await supabase
                .from('school_students')
                .select('first_name, last_name')
                .eq('id', report.student_id)
                .single();
              
              const { data: progressReport } = await supabase
                .from('school_progress_reports')
                .select('avg_score, avg_grade_letter, range_start, range_end')
                .eq('id', report.report_id)
                .single();

              return {
                id: report.report_id,
                student_id: report.student_id,
                student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
                class_id: report.class_id,
                class_name: classes.find(c => c.id === report.class_id)?.name || 'Unknown',
                avg_score: progressReport?.avg_score || 0,
                avg_grade_letter: progressReport?.avg_grade_letter || 'N/A',
                released_at: report.released_at,
                range_start: progressReport?.range_start || '',
                range_end: progressReport?.range_end || '',
              };
            })
          );
          setRecentReports(enrichedReports);
        }

        // 6. Fetch Student Detail (if student selected)
        if (filters.studentId) {
          const { data: timeline } = await supabase.rpc('pr_student_timeline', {
            p_school: schoolId,
            p_student: filters.studentId,
            p_from: from,
            p_to: to,
          });
          if (timeline) setStudentTimeline(timeline);

          // Fetch latest report snapshot
          const { data: latestReportData } = await supabase
            .from('school_progress_reports')
            .select('*')
            .eq('student_id', filters.studentId)
            .gte('range_start', from)
            .lte('range_end', to)
            .order('released_at', { ascending: false })
            .limit(1)
            .single();

          if (latestReportData) {
            setStudentLatestReport({
              ...latestReportData,
              strengths: latestReportData.strengths || [],
              focus_areas: latestReportData.focus_areas || [],
              comments: latestReportData.comments || [],
            });
          } else {
            setStudentLatestReport(null);
          }
        } else {
          setStudentTimeline([]);
          setStudentLatestReport(null);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, filters.classId, filters.studentId, filters.range, classes]);

  const handleExportCSV = () => {
    // Simple CSV export
    const csv = [
      ['Student', 'Average Score', 'Grade', 'Risk'],
      ...recentReports.map(r => [
        r.student_name,
        r.avg_score?.toFixed(1) || 'N/A',
        r.avg_grade_letter,
        'No', // Would need risk_flag from report
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.progress.title')}</h1>
          <p className="text-gray-500">{t('dashboard.progress.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsGenerateModalOpen(true)}>
            {t('dashboard.progress.generate')}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExportCSV}>
            <Download className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      </div>

      <PRFilters
        filters={filters}
        onChange={handleFilterChange}
        classes={classes}
        students={students}
      />

      <div className="space-y-6">
        <PRKpis data={kpis} loading={loading} />

        {filters.studentId ? (
          <PRStudentPanel
            studentId={filters.studentId}
            studentName={students.find(s => s.id === filters.studentId)?.name || 'Student'}
            timelineData={studentTimeline}
            latestReport={studentLatestReport}
            loading={loading}
          />
        ) : filters.classId ? (
          <div className="grid grid-cols-1 gap-6">
            <PRClassOverview data={classOverview} loading={loading} />
            <PRRecentReports 
              reports={recentReports} 
              loading={loading}
              onViewReport={(r) => handleFilterChange({ ...filters, studentId: r.student_id })}
            />
          </div>
        ) : (
          <PRRecentReports 
            reports={recentReports} 
            loading={loading}
            onViewReport={(r) => handleFilterChange({ classId: r.class_id, studentId: r.student_id, range: filters.range })}
          />
        )}
      </div>

      <PRGenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        classes={classes}
        schoolId={schoolId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
