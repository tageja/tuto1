'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin, Star, Phone, Globe, Mail, CheckCircle,
  ArrowLeft, GraduationCap, Users, DollarSign, ExternalLink,
  Building2,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { School } from '../../../types/school';
import { mapSchoolFromDB, mapDirectorySchool } from '../../../lib/school-mapper';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/landing/Footer';
import { formatSchoolTuition, formatRating } from '../../../lib/format';
import { useI18n } from '../../../contexts/I18nContext';
import LoadingState from '../../../components/shared/LoadingState';
import ClaimSchoolModal from '../../../components/school/ClaimSchoolModal';

// UUID pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SCHOOL_TYPE_LABELS: Record<string, { vi: string; en: string }> = {
  Preschool:  { vi: 'Mầm non', en: 'Preschool' },
  Primary:    { vi: 'Tiểu học', en: 'Primary School' },
  Secondary:  { vi: 'THCS', en: 'Secondary School' },
  HighSchool: { vi: 'THPT', en: 'High School' },
  Center:     { vi: 'Trung tâm', en: 'Center' },
  Other:      { vi: 'Khác', en: 'Other' },
};

export default function SchoolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useI18n();
  const [school, setSchool] = useState<School | null>(null);
  const [rawSchool, setRawSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'listings' | 'directory'>('listings');
  const [showClaim, setShowClaim] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchSchool(decodeURIComponent(slug));
  }, [slug]);

  const fetchSchool = async (slugOrId: string) => {
    setLoading(true);
    try {
      if (UUID_RE.test(slugOrId)) {
        // Legacy school_listings record — look up by UUID
        const { data, error } = await supabase
          .from('school_listings')
          .select('*')
          .eq('id', slugOrId)
          .single();
        if (error) throw error;
        if (data) { setSchool(mapSchoolFromDB(data)); setRawSchool(data); setSource('listings'); }
      } else {
        // directory school — look up by slug
        const { data, error } = await supabase
          .from('kiddihub_schools')
          .select('*')
          .eq('slug', slugOrId)
          .single();
        if (error) throw error;
        if (data) { setSchool(mapDirectorySchool(data)); setRawSchool(data); setSource('directory'); }
      }
    } catch (err) {
      console.error('Error fetching school:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
          <GraduationCap size={48} className="text-gray-300" />
          <p className="text-lg">{lang === 'vi' ? 'Không tìm thấy trường' : 'School not found'}</p>
          <Link href="/find-school" className="text-[#0B5FFF] text-sm hover:underline">
            ← {lang === 'vi' ? 'Quay lại danh sách' : 'Back to list'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tuitionText = school.minTuition
    ? school.maxTuition && school.maxTuition !== school.minTuition
      ? `${formatSchoolTuition(school.minTuition)} – ${formatSchoolTuition(school.maxTuition)}`
      : formatSchoolTuition(school.minTuition)
    : lang === 'vi' ? 'Liên hệ' : 'Contact';

  const typeLabel =
    SCHOOL_TYPE_LABELS[school.type]?.[lang as 'vi' | 'en'] || school.type;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[260px] bg-gray-900">
        {school.images[0] ? (
          <Image
            src={school.images[0]}
            alt={school.name}
            fill
            className="object-cover opacity-60"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-800" />
        )}

        {/* Back link */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <Link
            href="/find-school"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full transition-colors"
          >
            <ArrowLeft size={14} />
            {lang === 'vi' ? 'Danh sách trường' : 'All Schools'}
          </Link>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-10 w-full text-white">
            {/* Type badge */}
            <span className="inline-block mb-3 text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              {typeLabel}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl leading-tight">
              {school.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {school.address && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin size={15} className="text-white/70" />
                  <span>{school.address}</span>
                </div>
              )}
              {school.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{formatRating(school.rating)}</span>
                  {school.reviewCount > 0 && (
                    <span className="text-white/70 text-xs">({school.reviewCount})</span>
                  )}
                </div>
              )}
              {school.verified && (
                <div className="flex items-center gap-1.5 bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <CheckCircle size={13} className="text-green-300" />
                  <span className="text-xs font-medium">
                    {lang === 'vi' ? 'Đã xác minh' : 'Verified'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Main */}
        <div className="lg:col-span-2 space-y-10">

          {/* About */}
          {school.description ? (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lang === 'vi' ? 'Giới thiệu' : 'About'}
              </h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {school.description}
              </div>
            </section>
          ) : source === 'directory' ? (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lang === 'vi' ? 'Thông tin trường' : 'School Info'}
              </h2>
              <p className="text-gray-500 text-sm">
                {lang === 'vi'
                  ? 'Thông tin chi tiết đang được cập nhật. Bạn là chủ trường? Nhận quyền quản lý để cập nhật ngay.'
                  : 'Detailed info is being updated. Are you the owner? Claim this listing to update it.'}
              </p>
            </section>
          ) : null}

          {/* Tags */}
          {school.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {school.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Programs */}
          {school.programs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {lang === 'vi' ? 'Chương trình học' : 'Programs'}
              </h2>
              <div className="space-y-4">
                {school.programs.map((prog, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{prog.title}</h3>
                      <span className="text-sm font-medium text-[#0B5FFF] bg-blue-50 px-3 py-1 rounded-full">
                        {prog.ageRange}
                      </span>
                    </div>
                    <p className="text-gray-600">{prog.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Features */}
          {school.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {lang === 'vi' ? 'Tiện ích & Điểm nổi bật' : 'Features & Highlights'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {school.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    <span className="text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stats row */}
          {source === 'directory' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {school.rating > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                  <Star size={20} className="text-yellow-500 mx-auto mb-1 fill-yellow-400" />
                  <p className="text-2xl font-bold text-gray-900">{formatRating(school.rating)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {school.reviewCount} {lang === 'vi' ? 'đánh giá' : 'reviews'}
                  </p>
                </div>
              )}
              {school.minTuition > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <DollarSign size={20} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{tuitionText}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang === 'vi' ? 'Học phí/tháng' : 'Tuition/mo'}</p>
                </div>
              )}
              {school.reviewCount > 0 && (
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <Users size={20} className="text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{school.reviewCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang === 'vi' ? 'Phụ huynh đánh giá' : 'Parent reviews'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">

              {/* Tuition */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  {lang === 'vi' ? 'Học phí' : 'Tuition'}
                </p>
                <p className="text-2xl font-bold text-[#0B5FFF]">{tuitionText}</p>
                {school.minTuition > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lang === 'vi' ? 'mỗi tháng' : 'per month'}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-4">
                {school.contact.phone && (
                  <a href={`tel:${school.contact.phone}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#0B5FFF] transition-colors">
                      <Phone size={18} className="text-[#0B5FFF] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hotline</p>
                      <p className="font-semibold text-gray-900">{school.contact.phone}</p>
                    </div>
                  </a>
                )}

                {school.contact.email && (
                  <a href={`mailto:${school.contact.email}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#0B5FFF] transition-colors">
                      <Mail size={18} className="text-[#0B5FFF] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {school.contact.email}
                      </p>
                    </div>
                  </a>
                )}

                {school.contact.website && (
                  <a
                    href={school.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#0B5FFF] transition-colors">
                      <Globe size={18} className="text-[#0B5FFF] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="font-semibold text-gray-900 group-hover:text-[#0B5FFF] transition-colors flex items-center gap-1">
                        {lang === 'vi' ? 'Xem website' : 'Visit Website'}
                        <ExternalLink size={12} />
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* CTA */}
              {school.contact.website ? (
                <a
                  href={school.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-8 py-3 bg-[#0B5FFF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  {lang === 'vi' ? 'Xem chi tiết đầy đủ' : 'View Full Details'}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <button className="w-full mt-8 py-3 bg-[#0B5FFF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all">
                  {lang === 'vi' ? 'Liên hệ tư vấn' : 'Contact School'}
                </button>
              )}
            </div>

            {/* Claim this school */}
            {source === 'directory' && !rawSchool?.claimed && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={16} className="text-[#0B5FFF]" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {lang === 'vi' ? 'Đây là trường của bạn?' : 'Is this your school?'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  {lang === 'vi'
                    ? 'Nhận quyền quản lý trang trường để cập nhật thông tin, ảnh và liên hệ.'
                    : 'Claim this listing to update your school info, photos and contact details.'}
                </p>
                <button
                  onClick={() => setShowClaim(true)}
                  className="w-full py-2 border-2 border-[#0B5FFF] text-[#0B5FFF] rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors"
                >
                  {lang === 'vi' ? 'Nhận quản lý trang này' : 'Claim this listing'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showClaim && rawSchool && (
        <ClaimSchoolModal
          school={rawSchool}
          onClose={() => setShowClaim(false)}
        />
      )}

      <Footer />
    </div>
  );
}
