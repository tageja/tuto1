'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';

interface StudentsFiltersProps {
  searchQuery: string;
  selectedClass: string | string[];
  selectedGrade: string | string[];
  selectedStatus: string | string[];
  classes: Array<{ id: string; name: string; grade_level?: string | null }>;
  grades: string[];
  onSearchChange: (value: string) => void;
  onClassChange: (value: string | string[]) => void;
  onGradeChange: (value: string | string[]) => void;
  onStatusChange: (value: string | string[]) => void;
  onClearAll: () => void;
}

export function StudentsFilters({
  searchQuery,
  selectedClass,
  selectedGrade,
  selectedStatus,
  classes,
  grades,
  onSearchChange,
  onClassChange,
  onGradeChange,
  onStatusChange,
  onClearAll,
}: StudentsFiltersProps) {
  const { t, lang } = useI18n();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const gradeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(event.target as Node)) {
        setShowGradeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedClassArray = Array.isArray(selectedClass) ? selectedClass : (selectedClass && selectedClass !== 'all' ? [selectedClass] : []);
  const selectedGradeArray = Array.isArray(selectedGrade) ? selectedGrade : (selectedGrade && selectedGrade !== 'all' ? [selectedGrade] : []);
  const selectedStatusArray = Array.isArray(selectedStatus) ? selectedStatus : (selectedStatus && selectedStatus !== 'all' ? [selectedStatus] : []);

  const hasActiveFilters = selectedClassArray.length > 0 || selectedGradeArray.length > 0 || selectedStatusArray.length > 0 || localSearch;

  const toggleClass = (classId: string) => {
    if (selectedClassArray.includes(classId)) {
      onClassChange(selectedClassArray.filter((id) => id !== classId));
    } else {
      onClassChange([...selectedClassArray, classId]);
    }
  };

  const toggleGrade = (grade: string) => {
    if (selectedGradeArray.includes(grade)) {
      onGradeChange(selectedGradeArray.filter((g) => g !== grade));
    } else {
      onGradeChange([...selectedGradeArray, grade]);
    }
  };

  const toggleStatus = (status: string) => {
    if (selectedStatusArray.includes(status)) {
      onStatusChange(selectedStatusArray.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatusArray, status]);
    }
  };

  const handleActiveToggle = () => {
    if (selectedStatusArray.includes('active')) {
      onStatusChange(selectedStatusArray.filter((s) => s !== 'active'));
    } else {
      onStatusChange([...selectedStatusArray, 'active']);
    }
  };

  const handleInactiveToggle = () => {
    if (selectedStatusArray.includes('inactive')) {
      onStatusChange(selectedStatusArray.filter((s) => s !== 'inactive'));
    } else {
      onStatusChange([...selectedStatusArray, 'inactive']);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('dashboard.students.filters.searchPlaceholder') || 'Search by name or code...'}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('dashboard.students.filters.searchLabel') || 'Search students'}
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Class Filter */}
          <div className="relative" ref={classDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.students.filters.class') || 'Class'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label={t('dashboard.students.filters.selectClass') || 'Select class'}
                aria-expanded={showClassDropdown}
              >
                {selectedClassArray.length === 0
                  ? t('dashboard.students.filters.allClasses') || 'All Classes'
                  : `${selectedClassArray.length} ${lang === 'vi' ? 'lớp' : 'selected'}`}
              </button>
              {showClassDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {classes.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClassArray.includes(cls.id)}
                        onChange={() => toggleClass(cls.id)}
                        className="mr-2"
                      />
                      <span>{cls.name || 'Unnamed Class'}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grade Filter */}
          <div className="relative" ref={gradeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.students.filters.grade') || 'Grade'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label={t('dashboard.students.filters.selectGrade') || 'Select grade'}
                aria-expanded={showGradeDropdown}
              >
                {selectedGradeArray.length === 0
                  ? t('dashboard.students.filters.allGrades') || 'All Grades'
                  : `${selectedGradeArray.length} ${lang === 'vi' ? 'khối' : 'selected'}`}
              </button>
              {showGradeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {grades.map((grade) => (
                    <label
                      key={grade}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGradeArray.includes(grade)}
                        onChange={() => toggleGrade(grade)}
                        className="mr-2"
                      />
                      <span>{grade}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.students.filters.status') || 'Status'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label={t('dashboard.students.filters.selectStatus') || 'Select status'}
                aria-expanded={showStatusDropdown}
              >
                {selectedStatusArray.length === 0
                  ? t('dashboard.students.filters.allStatus') || 'All Status'
                  : `${selectedStatusArray.length} ${lang === 'vi' ? 'trạng thái' : 'selected'}`}
              </button>
              {showStatusDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatusArray.includes('active')}
                      onChange={() => toggleStatus('active')}
                      className="mr-2"
                    />
                    <span>{t('dashboard.students.status.active') || 'Active'}</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatusArray.includes('inactive')}
                      onChange={() => toggleStatus('inactive')}
                      className="mr-2"
                    />
                    <span>{t('dashboard.students.status.inactive') || 'Inactive'}</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Quick Status Chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.students.filters.quickFilters') || 'Quick Filters'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleActiveToggle}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedStatusArray.includes('active')
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={t('dashboard.students.filters.filterActive') || 'Filter active students'}
              >
                {t('dashboard.students.status.active') || 'Active'}
              </button>
              <button
                type="button"
                onClick={handleInactiveToggle}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedStatusArray.includes('inactive')
                    ? 'bg-gray-100 border-gray-500 text-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={t('dashboard.students.filters.filterInactive') || 'Filter inactive students'}
              >
                {t('dashboard.students.status.inactive') || 'Inactive'}
              </button>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              {t('dashboard.students.filters.clearAll') || 'Clear All Filters'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

