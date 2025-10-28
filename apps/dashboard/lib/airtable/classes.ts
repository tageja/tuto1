const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
};

function buildUrl(tableName: string, filterFormula?: string, sort?: string, maxRecords?: number) {
  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  const params = [];
  
  if (filterFormula) {
    params.push(`filterByFormula=${encodeURIComponent(filterFormula)}`);
  }
  if (sort) {
    params.push(sort);
  }
  if (maxRecords) {
    params.push(`maxRecords=${maxRecords}`);
  }
  
  return params.length > 0 ? `${url}?${params.join('&')}` : url;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  grade: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  capacity?: number;
  studentCount?: number;
  schedule?: string;
  roomNumber?: string;
  status: string;
  academicYear?: string;
  createdDate?: string;
}

export async function getClasses(schoolId: string, filters?: { grade?: string; search?: string; page?: number; pageSize?: number }) {
  try {
    let filterFormula = `{School Name}='${schoolId}'`;
    
    if (filters?.grade && filters.grade !== 'all') {
      filterFormula += ` AND {Grade Level}='${filters.grade}'`;
    }
    
    if (filters?.search) {
      filterFormula += ` AND SEARCH('${filters.search}', LOWER({Class Name}))`;
    }
    
    const url = buildUrl('TutoSchoolClasses', filterFormula);
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      return { records: [], total: 0 };
    }
    
    const data = await response.json();
    const records = (data.records || []).map((r: any) => ({
      id: r.id,
      name: r.fields['Class Name'],
      schoolId: r.fields['School Name'],
      grade: r.fields['Grade Level'],
      capacity: r.fields['Student Count'],
      schedule: r.fields.Schedule,
      roomNumber: r.fields['Room Number'],
      status: r.fields.Status || 'Active',
      academicYear: r.fields['Academic Year'],
      createdDate: r.fields['Created Date'],
    }));
    
    // Pagination
    const pageSize = filters?.pageSize || 10;
    const page = filters?.page || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      records: records.slice(start, end),
      total: records.length,
      page,
      pageSize,
      totalPages: Math.ceil(records.length / pageSize),
    };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { records: [], total: 0 };
  }
}

export async function getClassById(classId: string) {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolClasses/${classId}`;
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return {
      id: data.id,
      name: data.fields['Class Name'],
      schoolId: data.fields['School Name'],
      grade: data.fields['Grade Level'],
      capacity: data.fields['Student Count'],
      schedule: data.fields.Schedule,
      roomNumber: data.fields['Room Number'],
      status: data.fields.Status || 'Active',
      academicYear: data.fields['Academic Year'],
    };
  } catch (error) {
    console.error('Error fetching class by ID:', error);
    return null;
  }
}

export async function getClassKpis(schoolId: string) {
  try {
    const classesData = await getClasses(schoolId, { pageSize: 1000 });
    const classes = classesData.records;
    
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.status === 'Active').length;
    
    // Get all students for this school to calculate total and capacity
    const studentsUrl = buildUrl('TutoSchoolStudents', `{School Name}='${schoolId}'`);
    const studentsResponse = await fetch(studentsUrl, { headers, cache: 'no-store' });
    const studentsData = await studentsResponse.ok ? await studentsResponse.json() : { records: [] };
    const totalStudents = studentsData.records?.length || 0;
    
    // Calculate total capacity
    const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 25), 0);
    const capacityUsage = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
    
    // Get attendance data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
    
    const attendanceUrl = buildUrl('TutoAttendanceRecords', 
      `AND({School Name}='${schoolId}', IS_AFTER({Date}, '${dateFilter}'))`
    );
    const attendanceResponse = await fetch(attendanceUrl, { headers, cache: 'no-store' });
    const attendanceData = await attendanceResponse.ok ? await attendanceResponse.json() : { records: [] };
    
    const attendanceRecords = attendanceData.records || [];
    const presentCount = attendanceRecords.filter((r: any) => r.fields.Status === 'Present').length;
    const avgAttendance = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;
    
    return {
      totalClasses,
      activeClasses,
      totalStudents,
      capacityUsage,
      avgAttendance,
    };
  } catch (error) {
    console.error('Error fetching class KPIs:', error);
    return {
      totalClasses: 0,
      activeClasses: 0,
      totalStudents: 0,
      capacityUsage: 0,
      avgAttendance: 0,
    };
  }
}

export async function createClass(classData: Partial<Class>) {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolClasses`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Class Name': classData.name,
          'School Name': classData.schoolId,
          'Grade Level': classData.grade,
          'Student Count': classData.capacity || 25,
          'Schedule': classData.schedule,
          'Room Number': classData.roomNumber,
          'Status': 'Active',
          'Academic Year': classData.academicYear || new Date().getFullYear().toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create class');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
}

export async function getDistinctGrades(schoolId: string): Promise<string[]> {
  try {
    const classesData = await getClasses(schoolId, { pageSize: 1000 });
    const grades = new Set<string>();
    
    classesData.records.forEach(c => {
      if (c.grade) grades.add(c.grade);
    });
    
    return Array.from(grades).sort();
  } catch (error) {
    console.error('Error fetching distinct grades:', error);
    return [];
  }
}

