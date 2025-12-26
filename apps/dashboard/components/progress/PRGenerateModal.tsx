'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import supabase from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { calculateDateRange } from '../../lib/supabase/progress';

interface PRGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: { id: string; name: string }[];
  schoolId: string;
  onSuccess: () => void;
}

export function PRGenerateModal({ isOpen, onClose, classes, schoolId, onSuccess }: PRGenerateModalProps) {
  const { t } = useI18n();
  const [classId, setClassId] = useState<string>('');
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('3m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!classId) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { from, to } = calculateDateRange(range);

      const { data, error: rpcError } = await supabase.rpc('pr_generate_reports', {
        p_school: schoolId,
        p_class: classId,
        p_from: from,
        p_to: to,
      });

      if (rpcError) throw rpcError;

      const selectedClass = classes.find(c => c.id === classId);
      setSuccess(`Generated reports for ${selectedClass?.name || 'selected class'} (${from} to ${to})`);
      
      // Create notifications for parents of students in the class
      try {
        // Get all students in the class
        const { data: studentsInClass } = await supabase
          .from('school_students')
          .select('id, first_name, last_name')
          .eq('school_id', schoolId)
          .eq('class_id', classId)
          .ilike('status', 'active');

        if (studentsInClass && studentsInClass.length > 0) {
          const studentIds = studentsInClass.map(s => s.id);
          const { data: parentMappings } = await supabase
            .from('school_parent_students')
            .select('parent_user_id, student_id')
            .eq('school_id', schoolId)
            .in('student_id', studentIds);

          if (parentMappings && parentMappings.length > 0) {
            // Group by parent to create one notification per parent (they may have multiple children)
            const parentToStudents = new Map<string, string[]>();
            parentMappings.forEach((m: any) => {
              if (m.parent_user_id && m.student_id) {
                if (!parentToStudents.has(m.parent_user_id)) {
                  parentToStudents.set(m.parent_user_id, []);
                }
                const student = studentsInClass.find(s => s.id === m.student_id);
                if (student) {
                  parentToStudents.get(m.parent_user_id)!.push(`${student.first_name} ${student.last_name}`);
                }
              }
            });

            // Create notifications for each parent
            const notificationPromises = Array.from(parentToStudents.entries()).map(async ([parentUserId, studentNames]) => {
              try {
                const studentList = studentNames.length === 1 
                  ? studentNames[0]
                  : `${studentNames.length} students`;
                
                await supabase.from('notifications').insert({
                  school_id: schoolId,
                  recipient_user_id: parentUserId,
                  recipient_role: 'parent',
                  type: 'progress_report',
                  priority: 'urgent',
                  title: `Progress Report Available: ${selectedClass?.name || 'Class'}`,
                  body: `Progress reports for ${studentList} are now available (${from} to ${to})`,
                  target_type: 'progress_report',
                  target_id: classId,
                  is_read: false,
                  meta: {
                    class_id: classId,
                    class_name: selectedClass?.name,
                    date_range: { from, to },
                    student_count: studentNames.length,
                  },
                });
              } catch (notifError) {
                console.error('Failed to create progress report notification:', notifError);
              }
            });

            await Promise.allSettled(notificationPromises);
            console.log('✅ Progress report notifications created for', parentToStudents.size, 'parents');
          }
        }
      } catch (notifError) {
        // Don't fail the request if notifications fail
        console.error('Error creating progress report notifications:', notifError);
      }
      
      // Delay before closing to show success message
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(null);
        setClassId('');
      }, 2000);
    } catch (err: any) {
      console.error('Error generating reports:', err);
      setError(err.message || 'Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setClassId('');
      setRange('3m');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const { from, to } = calculateDateRange(range);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.progress.generate')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            This will generate snapshot reports for all active students in the selected class for the specified period.
          </p>

          <Select
            label={t('dashboard.progress.filters.class')}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
            placeholder={t('dashboard.students.filters.selectClass')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {(['3m', '6m', '12m'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  disabled={loading}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    range === r
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  } disabled:opacity-50`}
                >
                  {t(`dashboard.progress.filters.range.${r}`)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Period: {from} to {to}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('dashboard.progress.actions.cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={!classId || loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('dashboard.progress.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
