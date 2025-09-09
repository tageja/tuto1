import { useState, useCallback } from 'react';
import AirtableService, { TABLES, FIELDS } from '../services/airtable';
import { Teacher, Student, Parent, Booking, Review } from '../types';
import { subjects as SUBJECTS } from '../data/subjects';
import { sha256 } from 'js-sha256';
import { useUser } from '../contexts/UserContext';

export const useAirtable = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useUser();

  // Teachers
  const getTeachers = useCallback(async (options?: {
    filterByFormula?: string;
    maxRecords?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getTeachers(options);
      return records.map(record => ({
        id: record.id,
        name: record.get(FIELDS.TEACHERS.NAME) as string,
        avatar: record.get(FIELDS.TEACHERS.AVATAR) as string,
        subjects: record.get(FIELDS.TEACHERS.SUBJECTS) as string[] || [],
        qualifications: record.get(FIELDS.TEACHERS.QUALIFICATIONS) as string[] || [],
        experience: record.get(FIELDS.TEACHERS.EXPERIENCE) as number || 0,
        hourlyRate: record.get(FIELDS.TEACHERS.HOURLY_RATE) as number || 0,
        rating: record.get(FIELDS.TEACHERS.RATING) as number || 0,
        reviewCount: record.get(FIELDS.TEACHERS.REVIEW_COUNT) as number || 0,
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
        languages: record.get(FIELDS.TEACHERS.LANGUAGES) as string[] || [],
      } as Teacher));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachersBySubject = useCallback(async (subjectKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const filterByFormula = `FIND("${subjectKey}", ARRAYJOIN({${FIELDS.TEACHERS.SUBJECTS}})) > 0`;
      const teachers = await getTeachers({ filterByFormula });
      return teachers;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers by subject');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getTeachers]);

  const createTeacher = useCallback(async (teacherData: {
    name: string;
    email: string;
    phone?: string;
    imageUrl?: string;
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
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createTeacher({
        ...teacherData,
        avatar: teacherData.imageUrl,
      } as any);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create teacher');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (studentData: {
    name: string;
    age: number;
    grade: string;
    parentId: string;
    subjectsInterest: string[];
    address: string;
    phone?: string;
    email?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createStudent(studentData);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createParent = useCallback(async (parentData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod?: string;
    password?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createParent({
        ...parentData,
        // Always store hash on creation
        passwordHash: parentData.password ? sha256(parentData.password) : undefined,
      } as any);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const hash = sha256(password);
      // Normalize email and perform case-insensitive match in Airtable
      const normalizedEmail = email.trim().toLowerCase();
      const filterByFormula = `LOWER({${FIELDS.PARENTS.EMAIL}}) = '${normalizedEmail}'`;
      const records = await AirtableService.getAll(TABLES.PARENTS, { filterByFormula, maxRecords: 1 });
      if (records.length === 0) return null;
      const r = records[0];
      const storedHash = (r.get(FIELDS.PARENTS.PASSWORD_HASH) as string) || '';
      if (storedHash && storedHash === hash) {
        return {
          id: r.id,
          name: r.get(FIELDS.PARENTS.NAME) as string,
          email: r.get(FIELDS.PARENTS.EMAIL) as string,
          role: 'parent' as const,
        };
      }
      if (!storedHash) {
        // One-time migration: store hash for older records
        try {
          await AirtableService.update(TABLES.PARENTS, r.id, { [FIELDS.PARENTS.PASSWORD_HASH]: hash });
          return {
            id: r.id,
            name: r.get(FIELDS.PARENTS.NAME) as string,
            email: r.get(FIELDS.PARENTS.EMAIL) as string,
            role: 'parent' as const,
          };
        } catch (_) {
          // If update failed (permissions), still allow login for this session
          return {
            id: r.id,
            name: r.get(FIELDS.PARENTS.NAME) as string,
            email: r.get(FIELDS.PARENTS.EMAIL) as string,
            role: 'parent' as const,
          };
        }
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: {
    studentId: string;
    teacherId: string;
    parentId: string;
    subject: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createBooking(bookingData);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingsByParent = useCallback(async (parentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getBookingsByParent(parentId);
      return records.map(record => ({
        id: record.id,
        studentId: ((record.get(FIELDS.BOOKINGS.STUDENT_ID) as any) || [])[0] as string,
        teacherId: ((record.get(FIELDS.BOOKINGS.TEACHER_ID) as any) || [])[0] as string,
        parentId: ((record.get(FIELDS.BOOKINGS.PARENT_ID) as any) || [])[0] as string,
        subject: record.get(FIELDS.BOOKINGS.SUBJECT) as string,
        date: record.get(FIELDS.BOOKINGS.DATE) as string,
        time: record.get(FIELDS.BOOKINGS.TIME) as string,
        duration: record.get(FIELDS.BOOKINGS.DURATION) as number,
        status: record.get(FIELDS.BOOKINGS.STATUS) as string,
        notes: record.get(FIELDS.BOOKINGS.NOTES) as string,
        createdAt: record.get(FIELDS.BOOKINGS.CREATED_AT) as string,
      } as Booking));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (reviewData: {
    teacherId: string;
    studentId: string;
    rating: number;
    comment: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createReview(reviewData);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Posts
  const getPosts = useCallback(async (options?: {
    filterByFormula?: string;
    maxRecords?: number;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getPosts(options);
      return records.map(record => ({
        id: record.id,
        author: {
          id: record.get('Author ID') as string,
          name: record.get('Author Name') as string,
          role: record.get('Author Role') as 'teacher' | 'parent' | 'student',
          avatar: record.get('Author Avatar') as string,
        },
        content: {
          text: record.get('Content Text') as string,
          media: record.get('Content Media Type') ? {
            type: record.get('Content Media Type') as 'image' | 'video',
            url: record.get('Content Media URL') as string,
            thumbnail: record.get('Content Media Thumbnail') as string,
          } : undefined,
        },
        type: record.get('Post Type') as 'text' | 'image' | 'video' | 'poll' | 'resource',
        subjects: record.get('Subjects') as string[] || [],
        timestamp: new Date(record.get('Timestamp') as string),
        interactions: {
          likes: record.get('Likes Count') as number || 0,
          comments: record.get('Comments Count') as number || 0,
          shares: record.get('Shares Count') as number || 0,
          saves: record.get('Saves Count') as number || 0,
        },
        isLiked: record.get('Is Liked') as boolean || false,
        isSaved: record.get('Is Saved') as boolean || false,
        privacy: record.get('Privacy') as 'public' | 'center-only' | 'network-only',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData: {
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
  }) => {
    setLoading(true);
    setError(null);
    try {
      // Map subject keys to Airtable multipleSelect option labels; fallback to raw keys
      const subjectLabels = (postData.subjects || [])
        .map((key) => SUBJECTS.find((s) => s.key === key)?.nameEn || key)
        .filter((v): v is string => Boolean(v));

      const payload = {
        ...postData,
        subjects: subjectLabels,
      };
      // Defensive: remove undefined fields Airtable might reject
      if (!payload.contentMediaType) delete (payload as any).contentMediaType;
      if (!payload.contentMediaUrl) delete (payload as any).contentMediaUrl;
      if (!payload.contentMediaThumbnail) delete (payload as any).contentMediaThumbnail;

      const record = await AirtableService.createPost(payload as any);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPostLike = useCallback(async (postId: string, like: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // Use real user ID if available, otherwise fallback to session ID
      const currentUserId = userData?.id || (() => {
        if (!(globalThis as any).__sessionUserId) {
          (globalThis as any).__sessionUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return (globalThis as any).__sessionUserId;
      })();
      
      console.log(`[${new Date().toISOString()}] [HOOK] Using userId: ${currentUserId} (${userData?.name || 'Guest'})`);
      await AirtableService.setPostLike(postId, like, currentUserId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const setPostSave = useCallback(async (postId: string, save: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await AirtableService.setPostSave(postId, save);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (postId: string, text: string, authorId?: string, authorName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const commentData = {
        postId,
        authorId: authorId || userData?.id || 'guest-user',
        authorName: authorName || userData?.name || 'Guest User',
        content: text,
      };
      
      console.log(`[${new Date().toISOString()}] [HOOK] Creating comment:`, commentData);
      
      // Create the comment in Airtable
      await AirtableService.createComment(commentData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const getComments = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[${new Date().toISOString()}] [HOOK] Fetching comments for post:`, postId);
      
      const records = await AirtableService.getPostComments(postId);
      return records.map((record: any) => ({
        id: record.id,
        postId: record.get(FIELDS.COMMENTS.POST_ID) || record.get('postId') as string,
        authorId: record.get(FIELDS.COMMENTS.AUTHOR_ID) || record.get('authorId') as string,
        authorName: record.get(FIELDS.COMMENTS.AUTHOR_NAME) || record.get('authorName') as string,
        content: record.get(FIELDS.COMMENTS.CONTENT) || record.get('content') as string,
        createdAt: record.get(FIELDS.COMMENTS.CREATED_AT) || record.get('createdAt') as string,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Subjects
  const getSubjects = useCallback(async (options?: {
    filterByFormula?: string;
    maxRecords?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getSubjects(options);
      return records.map(record => ({
        id: record.id,
        nameEn: record.get('Name') as string,
        nameVi: record.get('Name (Vietnamese)') as string,
        icon: record.get('Icon') as string,
        category: record.get('Category') as string,
        description: record.get('Description') as string,
        status: record.get('Status') as string,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubjectsByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getSubjectsByCategory(category);
      return records.map(record => ({
        id: record.id,
        nameEn: record.get('Name') as string,
        nameVi: record.get('Name (Vietnamese)') as string,
        icon: record.get('Icon') as string,
        category: record.get('Category') as string,
        description: record.get('Description') as string,
        status: record.get('Status') as string,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects by category');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Bookings
  const getBookings = useCallback(async (userId: string, userType: 'parent' | 'teacher') => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.getBookings(userId, userType);
      return records.map(record => ({
        id: record.id,
        studentId: ((record.get('Student ID') as any) || [])[0] as string,
        teacherId: ((record.get('Teacher ID') as any) || [])[0] as string,
        parentId: ((record.get('Parent ID') as any) || [])[0] as string,
        subject: record.get('Subject') as string,
        date: record.get('Date') as string,
        time: record.get('Time') as string,
        duration: record.get('Duration') as number,
        status: record.get('Status') as string,
        notes: record.get('Notes') as string,
        paymentStatus: record.get('Payment Status') as string,
        createdAt: record.get('Created At') as string,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Teacher by ID
  const getTeacherById = useCallback(async (teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const teacher = await AirtableService.getTeacherById(teacherId);
      return teacher;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teacher');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic CRUD methods for school tables
  const fetchRecords = useCallback(async (table: string, options?: {
    filterByFormula?: string;
    maxRecords?: number;
    pageSize?: number;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    offset?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const records = await AirtableService.list(table, options);
      return records.map((record: any) => ({
        id: record.id,
        fields: record.getAllFields ? record.getAllFields() : {},
        createdTime: record.createdTime,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch records from ${table}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecord = useCallback(async (table: string, fields: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.create(table, fields);
      return {
        id: record.id,
        fields: record.getAllFields ? record.getAllFields() : {},
        createdTime: record.createdTime,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to create record in ${table}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (table: string, id: string, fields: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.update(table, id, fields);
      return {
        id: record.id,
        fields: record.getAllFields ? record.getAllFields() : {},
        createdTime: record.createdTime,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update record in ${table}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (table: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      await AirtableService.remove(table, id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete record from ${table}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    // Generic CRUD methods
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    // Teachers
    getTeachers,
    createTeacher,
    fetchTeachersBySubject,
    getTeacherById,
    // Students
    createStudent,
    // Parents
    createParent,
    authenticate,
    // Bookings
    createBooking,
    getBookingsByParent,
    getBookings,
    // Reviews
    createReview,
    // Posts
    getPosts,
    createPost,
    setPostLike,
    setPostSave,
    addComment,
    getComments,
    // Subjects
    getSubjects,
    getSubjectsByCategory,
  };
};