'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useI18n } from '../../../contexts/I18nContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function TeacherSchoolCodePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useI18n();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError(lang === 'vi' ? 'Vui lòng nhập mã trường.' : 'Please enter the school code.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/school/teacher-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || (lang === 'vi' ? 'Mã trường không hợp lệ.' : 'Invalid school code.'));
        return;
      }
      if (data.success && data.school_id) {
        router.push(`/school/${encodeURIComponent(data.school_id)}/teacher`);
      }
    } catch (err: any) {
      setError(err?.message || (lang === 'vi' ? 'Có lỗi xảy ra.' : 'Something went wrong.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'vi' ? 'Nhập mã trường' : 'Enter school code'}
        </h1>
        <p className="text-gray-600 mb-6">
          {lang === 'vi'
            ? 'Để truy cập bảng điều khiển giáo viên, nhập mã trường do quản trị viên cung cấp.'
            : 'To access the teacher dashboard, enter the school code provided by your admin.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="school-code" className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'vi' ? 'Mã trường' : 'School code'}
            </label>
            <input
              id="school-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={lang === 'vi' ? 'VD: ABC123' : 'e.g. ABC123'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (lang === 'vi' ? 'Đang xử lý...' : 'Submitting...') : (lang === 'vi' ? 'Tiếp tục' : 'Continue')}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          {lang === 'vi' ? 'Email của bạn phải đã được quản trị viên thêm vào trường.' : 'Your email must already be added to the school by an admin.'}
        </p>
      </Card>
    </div>
  );
}
