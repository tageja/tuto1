import Airtable from 'airtable'

export interface AirtableRecord {
  id: string
  fields: Record<string, any>
}

// Lazy initialization to avoid runtime errors during deployment
let _airtableBase: ReturnType<Airtable['base']> | null = null

function getAirtable() {
  if (!_airtableBase) {
    if (!process.env.AIRTABLE_PAT) {
      throw new Error('AIRTABLE_PAT environment variable is not set')
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID environment variable is not set')
    }
    _airtableBase = new Airtable({
      apiKey: process.env.AIRTABLE_PAT
    }).base(process.env.AIRTABLE_BASE_ID)
  }
  return _airtableBase
}

export const airtableService = {
  // ═══════════════════════════════════════════════════════════════════════
  // TEACHERS - School Dashboard
  // ═══════════════════════════════════════════════════════════════════════
  
  async getSchoolTeachers(
    schoolId: string,
    filters?: {
      status?: string
      subject?: string
      q?: string
      page?: number
      limit?: number
      parentEmail?: string // For parent filtering
    }
  ): Promise<{ records: AirtableRecord[], total: number, hasMore: boolean }> {
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    // If parent email provided, filter by children's classes
    let teacherNames: string[] | null = null
    if (filters?.parentEmail) {
      try {
        // Get student's classes taught by teachers
        const students = await getAirtable()('TutoSchoolStudents')
          .select({
            filterByFormula: `AND({School Name} = "${schoolId}", {Parent Email} = "${filters.parentEmail}")`,
            fields: ['Class Name']
          })
          .all()

        if (students.length > 0) {
          const classNames = [...new Set(students.map(s => s.fields['Class Name']).filter(Boolean))]
          
          if (classNames.length > 0) {
            // Get teachers for these classes
            // Note: This assumes there's a way to link teachers to classes
            // For now, we'll return all active teachers as a fallback
            teacherNames = [] // Will be populated when class-teacher linking is implemented
          }
        } else {
          // No students found for this parent
          return {
            records: [],
            total: 0,
            hasMore: false
          }
        }
      } catch (error) {
        console.error('Error filtering teachers by parent:', error)
        // Fallback to showing all active teachers
      }
    }

    // Build filter formula
    const filterParts: string[] = [`{School Name} = "${schoolId}"`]
    
    if (filters?.status) {
      filterParts.push(`{Status} = "${filters.status}"`)
    }
    
    if (filters?.subject) {
      filterParts.push(`FIND("${filters.subject}", {Subjects})`)
    }
    
    if (filters?.q) {
      filterParts.push(`SEARCH(LOWER("${filters.q}"), LOWER({Teacher Name}))`)
    }

    // If parent filtering resulted in specific teacher names, add that constraint
    if (teacherNames && teacherNames.length > 0) {
      const teacherNamesFilter = teacherNames.map(name => `{Teacher Name} = "${name}"`).join(', ')
      filterParts.push(`OR(${teacherNamesFilter})`)
    }

    const filterFormula = filterParts.length > 1
      ? `AND(${filterParts.join(', ')})`
      : filterParts[0]

    const records = await getAirtable()('TutoSchoolTeachers')
      .select({
        filterByFormula: filterFormula,
        maxRecords: limit + 1, // Fetch one extra to check if there are more
        sort: [{ field: 'Teacher Name', direction: 'asc' }]
      })
      .all() as any[]

    const hasMore = records.length > limit
    const resultRecords = records.slice(0, limit)

    return {
      records: resultRecords.map((record: any) => ({
        id: record.id as string,
        fields: record.fields as Record<string, any>
      })),
      total: resultRecords.length, // Note: Airtable doesn't provide total count easily
      hasMore
    }
  },

  async getSchoolTeacherById(teacherId: string): Promise<AirtableRecord | null> {
    try {
      const record = await getAirtable()('TutoSchoolTeachers').find(teacherId) as any
      return {
        id: record.id as string,
        fields: record.fields as Record<string, any>
      }
    } catch (error) {
      return null
    }
  },

  async createSchoolTeacher(data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoSchoolTeachers').create({
      ...data,
      'Created Date': new Date().toISOString().split('T')[0],
      Status: data.Status || 'Active'
    }) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  async updateSchoolTeacher(id: string, data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoSchoolTeachers').update(id, data) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  async getTeacherAttendance(
    teacherName: string,
    schoolId: string,
    days?: number
  ): Promise<AirtableRecord[]> {
    const daysAgo = days || 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString().split('T')[0]

    const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", IS_AFTER({Date}, "${startDateStr}"))`

    const records = await getAirtable()('TutoSchoolTeacherAttendance')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'Date', direction: 'desc' }]
      })
      .all()
      .catch(() => []) as any[]

    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async getTeacherFeedback(
    teacherName: string,
    schoolId: string,
    limit?: number
  ): Promise<AirtableRecord[]> {
    const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", {Status} = "Active")`

    const records = await getAirtable()('TutoSchoolFeedback')
      .select({
        filterByFormula: filterFormula,
        maxRecords: limit || 50,
        sort: [{ field: 'Created At', direction: 'desc' }]
      })
      .all()
      .catch(() => []) as any[]

    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async getTeachingHours(
    teacherName: string,
    schoolId: string,
    weeks?: number
  ): Promise<AirtableRecord[]> {
    const weeksAgo = weeks || 12
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (weeksAgo * 7))
    const startDateStr = startDate.toISOString().split('T')[0]

    const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", IS_AFTER({Week Of}, "${startDateStr}"))`

    const records = await getAirtable()('TutoSchoolTeachingHours')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'Week Of', direction: 'desc' }]
      })
      .all()
      .catch(() => []) as any[]

    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async getTeacherKPIs(schoolId: string): Promise<{
    total: number
    active: number
    onLeave: number
    avgRating: number
  }> {
    const records = await getAirtable()('TutoSchoolTeachers')
      .select({
        filterByFormula: `{School Name} = "${schoolId}"`,
        fields: ['Status', 'Rating']
      })
      .all() as any[]

    const total = records.length
    const active = records.filter((r: any) => r.fields.Status === 'Active').length
    const onLeave = records.filter((r: any) => r.fields.Status === 'On Leave').length
    
    const ratingsArr = records
      .map((r: any) => r.fields.Rating as number)
      .filter((r: number) => typeof r === 'number' && r > 0)
    
    const avgRating = ratingsArr.length > 0
      ? ratingsArr.reduce((sum: number, r: number) => sum + r, 0) / ratingsArr.length
      : 0

    return {
      total,
      active,
      onLeave,
      avgRating: Math.round(avgRating * 10) / 10
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LEGACY TEACHERS (for backward compatibility)
  // ═══════════════════════════════════════════════════════════════════════
  
  async getTeachers(schoolId: string): Promise<AirtableRecord[]> {
    const records = await getAirtable()('TutoTeachers')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async createTeacher(data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoTeachers').create(data) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  async updateTeacher(id: string, data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoTeachers').update(id, data) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLASSES - School Dashboard
  // ═══════════════════════════════════════════════════════════════════════

  async getSchoolClasses(schoolId: string, filters?: { grade?: string; search?: string }): Promise<AirtableRecord[]> {
    const filterParts: string[] = [`{School Name} = "${schoolId}"`]
    
    if (filters?.grade) {
      filterParts.push(`{Grade Level} = "${filters.grade}"`)
    }
    if (filters?.search) {
      filterParts.push(`SEARCH(LOWER("${filters.search}"), LOWER({Class Name}))`)
    }

    const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0]

    const records = await getAirtable()('TutoSchoolClasses')
      .select({ filterByFormula: filterFormula })
      .all() as any[]

    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async getSchoolClassById(classId: string): Promise<AirtableRecord | null> {
    try {
      const record = await getAirtable()('TutoSchoolClasses').find(classId) as any
      return {
        id: record.id as string,
        fields: record.fields as Record<string, any>
      }
    } catch (error) {
      return null
    }
  },

  async getDistinctGrades(schoolId: string): Promise<string[]> {
    try {
      const records = await getAirtable()('TutoSchoolClasses')
        .select({
          filterByFormula: `{School Name} = "${schoolId}"`,
          fields: ['Grade Level']
        })
        .all() as any[]

      const grades = new Set<string>()
      records.forEach((record: any) => {
        const grade = record.fields['Grade Level']
        if (grade) grades.add(grade)
      })

      return Array.from(grades).sort()
    } catch (error) {
      return []
    }
  },

  async getAttendanceRecords(schoolId: string, filters?: { className?: string; date?: string; startDate?: string }): Promise<AirtableRecord[]> {
    const filterParts: string[] = [`{School Name} = "${schoolId}"`]
    
    if (filters?.className) {
      filterParts.push(`{Class Name} = "${filters.className}"`)
    }
    if (filters?.date) {
      filterParts.push(`{Date} = "${filters.date}"`)
    }
    if (filters?.startDate) {
      filterParts.push(`IS_AFTER({Date}, "${filters.startDate}")`)
    }

    const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0]

    try {
      const records = await getAirtable()('TutoAttendanceRecords')
        .select({ filterByFormula: filterFormula })
        .all() as any[]

      return records.map((record: any) => ({
        id: record.id as string,
        fields: record.fields as Record<string, any>
      }))
    } catch (error) {
      return []
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STUDENTS - School Dashboard  
  // ═══════════════════════════════════════════════════════════════════════

  async getSchoolStudents(schoolId: string, filters?: { className?: string; classId?: string; grade?: string }): Promise<AirtableRecord[]> {
    const filterParts: string[] = [`{School Name} = "${schoolId}"`]
    
    if (filters?.className) {
      filterParts.push(`{Class Name} = "${filters.className}"`)
    }
    if (filters?.classId) {
      filterParts.push(`{Class Name} = "${filters.classId}"`)
    }
    if (filters?.grade) {
      filterParts.push(`{Grade Level} = "${filters.grade}"`)
    }

    const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0]

    const records = await getAirtable()('TutoSchoolStudents')
      .select({
        filterByFormula: filterFormula
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async getSchoolStudentById(studentId: string): Promise<AirtableRecord | null> {
    try {
      const record = await getAirtable()('TutoSchoolStudents').find(studentId) as any
      return {
        id: record.id as string,
        fields: record.fields as Record<string, any>
      }
    } catch (error) {
      return null
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LEGACY STUDENTS (for backward compatibility)
  // ═══════════════════════════════════════════════════════════════════════

  async getStudents(schoolId: string): Promise<AirtableRecord[]> {
    const records = await getAirtable()('TutoStudents')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async createStudent(data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoStudents').create(data) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  async updateStudent(id: string, data: any): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoStudents').update(id, data) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  // Bookings
  async getBookings(schoolId: string, status?: string): Promise<AirtableRecord[]> {
    let filterFormula = `{School ID} = "${schoolId}"`
    if (status) {
      filterFormula += ` AND {Status} = "${status}"`
    }
    
    const records = await getAirtable()('TutoBookings')
      .select({
        filterByFormula: filterFormula
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async updateBookingStatus(id: string, status: string): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoBookings').update(id, { Status: status }) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  // Reviews
  async getReviews(schoolId: string, status?: string): Promise<AirtableRecord[]> {
    let filterFormula = `{School ID} = "${schoolId}"`
    if (status) {
      filterFormula += ` AND {Status} = "${status}"`
    }
    
    const records = await getAirtable()('TutoReviews')
      .select({
        filterByFormula: filterFormula
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  },

  async updateReviewStatus(id: string, status: string): Promise<AirtableRecord> {
    const record = await getAirtable()('TutoReviews').update(id, { Status: status }) as any
    return {
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }
  },

  // Payments
  async getPayments(schoolId: string): Promise<AirtableRecord[]> {
    const records = await getAirtable()('TutoPayments')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all() as any[]
    
    return records.map((record: any) => ({
      id: record.id as string,
      fields: record.fields as Record<string, any>
    }))
  }
}


