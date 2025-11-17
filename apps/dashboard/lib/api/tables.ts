/**
 * Airtable Table Names and Field Mappings
 * 
 * Centralized constants for all Airtable tables and their fields.
 * This ensures consistency across the application.
 */

// === Table Names ===

export const TABLES = {
  // Core Tables
  TEACHERS: 'TutoTeachers',
  STUDENTS: 'TutoStudents',
  PARENTS: 'TutoParents',
  BOOKINGS: 'TutoBookings',
  SUBJECTS: 'TutoSubjects',
  REVIEWS: 'TutoReviews',
  PAYMENTS: 'TutoPayments',
  HOMEWORK: 'TutoHomework',
  
  // Social Feed
  POSTS: 'TutoPosts',
  COMMENTS: 'TutoComments',
  POST_LIKES: 'TutoPostLikes',
  REPORTS: 'TutoReports',
  
  // School System
  SCHOOLS: 'TutoSchools',
  SCHOOL_INVITATIONS: 'TutoSchoolInvitations',
  SCHOOL_USERS: 'TutoSchoolUsers',
  DAILY_ACTIVITIES: 'TutoDailyActivities',
  ANNOUNCEMENTS: 'TutoAnnouncements',
  MESSAGES: 'TutoMessages',
  PHOTO_ALBUMS: 'TutoPhotoAlbums',
  
  // User Management
  USERS: 'Users',
  INVITE_CODES: 'InviteCodes',
  GUARDIAN_STUDENT_LINKS: 'GuardianStudentLinks',
  STUDENT_PROFILES: 'StudentProfiles',
} as const;

// === Field Names ===

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
    SCHOOL_ID: 'School ID',
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
    SCHOOL_ID: 'School ID',
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
    SCHOOL_ID: 'School ID',
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
    STATUS: 'Status',
    SCHOOL_ID: 'School ID',
  },
  
  PAYMENTS: {
    ID: 'ID',
    BOOKING_ID: 'Booking ID',
    AMOUNT: 'Amount',
    CURRENCY: 'Currency',
    STATUS: 'Status',
    PAYMENT_METHOD: 'Payment Method',
    CREATED_AT: 'Created At',
    SCHOOL_ID: 'School ID',
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
  
  SCHOOLS: {
    ID: 'ID',
    NAME: 'Name',
    TYPE: 'Type',
    ADDRESS: 'Address',
    PHONE: 'Phone',
    EMAIL: 'Email',
    PRINCIPAL: 'Principal',
    STATUS: 'Status',
    CREATED_AT: 'Created At',
  },
  
  USERS: {
    ID: 'ID',
    FIREBASE_UID: 'firebaseUid',
    NAME: 'Name',
    EMAIL: 'Email',
    ROLE: 'role',
    AVATAR: 'Avatar',
    CREATED_AT: 'Created At',
  },
} as const;

// === Status Enums ===

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
} as const;

export const USER_ROLES = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  STUDENT: 'student',
  SCHOOL_ADMIN: 'school_admin',
  TUTO_ADMIN: 'admin',
} as const;

// Export types for TypeScript
export type TableName = typeof TABLES[keyof typeof TABLES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

























