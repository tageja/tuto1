import Backend, { ListResult } from './api/backend';

type TableName =
  | 'TutoSchoolStudents'
  | 'TutoSchoolClasses'
  | 'TutoAttendanceRecords'
  | 'TutoSchoolPayments'
  | 'TutoSchoolTeachers';

export interface SchoolKpiItem {
  label: string;
  value: string;
}

export interface ComputeKpisParams {
  schoolName?: string;
}

// Fetch all records from a table, following Airtable-style pagination
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

// Helpers to build Airtable formulas safely
function escapeAirtableString(input: string): string {
  return input.replace(/'/g, "\\'");
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

// KPI computations
export async function computeKpis(params: ComputeKpisParams = {}): Promise<{ kpis: SchoolKpiItem[] }> {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const ym = `${y}-${m}`; // e.g., 2025-10

  // 1) Active Students — count TutoSchoolStudents (optionally filter by School Name, Status not archived if present)
  const studentsFilter = andFormula([
    whereSchool(params.schoolName),
    // If Status exists, prefer active-like rows
    // Using a defensive OR to include rows without Status field
    "OR({Status} = 'Active', {Status} = 'Enrolled', {Status} = 'Current', NOT({Status}))",
  ]);
  const students = await listAll<any>('TutoSchoolStudents', { filterByFormula: studentsFilter });
  const activeStudents = students.length;

  // 2) Active Classes — count TutoSchoolClasses (optionally filter by School Name, Status)
  const classesFilter = andFormula([
    whereSchool(params.schoolName),
    "OR({Status} = 'Active', {Status} = 'Ongoing', NOT({Status}))",
  ]);
  const classes = await listAll<any>('TutoSchoolClasses', { filterByFormula: classesFilter });
  const activeClasses = classes.length;

  // 3) Attendance Rate (last 30 days) — from TutoAttendanceRecords
  // Present / Total in last 30 days, optionally scoped by School Name
  const attendanceBase = andFormula([
    whereSchool(params.schoolName),
    "IS_AFTER({Date}, DATEADD(TODAY(), -30, 'days'))",
  ]);
  const attendanceAll = await listAll<any>('TutoAttendanceRecords', { filterByFormula: attendanceBase });
  const totalAttendance = attendanceAll.length;
  const presentCount = attendanceAll.filter((r: any) => {
    const status = (r.fields && r.fields['Status']) || (r['Status']);
    return typeof status === 'string' && status.toLowerCase().includes('present');
  }).length;
  const attendanceRatePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // 4) Revenue MTD — sum Amount in TutoSchoolPayments where Payment Date is this month and Status paid-like
  const paymentMonthFilter = andFormula([
    whereSchool(params.schoolName),
    `DATETIME_FORMAT({Payment Date}, 'YYYY-MM') = '${ym}'`,
    "OR({Status} = 'Paid', {Status} = 'Completed', {Status} = 'Success', NOT({Status}))",
  ]);
  const payments = await listAll<any>('TutoSchoolPayments', { filterByFormula: paymentMonthFilter });
  const revenueMtd = payments.reduce((sum: number, r: any) => {
    const amountRaw = (r.fields && r.fields['Amount']) ?? r['Amount'];
    const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw || 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  // 5) Teachers Count — count TutoSchoolTeachers optionally filtered
  const teachersFilter = andFormula([
    whereSchool(params.schoolName),
    "OR({Status} = 'Active', NOT({Status}))",
  ]);
  const teachers = await listAll<any>('TutoSchoolTeachers', { filterByFormula: teachersFilter });
  const teachersCount = teachers.length;

  // Format values for display (VND); leave as raw integers for counts
  const formatVnd = (v: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.max(0, Math.floor(v)));

  const kpis: SchoolKpiItem[] = [
    { label: 'Học sinh hoạt động', value: String(activeStudents) },
    { label: 'Lớp đang hoạt động', value: String(activeClasses) },
    { label: 'Tỷ lệ chuyên cần (30 ngày)', value: `${attendanceRatePct}%` },
    { label: 'Doanh thu tháng này', value: formatVnd(revenueMtd) },
    { label: 'Giáo viên', value: String(teachersCount) },
  ];

  return { kpis };
}

export default { computeKpis };


