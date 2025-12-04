'use client';

import { Plus, Search, Zap, GraduationCap } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/school/shared/StatusBadge';
import { ClassKpis } from '../../../../../components/school/classes/ClassKpis';
import { ClassQuickAddModal } from '../../../../../components/school/classes/ClassQuickAddModal';
import { useI18n } from '../../../../../contexts/I18nContext';

export default function ClassesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ClassesPage />
    </Suspense>
  );
}

function ClassesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);

  // State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ totalClasses: 0, activeClasses: 0, totalStudents: 0, capacityUsage: 0, avgAttendance: 0 });
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL params
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('grade') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGrade, currentPage]);

  const updateURL = () => {
    const urlParams = new URLSearchParams();
    if (selectedGrade && selectedGrade !== 'all') urlParams.set('grade', selectedGrade);
    if (searchQuery) urlParams.set('q', searchQuery);
    if (currentPage > 1) urlParams.set('page', currentPage.toString());
    
    const query = urlParams.toString();
    router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes${query ? `?${query}` : ''}`, { scroll: false });
  };

  // Load data
  useEffect(() => {
    if (!schoolId) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel for better performance
        const classesParams = new URLSearchParams({
          schoolId: schoolId,
          limit: '50',
          ...(selectedGrade && selectedGrade !== 'all' && { gradeLevel: selectedGrade }),
          ...(searchQuery && { q: searchQuery }),
        });

        const [classesResponse] = await Promise.all([
          fetch(`/api/school/classes?${classesParams}`),
        ]);

        // Process responses
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          if (classesData.success && classesData.data) {
            const records = classesData.data.records || [];
            setClasses(records);
            
            // Calculate KPIs from classes data
            const totalClasses = classesData.data.total || 0;
            const activeClasses = records.filter((c: any) => 
              c.status && c.status.toLowerCase() === 'active'
            ).length;
            
            // Calculate total students (sum of student counts per class)
            const totalStudents = records.reduce((sum: number, c: any) => {
              return sum + (c.student_count || 0);
            }, 0);
            
            // Calculate capacity usage
            const totalCapacity = records.reduce((sum: number, c: any) => {
              return sum + (c.capacity || 0);
            }, 0);
            const capacityUsage = totalCapacity > 0 
              ? Math.round((totalStudents / totalCapacity) * 100) 
              : 0;
            
            // Extract unique grades
            const uniqueGrades = Array.from(new Set(
              records.map((c: any) => c.grade_level).filter(Boolean)
            )).sort();
            setGrades(uniqueGrades);
            
            setKpis({
              totalClasses,
              activeClasses,
              totalStudents,
              capacityUsage,
              avgAttendance: 0, // TODO: Calculate from attendance data
            });
            
            // Debug logging
            if (process.env.NODE_ENV === 'development') {
              console.log(`📚 Loaded ${totalClasses} classes (${activeClasses} active) for school: ${schoolId}`);
              if (records.length > 0) {
                console.log('Sample classes:', records.slice(0, 3).map((c: any) => ({
                  name: c.name,
                  grade: c.grade_level,
                  status: c.status
                })));
              }
            }
          } else {
            console.error('API response not successful:', classesData);
          }
        } else {
          console.error('Failed to fetch classes:', classesResponse.status);
        }
      } catch (err) {
        console.error('Error loading classes:', err);
        setError(lang === 'vi' ? 'Không thể tải dữ liệu' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [schoolId, selectedGrade, searchQuery, currentPage, lang]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedGrade('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('classes')}</h1>
          <p className="text-text-muted">
            {lang === 'vi' 
              ? 'Quản lý lớp học, xem danh sách học sinh và theo dõi hiệu suất lớp'
              : 'Manage classes, view student rosters, and track class performance'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowQuickAdd(true)}>
            <Zap className="w-4 h-4" />
            {lang === 'vi' ? 'Thêm nhanh' : 'Quick Add'}
          </Button>
          <Button className="gap-2" onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes/new`)}>
            <Plus className="w-4 h-4" />
            {lang === 'vi' ? 'Tạo lớp mới' : 'Add New Class'}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ClassKpis {...kpis} loading={loading} />

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <select 
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="px-4 py-2 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">{lang === 'vi' ? 'Tất cả khối' : 'All Grades'}</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>
                {lang === 'vi' ? `Khối ${grade}` : `Grade ${grade}`}
              </option>
            ))}
          </select>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm lớp học...' : 'Search classes...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {(selectedGrade !== 'all' || searchQuery) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              {lang === 'vi' ? 'Xóa bộ lọc' : 'Clear Filters'}
            </Button>
          )}
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6 mb-6 bg-danger/10 border-danger/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-danger mb-1">
                {lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Error Loading Data'}
              </h3>
              <p className="text-sm text-danger">{error}</p>
            </div>
            <Button variant="outline" onClick={handleRetry}>
              {lang === 'vi' ? 'Thử lại' : 'Retry'}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-surface rounded w-3/4"></div>
                <div className="h-3 bg-surface rounded"></div>
                <div className="h-3 bg-surface rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && !error && (
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">
            {lang === 'vi' ? 'Không tìm thấy lớp học' : 'No classes found'}
          </h3>
          <p className="text-text-muted mb-6">
            {selectedGrade !== 'all' || searchQuery
              ? (lang === 'vi' ? 'Thử điều chỉnh bộ lọc của bạn' : 'Try adjusting your filters')
              : (lang === 'vi' ? 'Bắt đầu bằng cách tạo lớp học đầu tiên của bạn' : 'Start by creating your first class')}
          </p>
          {(selectedGrade !== 'all' || searchQuery) && (
            <Button variant="outline" onClick={handleClearFilters}>
              {lang === 'vi' ? 'Xóa bộ lọc' : 'Clear Filters'}
            </Button>
          )}
        </Card>
      )}

      {/* Classes Grid */}
      {!loading && classes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {classes.map((classItem) => (
              <Card 
                key={classItem.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes/${classItem.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <span className="text-2xl font-bold text-primary">
                      {classItem.grade_level || classItem.grade || '?'}
                    </span>
                  </div>
                  <StatusBadge status={classItem.status || 'active'} />
                </div>

                <h3 className="text-lg font-semibold text-text mb-2">{classItem.name || (lang === 'vi' ? 'Không có tên' : 'Untitled Class')}</h3>
                
                <div className="space-y-2 text-sm text-text-muted mb-4">
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Giáo viên' : 'Teacher'}</span>
                    <span className="font-medium text-text">{classItem.homeroomTeacherName || classItem.school_teachers?.name || (lang === 'vi' ? 'Chưa gán' : 'Not assigned')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Học sinh' : 'Students'}</span>
                    <span className="font-medium text-text">{classItem.student_count || classItem.studentCount || 0}/{classItem.capacity || 25}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Phòng' : 'Room'}</span>
                    <span className="font-medium text-text">{classItem.room_number || classItem.roomNumber || (lang === 'vi' ? 'TBD' : 'TBD')}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/school/${encodeURIComponent(schoolId)}/admin/classes/${classItem.id}`);
                }}>
                  {lang === 'vi' ? 'Xem chi tiết' : 'View Details'}
                </Button>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                {lang === 'vi' ? 'Trước' : 'Previous'}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-text hover:bg-surface/80'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-text hover:bg-surface/80'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                {lang === 'vi' ? 'Tiếp' : 'Next'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Quick Add Modal */}
      <ClassQuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        schoolId={schoolId || ''}
        onSuccess={() => {
          setShowQuickAdd(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

