export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  avatar?: string;
  language: 'en' | 'vi';
}

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  qualifications: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  availability: {
    days: string[];
    timeSlots: string[];
  };
  description: string;
  experience: number;
  languages: string[];
}

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
  status: 'active' | 'inactive';
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  children: string[]; // Array of student IDs
  paymentMethod?: string;
  status: 'active' | 'inactive';
}

export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  category: 'academic' | 'extracurricular';
}

export interface Review {
  id: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'assigned' | 'submitted' | 'graded';
  adaptiveLevel?: number;
}

export interface ClassSchedule {
  id: string;
  teacherId: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  createdAt: string;
} 