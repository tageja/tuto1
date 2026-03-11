/**
 * Validate mapped rows before import.
 */
import { parseDate } from './mapper';
import type { ImportEntity, MappedRow, ValidationError, ValidationResult } from './types';
import { ENTITY_REQUIRED_FIELDS } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(s: string): boolean {
  return EMAIL_REGEX.test(s.trim());
}

/**
 * Validate a single row for the given entity.
 */
function validateRow(
  row: MappedRow,
  rowIndex: number,
  entity: ImportEntity,
  existingClassNames?: string[],
  existingTeacherNames?: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const required = ENTITY_REQUIRED_FIELDS[entity];

  for (const field of required) {
    const val = row[field];
    if (val == null || String(val).trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field,
        message: `Required field "${field}" is empty`,
        value: String(val ?? ''),
      });
    }
  }

  if (entity === 'students') {
    const fn = row.first_name;
    const ln = row.last_name;
    if ((!fn || !String(fn).trim()) && (!ln || !String(ln).trim())) {
      errors.push({
        row: rowIndex + 1,
        field: 'first_name',
        message: 'Either first name or last name is required',
      });
    }
  }

  if (row.parent_email && !isValidEmail(String(row.parent_email))) {
    errors.push({
      row: rowIndex + 1,
      field: 'parent_email',
      message: 'Invalid email format',
      value: String(row.parent_email),
    });
  }

  if (row.date_of_birth) {
    const parsed = parseDate(String(row.date_of_birth));
    if (!parsed) {
      errors.push({
        row: rowIndex + 1,
        field: 'date_of_birth',
        message: 'Invalid date format',
        value: String(row.date_of_birth),
      });
    }
  }

  return errors;
}

/**
 * Validate all rows. Optionally pass existing class/teacher names for FK resolution hints.
 */
export function validateRows(
  rows: MappedRow[],
  entity: ImportEntity,
  options?: {
    existingClassNames?: string[];
    existingTeacherNames?: string[];
  }
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const preview: Record<string, string>[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowErrors = validateRow(
      rows[i],
      i,
      entity,
      options?.existingClassNames,
      options?.existingTeacherNames
    );
    allErrors.push(...rowErrors);

    const previewRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(rows[i])) {
      previewRow[k] = v != null ? String(v) : '';
    }
    preview.push(previewRow);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    preview: preview.slice(0, 10),
  };
}
