'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { School } from '../../types/school';
import { mapSchoolFromDB } from '../../lib/school-mapper';
import SchoolCard from '../../components/school/SchoolCard';
import Header from '../../components/layout/Header';
import Footer from '../../components/landing/Footer';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useI18n } from '../../contexts/I18nContext';

export default function FindSchoolPage() {
  const { t, lang } = useI18n();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('school_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedSchools: School[] = data.map(mapSchoolFromDB);
        setSchools(mappedSchools);
      }
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = school.name.toLowerCase().includes(q);
        const matchesAddress = school.address.toLowerCase().includes(q);
        const matchesTags = school.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesTags) return false;
      }

      // City
      if (selectedCity && school.city !== selectedCity) return false;

      // Type
      if (selectedType && school.type !== selectedType) return false;

      // Price
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        // Simple logic: if school minTuition is within range or overlaps
        if (max) {
           if (school.minTuition > max) return false;
        } else {
           // 20M+
           if (school.minTuition < min) return false;
        }
      }

      return true;
    });
  }, [schools, searchQuery, selectedCity, selectedType, priceRange]);

  const uniqueCities = useMemo(() => [...new Set(schools.map(s => s.city))].filter(Boolean), [schools]);
  const schoolTypes = ['Preschool', 'Primary', 'Secondary', 'HighSchool', 'Center', 'Other'];

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
                placeholder={lang === 'vi' ? "Tìm trường, trung tâm..." : "Search schools, centers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/20 focus:border-[#0B5FFF] transition-all"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#0B5FFF]"
              >
                <option value="">{lang === 'vi' ? 'Tất cả khu vực' : 'All Locations'}</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#0B5FFF]"
              >
                <option value="">{lang === 'vi' ? 'Tất cả loại hình' : 'All Types'}</option>
                {schoolTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <button
                 onClick={() => {
                   setSearchQuery('');
                   setSelectedCity('');
                   setSelectedType('');
                   setPriceRange('');
                 }}
                 className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap"
              >
                {lang === 'vi' ? 'Xóa lọc' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {loading ? (
           <LoadingState message={lang === 'vi' ? "Đang tải danh sách..." : "Loading schools..."} />
        ) : error ? (
           <ErrorState message={error} onRetry={fetchSchools} />
        ) : filteredSchools.length === 0 ? (
           <EmptyState 
             title={lang === 'vi' ? "Không tìm thấy kết quả" : "No schools found"}
             description={lang === 'vi' ? "Thử thay đổi bộ lọc tìm kiếm" : "Try adjusting your filters"}
           />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map(school => (
              <div key={school.id} className="h-full">
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

