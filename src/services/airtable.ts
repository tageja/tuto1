import Airtable from 'airtable';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || '';

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Table names
export const TABLES = {
  TEACHERS: 'Teachers',
  STUDENTS: 'Students',
  PARENTS: 'Parents',
  BOOKINGS: 'Bookings',
  SUBJECTS: 'Subjects',
  REVIEWS: 'Reviews',
  PAYMENTS: 'Payments',
  HOMEWORK: 'Homework',
} as const;

// Field mappings for each table
export const FIELDS = {
  TEACHERS: {
    ID: 'ID',
    NAME: 'Name',
    EMAIL: 'Email',
    PHONE: 'Phone',
    AVATAR: 'Avatar',
    SUBJECTS: 'Subjects',
    QUALIFICATIONS: 'Qualifications',
    EXPERIENCE: 'Experience',
    HOURLY_RATE: 'Hourly Rate',
    RATING: 'Rating',
    REVIEW_COUNT: 'Review Count',
    LOCATION: 'Location',
    LATITUDE: 'Latitude',
    LONGITUDE: 'Longitude',
    AVAILABILITY: 'Availability',
    LANGUAGES: 'Languages',
    DESCRIPTION: 'Description',
    STATUS: 'Status',
  },
  STUDENTS: {
    ID: 'ID',
    NAME: 'Name',
    AGE: 'Age',
    GRADE: 'Grade',
    PARENT_ID: 'Parent ID',
    SUBJECTS_INTEREST: 'Subjects of Interest',
    ADDRESS: 'Address',
    PHONE: 'Phone',
    EMAIL: 'Email',
    STATUS: 'Status',
  },
  PARENTS: {
    ID: 'ID',
    NAME: 'Name',
    EMAIL: 'Email',
    PHONE: 'Phone',
    ADDRESS: 'Address',
    CHILDREN: 'Children',
    PAYMENT_METHOD: 'Payment Method',
    STATUS: 'Status',
  },
  BOOKINGS: {
    ID: 'ID',
    STUDENT_ID: 'Student ID',
    TEACHER_ID: 'Teacher ID',
    PARENT_ID: 'Parent ID',
    SUBJECT: 'Subject',
    DATE: 'Date',
    TIME: 'Time',
    DURATION: 'Duration',
    STATUS: 'Status',
    NOTES: 'Notes',
    PAYMENT_STATUS: 'Payment Status',
    CREATED_AT: 'Created At',
  },
  SUBJECTS: {
    ID: 'ID',
    NAME: 'Name',
    NAME_VI: 'Name (Vietnamese)',
    ICON: 'Icon',
    CATEGORY: 'Category',
    DESCRIPTION: 'Description',
    STATUS: 'Status',
  },
  REVIEWS: {
    ID: 'ID',
    TEACHER_ID: 'Teacher ID',
    STUDENT_ID: 'Student ID',
    RATING: 'Rating',
    COMMENT: 'Comment',
    CREATED_AT: 'Created At',
  },
  PAYMENTS: {
    ID: 'ID',
    BOOKING_ID: 'Booking ID',
    AMOUNT: 'Amount',
    CURRENCY: 'Currency',
    STATUS: 'Status',
    PAYMENT_METHOD: 'Payment Method',
    CREATED_AT: 'Created At',
  },
  HOMEWORK: {
    ID: 'ID',
    STUDENT_ID: 'Student ID',
    TEACHER_ID: 'Teacher ID',
    SUBJECT: 'Subject',
    TITLE: 'Title',
    DESCRIPTION: 'Description',
    DUE_DATE: 'Due Date',
    STATUS: 'Status',
    ADAPTIVE_LEVEL: 'Adaptive Level',
  },
} as const;

