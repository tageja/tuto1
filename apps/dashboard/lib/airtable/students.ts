const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
};

function buildUrl(tableName: string, filterFormula?: string) {
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  return filterFormula ? `${baseUrl}?filterByFormula=${encodeURIComponent(filterFormula)}` : baseUrl;
}

export interface Student {
  id: string;
  code?: string;
  name: string;
  schoolId: string;
  classId?: string;
  className?: string;
  dob?: string;
  gender?: string;
  status: string;
  enrolledAt?: string;
  photoUrl?: string;
  parentName?: string;
  parentEmail?: string;
  gradeLevel?: string;
}

export async function getStudentsByClassId(classId: string): Promise<Student[]> {
  try {
    const url = buildUrl('TutoSchoolStudents', `{Class Name}='${classId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.records || []).map((r: any) => ({
      id: r.id,
      code: r.fields['Student ID'],
      name: r.fields['Student Name'],
      schoolId: r.fields['School Name'],
      classId: r.fields['Class Name'],
      className: r.fields['Class Name'],
      dob: r.fields['Date of Birth'],
      gender: r.fields.Gender,
      status: r.fields.Status || 'Active',
      enrolledAt: r.fields['Enrollment Date'],
      photoUrl: r.fields['Profile Photo'],
      parentName: r.fields['Parent Name'],
      parentEmail: r.fields['Parent Email'],
      gradeLevel: r.fields['Grade Level'],
    }));
  } catch (error) {
    console.error('Error fetching students by class:', error);
    return [];
  }
}

export async function countStudentsByClassIds(classIds: string[]): Promise<Record<string, number>> {
  try {
    const counts: Record<string, number> = {};
    
    // Initialize counts
    classIds.forEach(id => counts[id] = 0);
    
    // Fetch all students for these classes
    const filter = classIds.map(id => `{Class Name}='${id}'`).join(',');
    const url = buildUrl('TutoSchoolStudents', `OR(${filter})`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return counts;
    }
    
    const data = await response.json();
    (data.records || []).forEach((r: any) => {
      const className = r.fields['Class Name'];
      if (className && counts[className] !== undefined) {
        counts[className]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error counting students:', error);
    return {};
  }
}












