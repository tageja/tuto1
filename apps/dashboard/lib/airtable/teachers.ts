const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
};

function buildUrl(tableName: string, filterFormula?: string, maxRecords?: number) {
  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  const params = [];
  
  if (filterFormula) {
    params.push(`filterByFormula=${encodeURIComponent(filterFormula)}`);
  }
  if (maxRecords) {
    params.push(`maxRecords=${maxRecords}`);
  }
  
  return params.length > 0 ? `${url}?${params.join('&')}` : url;
}

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  schoolId: string;
  subjects?: string[];
  position?: string;
  qualifications?: string;
  experience?: number;
  rating?: number;
  status: string;
  photoUrl?: string;
}

export async function getTeachers(schoolId: string, filters?: { status?: string; subject?: string }): Promise<Teacher[]> {
  try {
    let filterFormula = `{School Name}='${schoolId}'`;
    
    if (filters?.status) {
      filterFormula += ` AND {Status}='${filters.status}'`;
    }
    
    if (filters?.subject) {
      filterFormula += ` AND SEARCH('${filters.subject}', {Subjects})`;
    }
    
    const url = buildUrl('TutoSchoolTeachers', filterFormula);
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return (data.records || []).map((r: any) => ({
      id: r.id,
      name: r.fields['Teacher Name'] || r.fields.Name,
      email: r.fields.Email,
      phone: r.fields.Phone,
      schoolId: r.fields['School Name'],
      subjects: r.fields.Subjects ? (Array.isArray(r.fields.Subjects) ? r.fields.Subjects : [r.fields.Subjects]) : [],
      position: r.fields.Position,
      qualifications: r.fields.Qualifications,
      experience: r.fields['Years of Experience'],
      rating: r.fields.Rating,
      status: r.fields.Status || 'Active',
      photoUrl: r.fields['Profile Photo'],
    }));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
}

export async function getTeacherById(teacherId: string): Promise<Teacher | null> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/TutoSchoolTeachers/${teacherId}`;
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return {
      id: data.id,
      name: data.fields['Teacher Name'] || data.fields.Name,
      email: data.fields.Email,
      phone: data.fields.Phone,
      schoolId: data.fields['School Name'],
      subjects: data.fields.Subjects ? (Array.isArray(data.fields.Subjects) ? data.fields.Subjects : [data.fields.Subjects]) : [],
      position: data.fields.Position,
      qualifications: data.fields.Qualifications,
      experience: data.fields['Years of Experience'],
      rating: data.fields.Rating,
      status: data.fields.Status || 'Active',
      photoUrl: data.fields['Profile Photo'],
    };
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    return null;
  }
}

export async function getActiveTeachers(schoolId: string): Promise<Teacher[]> {
  return getTeachers(schoolId, { status: 'Active' });
}

export async function getTeachersBySubject(schoolId: string, subject: string): Promise<Teacher[]> {
  return getTeachers(schoolId, { subject });
}

















