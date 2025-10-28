'use client';

import { Plus, Search, Zap, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { ClassKpis } from '../../../../components/school/classes/ClassKpis';
import { ClassQuickAddModal } from '../../../../components/school/classes/ClassQuickAddModal';
import { useSchool } from '../../../../contexts/SchoolContext';
import { useI18n } from '../../../../contexts/I18nContext';

export default function ClassesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedSchool } = useSchool();
  const { t, lang } = useI18n();
  
  const schoolId = selectedSchool?.id || selectedSchool?.name;

  // Redirect to school selector if no school selected
  useEffect(() => {
    if (!schoolId) {
      router.push('/school');
    }
  }, [schoolId, router]);

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
    const params = new URLSearchParams();
    if (selectedGrade && selectedGrade !== 'all') params.set('grade', selectedGrade);
    if (searchQuery) params.set('q', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const query = params.toString();
    router.push(`/school/admin/classes${query ? `?${query}` : ''}`, { scroll: false });
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
          schoolId,
          ...(selectedGrade && selectedGrade !== 'all' && { grade: selectedGrade }),
          ...(searchQuery && { search: searchQuery }),
          page: currentPage.toString(),
          pageSize: '10',
        });

        const [kpisResponse, classesResponse, gradesResponse] = await Promise.all([
          fetch(`/api/school/classes/kpis?schoolId=${schoolId}`),
          fetch(`/api/school/classes?${classesParams}`),
          fetch(`/api/school/classes/grades?schoolId=${schoolId}`),
        ]);

        // Process responses
        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json();
          setKpis(kpisData);
        }

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData.records || []);
          setTotalPages(classesData.totalPages || 1);
        }

        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData.grades || []);
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

  if (!schoolId) {
    return <div className="p-6">{lang === 'vi' ? 'Đang chuyển hướng...' : 'Redirecting...'}</div>;
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('classes')}</h1>
          <p className="text-gray-600">
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
          <Button className="gap-2" onClick={() => router.push('/school/admin/classes/new')}>
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
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{lang === 'vi' ? 'Tất cả khối' : 'All Grades'}</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>
                {lang === 'vi' ? `Khối ${grade}` : `Grade ${grade}`}
              </option>
            ))}
          </select>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm lớp học...' : 'Search classes...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                {lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Error Loading Data'}
              </h3>
              <p className="text-sm text-red-700">{error}</p>
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
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && !error && (
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {lang === 'vi' ? 'Không tìm thấy lớp học' : 'No classes found'}
          </h3>
          <p className="text-gray-600 mb-6">
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
                onClick={() => router.push(`/school/admin/classes/${classItem.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl font-bold text-blue-600">
                      {classItem.grade || '?'}
                    </span>
                  </div>
                  <StatusBadge status={classItem.status} />
                </div>

                <h3 className="text-lg font-semibold mb-2">{classItem.name || lang === 'vi' ? 'Không có tên' : 'Untitled Class'}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Giáo viên' : 'Teacher'}</span>
                    <span className="font-medium text-gray-900">{classItem.homeroomTeacherName || lang === 'vi' ? 'Chưa gán' : 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Học sinh' : 'Students'}</span>
                    <span className="font-medium text-gray-900">{classItem.studentCount || 0}/{classItem.capacity || 25}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'vi' ? 'Phòng' : 'Room'}</span>
                    <span className="font-medium text-gray-900">{classItem.roomNumber || lang === 'vi' ? 'TBD' : 'TBD'}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/school/admin/classes/${classItem.id}`);
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