// Generic CRUD operations
export class AirtableService {
  // Create a new record
  static async create(tableName: string, fields: Record<string, any>) {
    try {
      const record = await base(tableName).create([
        {
          fields,
        },
      ]);
      return record[0];
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Get all records from a table
  static async getAll(tableName: string, options?: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    maxRecords?: number;
  }) {
    try {
      let query = base(tableName).select();
      
      if (options?.filterByFormula) {
        query = query.filterByFormula(options.filterByFormula);
      }
      
      if (options?.sort) {
        query = query.sort(options.sort);
      }
      
      if (options?.maxRecords) {
        query = query.maxRecords(options.maxRecords);
      }

      const records = await query.all();
      return records;
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      throw error;
    }
  }

  // Get a single record by ID
  static async getById(tableName: string, recordId: string) {
    try {
      const record = await base(tableName).find(recordId);
      return record;
    } catch (error) {
      console.error(`Error fetching record from ${tableName}:`, error);
      throw error;
    }
  }

  // Update a record
  static async update(tableName: string, recordId: string, fields: Record<string, any>) {
    try {
      const record = await base(tableName).update([
        {
          id: recordId,
          fields,
        },
      ]);
      return record[0];
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Delete a record
  static async delete(tableName: string, recordId: string) {
    try {
      await base(tableName).destroy(recordId);
      return true;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }

  // Teacher-specific operations
  static async getTeachers(options?: {
    filterByFormula?: string;
    maxRecords?: number;
  }) {
    return this.getAll(TABLES.TEACHERS, options);
  }

  static async getTeacherById(teacherId: string) {
    return this.getById(TABLES.TEACHERS, teacherId);
  }

  static async createTeacher(teacherData: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    subjects: string[];
    qualifications: string[];
    experience: number;
    hourlyRate: number;
    location: string;
    latitude?: number;
    longitude?: number;
    availability: string;
    languages: string[];
    description: string;
  }) {
    return this.create(TABLES.TEACHERS, {
      [FIELDS.TEACHERS.NAME]: teacherData.name,
      [FIELDS.TEACHERS.EMAIL]: teacherData.email,
      [FIELDS.TEACHERS.PHONE]: teacherData.phone,
      [FIELDS.TEACHERS.AVATAR]: teacherData.avatar,
      [FIELDS.TEACHERS.SUBJECTS]: teacherData.subjects,
      [FIELDS.TEACHERS.QUALIFICATIONS]: teacherData.qualifications,
      [FIELDS.TEACHERS.EXPERIENCE]: teacherData.experience,
      [FIELDS.TEACHERS.HOURLY_RATE]: teacherData.hourlyRate,
      [FIELDS.TEACHERS.LOCATION]: teacherData.location,
      [FIELDS.TEACHERS.LATITUDE]: teacherData.latitude,
      [FIELDS.TEACHERS.LONGITUDE]: teacherData.longitude,
      [FIELDS.TEACHERS.AVAILABILITY]: teacherData.availability,
      [FIELDS.TEACHERS.LANGUAGES]: teacherData.languages,
      [FIELDS.TEACHERS.DESCRIPTION]: teacherData.description,
      [FIELDS.TEACHERS.RATING]: 0,
      [FIELDS.TEACHERS.REVIEW_COUNT]: 0,
      [FIELDS.TEACHERS.STATUS]: 'Active',
    });
  }

  // Booking-specific operations
  static async createBooking(bookingData: {
    studentId: string;
    teacherId: string;
    parentId: string;
    subject: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
  }) {
    return this.create(TABLES.BOOKINGS, {
      [FIELDS.BOOKINGS.STUDENT_ID]: [bookingData.studentId],
      [FIELDS.BOOKINGS.TEACHER_ID]: [bookingData.teacherId],
      [FIELDS.BOOKINGS.PARENT_ID]: [bookingData.parentId],
      [FIELDS.BOOKINGS.SUBJECT]: bookingData.subject,
      [FIELDS.BOOKINGS.DATE]: bookingData.date,
      [FIELDS.BOOKINGS.TIME]: bookingData.time,
      [FIELDS.BOOKINGS.DURATION]: bookingData.duration,
      [FIELDS.BOOKINGS.NOTES]: bookingData.notes,
      [FIELDS.BOOKINGS.STATUS]: 'Pending',
      [FIELDS.BOOKINGS.PAYMENT_STATUS]: 'Pending',
      [FIELDS.BOOKINGS.CREATED_AT]: new Date().toISOString(),
    });
  }

  static async getBookingsByParent(parentId: string) {
    return this.getAll(TABLES.BOOKINGS, {
      filterByFormula: `{${FIELDS.BOOKINGS.PARENT_ID}} = '${parentId}'`,
    });
  }

  static async getBookingsByTeacher(teacherId: string) {
    return this.getAll(TABLES.BOOKINGS, {
      filterByFormula: `{${FIELDS.BOOKINGS.TEACHER_ID}} = '${teacherId}'`,
    });
  }

  // Student-specific operations
  static async createStudent(studentData: {
    name: string;
    age: number;
    grade: string;
    parentId: string;
    subjectsInterest: string[];
    address: string;
    phone?: string;
    email?: string;
  }) {
    return this.create(TABLES.STUDENTS, {
      [FIELDS.STUDENTS.NAME]: studentData.name,
      [FIELDS.STUDENTS.AGE]: studentData.age,
      [FIELDS.STUDENTS.GRADE]: studentData.grade,
      [FIELDS.STUDENTS.PARENT_ID]: [studentData.parentId],
      [FIELDS.STUDENTS.SUBJECTS_INTEREST]: studentData.subjectsInterest,
      [FIELDS.STUDENTS.ADDRESS]: studentData.address,
      [FIELDS.STUDENTS.PHONE]: studentData.phone,
      [FIELDS.STUDENTS.EMAIL]: studentData.email,
      [FIELDS.STUDENTS.STATUS]: 'Active',
    });
  }

  // Parent-specific operations
  static async createParent(parentData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod?: string;
  }) {
    return this.create(TABLES.PARENTS, {
      [FIELDS.PARENTS.NAME]: parentData.name,
      [FIELDS.PARENTS.EMAIL]: parentData.email,
      [FIELDS.PARENTS.PHONE]: parentData.phone,
      [FIELDS.PARENTS.ADDRESS]: parentData.address,
      [FIELDS.PARENTS.PAYMENT_METHOD]: parentData.paymentMethod,
      [FIELDS.PARENTS.STATUS]: 'Active',
    });
  }

  // Review-specific operations
  static async createReview(reviewData: {
    teacherId: string;
    studentId: string;
    rating: number;
    comment: string;
  }) {
    const review = await this.create(TABLES.REVIEWS, {
      [FIELDS.REVIEWS.TEACHER_ID]: [reviewData.teacherId],
      [FIELDS.REVIEWS.STUDENT_ID]: [reviewData.studentId],
      [FIELDS.REVIEWS.RATING]: reviewData.rating,
      [FIELDS.REVIEWS.COMMENT]: reviewData.comment,
      [FIELDS.REVIEWS.CREATED_AT]: new Date().toISOString(),
    });

    // Update teacher's average rating
    await this.updateTeacherRating(reviewData.teacherId);

    return review;
  }

  // Update teacher's average rating
  static async updateTeacherRating(teacherId: string) {
    try {
      const reviews = await this.getAll(TABLES.REVIEWS, {
        filterByFormula: `{${FIELDS.REVIEWS.TEACHER_ID}} = '${teacherId}'`,
      });

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => {
          return sum + (review.get(FIELDS.REVIEWS.RATING) as number);
        }, 0);
        const averageRating = totalRating / reviews.length;

        await this.update(TABLES.TEACHERS, teacherId, {
          [FIELDS.TEACHERS.RATING]: averageRating,
          [FIELDS.TEACHERS.REVIEW_COUNT]: reviews.length,
        });
      }
    } catch (error) {
      console.error('Error updating teacher rating:', error);
    }
  }
}

export default AirtableService; 