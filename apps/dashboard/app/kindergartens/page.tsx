'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Star, Phone, Globe, ExternalLink, Filter, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Header from '../../components/layout/Header';
import Footer from '../../components/landing/Footer';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────

interface School {
  id: string;
  kiddihub_id: number;
  slug: string;
  kiddihub_url: string | null;
  name: string;
  short_name: string | null;
  address: string | null;
  province: string | null;
  province_slug: string | null;
  school_type: number | null;       // 1=private, 3=bilingual, 4=international
  category: string;
  age_range: string | null;
  age_from_months: number | null;
  age_to_months: number | null;
  tuition_min: number | null;
  tuition_max: number | null;
  tuition_unit: string | null;
  rating: number | null;
  review_count: number;
  recommend_count: number;
  verified: boolean;
  member: boolean;
  refund_commitment: boolean;
  banner_lg: string | null;
  banner_md: string | null;
  avatar_lg: string | null;
  has_promotions: boolean;
  featured: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toString();
}

const SCHOOL_TYPE_LABELS: Record<number, string> = {
  1: 'Tư thục',
  3: 'Song ngữ',
  4: 'Quốc tế',
  13: 'Công lập',
};

const SCHOOL_TYPE_COLORS: Record<number, string> = {
  1: 'bg-gray-100 text-gray-600',
  3: 'bg-blue-50 text-blue-700',
  4: 'bg-purple-50 text-purple-700',
  13: 'bg-green-50 text-green-700',
};

// ─── SchoolCard ───────────────────────────────────────────────────────────────

function SchoolCard({ school }: { school: School }) {
  const imgUrl = school.banner_md || school.banner_lg || school.avatar_lg;
  const typeLabel = school.school_type ? SCHOOL_TYPE_LABELS[school.school_type] : null;
  const typeColor = school.school_type ? SCHOOL_TYPE_COLORS[school.school_type] : 'bg-gray-100 text-gray-600';

  const tuitionText = (() => {
    if (!school.tuition_min && !school.tuition_max) return null;
    if (school.tuition_min && school.tuition_max)
      return `${formatVND(school.tuition_min)} – ${formatVND(school.tuition_max)}/${school.tuition_unit || 'tháng'}`;
    return `${formatVND(school.tuition_min || school.tuition_max || 0)}/${school.tuition_unit || 'tháng'}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-40 w-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden shrink-0">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt={school.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap size={40} className="text-blue-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {school.featured && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">⭐ Nổi bật</span>
          )}
          {typeLabel && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
          )}
          {school.has_promotions && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">🎁 Ưu đãi</span>
          )}
        </div>

        {school.verified && (
          <span className="absolute top-2 right-2 bg-white/90 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">✓ Xác minh</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {school.name}
        </h3>

        {school.address && (
          <div className="flex items-start gap-1 text-xs text-gray-500">
            <MapPin size={11} className="text-blue-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{school.address}</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
          {school.rating != null && school.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-700">{school.rating.toFixed(1)}</span>
              {school.review_count > 0 && <span>({school.review_count})</span>}
            </div>
          )}
          {school.age_range && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{school.age_range}</span>
          )}
        </div>

        {tuitionText && (
          <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
            💰 {tuitionText}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2 flex-wrap">
          <a
            href={`/find-school/${school.slug}`}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <ExternalLink size={11} />
            Xem trường
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SCHOOL_TYPES = [
  { value: '', label: 'Tất cả loại hình' },
  { value: '4', label: 'Quốc tế' },
  { value: '3', label: 'Song ngữ' },
  { value: '1', label: 'Tư thục' },
  { value: '13', label: 'Công lập' },
];

const TUITION_RANGES = [
  { value: '', label: 'Tất cả học phí' },
  { value: '0-5000000', label: 'Dưới 5tr/tháng' },
  { value: '5000000-10000000', label: '5tr – 10tr/tháng' },
  { value: '10000000-20000000', label: '10tr – 20tr/tháng' },
  { value: '20000000-999999999', label: 'Trên 20tr/tháng' },
];

export default function KindergartensPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [tuitionRange, setTuitionRange] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchSchools(); }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('kiddihub_schools')
        .select('*')
        .eq('published', true)
        .eq('category', 'mam-non')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(500);

      if (sbError) throw sbError;
      setSchools(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = schools;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
      );
    }

    if (selectedType) {
      result = result.filter(s => s.school_type === parseInt(selectedType));
    }

    if (tuitionRange) {
      const [min, max] = tuitionRange.split('-').map(Number);
      result = result.filter(s => {
        const t = s.tuition_min;
        if (t == null) return false;
        return t >= min && t <= max;
      });
    }

    if (minRating) {
      result = result.filter(s => s.rating != null && s.rating >= parseFloat(minRating));
    }

    return result;
  }, [schools, searchQuery, selectedType, tuitionRange, minRating]);

  const hasFilters = searchQuery || selectedType || tuitionRange || minRating;
  const clearFilters = () => { setSearchQuery(''); setSelectedType(''); setTuitionRange(''); setMinRating(''); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            Trường Mầm Non TP. Hồ Chí Minh
          </motion.h1>
          <p className="text-blue-200 text-lg mb-8">
            {schools.length > 0 ? `${schools.length.toLocaleString()} trường trong danh sách` : 'Đang tải dữ liệu...'}
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên trường hoặc địa chỉ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            Lọc
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 flex-wrap overflow-hidden"
              >
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  {SCHOOL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <select
                  value={tuitionRange}
                  onChange={e => setTuitionRange(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  {TUITION_RANGES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <select
                  value={minRating}
                  onChange={e => setMinRating(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  <option value="">Mọi đánh giá</option>
                  <option value="4.5">4.5★ trở lên</option>
                  <option value="4">4★ trở lên</option>
                  <option value="3.5">3.5★ trở lên</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
              <X size={12} /> Xóa lọc
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} trường</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading && <LoadingState message="Đang tải danh sách trường..." />}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchSchools} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState title="Không tìm thấy trường" description="Thử thay đổi từ khóa hoặc xóa bộ lọc." />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
