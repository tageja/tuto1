/**
 * TypeScript Type Definitions for Tuto Dashboard
 * 
 * Centralized types for all data models, API responses, and component props.
 */

// === User & Authentication ===

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  schoolIds?: string[];
  createdAt: string;
}

export type UserRole = 'parent' | 'teacher' | 'student' | 'school_admin' | 'admin';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// === Airtable Records ===

export interface AirtableRecord<T = any> {
  id: string;
  fields: T;
  createdTime?: string;
}

// === Teacher ===

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  subjects: string[];
  qualifications: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  availability: string;
  languages: string[];
  description: string;
  status: 'Active' | 'Inactive' | 'Pending';
  schoolId?: string;
}

// === Student ===

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentId: string;
  subjectsInterest: string[];
  address: string;
  phone?: string;
  email?: string;
  status: 'Active' | 'Inactive';
  schoolId?: string;
}

// === Parent ===

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  children?: string[];
  paymentMethod?: string;
  status: 'Active' | 'Inactive';
}

// === Booking ===

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No-show';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
  notes?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  schoolId?: string;
}

// === Review ===

export interface Review {
  id: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  schoolId?: string;
}

// === Payment ===

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  schoolId?: string;
}

// === School ===

export interface School {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

// === Subject ===

export interface Subject {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
}

// === Feed Post ===

export interface Post {
  id: string;
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
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  privacy: 'public' | 'private' | 'friends';
  createdAt: string;
}

// === Comment ===

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// === Dashboard Stats ===

export interface DashboardStats {
  activeStudents: number;
  classesThisWeek: number;
  revenueMTD: number;
  pendingInvoices: number;
  churnRisk: number;
}

// === API Response Types ===

export interface ApiError {
  ok: false;
  code: string;
  message: string;
}

export interface ApiSuccess<T = any> {
  ok: true;
  data?: T;
  [key: string]: any;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export interface ListResponse<T> {
  records: T[];
  offset?: string;
}

// === Table Filter Options ===

export interface TableFilterOptions {
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  offset?: string;
}

// === UI Component Props ===

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// === Form Types ===

export interface CreateTeacherFormData {
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
}

export interface CreateStudentFormData {
  name: string;
  age: number;
  grade: string;
  parentId: string;
  subjectsInterest: string[];
  address: string;
  phone?: string;
  email?: string;
}

export interface CreateBookingFormData {
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

// === Context Types ===

export interface SchoolContext {
  currentSchoolId: string | null;
  schools: School[];
  switchSchool: (schoolId: string) => void;
  loading: boolean;
}

// Export all types
export type * from './index';





























