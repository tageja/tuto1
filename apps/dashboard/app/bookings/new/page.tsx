'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    teacherId: searchParams.get('teacherId') || '',
    teacherName: searchParams.get('teacherName') || '',
    studentId: '',
    parentId: 'demo-parent-id', // Would come from auth
    subject: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.teacherId || !formData.subject || !formData.date || !formData.time) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      
      // Success - redirect to bookings list
      router.push('/bookings?success=true');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get dates for the next 30 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Time slots
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00'
  ];

  // Subjects
  const subjects = [
    'Toán học', 'Tiếng Anh', 'Vật lý', 'Hóa học',
    'Sinh học', 'Văn học', 'Lịch sử', 'Địa lý',
    'Tin học', 'Âm nhạc', 'Mỹ thuật', 'Thể dục'
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đặt lịch học mới</h1>
        <p className="mt-2 text-gray-600">
          Điền thông tin để đặt lịch học với giáo viên
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Teacher Info */}
          {formData.teacherName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Giáo viên:</strong> {formData.teacherName}
              </p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Chọn môn học</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày học <span className="text-red-500">*</span>
            </label>
            <select
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Chọn ngày</option>
              {getAvailableDates().map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ học <span className="text-red-500">*</span>
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Chọn giờ</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời lượng (phút)
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="30">30 phút</option>
              <option value="60">60 phút</option>
              <option value="90">90 phút</option>
              <option value="120">120 phút</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Ví dụ: Cần ôn tập chương 5, chuẩn bị cho kỳ thi..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Box */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Lưu ý:</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Giáo viên sẽ xác nhận lịch học trong vòng 24 giờ</li>
          <li>Bạn có thể hủy hoặc đổi lịch trước 12 giờ so với giờ học</li>
          <li>Thanh toán sẽ được thực hiện sau khi giáo viên xác nhận</li>
        </ul>
      </div>
    </main>
  );
}


