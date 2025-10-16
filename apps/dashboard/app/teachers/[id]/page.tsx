'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subjects: string[];
  qualifications: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  availability: {
    days: string[];
    timeSlots: string;
  };
  languages: string[];
  description: string;
  status: string;
}

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTeacher();
    }
  }, [params.id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teachers/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy giáo viên');
        }
        throw new Error('Không thể tải thông tin giáo viên');
      }

      const data = await response.json();
      setTeacher(data.teacher);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push(`/bookings/new?teacherId=${params.id}&teacherName=${teacher?.name}`);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState message="Đang tải thông tin giáo viên..." />
      </main>
    );
  }

  if (error || !teacher) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState message={error || 'Không tìm thấy giáo viên'} onRetry={fetchTeacher} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Back Button */}
      <Link href="/find-teacher" className="inline-flex items-center text-primary hover:underline mb-6">
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <div className="p-6">
              <div className="flex items-start gap-6">
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                    {teacher.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                  <p className="text-gray-600 mt-1">{teacher.subjects.join(', ')}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="ml-1 font-semibold">{teacher.rating.toFixed(1)}</span>
                      <span className="ml-1 text-sm text-gray-500">({teacher.reviewCount} đánh giá)</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {teacher.experience} năm kinh nghiệm
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {teacher.status === 'Active' ? '✓ Đang hoạt động' : teacher.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {teacher.description || 'Chưa có thông tin giới thiệu.'}
              </p>
            </div>
          </Card>

          {/* Qualifications */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bằng cấp & Chứng chỉ</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {teacher.qualifications || 'Chưa có thông tin bằng cấp.'}
              </p>
            </div>
          </Card>

          {/* Subjects */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Môn học giảng dạy</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Booking Info */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary">{teacher.hourlyRate}k</div>
                <div className="text-sm text-gray-600">VNĐ / giờ</div>
              </div>
              
              <Button variant="primary" className="w-full mb-3" onClick={handleBookNow}>
                Đặt lịch ngay
              </Button>
              
              <Button variant="outline" className="w-full">
                Nhắn tin
              </Button>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3 text-sm">
                {teacher.email && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{teacher.phone}</span>
                  </div>
                )}
                {teacher.location.address && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{teacher.location.address}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Availability */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold mb-4">Lịch có sẵn</h3>
              {teacher.availability.days.length > 0 ? (
                <>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="font-medium text-gray-700">Ngày trong tuần:</div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.availability.days.map((day) => (
                        <span key={day} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  {teacher.availability.timeSlots && (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-gray-700">Khung giờ:</div>
                      <p className="text-gray-600">{teacher.availability.timeSlots}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Liên hệ để biết lịch trống</p>
              )}
            </div>
          </Card>

          {/* Languages */}
          {teacher.languages.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Ngôn ngữ</h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.languages.map((lang) => (
                    <span key={lang} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}


