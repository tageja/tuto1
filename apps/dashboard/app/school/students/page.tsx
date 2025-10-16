'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import DataTable from '../../../components/shared/DataTable';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';
import EmptyState from '../../../components/shared/EmptyState';
import FilterBar from '../../../components/shared/FilterBar';

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    studentName: '',
    schoolName: 'Demo School',
    className: '',
    studentId: '',
    dateOfBirth: '',
    gender: '',
    gradeLevel: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        schoolName: 'Demo School',
        maxRecords: '100',
        ...filters,
      });

      const response = await fetch(`/api/school/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create student');
      }

      // Reset form and refresh
      setFormData({
        studentName: '',
        schoolName: 'Demo School',
        className: '',
        studentId: '',
        dateOfBirth: '',
        gender: '',
        gradeLevel: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
      });
      setShowForm(false);
      fetchStudents();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const columns = [
    { key: 'studentName', label: 'Tên học sinh' },
    { key: 'className', label: 'Lớp' },
    { key: 'gradeLevel', label: 'Khối' },
    { key: 'parentName', label: 'Phụ huynh' },
    { key: 'parentPhone', label: 'SĐT phụ huynh' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 
          value === 'Inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value === 'Active' ? 'Đang học' : value === 'Inactive' ? 'Nghỉ học' : value}
        </span>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'className',
      label: 'Lớp',
      type: 'text' as const,
      placeholder: 'VD: 6A, 7B',
    },
    {
      key: 'gradeLevel',
      label: 'Khối',
      type: 'text' as const,
      placeholder: 'VD: 6, 7, 8',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: 'Active', label: 'Đang học' },
        { value: 'Inactive', label: 'Nghỉ học' },
        { value: 'Graduated', label: 'Đã tốt nghiệp' },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học sinh</h1>
          <p className="mt-2 text-gray-600">Danh sách và quản lý học sinh trong trường</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Đóng' : '+ Thêm học sinh mới'}
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        onApply={(values) => setFilters(values)}
        onReset={() => setFilters({})}
      />

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Thêm học sinh mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên học sinh *</label>
                <Field
                  type="text"
                  value={formData.studentName}
                  onChange={(e: any) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã học sinh</label>
                <Field
                  type="text"
                  value={formData.studentId}
                  onChange={(e: any) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
                <Field
                  type="text"
                  value={formData.className}
                  onChange={(e: any) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="VD: 6A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khối</label>
                <Field
                  type="text"
                  value={formData.gradeLevel}
                  onChange={(e: any) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  placeholder="VD: 6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                <Field
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e: any) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin phụ huynh</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên phụ huynh</label>
                <Field
                  type="text"
                  value={formData.parentName}
                  onChange={(e: any) => setFormData({ ...formData, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email phụ huynh</label>
                <Field
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e: any) => setFormData({ ...formData, parentEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SĐT phụ huynh</label>
                <Field
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e: any) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Liên hệ khẩn cấp</label>
                <Field
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e: any) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <Field
                  type="text"
                  value={formData.address}
                  onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary">Thêm học sinh</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <LoadingState message="Đang tải danh sách học sinh..." />}

      {error && !loading && (
        <ErrorState message={error} onRetry={fetchStudents} />
      )}

      {!loading && !error && students.length === 0 && (
        <EmptyState
          title="Chưa có học sinh nào"
          description="Thêm học sinh đầu tiên để bắt đầu quản lý"
          action={{
            label: 'Thêm học sinh mới',
            onClick: () => setShowForm(true),
          }}
        />
      )}

      {!loading && !error && students.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="mb-4 text-sm text-gray-600">
              Tổng số: {students.length} học sinh
            </div>
            <DataTable
              columns={columns}
              data={students}
              keyField="id"
            />
          </div>
        </Card>
      )}
    </main>
  );
}


