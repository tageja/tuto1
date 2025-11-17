'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { useI18n } from '../../../../../contexts/I18nContext';

export default function NewClassPage() {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const { lang } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const schoolId = selectedSchool?.id || selectedSchool?.name;

  // Redirect if no school selected
  useEffect(() => {
    if (!schoolId) {
      router.push('/school');
    }
  }, [schoolId, router]);

  // Load teachers for dropdown
  useEffect(() => {
    if (!schoolId) return;

    async function loadTeachers() {
      try {
        const response = await fetch(`/api/school/data?table=teachers&schoolId=${schoolId}`);
        if (response.ok) {
          const result = await response.json();
          const activeTeachers = (result.data || []).filter((t: any) => t.Status === 'Active');
          setTeachers(activeTeachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    }

    loadTeachers();
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Phase 2: Actual class creation
    alert(lang === 'vi' ? 'Tính năng tạo lớp sẽ có trong Giai đoạn 2' : 'Class creation will be available in Phase 2');
    setSubmitting(false);
  };

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          {lang === 'vi' ? 'Đang chuyển hướng...' : 'Redirecting...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'vi' ? 'Tạo lớp học mới' : 'Create New Class'}
        </h1>
        <p className="text-gray-600 mt-2">
          {lang === 'vi' 
            ? 'Nhập thông tin chi tiết để tạo lớp học mới cho năm học này'
            : 'Enter the details to create a new class for this academic year'}
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {lang === 'vi' ? 'Thông tin cơ bản' : 'Basic Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Tên lớp' : 'Class Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="className"
                  required
                  placeholder={lang === 'vi' ? 'VD: Lớp 5A, Lớp Toán nâng cao' : 'e.g., Grade 5A, Advanced Math'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'vi' 
                    ? 'Tên hiển thị cho lớp học này'
                    : 'Display name for this class'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Khối' : 'Grade Level'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{lang === 'vi' ? 'Chọn khối' : 'Select grade'}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                    <option key={grade} value={grade}>
                      {lang === 'vi' ? `Khối ${grade}` : `Grade ${grade}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Năm học' : 'Academic Year'}
                </label>
                <input
                  type="text"
                  name="academicYear"
                  defaultValue={new Date().getFullYear().toString()}
                  placeholder="2025"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Class Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {lang === 'vi' ? 'Cấu hình lớp học' : 'Class Configuration'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Sức chứa' : 'Capacity'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  required
                  defaultValue={25}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'vi' 
                    ? 'Số học sinh tối đa trong lớp'
                    : 'Maximum number of students in class'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Phòng học' : 'Room Number'}
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  placeholder={lang === 'vi' ? 'VD: P101, A-205' : 'e.g., R101, A-205'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'vi' ? 'Giáo viên chủ nhiệm' : 'Homeroom Teacher'}
                </label>
                {loadingTeachers ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {lang === 'vi' ? 'Đang tải giáo viên...' : 'Loading teachers...'}
                  </div>
                ) : (
                  <select
                    name="teacherId"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{lang === 'vi' ? 'Chọn giáo viên' : 'Select teacher'}</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher['Teacher Name'] || teacher.Name}
                        {teacher.Position ? ` - ${teacher.Position}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'vi' 
                    ? 'Có thể để trống và gán sau'
                    : 'Can be left empty and assigned later'}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {lang === 'vi' ? 'Lịch học' : 'Schedule'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'vi' ? 'Thời gian học' : 'Class Schedule'}
              </label>
              <textarea
                name="schedule"
                rows={3}
                placeholder={lang === 'vi' 
                  ? 'VD: Thứ 2-6, 8:00-15:30'
                  : 'e.g., Mon-Fri, 8:00-15:30'}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {lang === 'vi' 
                  ? 'Mô tả ngắn gọn về lịch học hàng tuần'
                  : 'Brief description of the weekly schedule'}
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {lang === 'vi' ? 'Thông tin bổ sung' : 'Additional Information'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'vi' ? 'Ghi chú' : 'Notes'}
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder={lang === 'vi' 
                  ? 'Thêm ghi chú về lớp học (tùy chọn)'
                  : 'Add any notes about this class (optional)'}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phase 2 Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>{lang === 'vi' ? 'Lưu ý:' : 'Note:'}</strong>{' '}
              {lang === 'vi' 
                ? 'Giai đoạn 1 chỉ hỗ trợ xem dữ liệu. Chức năng tạo lớp học sẽ có trong Giai đoạn 2 (CRUD operations).'
                : 'Phase 1 is read-only. Class creation will be available in Phase 2 (CRUD operations).'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              title={lang === 'vi' ? 'Sắp ra mắt trong Giai đoạn 2' : 'Coming in Phase 2'}
            >
              {submitting 
                ? (lang === 'vi' ? 'Đang tạo...' : 'Creating...') 
                : (lang === 'vi' ? 'Tạo lớp học' : 'Create Class')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}













