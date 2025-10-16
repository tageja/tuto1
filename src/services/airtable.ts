// Airtable now proxied via Firebase Functions (no direct client secrets)
import { Backend } from './backend';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type QueryParams = Record<string, string | number | boolean | undefined> | undefined;

interface AirtableRestRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}

// Wrap REST records to mimic Airtable SDK's Record API: record.get(fieldName)
class WrappedRecord {
  id: string;
  private readonly fields: Record<string, any>;
  createdTime?: string;

  constructor(record: AirtableRestRecord) {
    this.id = record.id;
    this.fields = record.fields || {};
    this.createdTime = record.createdTime;
  }

  // Align with SDK-style accessor used throughout the app
  get(fieldName: string): any {
    return this.fields[fieldName];
  }

  // Get all fields for compatibility with generic CRUD methods
  getAllFields(): Record<string, any> {
    return { ...this.fields };
  }
}

const buildQueryString = (params: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

// request is delegated to Backend service (Firebase Functions HTTPS)
async function request<T = any>(
  path: string,
  options?: {
    method?: HttpMethod;
    query?: QueryParams;
    body?: unknown;
  },
): Promise<T> {
  // translate path/query to Backend calls
  const parts = path.split('/').filter(Boolean); // [table, id?]
  const table = decodeURIComponent(parts[0] || '');
  const id = parts[1] ? decodeURIComponent(parts[1]) : undefined;
  const method = options?.method || 'GET';
  if (method === 'GET' && !id) {
    const sortParam = (options?.query as any)?.sort; // already encoded by caller logic
    const sortArray = undefined; // handled in specific getAll call below
    return (await Backend.list<any>(table, options?.query as any)) as unknown as T;
  }
  if (method === 'GET' && id) {
    return (await Backend.get<any>(table, id)) as unknown as T;
  }
  if (method === 'POST') {
    return (await Backend.create<any>(table, (options?.body as any)?.fields || {})) as unknown as T;
  }
  if (method === 'PATCH' && id) {
    return (await Backend.update<any>(table, id, (options?.body as any)?.fields || {})) as unknown as T;
  }
  if (method === 'DELETE' && id) {
    await Backend.remove(table, id);
    return {} as T;
  }
  throw new Error('Unsupported request');
}

// Table names
export const TABLES = {
  TEACHERS: 'TutoTeachers',
  STUDENTS: 'TutoStudents',
  PARENTS: 'TutoParents',
  BOOKINGS: 'TutoBookings',
  SUBJECTS: 'TutoSubjects',
  REVIEWS: 'TutoReviews',
  PAYMENTS: 'TutoPayments',
  HOMEWORK: 'TutoHomework',
  POSTS: 'TutoPosts',
  COMMENTS: 'TutoComments',
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
    PASSWORD_HASH: 'Password Hash',
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
    CREATED_AT: 'Created At',
  },
  POSTS: {
    ID: 'ID',
    AUTHOR_ID: 'Author ID',
    AUTHOR_NAME: 'Author Name',
    AUTHOR_ROLE: 'Author Role',
    AUTHOR_AVATAR: 'Author Avatar',
    CONTENT_TEXT: 'Content Text',
    CONTENT_MEDIA_TYPE: 'Content Media Type',
    CONTENT_MEDIA_URL: 'Content Media URL',
    CONTENT_MEDIA_THUMBNAIL: 'Content Media Thumbnail',
    POST_TYPE: 'Post Type',
    SUBJECTS: 'Subjects',
    TIMESTAMP: 'Timestamp',
    LIKES_COUNT: 'Likes Count',
    COMMENTS_COUNT: 'Comments Count',
    SHARES_COUNT: 'Shares Count',
    SAVES_COUNT: 'Saves Count',

    IS_LIKED: 'Is Liked',
    IS_SAVED: 'Is Saved',
    PRIVACY: 'Privacy',
    CREATED_AT: 'Created At',
  },
  COMMENTS: {
    ID: 'ID',
    POST_ID: 'Post ID',
    AUTHOR_ID: 'Author ID',
    AUTHOR_NAME: 'Author Name',
    CONTENT: 'Content',
    CREATED_AT: 'Created At',
  },
} as const;

