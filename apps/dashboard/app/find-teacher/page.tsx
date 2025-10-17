'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../globals.css';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import FilterBar from '../../components/shared/FilterBar';

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: number;
  avatar: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  languages: string[];
  status: string;
}

export default function FindTeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTeachers();
  }, [filters]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams({
        maxRecords: '50',
        status: 'Active',
        ...filters,
      });

      const response = await fetch(`/api/teachers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({});
    setSearchQuery('');
    fetchTeachers();
  };

  // Filter teachers by search query
  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subjects.some((s) => s.toLowerCase().includes(query)) ||
      teacher.location.address.toLowerCase().includes(query)
    );
  });

  const filterOptions = [
    {
      key: 'subject',
      label: 'Môn học',
      type: 'select' as const,
      options: [
        { value: 'Mathematics', label: 'Toán' },
        { value: 'English', label: 'Tiếng Anh' },
        { value: 'Physics', label: 'Vật lý' },
        { value: 'Chemistry', label: 'Hóa học' },
        { value: 'Literature', label: 'Văn' },
        { value: 'Biology', label: 'Sinh học' },
      ],
    },
    {
      key: 'minRating',
      label: 'Đánh giá tối thiểu',
      type: 'select' as const,
      options: [
        { value: '3', label: '3+ sao' },
        { value: '4', label: '4+ sao' },
        { value: '4.5', label: '4.5+ sao' },
      ],
    },
    {
      key: 'maxRate',
      label: 'Học phí tối đa (k/giờ)',
      type: 'number' as const,
      placeholder: 'VD: 500',
    },
    {
      key: 'location',
      label: 'Khu vực',
      type: 'text' as const,
      placeholder: 'VD: Hà Nội, Quận 1',
    },
  ];

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tìm giáo viên</h1>
        <p className="mt-2 text-gray-600">
          Tìm kiếm giáo viên phù hợp theo môn học, vị trí và đánh giá
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Field
          type="text"
          placeholder="Tìm kiếm theo tên, môn học hoặc khu vực..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />

      {/* Loading State */}
      {loading && <LoadingState message="Đang tải danh sách giáo viên..." />}

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={fetchTeachers}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredTeachers.length === 0 && (
        <EmptyState
          title="Không tìm thấy giáo viên"
          description="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn"
          action={{
            label: 'Đặt lại bộ lọc',
            onClick: handleFilterReset,
          }}
        />
      )}

      {/* Teachers Grid */}
      {!loading && !error && filteredTeachers.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Tìm thấy {filteredTeachers.length} giáo viên
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id}>
                <Link href={`/teachers/${teacher.id}`}>
                  <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      {teacher.avatar ? (
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {teacher.subjects.slice(0, 2).join(', ')}
                          {teacher.subjects.length > 2 && '...'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Đánh giá:</span>
                        <span className="font-medium">
                          ⭐ {teacher.rating.toFixed(1)} ({teacher.reviewCount})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Kinh nghiệm:</span>
                        <span className="font-medium">{teacher.experience} năm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Học phí:</span>
                        <span className="font-medium text-primary">
                          {teacher.hourlyRate}k/giờ
                        </span>
                      </div>
                      {teacher.location.address && (
                        <div className="flex items-start gap-2 pt-2 border-t">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {teacher.location.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button variant="primary" className="w-full mt-4">
                      Xem hồ sơ
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
