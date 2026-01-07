'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

export default function FindTeacherFooter() {
  const { t, lang, setLang } = useI18n();

  const footerSections = [
    {
      title: lang === 'vi' ? 'Cho Giáo Viên' : 'For Teachers',
      links: [
        { label: lang === 'vi' ? 'Đăng ký làm giáo viên' : 'Apply as a Teacher', href: '/coming-soon?page=teacher-apply' },
        { label: lang === 'vi' ? 'Tài nguyên giáo viên' : 'Teacher Resources', href: '/coming-soon?page=teacher-resources' },
        { label: lang === 'vi' ? 'Cách hoạt động' : 'How It Works', href: '/coming-soon?page=how-it-works-teachers' },
      ],
    },
    {
      title: lang === 'vi' ? 'Cho Học Viên' : 'For Learners',
      links: [
        { label: lang === 'vi' ? 'Tìm giáo viên' : 'Find a Teacher', href: '/find-teacher' },
        { label: lang === 'vi' ? 'Buổi học thử' : 'Trial Lessons', href: '/coming-soon?page=trial-lesson' },
        { label: lang === 'vi' ? 'An toàn & Tin cậy' : 'Safety & Trust', href: '/coming-soon?page=safety-trust' },
      ],
    },
    {
      title: lang === 'vi' ? 'Hỗ Trợ' : 'Support',
      links: [
        { label: lang === 'vi' ? 'Trung tâm trợ giúp' : 'Help Center', href: '/coming-soon?page=help' },
        { label: lang === 'vi' ? 'Liên hệ' : 'Contact Us', href: '/coming-soon?page=contact' },
        { label: lang === 'vi' ? 'Báo cáo sự cố' : 'Report an Issue', href: '/coming-soon?page=report-issue' },
      ],
    },
    {
      title: lang === 'vi' ? 'Pháp Lý' : 'Legal',
      links: [
        { label: lang === 'vi' ? 'Bảo mật' : 'Privacy Policy', href: '/coming-soon?page=privacy' },
        { label: lang === 'vi' ? 'Điều khoản' : 'Terms of Service', href: '/coming-soon?page=terms' },
        { label: lang === 'vi' ? 'Chính sách đánh giá' : 'Ratings Policy', href: '/coming-soon?page=ratings-policy' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Image src="/images/tuto-logo.png" alt="tuto." width={100} height={34} className="mb-6" />
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {lang === 'vi' 
                ? 'Kết nối học viên với giáo viên chất lượng gần bạn.'
                : 'Connecting learners with quality teachers nearby.'}
            </p>
            
            {/* Language Switcher */}
            <button 
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0B5FFF] transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
            >
              <Globe className="w-4 h-4" />
              {lang === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
          </div>

          {/* Link Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-gray-900 mb-6">{section.title}</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href} 
                      className="hover:text-[#0B5FFF] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} tuto. Education. {lang === 'vi' ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Facebook</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Instagram</a>
            <a href="#" className="hover:text-gray-600 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

