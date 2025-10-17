'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, would filter by current user
      const response = await fetch('/api/bookings?maxRecords=50');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by upcoming/past
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= now);
  const pastBookings = bookings.filter((b) => new Date(b.date) < now);

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch đặt học</h1>
          <p className="mt-2 text-gray-600">Quản lý tất cả các buổi học của bạn</p>
        </div>
        <Link href="/bookings/new">
          <Button variant="primary">
            + Đặt lịch mới
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sắp tới ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Đã qua ({pastBookings.length})
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {loading && <LoadingState message="Đang tải danh sách..." />}

      {/* Error State */}
      {error && !loading && (
        <ErrorState message={error} onRetry={fetchBookings} />
      )}

      {/* Empty State */}
      {!loading && !error && displayedBookings.length === 0 && (
        <EmptyState
          title={activeTab === 'upcoming' ? 'Chưa có buổi học sắp tới' : 'Chưa có buổi học nào'}
          description={
            activeTab === 'upcoming'
              ? 'Đặt lịch học với giáo viên để bắt đầu'
              : 'Lịch sử các buổi học của bạn sẽ hiển thị ở đây'
          }
          action={
            activeTab === 'upcoming'
              ? {
                  label: 'Đặt lịch ngay',
                  onClick: () => (window.location.href = '/bookings/new'),
                }
              : undefined
          }
        />
      )}

      {/* Bookings List */}
      {!loading && !error && displayedBookings.length > 0 && (
        <div className="space-y-4">
          {displayedBookings.map((booking) => (
            <Card key={booking.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.subject}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Giáo viên: {booking.teacherId}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.time} ({booking.duration} phút)
                      </div>
                      {booking.notes && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span className="truncate">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {activeTab === 'upcoming' && booking.status === 'Confirmed' && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Sửa lịch
                    </Button>
                    <Button variant="outline" size="sm">
                      Hủy buổi học
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}



