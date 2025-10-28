const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
};

function buildUrl(tableName: string, filterFormula?: string) {
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  return filterFormula ? `${baseUrl}?filterByFormula=${encodeURIComponent(filterFormula)}` : baseUrl;
}

export async function getClassAttendanceAgg(classId: string, days: number = 30): Promise<number> {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const dateFilter = daysAgo.toISOString().split('T')[0];
    
    const url = buildUrl('TutoAttendanceRecords', 
      `AND({Class Name}='${classId}', IS_AFTER({Date}, '${dateFilter}'))`
    );
    
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    const records = data.records || [];
    
    if (records.length === 0) return 0;
    
    const presentCount = records.filter((r: any) => r.fields.Status === 'Present').length;
    return Math.round((presentCount / records.length) * 100);
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    return 0;
  }
}

export async function getAttendanceForDate(schoolId: string, classId: string, date: string) {
  try {
    const url = buildUrl('TutoAttendanceRecords', 
      `AND({School Name}='${schoolId}', {Class Name}='${classId}', {Date}='${date}')`
    );
    
    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching attendance for date:', error);
    return [];
  }
}

