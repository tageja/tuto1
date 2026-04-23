// School Management Types
export interface School {
  id: string;
  name: string;
  logo_url?: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  schoolType: 'Public' | 'Private' | 'International';
  gradeLevels: string[];
  studentCount: number;
  teacherCount: number;
  foundedYear: number;
  status: 'Active' | 'Inactive' | 'Pending';
  createdDate: string;
  updatedDate: string;
}

export interface JoinedSchool {
  school: School;
  joinedDate: string;
  invitationCode: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
}

export interface SchoolInvitation {
  id: string;
  invitationCode: string;
  schoolId: string;
  schoolName: string;
  createdBy: string;
  createdDate: string;
  expiryDate: string;
  maxUses: number;
  currentUses: number;
  status: 'Active' | 'Expired' | 'Disabled';
  usedBy: string[];
}

export interface SchoolClass {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  gradeLevel: string;
  academicYear: string;
  classTeacherId: string;
  studentCount: number;
  schedule: string;
  roomNumber: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export interface SchoolStudent {
  id: string;
  name: string;
  schoolId: string;
  schoolName?: string;
  classId: string | null;
  className: string | null;
  studentId?: string;
  code: string; // student_number
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  dob: string | null;
  gender: 'Male' | 'Female' | 'Other' | string | null;
  gradeLevel: string | null;
  grade: string | null;
  parentName?: string;
  parent: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'active' | 'inactive' | string;
  enrollmentDate: string | null;
  enrolledAt: string | null;
  photoUrl: string | null;
  createdDate?: string;
}

export interface StudentKPI {
  total: number;
  active: number;
  inactive: number;
  avgAttendance: number;
  lastUpdated?: string;
}

export interface SchoolTeacher {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  email: string;
  phone: string;
  position: 'Teacher' | 'Principal' | 'Vice Principal' | 'Admin' | 'Specialist';
  subjects: string[];
  gradeLevels: string[];
  experienceYears: number;
  education: string;
  bio: string;
  profilePicture?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  createdDate: string;
}

export interface DailyActivity {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  date: string;
  activityType: 'Academic' | 'Sports' | 'Arts' | 'Field Trip' | 'Assembly' | 'Other';
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  studentsPresent: number;
  photos?: string[];
  notes?: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
  createdDate: string;
}

export interface SchoolMessage {
  id: string;
  subject: string;
  schoolId: string;
  schoolName: string;
  fromUser: string;
  fromRole: 'Teacher' | 'Parent' | 'Student' | 'Admin';
  toUser: string;
  toRole: 'Teacher' | 'Parent' | 'Student' | 'Admin';
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Sent' | 'Delivered' | 'Read' | 'Archived';
  sentDate: string;
  readDate?: string;
  attachments?: string[];
  createdDate: string;
}

export interface AbsenceRequest {
  id: string;
  requestId: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  parentName: string;
  requestType: 'Sick Leave' | 'Personal Leave' | 'Emergency' | 'Other';
  startDate: string;
  endDate: string;
  reason: string;
  supportingDocuments?: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  createdDate: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  content: string;
  category: 'General' | 'Academic' | 'Sports' | 'Events' | 'Emergency';
  targetAudience: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  publishDate: string;
  expiryDate?: string;
  author: string;
  attachments?: string[];
  status: 'Draft' | 'Published' | 'Archived';
  createdDate: string;
}

// Legacy HealthRecord interface (kept for backward compatibility)
export interface HealthRecord {
  id: string;
  recordId: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  recordType: 'Medical Checkup' | 'Vaccination' | 'Allergy' | 'Medication' | 'Emergency';
  date: string;
  description: string;
  doctorName?: string;
  hospitalClinic?: string;
  documents?: string[];
  allergies: string[];
  medications?: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes?: string;
  createdDate: string;
}

// Supabase-aligned Health Record Types
export interface SupabaseHealthRecord {
  id: string;
  school_id: string;
  student_id: string;
  record_type: 'general' | 'vaccination' | 'vitals' | 'note';
  title?: string | null;
  details: Record<string, any>;
  recorded_at: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AllergyRecord {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  recordedAt: string;
}

export interface MedicationRecord {
  id: string;
  name: string;
  dose?: string;
  schedule?: string;
  recordedAt: string;
}

export interface VaccinationRecord {
  id: string;
  vaccine: string;
  status: 'done' | 'pending' | 'due' | 'scheduled';
  date: string;
  recordedAt: string;
}

export interface VitalsRecord {
  id: string;
  heightCm?: number | null;
  weightKg?: number | null;
  recordedAt: string;
}

export interface HealthKPIs {
  totalStudents: number;
  allergies: number;
  medications: number;
  updatedThisMonth: number;
}

export interface StudentHealthSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string | null;
  className: string;
  hasAllergy: boolean;
  hasMedication: boolean;
}

export interface StudentHealthDetail {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string | null;
    classId: string | null;
    className: string;
    schoolId: string;
  };
  allergies: AllergyRecord[];
  medications: MedicationRecord[];
  emergencyContacts: {
    primaryName: string | null;
    primaryPhone: string | null;
    altName: string | null;
    altPhone: string | null;
  };
  vaccinations: VaccinationRecord[];
  vitals: VitalsRecord[];
  notes: Array<{
    id: string;
    title: string | null;
    details: any;
    recordedAt: string;
  }>;
}

