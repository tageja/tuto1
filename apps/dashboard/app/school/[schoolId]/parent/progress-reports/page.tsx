'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import supabase from '../../../../../lib/supabase';
import { PRStudentPanel } from '../../../../../components/progress/PRStudentPanel';
import { Card } from '../../../../../components/ui/Card';
import { StudentTimelineItem, ProgressReportSnapshot } from '../../../../../components/progress/types';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { calculateDateRange } from '../../../../../lib/supabase/progress';

export default function ParentProgressReportsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    searchParams.get('childId') || null
  );
  const [range, setRange] = useState<'3m' | '6m' | '12m'>(
    (searchParams.get('range') as '3m' | '6m' | '12m') || '3m'
  );
  const [timeline, setTimeline] = useState<StudentTimelineItem[]>([]);
  const [latestReport, setLatestReport] = useState<ProgressReportSnapshot | null>(null);

  // Update URL when selection changes
  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    const params = new URLSearchParams();
    params.set('childId', childId);
    params.set('range', range);
    router.push(`?${params.toString()}`);
  };

  const handleRangeChange = (newRange: '3m' | '6m' | '12m') => {
    setRange(newRange);
    const params = new URLSearchParams();
    if (selectedChildId) params.set('childId', selectedChildId);
    params.set('range', newRange);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // Get child IDs via RLS-safe RPC
        const { data: childIds } = await supabase.rpc('get_user_child_student_ids');
        
        if (!childIds || childIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch student details
        const { data: studentsData } = await supabase
          .from('school_students')
          .select('id, first_name, last_name')
          .in('id', childIds)
          .eq('school_id', schoolId);

        if (studentsData) {
          const childrenList = studentsData.map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
          }));
          setChildren(childrenList);

          // Auto-select first child if none selected
          if (!selectedChildId && childrenList.length > 0) {
            setSelectedChildId(childrenList[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchChildren();
  }, [schoolId, selectedChildId]);

  useEffect(() => {
    const fetchChildProgress = async () => {
      if (!selectedChildId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { from, to } = calculateDateRange(range);

        // Fetch timeline
        const { data: timelineData } = await supabase.rpc('pr_student_timeline', {
          p_school: schoolId,
          p_student: selectedChildId,
          p_from: from,
          p_to: to,
        });
        
        if (timelineData) setTimeline(timelineData);

        // Fetch latest report snapshot
        const { data: latestReportData } = await supabase
          .from('school_progress_reports')
          .select('*')
          .eq('student_id', selectedChildId)
          .gte('range_start', from)
          .lte('range_end', to)
          .order('released_at', { ascending: false })
          .limit(1)
          .single();

        if (latestReportData) {
          setLatestReport({
            ...latestReportData,
            strengths: latestReportData.strengths || [],
            focus_areas: latestReportData.focus_areas || [],
            comments: latestReportData.comments || [],
          });
        } else {
          setLatestReport(null);
        }
      } catch (error) {
        console.error('Error fetching child progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildProgress();
  }, [selectedChildId, range, schoolId]);

  if (loading && children.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h2>
          <p className="text-gray-500">
            No student records are linked to your account for this school.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.progress.title')}</h1>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {children.length > 1 && (
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => handleChildChange(child.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedChildId === child.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {child.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {(['3m', '6m', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  range === r
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t(`dashboard.progress.filters.range.${r}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedChildId && (
        <PRStudentPanel
          studentId={selectedChildId}
          studentName={children.find(c => c.id === selectedChildId)?.name || ''}
          timelineData={timeline}
          latestReport={latestReport}
          loading={loading}
        />
      )}
    </div>
  );
}
