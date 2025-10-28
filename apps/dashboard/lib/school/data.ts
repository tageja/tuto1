const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
};

// Helper function to build Airtable URL
function buildUrl(tableName: string, filterFormula?: string) {
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  if (filterFormula) {
    return `${baseUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`;
  }
  return baseUrl;
}

export async function getSchoolClasses(schoolId: string) {
  try {
    const url = buildUrl('TutoSchoolClasses', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch classes');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

export async function getSchoolStudents(schoolId: string) {
  try {
    const url = buildUrl('TutoSchoolStudents', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch students');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function getSchoolTeachers(schoolId: string) {
  try {
    const url = buildUrl('TutoSchoolTeachers', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch teachers');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
}

export async function getDailyActivities(schoolId: string, filters?: { date?: string; classId?: string }) {
  try {
    let filterFormula = `{School Name}='${schoolId}'`;
    if (filters?.date) {
      filterFormula += ` AND {Date}='${filters.date}'`;
    }
    const url = buildUrl('TutoDailyActivities', filterFormula);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch activities');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

export async function getAttendanceRecords(schoolId: string, date?: string) {
  try {
    let filterFormula = `{School Name}='${schoolId}'`;
    if (date) {
      filterFormula += ` AND {Date}='${date}'`;
    }
    const url = buildUrl('TutoAttendanceRecords', filterFormula);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

export async function getSchoolEvents(schoolId: string) {
  try {
    const url = buildUrl('TutoSchoolEvents', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getSchoolPayments(schoolId: string, studentId?: string) {
  try {
    let filterFormula = `{School Name}='${schoolId}'`;
    if (studentId) {
      filterFormula += ` AND {Student Name}='${studentId}'`;
    }
    const url = buildUrl('TutoSchoolPayments', filterFormula);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export async function getAnnouncements(schoolId: string) {
  try {
    const url = buildUrl('TutoAnnouncements', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch announcements');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function getMessages(userId: string, schoolId: string) {
  try {
    const url = buildUrl('TutoMessages', `AND({School Name}='${schoolId}', OR({From User}='${userId}', {To User}='${userId}'))`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function getHomeworkAssignments(studentId: string) {
  try {
    const url = buildUrl('TutoHomeworkAssignments', `{Student Name}='${studentId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch homework');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
}

export async function getProgressReports(studentId: string) {
  try {
    const url = buildUrl('TutoSchoolProgressReports', `{Student Name}='${studentId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch progress reports');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching progress reports:', error);
    return [];
  }
}

export async function getStudentByParentEmail(parentEmail: string, schoolId: string) {
  try {
    const url = buildUrl('TutoSchoolStudents', `AND({Parent Email}='${parentEmail}', {School Name}='${schoolId}')`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch student');
    const data = await response.json();
    return data.records?.[0] || null;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

export async function getSchoolDetails(schoolId: string) {
  try {
    const url = buildUrl('TutoSchools', `{School Name}='${schoolId}'`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch school details');
    const data = await response.json();
    return data.records?.[0] || null;
  } catch (error) {
    console.error('Error fetching school details:', error);
    return null;
  }
}

export async function getUnreadMessages(userId: string, schoolId: string) {
  try {
    const url = buildUrl('TutoMessages', `AND({School Name}='${schoolId}', {To User}='${userId}', {Status}!='Read')`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch unread messages');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    return [];
  }
}

export async function getUpcomingHomework(schoolId: string, limit: number = 10) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = buildUrl('TutoHomeworkAssignments', `AND({School Name}='${schoolId}', IS_AFTER({Due Date}, '${today}'))`);
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch homework');
    const data = await response.json();
    return data.records?.slice(0, limit) || [];
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
}

export async function getEnrollmentTrend(schoolId: string, months: number = 6) {
  try {
    const students = await getSchoolStudents(schoolId);
    
    // Group students by enrollment month
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7); // YYYY-MM
      monthCounts[key] = 0;
    }
    
    // Count students enrolled by month
    students.forEach(student => {
      const enrollDate = student.fields['Enrollment Date'] || student.fields['Created Date'];
      if (enrollDate) {
        const month = enrollDate.slice(0, 7);
        if (monthCounts[month] !== undefined) {
          monthCounts[month]++;
        }
      }
    });
    
    return Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short' })
    }));
  } catch (error) {
    console.error('Error calculating enrollment trend:', error);
    return [];
  }
}

export async function getAttendanceTrend(schoolId: string, months: number = 3) {
  try {
    const attendance = await getAttendanceRecords(schoolId);
    
    // Group by month and calculate rates
    const monthlyData: Record<string, { present: number; total: number }> = {};
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7);
      monthlyData[key] = { present: 0, total: 0 };
    }
    
    attendance.forEach(record => {
      const date = record.fields.Date;
      if (date) {
        const month = date.slice(0, 7);
        if (monthlyData[month]) {
          monthlyData[month].total++;
          if (record.fields.Status === 'Present') {
            monthlyData[month].present++;
          }
        }
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      label: new Date(month + '-01').toLocaleDateString('en', { month: 'short' })
    }));
  } catch (error) {
    console.error('Error calculating attendance trend:', error);
    return [];
  }
}


