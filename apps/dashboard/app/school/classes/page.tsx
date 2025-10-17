'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import DataTable from '../../../components/shared/DataTable';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';
import EmptyState from '../../../components/shared/EmptyState';

export default function SchoolClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    schoolName: 'Demo School',
    gradeLevel: '',
    academicYear: '2024-2025',
    roomNumber: '',
    schedule: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/school/classes?schoolName=Demo School&maxRecords=100');
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data.classes || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/school/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create class');
      }

      // Reset form and refresh
      setFormData({
        className: '',
        schoolName: 'Demo School',
        gradeLevel: '',
        academicYear: '2024-2025',
        roomNumber: '',
        schedule: '',
      });
      setShowForm(false);
      fetchClasses();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const columns = [
    { key: 'className', label: 'Tên lớp' },
    { key: 'gradeLevel', label: 'Khối' },
    { key: 'academicYear', label: 'Năm học' },
    { key: 'studentCount', label: 'Số học sinh' },
    { key: 'roomNumber', label: 'Phòng' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'Active' ? 'Hoạt động' : value}
        </span>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
          <p className="mt-2 text-gray-600">Danh sách và quản lý các lớp học trong trường</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Đóng' : '+ Thêm lớp mới'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Thêm lớp học mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lớp *
                </label>
                <Field
                  type="text"
                  value={formData.className}
                  onChange={(e: any) => setFormData({ ...formData, className: e.target.value })}
                  required
                  placeholder="VD: 6A, 7B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khối
                </label>
                <Field
                  type="text"
                  value={formData.gradeLevel}
                  onChange={(e: any) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  placeholder="VD: 6, 7, 8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học
                </label>
                <Field
                  type="text"
                  value={formData.academicYear}
                  onChange={(e: any) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2024-2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng học
                </label>
                <Field
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e: any) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="VD: A101, B205"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lịch học
                </label>
                <Field
                  type="text"
                  value={formData.schedule}
                  onChange={(e: any) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="VD: Thứ 2, 4, 6 - 7h00-11h00"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary">Tạo lớp học</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <LoadingState message="Đang tải danh sách lớp học..." />}

      {error && !loading && (
        <ErrorState message={error} onRetry={fetchClasses} />
      )}

      {!loading && !error && classes.length === 0 && (
        <EmptyState
          title="Chưa có lớp học nào"
          description="Thêm lớp học đầu tiên để bắt đầu quản lý"
          action={{
            label: 'Thêm lớp mới',
            onClick: () => setShowForm(true),
          }}
        />
      )}

      {!loading && !error && classes.length > 0 && (
        <Card>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={classes}
              keyField="id"
            />
          </div>
        </Card>
      )}
    </main>
  );
}



