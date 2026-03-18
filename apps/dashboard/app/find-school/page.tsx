'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { School } from '../../types/school';
import { mapSchoolFromDB, mapDirectorySchool } from '../../lib/school-mapper';
import SchoolCard from '../../components/school/SchoolCard';
import Header from '../../components/layout/Header';
import Footer from '../../components/landing/Footer';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useI18n } from '../../contexts/I18nContext';

const SCHOOL_TYPES = [
  { value: '', label: { vi: 'Tất cả loại hình', en: 'All Types' } },
  { value: 'Preschool', label: { vi: 'Mầm non', en: 'Preschool' } },
  { value: 'Primary', label: { vi: 'Tiểu học', en: 'Primary' } },
  { value: 'Secondary', label: { vi: 'THCS', en: 'Secondary' } },
  { value: 'HighSchool', label: { vi: 'THPT', en: 'High School' } },
  { value: 'Center', label: { vi: 'Trung tâm', en: 'Center' } },
  { value: 'Other', label: { vi: 'Khác', en: 'Other' } },
];

const TUITION_RANGES = [
  { value: '', label: { vi: 'Tất cả học phí', en: 'All Tuition' } },
  { value: '0-5000000', label: { vi: 'Dưới 5tr/tháng', en: 'Under 5M/mo' } },
  { value: '5000000-10000000', label: { vi: '5tr – 10tr/tháng', en: '5M – 10M/mo' } },
  { value: '10000000-20000000', label: { vi: '10tr – 20tr/tháng', en: '10M – 20M/mo' } },
  { value: '20000000-999999999', label: { vi: 'Trên 20tr/tháng', en: 'Above 20M/mo' } },
];

export default function FindSchoolPage() {
  const { lang } = useI18n();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [tuitionRange, setTuitionRange] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both sources in parallel
      const [listingsResult, directoryResult] = await Promise.all([
        supabase
          .from('school_listings')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('kiddihub_schools')
          .select('*')
          .eq('published', true)
          .order('featured', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(500),
      ]);

      const mapped: School[] = [];

      // school_listings first (Tuto's own data — featured at top)
      if (listingsResult.data) {
        mapped.push(...listingsResult.data.map(mapSchoolFromDB));
      }

      // directory data
      if (directoryResult.data) {
        mapped.push(...directoryResult.data.map(mapDirectorySchool));
      }

      setSchools(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hit =
          school.name.toLowerCase().includes(q) ||
          school.address.toLowerCase().includes(q) ||
          school.city.toLowerCase().includes(q) ||
          school.tags.some(t => t.toLowerCase().includes(q));
        if (!hit) return false;
      }

      if (selectedType && school.type !== selectedType) return false;

      if (tuitionRange) {
        const [min, max] = tuitionRange.split('-').map(Number);
        if (max < 999999999) {
          if (school.minTuition > max) return false;
        } else {
          if (school.minTuition < min) return false;
        }
      }

      return true;
    });
  }, [schools, searchQuery, selectedType, tuitionRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setTuitionRange('');
  };

  const hasFilters = searchQuery || selectedType || tuitionRange;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Sticky Filter Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Tìm trường, trung tâm...' : 'Search schools, centers...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/20 focus:border-[#0B5FFF] transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#0B5FFF]"
              >
                {SCHOOL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label[lang as 'vi' | 'en'] || t.label.vi}
                  </option>
                ))}
              </select>

              <select
                value={tuitionRange}
                onChange={e => setTuitionRange(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#0B5FFF]"
              >
                {TUITION_RANGES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label[lang as 'vi' | 'en'] || t.label.vi}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap"
                >
                  {lang === 'vi' ? 'Xóa lọc' : 'Clear'}
                </button>
              )}

              <span className="text-xs text-gray-400 whitespace-nowrap pl-2">
                {filteredSchools.length} {lang === 'vi' ? 'trường' : 'schools'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {loading ? (
          <LoadingState message={lang === 'vi' ? 'Đang tải danh sách...' : 'Loading schools...'} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSchools} />
        ) : filteredSchools.length === 0 ? (
          <EmptyState
            title={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No schools found'}
            description={lang === 'vi' ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Try adjusting your filters'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map(school => (
              <div key={`${school.id}-${school.slug}`} className="h-full">
                <SchoolCard school={school} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
