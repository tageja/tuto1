import { useState, useCallback } from 'react';
import AirtableService, { TABLES, FIELDS } from '../services/airtable';
import { Teacher, Student, Parent, Booking, Review } from '../types';

export const useAirtable = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const filterByFormula = `FIND("${subjectKey}", {${FIELDS.TEACHERS.SUBJECTS}}) > 0`;
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
      const record = await AirtableService.createTeacher(teacherData);
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
  }) => {
    setLoading(true);
    setError(null);
    try {
      const record = await AirtableService.createParent(parentData);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parent');
      throw err;
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
        studentId: record.get(FIELDS.BOOKINGS.STUDENT_ID) as string,
        teacherId: record.get(FIELDS.BOOKINGS.TEACHER_ID) as string,
        parentId: record.get(FIELDS.BOOKINGS.PARENT_ID) as string,
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
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    // Teachers
    getTeachers,
    createTeacher,
    fetchTeachersBySubject,
    // Students
    createStudent,
    // Parents
    createParent,
    // Bookings
    createBooking,
    getBookingsByParent,
    // Reviews
    createReview,
  };
};