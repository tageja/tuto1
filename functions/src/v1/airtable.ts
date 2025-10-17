import Airtable from 'airtable'

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID!)

export interface AirtableRecord {
  id: string
  fields: Record<string, any>
}

export const airtableService = {
  // Teachers
  async getTeachers(schoolId: string): Promise<AirtableRecord[]> {
    const records = await airtable('TutoTeachers')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all()
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields
    }))
  },

  async createTeacher(data: any): Promise<AirtableRecord> {
    const record = await airtable('TutoTeachers').create(data)
    return {
      id: record.id,
      fields: record.fields
    }
  },

  async updateTeacher(id: string, data: any): Promise<AirtableRecord> {
    const record = await airtable('TutoTeachers').update(id, data)
    return {
      id: record.id,
      fields: record.fields
    }
  },

  // Students
  async getStudents(schoolId: string): Promise<AirtableRecord[]> {
    const records = await airtable('TutoStudents')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all()
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields
    }))
  },

  async createStudent(data: any): Promise<AirtableRecord> {
    const record = await airtable('TutoStudents').create(data)
    return {
      id: record.id,
      fields: record.fields
    }
  },

  async updateStudent(id: string, data: any): Promise<AirtableRecord> {
    const record = await airtable('TutoStudents').update(id, data)
    return {
      id: record.id,
      fields: record.fields
    }
  },

  // Bookings
  async getBookings(schoolId: string, status?: string): Promise<AirtableRecord[]> {
    let filterFormula = `{School ID} = "${schoolId}"`
    if (status) {
      filterFormula += ` AND {Status} = "${status}"`
    }
    
    const records = await airtable('TutoBookings')
      .select({
        filterByFormula: filterFormula
      })
      .all()
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields
    }))
  },

  async updateBookingStatus(id: string, status: string): Promise<AirtableRecord> {
    const record = await airtable('TutoBookings').update(id, { Status: status })
    return {
      id: record.id,
      fields: record.fields
    }
  },

  // Reviews
  async getReviews(schoolId: string, status?: string): Promise<AirtableRecord[]> {
    let filterFormula = `{School ID} = "${schoolId}"`
    if (status) {
      filterFormula += ` AND {Status} = "${status}"`
    }
    
    const records = await airtable('TutoReviews')
      .select({
        filterByFormula: filterFormula
      })
      .all()
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields
    }))
  },

  async updateReviewStatus(id: string, status: string): Promise<AirtableRecord> {
    const record = await airtable('TutoReviews').update(id, { Status: status })
    return {
      id: record.id,
      fields: record.fields
    }
  },

  // Payments
  async getPayments(schoolId: string): Promise<AirtableRecord[]> {
    const records = await airtable('TutoPayments')
      .select({
        filterByFormula: `{School ID} = "${schoolId}"`
      })
      .all()
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields
    }))
  }
}


