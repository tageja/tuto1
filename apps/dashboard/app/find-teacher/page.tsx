'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import '../globals.css';
import { TeacherCardSkeleton } from '../../components/teacher/TeacherCardSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { Teacher } from '../../types/teacher';
import { Search, Filter, X, GraduationCap, Star, Users, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatVND } from '../../lib/format';
import JoinAsTeacherBanner from '../../components/find-teacher/JoinAsTeacherBanner';
import FindTeacherFooter from '../../components/find-teacher/FindTeacherFooter';

// Subject options for quick filter pills
const SUBJECT_OPTIONS = [
  { value: 'Mathematics', icon: '📐', color: 'blue' },
  { value: 'English', icon: '🇬🇧', color: 'red' },
  { value: 'Physics', icon: '⚛️', color: 'purple' },
  { value: 'Chemistry', icon: '🧪', color: 'green' },
  { value: 'Literature', icon: '📚', color: 'amber' },
  { value: 'Biology', icon: '🔬', color: 'emerald' },
];

export default function FindTeacherPage() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get subject labels based on language
  const getSubjectLabel = (value: string) => {
    const subjectMap: Record<string, { vi: string; en: string }> = {
      Mathematics: { vi: 'Toán', en: 'Math' },
      English: { vi: 'Tiếng Anh', en: 'English' },
      Physics: { vi: 'Vật lý', en: 'Physics' },
      Chemistry: { vi: 'Hóa học', en: 'Chemistry' },
      Literature: { vi: 'Văn', en: 'Literature' },
      Biology: { vi: 'Sinh học', en: 'Biology' },
    };
    return subjectMap[value]?.[lang as 'vi' | 'en'] || value;
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        maxRecords: '50',
        status: 'active',
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

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = teacher.name.toLowerCase().includes(query);
        const addressMatch = teacher.address?.toLowerCase().includes(query) || false;
        const subjectsMatch = teacher.teacher_subjects?.some((ts: any) => {
          const subjectName = ts.subjects?.name?.toLowerCase() || ts.subjects?.name_vi?.toLowerCase() || '';
          return subjectName.includes(query);
        }) || false;
        
        if (!nameMatch && !addressMatch && !subjectsMatch) {
          return false;
        }
      }

      if (selectedSubject) {
        const hasSubject = teacher.teacher_subjects?.some((ts: any) => {
          return ts.subjects?.name === selectedSubject || ts.subjects?.name_vi === selectedSubject;
        });
        if (!hasSubject) return false;
      }

      if (minRating > 0 && (teacher.rating || 0) < minRating) {
        return false;
      }

      if (maxPrice > 0 && (teacher.hourly_rate || 0) > maxPrice) {
        return false;
      }

      if (location && !teacher.address?.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [teachers, searchQuery, selectedSubject, minRating, maxPrice, location]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setMinRating(0);
    setMaxPrice(0);
    setLocation('');
  };

  const hasActiveFilters = selectedSubject || minRating > 0 || maxPrice > 0 || location;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Join as Teacher Banner - TOP of page */}
      <JoinAsTeacherBanner />

      {/* Header - Consistent with Homepage */}
      <Header />

      {/* Hero Section - Matching Homepage Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface to-blue-50/50 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t('web.findTeacher.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              {t('web.findTeacher.lead')}
            </p>
          </motion.div>

          {/* Search Bar - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-200 group-focus-within:border-primary/50 transition-all overflow-hidden">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('web.findTeacher.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 text-base outline-none bg-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Quick Filter Pills - Enhanced */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {SUBJECT_OPTIONS.map((subject) => (
                <button
                  key={subject.value}
                  onClick={() => setSelectedSubject(selectedSubject === subject.value ? '' : subject.value)}
                  className={`group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedSubject === subject.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <span className="mr-2">{subject.icon}</span>
                  {getSubjectLabel(subject.value)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Advanced Filters Toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mt-6 flex justify-center"
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/50"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? t('web.findTeacher.hideFilters') : t('web.findTeacher.advancedFilters')}
            </button>
          </motion.div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="max-w-3xl mx-auto mt-6"
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('web.findTeacher.minimumRating')}
                    </label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="0">{t('web.findTeacher.all')}</option>
                      <option value="3">3+ ⭐</option>
                      <option value="4">4+ ⭐</option>
                      <option value="4.5">4.5+ ⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('web.findTeacher.maxHourlyRate')}
                    </label>
                    <input
                      type="number"
                      placeholder={t('web.findTeacher.maxHourlyRatePlaceholder')}
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('web.findTeacher.location')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('web.findTeacher.locationPlaceholder')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {t('web.findTeacher.resetFilters')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Results Count */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center justify-between"
          >
            <p className="text-gray-600 text-lg">
              {lang === 'vi' 
                ? <>Tìm thấy <span className="font-bold text-gray-900">{filteredTeachers.length}</span> giáo viên</>
                : <>Found <span className="font-bold text-gray-900">{filteredTeachers.length}</span> teachers</>
              }
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState message={error} onRetry={fetchTeachers} />
        )}

        {/* Empty State */}
        {!loading && !error && filteredTeachers.length === 0 && (
          <EmptyState
            title={t('web.findTeacher.noTeachersFound')}
            description={
              hasActiveFilters
                ? t('web.findTeacher.adjustFilters')
                : t('web.findTeacher.noTeachersDescription')
            }
            icon={<Users className="w-16 h-16 text-gray-300" />}
            action={
              hasActiveFilters
                ? {
                    label: t('web.findTeacher.resetFilters'),
                    onClick: handleResetFilters,
                  }
                : undefined
            }
          />
        )}

        {/* Teachers Grid - New Modern Cards */}
        {!loading && !error && filteredTeachers.length > 0 && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredTeachers.map((teacher) => (
              <TeacherCardModern key={teacher.id} teacher={teacher} lang={lang} />
            ))}
          </motion.div>
        )}

        {/* How It Works Section */}
        {!loading && !error && filteredTeachers.length > 0 && (
          <section className="mt-24">
            <div className="bg-gradient-to-br from-surface to-blue-50/50 rounded-3xl p-12 border border-gray-100">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t('web.howItWorks.title')}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Search, step: t('web.findTeacher.howItWorks.step1'), desc: t('web.findTeacher.howItWorks.step1Desc'), color: 'blue' },
                  { icon: GraduationCap, step: t('web.findTeacher.howItWorks.step2'), desc: t('web.findTeacher.howItWorks.step2Desc'), color: 'purple' },
                  { icon: CheckCircle, step: t('web.findTeacher.howItWorks.step3'), desc: t('web.findTeacher.howItWorks.step3Desc'), color: 'green' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      item.color === 'blue' ? 'bg-blue-100' : 
                      item.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <item.icon className={`w-8 h-8 ${
                        item.color === 'blue' ? 'text-blue-600' : 
                        item.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                      }`} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.step}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <FindTeacherFooter />
    </div>
  );
}

// Modern Teacher Card Component (inline for now)
function TeacherCardModern({ teacher, lang }: { teacher: Teacher; lang: string }) {
  const subjects = teacher.teacher_subjects?.map((ts: any) => {
    return lang === 'vi' 
      ? (ts.subjects?.name_vi || ts.subjects?.name || '')
      : (ts.subjects?.name || ts.subjects?.name_vi || '');
  }) || [];
  
  const primarySubject = subjects[0] || '';
  const rating = teacher.rating || 0;
  const reviewCount = teacher.review_count || 0;
  const experience = teacher.experience || 0;
  const hourlyRate = teacher.hourly_rate || 0;
  
  // Get initials for avatar
  const initials = teacher.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  
  // Generate consistent color based on name
  const colors = ['blue', 'purple', 'emerald', 'rose', 'amber', 'cyan'];
  const colorIndex = teacher.name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative"
    >
      <Link href={`/teachers/${teacher.id}`}>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-primary/20 transition-all duration-300">
          {/* Demo Badge */}
          <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
            DEMO
          </div>

          {/* Header: Avatar + Basic Info */}
          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${colorClasses[avatarColor].bg} ${colorClasses[avatarColor].text}`}>
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                initials
              )}
            </div>
            
            {/* Name & Subject */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                {teacher.name}
              </h3>
              {primarySubject && (
                <p className="text-sm text-gray-500 truncate">{primarySubject}</p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({reviewCount})</span>
            </div>
            
            {/* Experience */}
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{experience}</span> {lang === 'vi' ? 'năm' : 'yrs'}
            </div>
            
            {/* Rate */}
            <div className="text-sm">
              <span className="font-bold text-primary">{formatVND(hourlyRate)}</span>
              <span className="text-gray-400">/{lang === 'vi' ? 'h' : 'hr'}</span>
            </div>
          </div>

          {/* Location */}
          {teacher.address && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{teacher.address}</span>
            </div>
          )}

          {/* Languages */}
          {teacher.languages && teacher.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {teacher.languages.slice(0, 3).map((lng: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium"
                >
                  {lng}
                </span>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white">
            {lang === 'vi' ? 'Xem hồ sơ' : 'View Profile'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
