import Backend, { ListResult } from './api/backend';

type TableName = 'TutoHomeworkAssignments' | 'TutoClassSubjects';

export interface LessonPlannerParams {
  schoolName?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  className?: string;
  subject?: string;
  description?: string;
  dueDate?: string; // ISO
  totalStudents?: number;
  submittedCount?: number;
  status?: string;
}

export interface ClassSubjectItem {
  id: string;
  name?: string;
  className?: string;
  subject?: string;
  enabled?: boolean;
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

export async function getLessonPlannerData(params: LessonPlannerParams = {}): Promise<{
  upcomingAssignments: AssignmentItem[];
  classSubjects: ClassSubjectItem[];
}> {
  // Upcoming assignments: Due Date today or later, order by Due Date ascending
  const assignmentsFilter = andFormula([
    whereSchool(params.schoolName),
    "OR(NOT({Status}), {Status} = 'Assigned', {Status} = 'Open')",
    "OR(NOT({Due Date}), IS_AFTER({Due Date}, DATEADD(TODAY(), -1, 'day')))",
  ]);
  const assignmentsRaw = await listAll<any>('TutoHomeworkAssignments', { filterByFormula: assignmentsFilter });
  const upcomingAssignments: AssignmentItem[] = assignmentsRaw.map((r: any) => {
    const f = r.fields || r;
    return {
      id: r.id,
      title: String(f['Assignment Title'] || ''),
      className: f['Class Name'],
      subject: f['Subject'],
      description: f['Description'],
      dueDate: f['Due Date'],
      totalStudents: typeof f['Total Students'] === 'number' ? f['Total Students'] : undefined,
      submittedCount: typeof f['Submitted Count'] === 'number' ? f['Submitted Count'] : undefined,
      status: f['Status'],
    };
  }).sort((a, b) => {
    const ad = a.dueDate ? Date.parse(a.dueDate) : Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate ? Date.parse(b.dueDate) : Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });

  // Class subjects: enabled only
  const subjectsFilter = andFormula([
    whereSchool(params.schoolName),
    "OR({Enabled} = 1, {Enabled} = TRUE(), {Enabled} = 'true', NOT({Enabled}))",
  ]);
  const subjectsRaw = await listAll<any>('TutoClassSubjects', { filterByFormula: subjectsFilter });
  const classSubjects: ClassSubjectItem[] = subjectsRaw.map((r: any) => {
    const f = r.fields || r;
    return {
      id: r.id,
      name: f['Name'],
      className: f['Class Name'],
      subject: f['Subject'],
      enabled: Boolean(f['Enabled']),
    };
  });

  return { upcomingAssignments, classSubjects };
}

export default { getLessonPlannerData };


