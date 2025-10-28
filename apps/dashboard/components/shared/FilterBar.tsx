'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  onApply: (values: Record<string, any>) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onApply,
  onReset,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(values);
  };

  const handleReset = () => {
    setValues({});
    onReset?.();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={values[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="">Tất cả</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Field
                type={filter.type}
                value={values[filter.key] || ''}
                onChange={(e: any) => handleChange(filter.key, e.target.value)}
                placeholder={filter.placeholder || ''}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleApply} variant="primary">
          Áp dụng
        </Button>
        <Button onClick={handleReset} variant="outline">
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;










