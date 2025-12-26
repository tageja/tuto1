// TEMPORARY STUB: This hook is deprecated - migrate to Supabase
// All functions return empty data to prevent crashes during migration
import { useState } from 'react';

export const useAirtable = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Stub implementations - return empty data
  const getTeachers = async () => [];
  const getTeacherById = async () => null;
  const createTeacher = async () => null;
  const fetchTeachersBySubject = async () => [];
  
  const createStudent = async () => null;
  
  const createParent = async () => null;
  const authenticate = async () => ({ success: false, user: null });
  
  const createBooking = async () => null;
  const getBookingsByParent = async () => [];
  const getBookings = async () => [];
  
  const createReview = async () => null;
  
  const getPosts = async () => [];
  const createPost = async () => null;
  const setPostLike = async () => null;
  const setPostSave = async () => null;
  const addComment = async () => null;
  const getComments = async () => [];
  
  const getSubjects = async () => [];
  const getSubjectsByCategory = async () => [];
  
  const fetchRecords = async () => [];
  const createRecord = async () => null;
  const updateRecord = async () => null;
  const deleteRecord = async () => null;
  
  const clearError = () => {};

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










