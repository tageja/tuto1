/**
 * Supabase Database Service
 * Replaces Airtable service with Supabase queries
 */

import { supabase } from '../config/supabase';

// ============================================================================
// TEACHERS (Marketplace)
// ============================================================================

export async function getTeachers(filters?: {
  status?: string;
  subjects?: string[];
  minRating?: number;
}) {
  let query = supabase
    .from('teachers')
    .select('*');
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating);
  }
  
  query = query.order('rating', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getTeacherById(id: string) {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function searchTeachers(query: string) {
  const { data, error } = await supabase
    .rpc('search_teachers', { search_query: query, max_results: 20 });
  
  if (error) throw error;
  return data;
}

export async function getNearbyTeachers(latitude: number, longitude: number, radiusMeters: number = 10000) {
  const { data, error } = await supabase
    .rpc('nearby_teachers', {
      user_lat: latitude,
      user_lon: longitude,
      radius_meters: radiusMeters,
    });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// STUDENTS (Marketplace)
// ============================================================================

export async function getStudentsByParent(parentId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', parentId);
  
  if (error) throw error;
  return data;
}

export async function createStudent(studentData: {
  parent_id: string;
  name: string;
  age?: number;
  grade?: string;
  subjects_interest?: string[];
}) {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// BOOKINGS
// ============================================================================

export async function getBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, teachers(*), students(*)')
    .eq('parent_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createBooking(bookingData: {
  parent_id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...bookingData,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function getTeacherReviews(teacherId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createReview(reviewData: {
  teacher_id: string;
  parent_id: string;
  student_id?: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// SUBJECTS
// ============================================================================

export async function getSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('status', 'active')
    .order('name');
  
  if (error) throw error;
  return data;
}

// ============================================================================
// POSTS (Social)
// ============================================================================

export async function getPosts(limit: number = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function createPost(postData: {
  author_id: string;
  author_name: string;
  author_role: string;
  content_text: string;
  content_media_url?: string;
  subjects?: string[];
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...postData,
      status: 'active',
      privacy: 'public',
      likes_count: 0,
      comments_count: 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function getCommentsByPost(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createComment(commentData: {
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// USER PROFILE
// ============================================================================

export async function getUserProfile(authUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: {
  name?: string;
  phone?: string;
  avatar?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// PLATFORM STATS
// ============================================================================

export async function getPlatformStats() {
  const { data, error } = await supabase
    .from('platform_stats')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error || !data) {
    // Return fallback values silently
    return {
      schools_count: 120,
      homework_completion_rate: 94,
      parent_engagement_rate: 88,
      attendance_rate: 98.5
    };
  }
  
  return data;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const SupabaseDB = {
  // Platform Stats
  getPlatformStats,
  
  // Teachers
  getTeachers,
  getTeacherById,
  searchTeachers,
  getNearbyTeachers,
  
  // Students
  getStudentsByParent,
  createStudent,
  
  // Bookings
  getBookings,
  createBooking,
  
  // Reviews
  getTeacherReviews,
  createReview,
  
  // Subjects
  getSubjects,
  
  // Posts
  getPosts,
  createPost,
  
  // Comments
  getCommentsByPost,
  createComment,
  
  // User
  getUserProfile,
  updateUserProfile,
};

export default SupabaseDB;










