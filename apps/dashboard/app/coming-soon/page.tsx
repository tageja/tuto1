'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Bell, Mail } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import Header from '../../components/layout/Header';

// Page title mappings
const PAGE_TITLES: Record<string, { en: string; vi: string }> = {
  // For Teachers
  'teacher-apply': { en: 'Apply as a Teacher', vi: 'Đăng ký làm giáo viên' },
  'teacher-resources': { en: 'Teacher Resources', vi: 'Tài nguyên giáo viên' },
  'teacher-guide': { en: 'Teacher Guide', vi: 'Hướng dẫn giáo viên' },
  'how-it-works-teachers': { en: 'How It Works for Teachers', vi: 'Cách hoạt động cho giáo viên' },
  
  // For Learners
  'trial-lesson': { en: 'Trial Lesson', vi: 'Buổi học thử' },
  'safety-trust': { en: 'Safety & Trust', vi: 'An toàn & Tin cậy' },
  'how-it-works': { en: 'How It Works', vi: 'Cách hoạt động' },
  'learning-tips': { en: 'Learning Tips', vi: 'Mẹo học tập' },
  
  // Support
  'help': { en: 'Help Center', vi: 'Trung tâm trợ giúp' },
  'contact': { en: 'Contact Us', vi: 'Liên hệ' },
  'faq': { en: 'FAQ', vi: 'Câu hỏi thường gặp' },
  'report-issue': { en: 'Report an Issue', vi: 'Báo cáo sự cố' },
  
  // Legal
  'privacy': { en: 'Privacy Policy', vi: 'Chính sách bảo mật' },
  'terms': { en: 'Terms of Service', vi: 'Điều khoản dịch vụ' },
  'ratings-policy': { en: 'Ratings Policy', vi: 'Chính sách đánh giá' },
  'cookies': { en: 'Cookie Policy', vi: 'Chính sách cookie' },
  
  // Default
  'default': { en: 'This Page', vi: 'Trang này' },
};

export default function ComingSoonPage() {
  const { t, lang, setLang } = useI18n();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 'default';
  
  const pageTitle = PAGE_TITLES[page] || PAGE_TITLES['default'];
  const title = lang === 'vi' ? pageTitle.vi : pageTitle.en;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#0B5FFF]/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-[#0B5FFF]" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {lang === 'vi' ? 'Sắp ra mắt!' : 'Coming Soon!'}
          </h1>
          
          {/* Page Name */}
          <p className="text-xl text-[#0B5FFF] font-medium mb-4">
            {title}
          </p>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {lang === 'vi' 
              ? 'Chúng tôi đang nỗ lực xây dựng trang này. Hãy quay lại sớm để xem những gì chúng tôi đang chuẩn bị cho bạn!'
              : "We're working hard to build this page. Check back soon to see what we have in store for you!"}
          </p>
          
          {/* Email Signup */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#0B5FFF]" />
              <span className="font-medium text-gray-900">
                {lang === 'vi' ? 'Nhận thông báo khi sẵn sàng' : 'Get notified when ready'}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder={lang === 'vi' ? 'Email của bạn' : 'Your email'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20 outline-none transition-all text-sm"
                />
              </div>
              <button className="px-5 py-3 bg-[#0B5FFF] text-white rounded-xl font-medium hover:bg-[#0B5FFF]/90 transition-colors text-sm whitespace-nowrap">
                {lang === 'vi' ? 'Đăng ký' : 'Notify Me'}
              </button>
            </div>
          </div>
          
          {/* Back Link */}
          <Link 
            href="/find-teacher"
            className="inline-flex items-center gap-2 text-[#0B5FFF] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'vi' ? 'Quay lại Tìm giáo viên' : 'Back to Find a Teacher'}
          </Link>
        </motion.div>
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/images/tuto-logo.png" alt="tuto." width={60} height={20} />
            <span>© {new Date().getFullYear()} tuto. Education</span>
          </div>
          <div className="flex gap-6">
            <Link href="/coming-soon?page=privacy" className="hover:text-gray-700 transition-colors">
              {lang === 'vi' ? 'Bảo mật' : 'Privacy'}
            </Link>
            <Link href="/coming-soon?page=terms" className="hover:text-gray-700 transition-colors">
              {lang === 'vi' ? 'Điều khoản' : 'Terms'}
            </Link>
            <Link href="/coming-soon?page=contact" className="hover:text-gray-700 transition-colors">
              {lang === 'vi' ? 'Liên hệ' : 'Contact'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


