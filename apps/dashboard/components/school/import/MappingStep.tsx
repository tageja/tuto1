'use client';

import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { ImportEntity, ColumnMapping } from '../../../lib/school/import/types';
import { ENTITY_REQUIRED_FIELDS, ENTITY_OPTIONAL_FIELDS } from '../../../lib/school/import/types';

const TARGET_OPTIONS: Record<ImportEntity, { value: string; label: string }[]> = {
  teachers: [
    { value: 'name', label: 'Name (required)' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'subjects', label: 'Subjects' },
    { value: 'qualifications', label: 'Qualifications' },
    { value: 'hire_date', label: 'Hire date' },
    { value: 'skip', label: '— Skip column' },
  ],
  classes: [
    { value: 'name', label: 'Class name (required)' },
    { value: 'grade_level', label: 'Grade level' },
    { value: 'academic_year', label: 'Academic year' },
    { value: 'teacher_id', label: 'Teacher name' },
    { value: 'room_number', label: 'Room number' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'skip', label: '— Skip column' },
  ],
  students: [
    { value: 'first_name', label: 'First name (required)' },
    { value: 'last_name', label: 'Last name (required)' },
    { value: 'student_number', label: 'Student number' },
    { value: 'class_id', label: 'Class name' },
    { value: 'date_of_birth', label: 'Date of birth' },
    { value: 'gender', label: 'Gender' },
    { value: 'parent_name', label: 'Parent name' },
    { value: 'parent_email', label: 'Parent email' },
    { value: 'parent_phone', label: 'Parent phone' },
    { value: 'address', label: 'Address' },
    { value: 'skip', label: '— Skip column' },
  ],
};

interface MappingStepProps {
  entity: ImportEntity;
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onNext: () => void;
  onSaveMapping?: () => void;
  saveMappingChecked?: boolean;
  onSaveMappingCheckedChange?: (checked: boolean) => void;
}

export function MappingStep({
  entity,
  headers,
  mapping,
  onMappingChange,
  onNext,
  onSaveMapping,
  saveMappingChecked = false,
  onSaveMappingCheckedChange,
}: MappingStepProps) {
  const options = TARGET_OPTIONS[entity];
  const required = ENTITY_REQUIRED_FIELDS[entity];
  const optional = ENTITY_OPTIONAL_FIELDS[entity];

  const handleChange = (sourceCol: string, targetValue: string) => {
    onMappingChange({ ...mapping, [sourceCol]: targetValue });
  };

  const mappedCount = Object.values(mapping).filter((v) => v && v !== 'skip').length;
  const hasRequired = required.every((f) =>
    Object.values(mapping).some((v) => v === f)
  );

  return (
    <div className="space-y-6">
      <Card padding="lg" variant="bordered">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-text">Map columns</h3>
          <p className="text-sm text-text-muted">
            Match your file columns to the correct fields. Required fields must be mapped.
          </p>

          <div className="space-y-3">
            {headers.map((header) => (
              <div
                key={header}
                className="flex items-center gap-4 py-2 border-b border-border last:border-0"
              >
                <span className="flex-1 text-sm text-text truncate" title={header}>
                  {header}
                </span>
                <select
                  value={mapping[header] ?? ''}
                  onChange={(e) => handleChange(header, e.target.value)}
                  className="flex-1 max-w-xs h-9 rounded-lg border border-border bg-card px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">— Select field —</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {onSaveMapping && onSaveMappingCheckedChange && (
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={saveMappingChecked}
                onChange={(e) => onSaveMappingCheckedChange(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/40"
              />
              <span className="text-sm text-text">Save this mapping for future imports</span>
            </label>
          )}

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-text-muted">
              {mappedCount} column(s) mapped
              {!hasRequired && ' • Map required fields to continue'}
            </p>
            <div className="flex gap-2">
              {saveMappingChecked && onSaveMapping && (
                <Button variant="outline" size="sm" onClick={onSaveMapping}>
                  Save mapping
                </Button>
              )}
              <Button
                size="sm"
                onClick={onNext}
                disabled={!hasRequired}
              >
                Next: Preview
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
