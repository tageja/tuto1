'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, GraduationCap } from 'lucide-react';
import { School } from '../../types/school';
import { formatSchoolTuition, formatRating } from '../../lib/format';
import { useI18n } from '../../contexts/I18nContext';

interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const { lang } = useI18n();
  
  // Format price range
  const priceRange = school.minTuition && school.maxTuition
    ? `${formatSchoolTuition(school.minTuition)} - ${formatSchoolTuition(school.maxTuition)}`
    : formatSchoolTuition(school.minTuition || 0);

  // Use slug when available (readable URL), fall back to id (UUID for legacy listings)
  const href = `/find-school/${school.slug || school.id}`;

  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-500/20 transition-all duration-300 h-full flex flex-col overflow-hidden">
        {/* Image */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          {school.images && school.images[0] ? (
            <Image
              src={school.images[0]}
              alt={school.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <GraduationCap className="w-12 h-12" />
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 rounded-full shadow-sm">
              {school.type}
            </span>
          </div>

          {/* Rating Badge */}
          {school.rating > 0 && school.reviewCount > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-gray-900">{formatRating(school.rating)}</span>
              <span className="text-xs text-gray-500">({school.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#0B5FFF] transition-colors line-clamp-2">
              {school.name}
            </h3>
            {school.logo && (
              <div className="relative w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                <Image src={school.logo} alt={school.name} fill className="object-contain p-1" />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{school.address}, {school.district}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {school.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Học phí' : 'Tuition'}</p>
              <p className="text-sm font-bold text-[#0B5FFF]">{priceRange}</p>
            </div>
            <span className="text-xs font-semibold text-[#0B5FFF] group-hover:translate-x-1 transition-transform">
              {lang === 'vi' ? 'Chi tiết' : 'Details'} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

