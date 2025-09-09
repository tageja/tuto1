// School Management Types
export interface School {
  id: string;
  name: string;
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
  schoolName: string;
  classId: string;
  className: string;
  studentId: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  gradeLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes?: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  enrollmentDate: string;
  createdDate: string;
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
  leaveSchool: () => void;
  switchToSchool: (school: School) => void;
  removeSchool: (schoolId: string) => void;
  refreshSchoolData: () => Promise<void>;
}
