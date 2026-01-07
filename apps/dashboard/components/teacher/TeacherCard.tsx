'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatVND } from '@/lib/format';
import { Teacher } from '@/types/teacher';
import { MapPin, Star, BookOpen, Clock } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const { lang } = useI18n();
  
  // Extract subjects from teacher_subjects relationship
  const subjects = teacher.teacher_subjects?.map((ts: any) => {
    return lang === 'vi' 
      ? (ts.subjects?.name_vi || ts.subjects?.name || '')
      : (ts.subjects?.name || ts.subjects?.name_vi || '');
  }) || [];
  const primarySubjects = subjects.slice(0, 2).join(', ') + (subjects.length > 2 ? '...' : '');
  
  // Get rating or default to 0
  const rating = teacher.rating || 0;
  const reviewCount = teacher.review_count || 0;
  const experience = teacher.experience || 0;
  const hourlyRate = teacher.hourly_rate || 0;
  
  // Avatar fallback
  const avatarUrl = teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=0B5FFF&color=fff&size=128`;
  
  return (
    <Card hover className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* DEMO ONLY Watermark */}
      <div className="absolute top-4 right-4 z-10 bg-yellow-400/95 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
        DEMO ONLY
      </div>
      
      <Link href={`/teachers/${teacher.id}`} className="block">
        <div className="p-6">
          {/* Avatar & Name Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={teacher.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  // Fallback to initials if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg border-2 border-gray-200';
                    fallback.textContent = teacher.name.charAt(0).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {teacher.name}
              </h3>
              {primarySubjects && (
                <p className="text-sm text-gray-600 line-clamp-1">
                  {primarySubjects}
                </p>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-3 text-sm">
            {/* Rating */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {lang === 'vi' ? 'Đánh giá' : 'Rating'}
              </span>
              <span className="font-semibold text-gray-900">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-400" />
                {lang === 'vi' ? 'Kinh nghiệm' : 'Experience'}
              </span>
              <span className="font-medium text-gray-900">
                {experience} {lang === 'vi' ? 'năm' : 'years'}
              </span>
            </div>

            {/* Hourly Rate */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                {lang === 'vi' ? 'Học phí' : 'Hourly rate'}
              </span>
              <span className="font-semibold text-[#0B5FFF]">
                {formatVND(hourlyRate)}/{lang === 'vi' ? 'giờ' : 'hour'}
              </span>
            </div>

            {/* Location */}
            {teacher.address && (
              <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-500 line-clamp-2 flex-1">
                  {teacher.address}
                </span>
              </div>
            )}

            {/* Languages */}
            {teacher.languages && teacher.languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {teacher.languages.slice(0, 2).map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* View Profile Button */}
          <Button
            variant="default"
            className="w-full mt-5 rounded-xl"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/teachers/${teacher.id}`;
            }}
          >
            {lang === 'vi' ? 'Xem hồ sơ' : 'View Profile'}
          </Button>
        </div>
      </Link>
    </Card>
  );
}

