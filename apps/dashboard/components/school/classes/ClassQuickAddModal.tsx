'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useRouter } from 'next/navigation';
import { useI18n } from '../../../contexts/I18nContext';

interface ClassQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  onSuccess?: () => void;
}

export function ClassQuickAddModal({ isOpen, onClose, schoolId, onSuccess }: ClassQuickAddModalProps) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Fetch active teachers for dropdown
      fetch(`/api/school/data?table=teachers&schoolId=${schoolId}`)
        .then(r => r.json())
        .then(result => {
          const activeTeachers = (result.data || []).filter((t: any) => t.Status === 'Active');
          setTeachers(activeTeachers);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading teachers:', err);
          setLoading(false);
        });
    }
  }, [isOpen, schoolId]);

  if (!isOpen) return null;

  const handleMoreOptions = () => {
    onClose();
    router.push('/school/admin/classes/new');
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Phase 2: Actual submission
    alert(lang === 'vi' ? 'Tính năng này sẽ có trong Giai đoạn 2' : 'This feature will be available in Phase 2');
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {lang === 'vi' ? 'Thêm nhanh lớp học' : 'Quick Add Class'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleQuickSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'vi' ? 'Tên lớp' : 'Class Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={lang === 'vi' ? 'VD: Lớp 5A' : 'e.g., Grade 5A'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'vi' ? 'Khối' : 'Grade'} <span className="text-red-500">*</span>
              </label>
              <select
                name="grade"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{lang === 'vi' ? 'Chọn khối' : 'Select grade'}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                  <option key={grade} value={grade}>{lang === 'vi' ? `Khối ${grade}` : `Grade ${grade}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'vi' ? 'Sức chứa' : 'Capacity'}
              </label>
              <input
                type="number"
                name="capacity"
                defaultValue={25}
                min={1}
                max={50}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'vi' ? 'Giáo viên chủ nhiệm' : 'Homeroom Teacher'}
            </label>
            {loading ? (
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {lang === 'vi' ? 'Đang tải...' : 'Loading...'}
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
          </div>

          <p className="text-xs text-gray-500">
            {lang === 'vi' 
              ? 'Nhấp "Thêm tùy chọn" để cài đặt nâng cao (lịch học, phòng học, v.v.)'
              : 'Click "More Options" for advanced settings (schedule, room number, etc.)'}
          </p>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleMoreOptions}
          >
            {lang === 'vi' ? 'Thêm tùy chọn' : 'More Options'}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleQuickSubmit}
              disabled={submitting}
              title={lang === 'vi' ? 'Sắp ra mắt trong Giai đoạn 2' : 'Coming in Phase 2'}
            >
              {submitting ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Tạo lớp' : 'Create Class')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

















