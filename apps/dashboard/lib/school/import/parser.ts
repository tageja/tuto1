/**
 * Parse CSV and Excel files for school data import.
 */
import * as XLSX from 'xlsx';
import iconv from 'iconv-lite';
import type { ParseResult } from './types';

const MAX_ROWS = 5000;
const SAMPLE_ROWS = 10;

/**
 * Decode a CSV buffer to a UTF-8 string, auto-detecting common encodings.
 *
 * Handles the very common case where a Vietnamese user saves CSV from Excel
 * on a Windows machine — Excel writes CP1258 (or CP1252) by default unless
 * "CSV UTF-8" is explicitly chosen, which then mangles diacritics like
 * "Nguyễn" → "Nguy?n" and "Mẹ Hương" → "M? H??ng" when read as UTF-8.
 *
 * Strategy:
 *   1. UTF-8 BOM present → trust it, decode UTF-8.
 *   2. Try UTF-8 — if no replacement chars (U+FFFD), use it.
 *   3. Try Windows-1258 (Vietnamese) — if it decodes more Vietnamese-looking
 *      chars than UTF-8 did, prefer it.
 *   4. Fall back to Windows-1252 (Western European).
 */
function decodeCsvBuffer(buffer: Buffer): string {
  // UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.slice(3).toString('utf8');
  }
  // UTF-16 LE BOM
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.slice(2).toString('utf16le');
  }
  // UTF-16 BE BOM — Node has no native utf16be; iconv-lite handles it
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return iconv.decode(buffer.slice(2), 'utf16-be');
  }

  const utf8 = buffer.toString('utf8');
  const utf8Replacements = (utf8.match(/\uFFFD/g) || []).length;

  // Clean UTF-8 — done.
  if (utf8Replacements === 0) {
    return utf8;
  }

  // Fallback path — try Vietnamese first (this is a VN-focused app), then Latin-1.
  const candidates: { encoding: string; text: string; score: number }[] = [];

  try {
    const cp1258 = iconv.decode(buffer, 'windows-1258');
    candidates.push({
      encoding: 'windows-1258',
      text: cp1258,
      score: scoreVietnameseText(cp1258),
    });
  } catch {
    /* ignore */
  }

  try {
    const cp1252 = iconv.decode(buffer, 'windows-1252');
    candidates.push({
      encoding: 'windows-1252',
      text: cp1252,
      score: scoreVietnameseText(cp1252),
    });
  } catch {
    /* ignore */
  }

  candidates.push({
    encoding: 'utf-8',
    text: utf8,
    // Penalise UTF-8 by the number of replacement chars
    score: scoreVietnameseText(utf8) - utf8Replacements * 5,
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].text;
}

/**
 * Heuristic score: count Vietnamese-specific characters minus replacement chars.
 * Higher = more likely to be the correct decoding.
 */
function scoreVietnameseText(text: string): number {
  // Composed Vietnamese letters with stacked diacritics
  const vnChars = (text.match(/[ăâđêôơưĂÂĐÊÔƠƯạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶ]/g) || []).length;
  const replacement = (text.match(/\uFFFD/g) || []).length;
  return vnChars - replacement * 5;
}

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
  // Decode bytes → UTF-8 string ourselves so XLSX never has to guess.
  const text = decodeCsvBuffer(buffer);
  const workbook = XLSX.read(text, { type: 'string', raw: true });
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
  // cellDates: true so date cells arrive as Date objects (parseDate handles them).
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    blankrows: false,
    raw: false,  // Format via cell formatting; keeps Vietnamese strings intact.
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
      const cell = row[h];
      if (cell == null) {
        obj[h] = '';
      } else if (cell instanceof Date) {
        // Render as DD/MM/YYYY so parseDate normalises consistently downstream.
        obj[h] = `${String(cell.getDate()).padStart(2, '0')}/${String(cell.getMonth() + 1).padStart(2, '0')}/${cell.getFullYear()}`;
      } else {
        obj[h] = String(cell).trim();
      }
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
