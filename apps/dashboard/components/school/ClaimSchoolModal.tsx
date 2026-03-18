'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';

interface ClaimSchoolModalProps {
  school: {
    id: string;
    name: string;
    slug: string;
  };
  onClose: () => void;
}

type Step = 'form' | 'success';

export default function ClaimSchoolModal({ school, onClose }: ClaimSchoolModalProps) {
  const { lang } = useI18n();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    contact_name: '',
    contact_role: '',
    contact_email: '',
    contact_phone: '',
    school_phone: '',
    school_email: '',
    school_website: '',
    message: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('school_claim_requests').insert({
      school_id: school.id,
      school_name: school.name,
      school_slug: school.slug,
      ...form,
    });

    setSubmitting(false);
    if (err) {
      setError(lang === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.');
    } else {
      setStep('success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 size={18} className="text-[#0B5FFF]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {lang === 'vi' ? 'Nhận quản lý trang trường' : 'Claim School Listing'}
              </h2>
              <p className="text-xs text-gray-500 truncate max-w-[280px]">{school.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {lang === 'vi' ? 'Yêu cầu đã được gửi!' : 'Request Submitted!'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {lang === 'vi'
                ? 'Chúng tôi sẽ xem xét và liên hệ với bạn qua email trong vòng 1-2 ngày làm việc.'
                : 'We\'ll review your request and contact you by email within 1-2 business days.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0B5FFF] text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              {lang === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Your info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {lang === 'vi' ? 'Thông tin của bạn' : 'Your Information'}
              </p>
              <div className="space-y-3">
                <input
                  required
                  type="text"
                  placeholder={lang === 'vi' ? 'Họ và tên *' : 'Full name *'}
                  value={form.contact_name}
                  onChange={set('contact_name')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
                <select
                  value={form.contact_role}
                  onChange={set('contact_role')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] text-gray-700"
                >
                  <option value="">{lang === 'vi' ? 'Vai trò của bạn' : 'Your role'}</option>
                  <option value="owner">{lang === 'vi' ? 'Chủ trường' : 'Owner'}</option>
                  <option value="principal">{lang === 'vi' ? 'Hiệu trưởng' : 'Principal'}</option>
                  <option value="admin">{lang === 'vi' ? 'Quản lý' : 'Administrator'}</option>
                  <option value="marketing">{lang === 'vi' ? 'Marketing' : 'Marketing'}</option>
                  <option value="other">{lang === 'vi' ? 'Khác' : 'Other'}</option>
                </select>
                <input
                  required
                  type="email"
                  placeholder={lang === 'vi' ? 'Email của bạn *' : 'Your email *'}
                  value={form.contact_email}
                  onChange={set('contact_email')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
                <input
                  type="tel"
                  placeholder={lang === 'vi' ? 'Số điện thoại của bạn' : 'Your phone number'}
                  value={form.contact_phone}
                  onChange={set('contact_phone')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
              </div>
            </div>

            {/* School contact info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {lang === 'vi' ? 'Thông tin liên hệ trường' : 'School Contact Info'}
              </p>
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder={lang === 'vi' ? 'Số điện thoại trường' : 'School phone number'}
                  value={form.school_phone}
                  onChange={set('school_phone')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
                <input
                  type="email"
                  placeholder={lang === 'vi' ? 'Email trường' : 'School email'}
                  value={form.school_email}
                  onChange={set('school_email')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
                <input
                  type="url"
                  placeholder={lang === 'vi' ? 'Website trường (https://...)' : 'School website (https://...)'}
                  value={form.school_website}
                  onChange={set('school_website')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                />
              </div>
            </div>

            {/* Message */}
            <textarea
              rows={3}
              placeholder={lang === 'vi' ? 'Ghi chú thêm (không bắt buộc)' : 'Additional notes (optional)'}
              value={form.message}
              onChange={set('message')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B5FFF] resize-none"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0B5FFF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...')
                : (lang === 'vi' ? 'Gửi yêu cầu' : 'Submit Request')}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {lang === 'vi'
                ? 'Chúng tôi sẽ xác minh thông tin trước khi cập nhật trang.'
                : 'We\'ll verify your information before updating the listing.'}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
