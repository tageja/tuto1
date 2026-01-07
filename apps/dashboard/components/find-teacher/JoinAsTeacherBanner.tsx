'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Users, Calendar, DollarSign } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

export default function JoinAsTeacherBanner() {
  const { lang } = useI18n();

  const benefits = [
    {
      icon: Users,
      label: lang === 'vi' ? 'Tiếp cận học viên' : 'Reach Students',
    },
    {
      icon: Calendar,
      label: lang === 'vi' ? 'Linh hoạt lịch dạy' : 'Flexible Schedule',
    },
    {
      icon: DollarSign,
      label: lang === 'vi' ? 'Thu nhập tốt' : 'Great Earnings',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#0B5FFF] to-[#4F46E5] text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Message */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {lang === 'vi' ? 'Bạn là giáo viên?' : 'Are you a teacher?'}
              </p>
              <p className="text-white/80 text-sm">
                {lang === 'vi' 
                  ? 'Tham gia mạng lưới giáo viên của chúng tôi và kết nối với học viên ngay hôm nay!'
                  : 'Join our teaching network and connect with students today!'}
              </p>
            </div>
          </div>

          {/* Center: Benefits (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/90 text-sm">
                <benefit.icon className="w-4 h-4" />
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>

          {/* Right: CTA Button */}
          <Link
            href="/coming-soon?page=teacher-apply"
            className="flex items-center gap-2 bg-white text-[#0B5FFF] px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg shadow-black/10 whitespace-nowrap"
          >
            {lang === 'vi' ? 'Đăng ký ngay' : 'Join Now'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

