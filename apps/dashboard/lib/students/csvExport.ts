/**
 * CSV Export Utility for Students
 * Handles localized formatting and CSV generation
 */

import { Student } from '../types/students';
import { formatStudentForExport } from './adapter';

/**
 * Generate CSV content from student array
 */
export function generateStudentsCSV(
  students: Student[],
  locale: string = 'en-US'
): string {
  if (students.length === 0) {
    return '';
  }

  // Format all students
  const csvRows = students.map((student) => formatStudentForExport(student, locale));

  // Get headers from first row
  const headers = Object.keys(csvRows[0] || {});

  // Generate CSV rows
  const csvLines = [
    // Header row
    headers.map((h) => escapeCSVValue(h)).join(','),
    // Data rows
    ...csvRows.map((row) =>
      headers.map((h) => escapeCSVValue(row[h] || '')).join(',')
    ),
  ];

  return csvLines.join('\n');
}

/**
 * Escape CSV value (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}



