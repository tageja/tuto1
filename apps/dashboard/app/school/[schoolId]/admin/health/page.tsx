'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { HealthFilters } from '../../../../../components/health/HealthFilters';
import { HealthKPIs } from '../../../../../components/health/HealthKPIs';
import { StudentList } from '../../../../../components/health/StudentList';
import { AddRecordModal } from '../../../../../components/health/AddRecordModal';
import { IncidentActions } from '../../../../../components/health/IncidentActions';
import { StudentHealthDrawer } from '../../../../../components/health/StudentHealthDrawer';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';

export default function AdminHealthPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const classIdParam = searchParams.get('classId') || undefined;
  const studentIdParam = searchParams.get('studentId') || undefined;
  const qParam = searchParams.get('q') || '';

  // State
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    classId: string;
    className: string;
    hasAllergy: boolean;
    hasMedication: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showStudentDrawer, setShowStudentDrawer] = useState(false);
  const [selectedStudentForRecord, setSelectedStudentForRecord] = useState<string | null>(null);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('school_classes')
          .select('id, name')
          .eq('school_id', schoolId)
          .ilike('status', 'active')
          .order('name');

        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [schoolId]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ schoolId });
        if (classIdParam) params.append('classId', classIdParam);
        if (studentIdParam) params.append('studentId', studentIdParam);
        if (qParam) params.append('q', qParam);

        const response = await fetch(`/api/health/students?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setStudents(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schoolId, classIdParam, studentIdParam, qParam]);

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentDrawer(true);
  };

  const handleAddRecord = () => {
    // If a student is selected in the drawer, use that
    // Otherwise, if a student is selected in filters, use that
    const studentToUse = selectedStudentId || studentIdParam;
    if (studentToUse) {
      setSelectedStudentForRecord(studentToUse);
      setShowAddRecord(true);
    } else {
      alert('Please select a student first');
    }
  };

  const handleRecordAdded = () => {
    setShowAddRecord(false);
    setSelectedStudentForRecord(null);
    // Refresh students list
    const params = new URLSearchParams({ schoolId });
    if (classIdParam) params.append('classId', classIdParam);
    if (studentIdParam) params.append('studentId', studentIdParam);
    if (qParam) params.append('q', qParam);

    fetch(`/api/health/students?${params.toString()}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setStudents(result.data || []);
        }
      });
  };

  const handleFiltersChange = (filters: {
    classId?: string;
    studentId?: string;
    q: string;
  }) => {
    // Filters are already synced to URL by HealthFilters component
    // This callback can be used for additional logic if needed
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.health.title')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.health.subtitle')} • {schoolId}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleAddRecord}
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.health.buttons.addRecord')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <HealthFilters
          schoolId={schoolId}
          classes={classes}
          onFiltersChange={handleFiltersChange}
        />
      </Card>

      {/* KPIs */}
      <HealthKPIs schoolId={schoolId} loading={loading} />

      {/* Quick Actions - Show when a student is selected in filters or drawer */}
      {(selectedStudentId || studentIdParam) && (
        <div className="mb-6">
          <IncidentActions
            studentId={selectedStudentId || studentIdParam || ''}
            onSuccess={() => {
              // Refresh data
              handleRecordAdded();
            }}
          />
        </div>
      )}

      {/* Student List */}
      <StudentList
        students={students}
        loading={loading}
        onViewStudent={handleViewStudent}
      />

      {/* Modals */}
      {showAddRecord && selectedStudentForRecord && (
        <AddRecordModal
          isOpen={showAddRecord}
          onClose={() => {
            setShowAddRecord(false);
            setSelectedStudentForRecord(null);
          }}
          onSuccess={handleRecordAdded}
          studentId={selectedStudentForRecord}
        />
      )}

      {showAddRecord && !selectedStudentForRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Select Student</h3>
            <p className="text-gray-600 mb-4">Please select a student from the list or filters before adding a record.</p>
            <Button onClick={() => setShowAddRecord(false)}>Close</Button>
          </Card>
        </div>
      )}

      {showStudentDrawer && (
        <StudentHealthDrawer
          studentId={selectedStudentId}
          isOpen={showStudentDrawer}
          onClose={() => {
            setShowStudentDrawer(false);
            setSelectedStudentId(null);
          }}
          onRefresh={handleRecordAdded}
        />
      )}
    </div>
  );
}
