/**
 * Types for school data import (teachers, classes, students)
 */

export type ImportEntity = 'teachers' | 'classes' | 'students';

/** Mapping from source column name to target field name. Use "skip" to ignore a column. */
export type ColumnMapping = Record<string, string>;

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  preview: Record<string, string>[];
}

export interface MappedRow {
  [targetField: string]: string | number | string[] | null;
}

export interface AutoMapResult {
  mapping: ColumnMapping;
  unmappedColumns: string[];
  autoMappedCount: number;
}

export const ENTITY_REQUIRED_FIELDS: Record<ImportEntity, string[]> = {
  teachers: ['name'],
  classes: ['name'],
  students: ['first_name', 'last_name'],
};

export const ENTITY_OPTIONAL_FIELDS: Record<ImportEntity, string[]> = {
  teachers: ['email', 'phone', 'subjects', 'qualifications', 'hire_date'],
  classes: ['grade_level', 'academic_year', 'teacher_id', 'room_number', 'capacity'],
  students: [
    'student_number',
    'class_id',
    'date_of_birth',
    'gender',
    'parent_name',
    'parent_email',
    'parent_phone',
    'address',
  ],
};
