/**
 * Map source columns to target fields using alias table and manual mapping.
 */
import { findTargetField } from './aliases';
import type { ImportEntity, ColumnMapping, MappedRow, AutoMapResult } from './types';

/**
 * Auto-map source headers to target fields using alias table.
 */
export function autoMap(headers: string[], entity: ImportEntity): AutoMapResult {
  const mapping: ColumnMapping = {};
  const unmappedColumns: string[] = [];

  for (const header of headers) {
    if (!header?.trim()) continue;
    const target = findTargetField(header, entity);
    if (target) {
      mapping[header] = target;
    } else {
      unmappedColumns.push(header);
    }
  }

  return {
    mapping,
    unmappedColumns,
    autoMappedCount: Object.keys(mapping).length,
  };
}

/**
 * Apply mapping to rows. Returns rows with target field names.
 * Columns not in mapping are skipped.
 */
export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): MappedRow[] {
  return rows.map((row) => {
    const mapped: MappedRow = {};
    for (const [sourceCol, targetField] of Object.entries(mapping)) {
      if (targetField === 'skip' || !targetField) continue;
      const value = row[sourceCol];
      if (value !== undefined && value !== null && value !== '') {
        mapped[targetField] = value;
      }
    }
    return mapped;
  });
}

/**
 * Parse subjects string (comma-separated) into array.
 */
export function parseSubjects(value: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse date string. Supports common formats.
 */
export function parseDate(value: string): string | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}