export interface MedicineReminder {
  id: string;
  reminderId: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  medicineName: string;
  dosage: string;
  frequency: 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'As Needed';
  time: string;
  startDate: string;
  endDate: string;
  instructions: string;
  administeredBy: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
  createdDate: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  eventType: 'Class Activity' | 'School Event' | 'Field Trip' | 'Sports' | 'Graduation' | 'Other';
  date: string;
  description: string;
  photos: string[];
  classId?: string;
  className?: string;
  teacherId?: string;
  privacy: 'Public' | 'Private' | 'Parents Only';
  status: 'Active' | 'Archived';
  createdDate: string;
}

export interface ExtracurricularActivity {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  activityType: 'Sports' | 'Arts' | 'Music' | 'Drama' | 'Science' | 'Technology' | 'Language' | 'Other';
  description: string;
  teacherId: string;
  schedule: string;
  location: string;
  maxStudents: number;
  currentStudents: number;
  gradeLevels: string[];
  fee: number;
  status: 'Active' | 'Inactive' | 'Full';
  startDate: string;
  endDate: string;
  createdDate: string;
}

export interface SchoolSurvey {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  surveyType: 'Parent Feedback' | 'Student Feedback' | 'Teacher Feedback' | 'General';
  description: string;
  questions: string;
  targetAudience: string[];
  startDate: string;
  endDate: string;
  responses: number;
  status: 'Draft' | 'Active' | 'Closed' | 'Archived';
  createdBy: string;
  createdDate: string;
}

export interface SchoolPayment {
  id: string;
  paymentId: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  parentName: string;
  paymentType: 'Tuition' | 'Extracurricular' | 'Lunch' | 'Transportation' | 'Other';
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Online';
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  receipt?: string;
  notes?: string;
  createdDate: string;
}

export interface SchoolSubscription {
  id: string;
  subscriptionId: string;
  schoolId: string;
  schoolName: string;
  planName: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  nextBillingDate: string;
  notes?: string;
  createdDate: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  eventType: 'Academic' | 'Sports' | 'Cultural' | 'Parent Meeting' | 'Holiday' | 'Other';
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  targetAudience: string[];
  registrationRequired: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdDate: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  subject: 'Math' | 'Science' | 'English' | 'History' | 'Geography' | 'Art' | 'Music' | 'PE';
  teacherId: string;
  description: string;
  dueDate: string;
  attachments?: string[];
  totalStudents: number;
  submittedCount: number;
  status: 'Active' | 'Due' | 'Completed' | 'Overdue';
  createdDate: string;
}

export interface ProgressReport {
  id: string;
  reportId: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term' | 'Final';
  subject: 'Math' | 'Science' | 'English' | 'History' | 'Geography' | 'Art' | 'Music' | 'PE';
  grade: string;
  percentage: number;
  teacherComments: string;
  parentComments?: string;
  reportDate: string;
  status: 'Draft' | 'Published' | 'Archived';
  createdDate: string;
}

export interface AttendanceRecord {
  id: string;
  recordId: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  date: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
  recordedBy: string;
  createdDate: string;
}

// School User Types
export interface SchoolUser {
  id: string;
  userId: string;
  schoolId: string;
  schoolName: string;
  role: 'school_admin' | 'school_teacher' | 'parent' | 'student';
  className?: string;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  createdDate: string;
}

// School Context Types
export interface SchoolContextType {
  joinedSchools: JoinedSchool[];
  currentSchool: School | null;
  schoolUser: SchoolUser | null;
  isSchoolMode: boolean;
  setCurrentSchool: (school: School | null) => void;
  setSchoolUser: (user: SchoolUser | null) => void;
  setIsSchoolMode: (mode: boolean) => void;
  joinSchool: (code: string) => Promise<boolean>;
  joinSchoolByPin: (schoolId: string, schoolName: string) => Promise<void>;
  leaveSchool: () => void;
  switchToSchool: (school: School) => void;
  removeSchool: (schoolId: string) => void;
  refreshSchoolData: () => Promise<void>;
}
