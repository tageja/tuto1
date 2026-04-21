/**
 * Parse CSV and Excel files for school data import.
 */
import * as XLSX from 'xlsx';
import type { ParseResult } from './types';

const MAX_ROWS = 5000;
const SAMPLE_ROWS = 10;

/**
 * Parse a file buffer (CSV or Excel) into headers and rows.
 */
export function parseFile(buffer: Buffer, filename: string): ParseResult {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'csv') {
    return parseCsv(buffer);
  }
  if (['xlsx', 'xls'].includes(ext)) {
    return parseExcel(buffer);
  }

  throw new Error('Unsupported file format. Use CSV or Excel (.xlsx, .xls).');
}

function parseCsv(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  }) as string[][];

  if (!data.length) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const headers = data[0].map((h) => String(h ?? '').trim()).filter(Boolean);
  const rows: Record<string, string>[] = [];
  const limit = Math.min(data.length - 1, MAX_ROWS);

  for (let i = 1; i <= limit; i++) {
    const row = data[i];
    const obj: Record<string, string> = {};
    headers.forEach((h, j) => {
      obj[h] = row?.[j] != null ? String(row[j]).trim() : '';
    });
    rows.push(obj);
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

function parseExcel(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    blankrows: false,
  });

  if (!data.length) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const headers = Object.keys(data[0] as Record<string, unknown>).filter(
    (h) => h && String(h).trim()
  );
  const limit = Math.min(data.length, MAX_ROWS);
  const rows: Record<string, string>[] = data.slice(0, limit).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h) => {
      obj[h] = row[h] != null ? String(row[h]).trim() : '';
    });
    return obj;
  });

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

/**
 * Get sample rows for preview (first N rows).
 */
export function getSampleRows(rows: Record<string, string>[], n = SAMPLE_ROWS): Record<string, string>[] {
  return rows.slice(0, n);
}
