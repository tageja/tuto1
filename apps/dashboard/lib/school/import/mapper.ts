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
 * Parse date string into ISO YYYY-MM-DD.
 * Supports common formats — preferring DD/MM/YYYY (Vietnamese / EU standard)
 * over MM/DD/YYYY since this dashboard primarily serves VN schools.
 *
 * Accepted:
 *   2018-01-21   (ISO)
 *   21/01/2018   (DD/MM/YYYY — preferred for slash form)
 *   21-01-2018   (DD-MM-YYYY)
 *   1/21/2018    (MM/DD/YYYY — only when DD/MM interpretation is invalid, e.g. month > 12)
 *   Anything else parseable by `new Date(...)` (e.g. "Jan 21 2018")
 */
export function parseDate(value: string | number | Date): string | null {
  if (value === null || value === undefined) return null;

  // Excel can hand us a real Date object via xlsx with cellDates: true
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return toIso(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  // Excel serial number (days since 1900-01-01, with the 1900 leap-year bug)
  if (typeof value === 'number' && Number.isFinite(value) && value > 0 && value < 100000) {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      return toIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }
  }

  const v = String(value).trim();
  if (!v) return null;

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = v.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
      return toIso(Number(y), Number(m), Number(d));
    }
    return null;
  }

  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (preferred — VN/EU)
  const dmyMatch = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, a, b, y] = dmyMatch;
    const na = Number(a);
    const nb = Number(b);

    // Try DD/MM/YYYY first
    if (na >= 1 && na <= 31 && nb >= 1 && nb <= 12) {
      return toIso(Number(y), nb, na);
    }
    // Fall back to MM/DD/YYYY (e.g. "12/31/2018" — day > 12 forces this)
    if (nb >= 1 && nb <= 31 && na >= 1 && na <= 12) {
      return toIso(Number(y), na, nb);
    }
    return null;
  }

  // Last resort — let JS try
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
