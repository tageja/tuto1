'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatsCard from '../../../components/shared/StatsCard';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';

export default function SchoolDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    pendingActivities: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In real app, would pass current school context
      const schoolName = 'Demo School'; // Would come from auth/context

      // Fetch classes
      const classesRes = await fetch(`/api/school/classes?schoolName=${schoolName}&maxRecords=100`);
      if (classesRes.ok) {
        const data = await classesRes.json();
        setStats((prev) => ({ ...prev, totalClasses: data.classes?.length || 0 }));
      }

      // Fetch students
      const studentsRes = await fetch(`/api/school/students?schoolName=${schoolName}&maxRecords=100`);
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStats((prev) => ({ ...prev, totalStudents: data.students?.length || 0 }));
      }

      // Mock data for demo
      setStats((prev) => ({
        ...prev,
        totalTeachers: 12,
        pendingActivities: 3,
      }));

      setRecentActivities([
        { id: '1', title: 'Lớp 6A - Toán học', date: '2024-01-15', type: 'Class' },
        { id: '2', title: 'Kiểm tra giữa kỳ', date: '2024-01-14', type: 'Exam' },
        { id: '3', title: 'Họp phụ huynh', date: '2024-01-13', type: 'Meeting' },
      ]);

      setAnnouncements([
        { id: '1', title: 'Thông báo nghỉ Tết 2024', date: '2024-01-10' },
        { id: '2', title: 'Kế hoạch học kỳ 2', date: '2024-01-05' },
      ]);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <LoadingState message="Đang tải bảng điều khiển..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển trường học</h1>
        <p className="mt-2 text-gray-600">Tổng quan và quản lý hoạt động trường học</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tổng số lớp"
          value={stats.totalClasses}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatsCard
          title="Tổng số học sinh"
          value={stats.totalStudents}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Tổng số giáo viên"
          value={stats.totalTeachers}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Hoạt động chưa xử lý"
          value={stats.pendingActivities}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Hành động nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/school/classes">
              <Button variant="outline" className="w-full">
                Quản lý lớp học
              </Button>
            </Link>
            <Link href="/school/students">
              <Button variant="outline" className="w-full">
                Quản lý học sinh
              </Button>
            </Link>
            <Link href="/school/teachers">
              <Button variant="outline" className="w-full">
                Quản lý giáo viên
              </Button>
            </Link>
            <Link href="/school/announcements">
              <Button variant="outline" className="w-full">
                Thông báo
              </Button>
            </Link>
            <Link href="/school/attendance">
              <Button variant="outline" className="w-full">
                Điểm danh
              </Button>
            </Link>
            <Link href="/school/activities">
              <Button variant="outline" className="w-full">
                Hoạt động
              </Button>
            </Link>
            <Link href="/school/messages">
              <Button variant="outline" className="w-full">
                Tin nhắn
              </Button>
            </Link>
            <Link href="/school/progress">
              <Button variant="outline" className="w-full">
                Báo cáo tiến độ
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
              <Link href="/school/activities" className="text-primary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.date}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Announcements */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thông báo mới</h2>
              <Link href="/school/announcements" className="text-primary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full mt-4">
              + Tạo thông báo mới
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}


