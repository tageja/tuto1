import Backend, { ListResult } from './api/backend';

type TableName = 'TutoProgressReports' | 'TutoSchoolProgressReports';

export interface AssessmentsParams {
  schoolName?: string;
}

export interface ProgressReportItem {
  id: string;
  studentName?: string;
  className?: string;
  subject?: string;
  grade?: string | number;
  percentage?: number;
  term?: string;
  reportDate?: string; // ISO
  teacherComments?: string;
}

async function listAll<T = any>(
  table: TableName,
  options?: { filterByFormula?: string; pageSize?: number }
): Promise<T[]> {
  const results: T[] = [];
  let offset: string | undefined = undefined;
  do {
    const page: ListResult<T> = await Backend.list<T>(table, {
      filterByFormula: options?.filterByFormula,
      pageSize: options?.pageSize || 100,
      offset,
    });
    if (Array.isArray((page as any).records)) {
      results.push(...((page as any).records as any[]));
    }
    offset = (page as any).offset as string | undefined;
  } while (offset);
  return results;
}

function escapeAirtableString(s: string): string {
  return s.replace(/'/g, "\\'");
}

function andFormula(parts: Array<string | undefined>): string | undefined {
  const valid = parts.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return `AND(${valid.join(', ')})`;
}

function whereSchool(schoolName?: string): string | undefined {
  if (!schoolName) return undefined;
  return `{School Name} = '${escapeAirtableString(schoolName)}'`;
}

export async function getAssessmentsData(params: AssessmentsParams = {}): Promise<{
  reports: ProgressReportItem[];
}> {
  // Prefer school-scoped reports table if present
  const reportsFilter = andFormula([
    whereSchool(params.schoolName),
    // recent 90 days
    "OR(NOT({Report Date}), IS_AFTER({Report Date}, DATEADD(TODAY(), -90, 'days')))",
  ]);
  const itemsRaw = await listAll<any>('TutoSchoolProgressReports', { filterByFormula: reportsFilter }).catch(async () => {
    // fallback to generic table
    return listAll<any>('TutoProgressReports', { filterByFormula: reportsFilter });
  });

  const reports: ProgressReportItem[] = itemsRaw.map((r: any) => {
    const f = r.fields || r;
    const pct = typeof f['Percentage'] === 'number' ? f['Percentage'] : Number(f['Percentage']);
    return {
      id: r.id,
      studentName: f['Student Name'],
      className: f['Class Name'],
      subject: f['Subject'],
      grade: f['Grade'],
      percentage: Number.isFinite(pct) ? pct : undefined,
      term: f['Term'],
      reportDate: f['Report Date'],
      teacherComments: f['Teacher Comments'],
    };
  }).sort((a, b) => {
    const ad = a.reportDate ? Date.parse(a.reportDate) : 0;
    const bd = b.reportDate ? Date.parse(b.reportDate) : 0;
    return bd - ad; // newest first
  });

  return { reports };
}

export default { getAssessmentsData };