// Generic CRUD operations
export class AirtableService {
  // Create a new record via REST
  static async create(tableName: string, fields: Record<string, any>) {
    try {
      const data = await request<AirtableRestRecord>(`/${encodeURIComponent(tableName)}`, {
        method: 'POST',
        body: { fields },
      });
      return new WrappedRecord(data);
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Get all records from a table
  static async getAll(
    tableName: string,
    options?: {
      filterByFormula?: string;
      sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      maxRecords?: number;
    },
  ) {
    try {
      const query: Record<string, string> = {};
      if (options?.filterByFormula) {
        query.filterByFormula = options.filterByFormula;
      }
      if (options?.maxRecords) {
        query.maxRecords = String(options.maxRecords);
      }
      if (options?.sort && options.sort.length > 0) {
        // Functions API expects JSON in `sort` param
        (query as any).sort = JSON.stringify(options.sort);
      }

      const all: AirtableRestRecord[] = [];
      let offset: string | undefined = undefined;
      do {
        const page = await Backend.list<AirtableRestRecord>(tableName, { ...(query as any), offset });
        if (page.records) all.push(...page.records);
        offset = (page as any).offset as string | undefined;
      } while (offset);
      return all.map((r) => new WrappedRecord(r));
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      throw error;
    }
  }

  // Get a single record by ID
  static async getById(tableName: string, recordId: string) {
    try {
      const data = await Backend.get<AirtableRestRecord>(tableName, recordId);
      return new WrappedRecord(data);
    } catch (error) {
      console.error(`Error fetching record from ${tableName}:`, error);
      throw error;
    }
  }

  // Update a record
  static async update(tableName: string, recordId: string, fields: Record<string, any>) {
    try {
      const data = await Backend.update<AirtableRestRecord>(tableName, recordId, fields);
      return new WrappedRecord(data);
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Delete a record
  static async delete(tableName: string, recordId: string) {
    try {
      await Backend.remove(tableName, recordId);
      return true;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }

  // Alias for getAll to match useAirtable hook expectations
  static async list(tableName: string, options?: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    maxRecords?: number;
  }) {
    return this.getAll(tableName, options);
  }

  // Alias for delete to match useAirtable hook expectations
  static async remove(tableName: string, recordId: string) {
    return this.delete(tableName, recordId);
  }

  // Teacher-specific operations
  static async getTeachers(options?: {
    filterByFormula?: string;
    maxRecords?: number;
  }) {
    return this.getAll(TABLES.TEACHERS, options);
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
      filterByFormula: `FIND('${parentId}', ARRAYJOIN({${FIELDS.BOOKINGS.PARENT_ID}})) > 0`,
    });
  }

  static async getBookingsByTeacher(teacherId: string) {
    return this.getAll(TABLES.BOOKINGS, {
      filterByFormula: `FIND('${teacherId}', ARRAYJOIN({${FIELDS.BOOKINGS.TEACHER_ID}})) > 0`,
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
    passwordHash?: string;
  }) {
    const fields: Record<string, any> = {
      [FIELDS.PARENTS.NAME]: parentData.name,
      [FIELDS.PARENTS.EMAIL]: parentData.email,
      [FIELDS.PARENTS.PHONE]: parentData.phone,
      [FIELDS.PARENTS.ADDRESS]: parentData.address,
      [FIELDS.PARENTS.PAYMENT_METHOD]: parentData.paymentMethod,
      [FIELDS.PARENTS.STATUS]: 'Active',
    };
    if (parentData.passwordHash) {
      fields[FIELDS.PARENTS.PASSWORD_HASH] = parentData.passwordHash;
    }
    return this.create(TABLES.PARENTS, fields);
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

  // Posts-specific operations
  static async getPosts(options?: {
    filterByFormula?: string;
    maxRecords?: number;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  }) {
    console.log('[AirtableService] getPosts called with options:', options);
    const records = await this.getAll(TABLES.POSTS, options);
    console.log('[AirtableService] getPosts returned records:', records.length);
    
    // Log each record's media data
    records.forEach((record, index) => {
      const mediaType = record.get('Content Media Type');
      const mediaUrl = record.get('Content Media URL');
      const mediaThumbnail = record.get('Content Media Thumbnail');
      
      console.log(`[AirtableService] Record ${index + 1} (${record.id}):`);
      console.log(`  - Media Type: ${mediaType}`);
      console.log(`  - Media URL: ${mediaUrl}`);
      console.log(`  - Media Thumbnail: ${mediaThumbnail}`);
    });
    
    return records;
  }

  static async createPost(postData: {
    authorId: string;
    authorName: string;
    authorRole: string;
    authorAvatar: string;
    contentText: string;
    contentMediaType?: string;
    contentMediaUrl?: string;
    contentMediaThumbnail?: string;
    postType: string;
    subjects: string[];
    privacy: string;
  }) {
    return this.create(TABLES.POSTS, {
      [FIELDS.POSTS.AUTHOR_ID]: postData.authorId,
      [FIELDS.POSTS.AUTHOR_NAME]: postData.authorName,
      [FIELDS.POSTS.AUTHOR_ROLE]: postData.authorRole,
      [FIELDS.POSTS.AUTHOR_AVATAR]: postData.authorAvatar,
      [FIELDS.POSTS.CONTENT_TEXT]: postData.contentText,
      [FIELDS.POSTS.CONTENT_MEDIA_TYPE]: postData.contentMediaType,
      [FIELDS.POSTS.CONTENT_MEDIA_URL]: postData.contentMediaUrl,
      [FIELDS.POSTS.CONTENT_MEDIA_THUMBNAIL]: postData.contentMediaThumbnail,
      [FIELDS.POSTS.POST_TYPE]: postData.postType,
      [FIELDS.POSTS.SUBJECTS]: postData.subjects,
      [FIELDS.POSTS.TIMESTAMP]: new Date().toISOString(),
      [FIELDS.POSTS.LIKES_COUNT]: 0,
      [FIELDS.POSTS.COMMENTS_COUNT]: 0,
      [FIELDS.POSTS.SHARES_COUNT]: 0,
      [FIELDS.POSTS.SAVES_COUNT]: 0,
      [FIELDS.POSTS.PRIVACY]: postData.privacy,
      // Some fields like Created At / Is Liked / Is Saved are not present in Airtable; avoid sending
    });
  }

  // Post interactions - client-side like tracking with server count sync
  static async setPostLike(postId: string, like: boolean, userId: string = 'current-user-id') {
    try {
      console.log(`[${new Date().toISOString()}] [LIKE] Starting setPostLike: postId=${postId}, like=${like}, userId=${userId}`);
      
      // Fetch current values
      const rec = await this.getById(TABLES.POSTS, postId);
      const currentLikes = (rec.get(FIELDS.POSTS.LIKES_COUNT) as number) || 0;
      
      // Client-side tracking: store user like state in memory
      const userLikes = (globalThis as any).__userLikes || new Map();
      (globalThis as any).__userLikes = userLikes;
      
      const postUserLikes = userLikes.get(postId) || new Set();
      const userHasLiked = postUserLikes.has(userId);
      
      console.log(`[${new Date().toISOString()}] [LIKE] Current state: likes=${currentLikes}, userHasLiked=${userHasLiked}`);
      
      let nextLikes = currentLikes;
      let shouldUpdate = false;
      
      if (like && !userHasLiked) {
        // Add like
        postUserLikes.add(userId);
        userLikes.set(postId, postUserLikes);
        nextLikes = currentLikes + 1;
        shouldUpdate = true;
        console.log(`[${new Date().toISOString()}] [LIKE] Adding like: ${currentLikes} -> ${nextLikes} (user ${userId})`);
      } else if (!like && userHasLiked) {
        // Remove like
        postUserLikes.delete(userId);
        userLikes.set(postId, postUserLikes);
        nextLikes = Math.max(0, currentLikes - 1);
        shouldUpdate = true;
        console.log(`[${new Date().toISOString()}] [LIKE] Removing like: ${currentLikes} -> ${nextLikes} (user ${userId})`);
      } else {
        console.log(`[${new Date().toISOString()}] [LIKE] No change needed: like=${like}, userHasLiked=${userHasLiked}`);
        return new WrappedRecord(rec as any);
      }
      
      if (!shouldUpdate) {
        return new WrappedRecord(rec as any);
      }
      
      // Only update the count, not the global IS_LIKED field
      const updateData = {
        [FIELDS.POSTS.LIKES_COUNT]: nextLikes,
      };
      
      console.log(`[${new Date().toISOString()}] [LIKE] Updating with data:`, updateData);
      const updated = await this.update(TABLES.POSTS, postId, updateData);
      console.log(`[${new Date().toISOString()}] [LIKE] Update successful`);
      return new WrappedRecord(updated as any);
    } catch (error) {
      console.error('[LIKE] Error updating post like:', error);
      throw error;
    }
  }

  static async setPostSave(postId: string, save: boolean) {
    try {
      const rec = await this.getById(TABLES.POSTS, postId);
      const currentSaves = (rec.get(FIELDS.POSTS.SAVES_COUNT) as number) || 0;
      const nextSaves = Math.max(0, currentSaves + (save ? 1 : -1));
      const updated = await this.update(TABLES.POSTS, postId, {
        [FIELDS.POSTS.SAVES_COUNT]: nextSaves,
        [FIELDS.POSTS.IS_SAVED]: save,
      });
      return new WrappedRecord(updated as any);
    } catch (error) {
      console.error('Error updating post save:', error);
      throw error;
    }
  }

  // Comment operations - with fallback for missing table
  static async createComment(commentData: {
    postId: string;
    authorId: string;
    authorName: string;
    content: string;
  }) {
    try {
      console.log(`[${new Date().toISOString()}] [COMMENT] Creating comment in Airtable:`, commentData);
      
      try {
        // Try to create the comment record
        const commentRecord = await this.create(TABLES.COMMENTS, {
          [FIELDS.COMMENTS.POST_ID]: commentData.postId,
          [FIELDS.COMMENTS.AUTHOR_ID]: commentData.authorId,
          [FIELDS.COMMENTS.AUTHOR_NAME]: commentData.authorName,
          [FIELDS.COMMENTS.CONTENT]: commentData.content,
          [FIELDS.COMMENTS.CREATED_AT]: new Date().toISOString(),
        });

        console.log(`[${new Date().toISOString()}] [COMMENT] Comment created successfully:`, commentRecord.id);
        
        // Increment the comment count on the post
        await this.incrementPostComments(commentData.postId, 1);
        
        return new WrappedRecord(commentRecord as any);
      } catch (tableError) {
        console.warn(`[${new Date().toISOString()}] [COMMENT] Comments table doesn't exist, storing in memory:`, tableError);
        
        // Fallback: store in memory and just increment counter
        const memoryComments = (globalThis as any).__memoryComments || new Map();
        (globalThis as any).__memoryComments = memoryComments;
        
        const postComments = memoryComments.get(commentData.postId) || [];
        const newComment = {
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...commentData,
          createdAt: new Date().toISOString(),
        };
        postComments.push(newComment);
        memoryComments.set(commentData.postId, postComments);
        
        // Still increment the post counter
        await this.incrementPostComments(commentData.postId, 1);
        
        console.log(`[${new Date().toISOString()}] [COMMENT] Comment stored in memory:`, newComment.id);
        return new WrappedRecord({ id: newComment.id, fields: newComment } as any);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  static async getPostComments(postId: string) {
    try {
      console.log(`[${new Date().toISOString()}] [COMMENT] Fetching comments for post:`, postId);
      
      try {
        // Try to fetch from Airtable
        const records = await this.getAll(TABLES.COMMENTS, {
          filterByFormula: `{${FIELDS.COMMENTS.POST_ID}} = "${postId}"`,
          sort: [{ field: FIELDS.COMMENTS.CREATED_AT, direction: 'desc' }],
        });
        
        console.log(`[${new Date().toISOString()}] [COMMENT] Found ${records.length} comments from Airtable`);
        return records.map(record => new WrappedRecord(record as any));
      } catch (tableError) {
        console.warn(`[${new Date().toISOString()}] [COMMENT] Comments table doesn't exist, using memory storage`);
        
        // Fallback: get from memory
        const memoryComments = (globalThis as any).__memoryComments || new Map();
        const postComments = memoryComments.get(postId) || [];
        
        console.log(`[${new Date().toISOString()}] [COMMENT] Found ${postComments.length} comments from memory`);
        return postComments.map((comment: any) => new WrappedRecord({ id: comment.id, fields: comment } as any));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  static async incrementPostComments(postId: string, delta: number = 1) {
    try {
      const rec = await this.getById(TABLES.POSTS, postId);
      const current = (rec.get(FIELDS.POSTS.COMMENTS_COUNT) as number) || 0;
      const next = Math.max(0, current + delta);
      const updated = await this.update(TABLES.POSTS, postId, {
        [FIELDS.POSTS.COMMENTS_COUNT]: next,
      });
      return new WrappedRecord(updated as any);
    } catch (error) {
      console.error('Error updating post comments:', error);
      throw error;
    }
  }

  // Subjects-specific operations
  static async getSubjects(options?: {
    filterByFormula?: string;
    maxRecords?: number;
  }) {
    return this.getAll(TABLES.SUBJECTS, options);
  }

  static async getSubjectsByCategory(category: string) {
    return this.getAll(TABLES.SUBJECTS, {
      filterByFormula: `{${FIELDS.SUBJECTS.CATEGORY}} = '${category}'`,
    });
  }

  // Get all bookings for a user (parent or teacher)
  static async getBookings(userId: string, userType: 'parent' | 'teacher') {
    if (userType === 'parent') {
      return this.getBookingsByParent(userId);
    } else if (userType === 'teacher') {
      return this.getBookingsByTeacher(userId);
    }
    return [];
  }

  // Get teacher by ID with full details
  static async getTeacherById(teacherId: string) {
    try {
      const record = await this.getById(TABLES.TEACHERS, teacherId);
      if (!record) return null;

      return {
        id: record.id,
        name: record.get(FIELDS.TEACHERS.NAME) as string,
        email: record.get(FIELDS.TEACHERS.EMAIL) as string,
        phone: record.get(FIELDS.TEACHERS.PHONE) as string,
        avatar: record.get(FIELDS.TEACHERS.AVATAR) as string,
        subjects: (record.get(FIELDS.TEACHERS.SUBJECTS) as string[]) || [],
        qualifications: (record.get(FIELDS.TEACHERS.QUALIFICATIONS) as string[]) || [],
        experience: (record.get(FIELDS.TEACHERS.EXPERIENCE) as number) || 0,
        hourlyRate: (record.get(FIELDS.TEACHERS.HOURLY_RATE) as number) || 0,
        rating: (record.get(FIELDS.TEACHERS.RATING) as number) || 0,
        reviewCount: (record.get(FIELDS.TEACHERS.REVIEW_COUNT) as number) || 0,
        location: {
          address: record.get(FIELDS.TEACHERS.LOCATION) as string,
          latitude: record.get(FIELDS.TEACHERS.LATITUDE) as number,
          longitude: record.get(FIELDS.TEACHERS.LONGITUDE) as number,
        },
        availability: {
          days: [],
          timeSlots: [],
        },
        description: record.get(FIELDS.TEACHERS.DESCRIPTION) as string,
        languages: (record.get(FIELDS.TEACHERS.LANGUAGES) as string[]) || [],
      };
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
      return null;
    }
  }
}

export default AirtableService; 