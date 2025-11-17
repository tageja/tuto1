'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { StudentsKpis } from '../../../../../components/students/StudentsKpis';
import { StudentsFilters } from '../../../../../components/students/StudentsFilters';
import { StudentsTable } from '../../../../../components/students/StudentsTable';
import { ExportCsvButton } from '../../../../../components/students/ExportCsvButton';
import { AddStudentModal } from '../../../../../components/students/AddStudentModal';
import { Toast } from '../../../../../components/ui/Toast';
import { Student, StudentKPI } from '../../../../../lib/types/students';

export default function AdminStudentsListPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();
  
  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [kpis, setKpis] = useState<StudentKPI>({ total: 0, active: 0, inactive: 0, avgAttendance: 0 });
  const [classes, setClasses] = useState<Array<{ id: string; name: string; grade_level?: string | null }>>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [cohortAvgAttendance, setCohortAvgAttendance] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // URL params - support both single and multiple values
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const classIdParams = searchParams.getAll('classId');
  const gradeParams = searchParams.getAll('grade');
  const statusParams = searchParams.getAll('status');
  const [selectedClass, setSelectedClass] = useState<string | string[]>(
    classIdParams.length > 0 ? (classIdParams.length === 1 ? classIdParams[0] : classIdParams) : 'all'
  );
  const [selectedGrade, setSelectedGrade] = useState<string | string[]>(
    gradeParams.length > 0 ? (gradeParams.length === 1 ? gradeParams[0] : gradeParams) : 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<string | string[]>(
    statusParams.length > 0 ? (statusParams.length === 1 ? statusParams[0] : statusParams) : 'all'
  );

  // Validate school ID
  useEffect(() => {
    if (schoolIdFromUrl && selectedSchool?.id && schoolIdFromUrl !== selectedSchool.id) {
      console.warn('School ID mismatch between URL and context');
    }
  }, [schoolIdFromUrl, selectedSchool]);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedClass, selectedGrade, selectedStatus, currentPage]);

  function updateURL() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedClass && selectedClass !== 'all') {
      const classIds = Array.isArray(selectedClass) ? selectedClass : [selectedClass];
      classIds.forEach((id) => params.append('classId', id));
    }
    if (selectedGrade && selectedGrade !== 'all') {
      const grades = Array.isArray(selectedGrade) ? selectedGrade : [selectedGrade];
      grades.forEach((g) => params.append('grade', g));
    }
    if (selectedStatus && selectedStatus !== 'all') {
      const statuses = Array.isArray(selectedStatus) ? selectedStatus : [selectedStatus];
      statuses.forEach((s) => params.append('status', s));
    }
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl, { scroll: false });
  }

  // Fetch KPIs
  useEffect(() => {
    if (schoolId) {
      fetchKPIs();
    }
  }, [schoolId]);

  // Fetch data
  useEffect(() => {
    if (schoolId) {
      fetchStudents();
      fetchClasses();
    }
  }, [schoolId, searchQuery, selectedClass, selectedGrade, selectedStatus, currentPage]);

  async function fetchKPIs() {
    try {
      const response = await fetch(`/api/school/students?schoolId=${encodeURIComponent(schoolId)}&kpis=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setKpis(data.data);
          setCohortAvgAttendance(data.data.avgAttendance);
        }
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  }

  async function fetchStudents() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        schoolId: schoolId,
        page: currentPage.toString(),
        pageSize: '10',
        ...(searchQuery && { q: searchQuery }),
      });

      if (selectedClass && selectedClass !== 'all') {
        const classIds = Array.isArray(selectedClass) ? selectedClass : [selectedClass];
        classIds.forEach((id) => params.append('classId', id));
      }

      if (selectedGrade && selectedGrade !== 'all') {
        const grades = Array.isArray(selectedGrade) ? selectedGrade : [selectedGrade];
        grades.forEach((g) => params.append('grade', g));
      }

      if (selectedStatus && selectedStatus !== 'all') {
        const statuses = Array.isArray(selectedStatus) ? selectedStatus : [selectedStatus];
        statuses.forEach((s) => params.append('status', s));
      }

      const response = await fetch(`/api/school/students?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setStudents(data.data.records || []);
        const total = data.data.total || 0;
        const pageSize = data.data.pageSize || 10;
        setTotalPages(Math.ceil(total / pageSize));
      } else {
        console.error('API response not successful:', data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClasses() {
    try {
      const response = await fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const classesData = data.data.records || [];
          setClasses(classesData);
          
          // Extract unique grades
          const uniqueGrades = Array.from(
            new Set(classesData.map((c: any) => c.grade_level).filter(Boolean))
          ).sort() as string[];
          setGrades(uniqueGrades);
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedGrade('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  function handleStudentAdded() {
    // Refresh KPIs and students list
    fetchKPIs();
    fetchStudents();
    
    // Show success toast
    setToast({
      message: t('dashboard.students.add.success') || 'Student added successfully',
      type: 'success',
    });

    // Close modal
    setIsAddModalOpen(false);
  }

  // Loading state
  if (loading && students.length === 0 && !error) {
    return <LoadingState message={t('dashboard.students.loading') || 'Loading students...'} />;
  }

  // Error state
  if (error && students.length === 0) {
    return (
      <ErrorState
        title={t('dashboard.students.error.title') || 'Error Loading Students'}
        message={error}
        onRetry={fetchStudents}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.students.title') || 'Students'}</h1>
          <p className="text-gray-600">
            {t('dashboard.students.subtitle') || 'Manage student profiles and enrollment'}
            {cohortAvgAttendance !== null && (
              <span className="ml-2 text-sm text-gray-500">
                ({t('dashboard.students.cohortAvgAttendance') || 'Cohort Avg Attendance'}: {cohortAvgAttendance}%)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            schoolId={schoolId}
            filters={{
              classId: selectedClass,
              grade: selectedGrade,
              status: selectedStatus,
              q: searchQuery,
            }}
          />
          <Button 
            className="gap-2" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.students.addStudent.button') || 'Add Student'}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <StudentsKpis kpis={kpis} loading={loading && students.length === 0} />

      {/* Filters */}
      <StudentsFilters
        searchQuery={searchQuery}
        selectedClass={selectedClass}
        selectedGrade={selectedGrade}
        selectedStatus={selectedStatus}
        classes={classes}
        grades={grades}
        onSearchChange={setSearchQuery}
        onClassChange={setSelectedClass}
        onGradeChange={setSelectedGrade}
        onStatusChange={setSelectedStatus}
        onClearAll={handleClearFilters}
      />

      {/* Students Table */}
      <StudentsTable
        students={students}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        schoolId={schoolId}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleStudentAdded}
        schoolId={schoolId}
      />

      {/* Toast Notification */}
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

