const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY }).base(process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID);

console.log('🏫 Creating comprehensive school management tables...');

// School Management Tables
const schoolTables = [
  {
    name: 'TutoSchools',
    description: 'School information and settings',
    fields: [
      { name: 'Name', type: 'singleLineText', description: 'School name' },
      { name: 'Code', type: 'singleLineText', description: 'Unique school code' },
      { name: 'Address', type: 'multilineText', description: 'School address' },
      { name: 'Phone', type: 'phoneNumber', description: 'School phone number' },
      { name: 'Email', type: 'email', description: 'School email' },
      { name: 'Principal', type: 'singleLineText', description: 'Principal name' },
      { name: 'Logo', type: 'multipleAttachments', description: 'School logo' },
      { name: 'Banner', type: 'multipleAttachments', description: 'School banner image' },
      { name: 'Subscription Plan', type: 'singleSelect', options: { choices: [{ name: 'Basic' }, { name: 'Standard' }, { name: 'Premium' }] } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Suspended' }] } },
      { name: 'Created Date', type: 'dateTime', description: 'School registration date' },
      { name: 'Max Students', type: 'number', description: 'Maximum number of students allowed' },
      { name: 'Current Students', type: 'number', description: 'Current number of students' }
    ]
  },
  {
    name: 'TutoSchoolInvitations',
    description: 'School invitation codes for user registration',
    fields: [
      { name: 'Code', type: 'singleLineText', description: 'Invitation code' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Role', type: 'singleSelect', options: { choices: [{ name: 'parent' }, { name: 'student' }, { name: 'teacher' }, { name: 'school_admin' }] } },
      { name: 'Created By', type: 'singleLineText', description: 'Who created the invitation' },
      { name: 'Expires At', type: 'dateTime', description: 'Invitation expiration date' },
      { name: 'Max Uses', type: 'number', description: 'Maximum number of uses' },
      { name: 'Used Count', type: 'number', description: 'Number of times used' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Used Up' }] } }
    ]
  },
  {
    name: 'TutoSchoolClasses',
    description: 'Classes within schools',
    fields: [
      { name: 'Name', type: 'singleLineText', description: 'Class name' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Teacher ID', type: 'singleLineText', description: 'Reference to teacher' },
      { name: 'Grade Level', type: 'singleSelect', options: { choices: [{ name: 'Kindergarten' }, { name: 'Pre-K' }, { name: 'Nursery' }, { name: 'Toddler' }] } },
      { name: 'Capacity', type: 'number', description: 'Maximum number of students' },
      { name: 'Current Students', type: 'number', description: 'Current number of students' },
      { name: 'Schedule', type: 'multilineText', description: 'Class schedule' },
      { name: 'Description', type: 'multilineText', description: 'Class description' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }] } }
    ]
  },
  {
    name: 'TutoSchoolStudents',
    description: 'Extended student profiles for school management',
    fields: [
      { name: 'Full Name', type: 'singleLineText', description: 'Student full name' },
      { name: 'Nickname', type: 'singleLineText', description: 'Student nickname' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class' },
      { name: 'Parent ID', type: 'singleLineText', description: 'Reference to parent' },
      { name: 'Date of Birth', type: 'date', description: 'Student date of birth' },
      { name: 'Gender', type: 'singleSelect', options: { choices: [{ name: 'Male' }, { name: 'Female' }] } },
      { name: 'Student ID', type: 'singleLineText', description: 'School student ID' },
      { name: 'Address', type: 'multilineText', description: 'Student address' },
      { name: 'Province', type: 'singleLineText', description: 'Province' },
      { name: 'District', type: 'singleLineText', description: 'District/Ward' },
      { name: 'Photo', type: 'multipleAttachments', description: 'Student photo' },
      { name: 'Emergency Contact', type: 'phoneNumber', description: 'Emergency contact number' },
      { name: 'Allergies', type: 'multilineText', description: 'Student allergies' },
      { name: 'Medical Notes', type: 'multilineText', description: 'Medical information' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Graduated' }] } },
      { name: 'Enrollment Date', type: 'date', description: 'Date of enrollment' }
    ]
  },
  {
    name: 'TutoSchoolTeachers',
    description: 'School teacher profiles',
    fields: [
      { name: 'Full Name', type: 'singleLineText', description: 'Teacher full name' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class' },
      { name: 'Email', type: 'email', description: 'Teacher email' },
      { name: 'Phone', type: 'phoneNumber', description: 'Teacher phone' },
      { name: 'Photo', type: 'multipleAttachments', description: 'Teacher photo' },
      { name: 'Qualifications', type: 'multilineText', description: 'Teacher qualifications' },
      { name: 'Experience', type: 'number', description: 'Years of experience' },
      { name: 'Specializations', type: 'multipleSelects', options: { choices: [{ name: 'Early Childhood' }, { name: 'Special Education' }, { name: 'Music' }, { name: 'Art' }, { name: 'Physical Education' }] } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }] } },
      { name: 'Hire Date', type: 'date', description: 'Date of hire' }
    ]
  }
];

// Communication Tables
const communicationTables = [
  {
    name: 'TutoDailyActivities',
    description: 'Daily activity reports for students',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class' },
      { name: 'Date', type: 'date', description: 'Activity date' },
      { name: 'Learning Activities', type: 'multilineText', description: 'What the student learned' },
      { name: 'Meals', type: 'multilineText', description: 'What the student ate' },
      { name: 'Sleep', type: 'singleLineText', description: 'Sleep duration and quality' },
      { name: 'Teacher Comments', type: 'multilineText', description: 'Teacher observations' },
      { name: 'Photos', type: 'multipleAttachments', description: 'Activity photos' },
      { name: 'Attendance', type: 'singleSelect', options: { choices: [{ name: 'Present' }, { name: 'Absent' }, { name: 'Late' }] } },
      { name: 'Mood', type: 'singleSelect', options: { choices: [{ name: 'Happy' }, { name: 'Calm' }, { name: 'Excited' }, { name: 'Tired' }, { name: 'Sick' }] } },
      { name: 'Created By', type: 'singleLineText', description: 'Teacher who created the report' },
      { name: 'Created At', type: 'dateTime', description: 'Report creation time' }
    ]
  },
  {
    name: 'TutoMessages',
    description: 'Parent-teacher communication messages',
    fields: [
      { name: 'From User ID', type: 'singleLineText', description: 'Sender user ID' },
      { name: 'To User ID', type: 'singleLineText', description: 'Recipient user ID' },
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Content', type: 'multilineText', description: 'Message content' },
      { name: 'Type', type: 'singleSelect', options: { choices: [{ name: 'Morning' }, { name: 'General' }, { name: 'Urgent' }] } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Sent' }, { name: 'Read' }, { name: 'Replied' }] } },
      { name: 'Date', type: 'dateTime', description: 'Message date and time' },
      { name: 'Read At', type: 'dateTime', description: 'When message was read' }
    ]
  },
  {
    name: 'TutoAbsenceRequests',
    description: 'Student absence requests from parents',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'Parent ID', type: 'singleLineText', description: 'Reference to parent' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Start Date', type: 'date', description: 'Absence start date' },
      { name: 'End Date', type: 'date', description: 'Absence end date' },
      { name: 'Reason', type: 'multilineText', description: 'Reason for absence' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Approved' }, { name: 'Rejected' }] } },
      { name: 'Teacher Comments', type: 'multilineText', description: 'Teacher response' },
      { name: 'Created At', type: 'dateTime', description: 'Request creation time' },
      { name: 'Updated At', type: 'dateTime', description: 'Last update time' }
    ]
  },
  {
    name: 'TutoSchoolAnnouncements',
    description: 'School announcements and news',
    fields: [
      { name: 'Title', type: 'singleLineText', description: 'Announcement title' },
      { name: 'Content', type: 'multilineText', description: 'Announcement content' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class (optional)' },
      { name: 'Author', type: 'singleLineText', description: 'Announcement author' },
      { name: 'Type', type: 'singleSelect', options: { choices: [{ name: 'General' }, { name: 'Important' }, { name: 'Urgent' }, { name: 'Event' }] } },
      { name: 'Photos', type: 'multipleAttachments', description: 'Announcement photos' },
      { name: 'Published At', type: 'dateTime', description: 'Publication date' },
      { name: 'Expires At', type: 'dateTime', description: 'Expiration date' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Published' }, { name: 'Draft' }, { name: 'Archived' }] } }
    ]
  }
];

// Health & Safety Tables
const healthTables = [
  {
    name: 'TutoHealthRecords',
    description: 'Student health monitoring records',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Date', type: 'date', description: 'Record date' },
      { name: 'Height', type: 'number', description: 'Height in cm' },
      { name: 'Weight', type: 'number', description: 'Weight in kg' },
      { name: 'BMI', type: 'number', description: 'Calculated BMI' },
      { name: 'Health Notes', type: 'multilineText', description: 'Health observations' },
      { name: 'Allergies', type: 'multilineText', description: 'Student allergies' },
      { name: 'Medications', type: 'multilineText', description: 'Current medications' },
      { name: 'Blood Type', type: 'singleSelect', options: { choices: [{ name: 'A+' }, { name: 'A-' }, { name: 'B+' }, { name: 'B-' }, { name: 'AB+' }, { name: 'AB-' }, { name: 'O+' }, { name: 'O-' }] } },
      { name: 'Medical Conditions', type: 'multilineText', description: 'Medical conditions' },
      { name: 'Recorded By', type: 'singleLineText', description: 'Who recorded the data' }
    ]
  },
  {
    name: 'TutoMedicineReminders',
    description: 'Medicine reminders for students',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Medicine Name', type: 'singleLineText', description: 'Name of medicine' },
      { name: 'Dosage', type: 'singleLineText', description: 'Medicine dosage' },
      { name: 'Time', type: 'singleLineText', description: 'Time to take medicine' },
      { name: 'Instructions', type: 'multilineText', description: 'Special instructions' },
      { name: 'Start Date', type: 'date', description: 'Start date for medicine' },
      { name: 'End Date', type: 'date', description: 'End date for medicine' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
      { name: 'Administered', type: 'checkbox', description: 'Whether medicine was given' },
      { name: 'Administered At', type: 'dateTime', description: 'When medicine was given' },
      { name: 'Administered By', type: 'singleLineText', description: 'Who administered the medicine' },
      { name: 'Notes', type: 'multilineText', description: 'Additional notes' }
    ]
  },
  {
    name: 'TutoPickupRequests',
    description: 'Student pickup authorization requests',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Parent ID', type: 'singleLineText', description: 'Reference to parent' },
      { name: 'Pickup Person', type: 'singleLineText', description: 'Name of pickup person' },
      { name: 'Relationship', type: 'singleLineText', description: 'Relationship to student' },
      { name: 'Phone', type: 'phoneNumber', description: 'Pickup person phone' },
      { name: 'Pickup Date', type: 'date', description: 'Date of pickup' },
      { name: 'Pickup Time', type: 'singleLineText', description: 'Time of pickup' },
      { name: 'Reason', type: 'multilineText', description: 'Reason for pickup' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Approved' }, { name: 'Rejected' }] } },
      { name: 'Approved By', type: 'singleLineText', description: 'Who approved the request' },
      { name: 'Created At', type: 'dateTime', description: 'Request creation time' }
    ]
  }
];

// Academic & Activities Tables
const academicTables = [
  {
    name: 'TutoPhotoAlbums',
    description: 'School photo albums',
    fields: [
      { name: 'Title', type: 'singleLineText', description: 'Album title' },
      { name: 'Description', type: 'multilineText', description: 'Album description' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class' },
      { name: 'Date', type: 'date', description: 'Album date' },
      { name: 'Photos', type: 'multipleAttachments', description: 'Album photos' },
      { name: 'Student IDs', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
      { name: 'Created By', type: 'singleLineText', description: 'Who created the album' },
      { name: 'Likes', type: 'number', description: 'Number of likes' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Published' }, { name: 'Draft' }] } }
    ]
  },
  {
    name: 'TutoExtracurricularActivities',
    description: 'Extracurricular activities and clubs',
    fields: [
      { name: 'Name', type: 'singleLineText', description: 'Activity name' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Description', type: 'multilineText', description: 'Activity description' },
      { name: 'Category', type: 'singleSelect', options: { choices: [{ name: 'Sports' }, { name: 'Arts' }, { name: 'Music' }, { name: 'Science' }, { name: 'Language' }] } },
      { name: 'Schedule', type: 'multilineText', description: 'Activity schedule' },
      { name: 'Capacity', type: 'number', description: 'Maximum participants' },
      { name: 'Current Participants', type: 'number', description: 'Current number of participants' },
      { name: 'Fee', type: 'number', description: 'Activity fee' },
      { name: 'Registration Status', type: 'singleSelect', options: { choices: [{ name: 'Open' }, { name: 'Closed' }, { name: 'Full' }] } },
      { name: 'Start Date', type: 'date', description: 'Activity start date' },
      { name: 'End Date', type: 'date', description: 'Activity end date' },
      { name: 'Photos', type: 'multipleAttachments', description: 'Activity photos' }
    ]
  },
  {
    name: 'TutoActivityRegistrations',
    description: 'Student registrations for extracurricular activities',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'Activity ID', type: 'singleLineText', description: 'Reference to activity' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Registration Date', type: 'date', description: 'Date of registration' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Registered' }, { name: 'Cancelled' }, { name: 'Completed' }] } },
      { name: 'Payment Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Paid' }, { name: 'Refunded' }] } },
      { name: 'Parent Notes', type: 'multilineText', description: 'Parent notes' }
    ]
  },
  {
    name: 'TutoSurveys',
    description: 'School surveys and questionnaires',
    fields: [
      { name: 'Title', type: 'singleLineText', description: 'Survey title' },
      { name: 'Description', type: 'multilineText', description: 'Survey description' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Target Audience', type: 'singleSelect', options: { choices: [{ name: 'Parents' }, { name: 'Teachers' }, { name: 'All' }] } },
      { name: 'Questions', type: 'multilineText', description: 'Survey questions (JSON format)' },
      { name: 'Start Date', type: 'date', description: 'Survey start date' },
      { name: 'End Date', type: 'date', description: 'Survey end date' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Active' }, { name: 'Closed' }] } },
      { name: 'Created By', type: 'singleLineText', description: 'Who created the survey' }
    ]
  },
  {
    name: 'TutoSurveyResponses',
    description: 'Survey responses from users',
    fields: [
      { name: 'Survey ID', type: 'singleLineText', description: 'Reference to survey' },
      { name: 'User ID', type: 'singleLineText', description: 'Reference to user' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Responses', type: 'multilineText', description: 'Survey responses (JSON format)' },
      { name: 'Submitted At', type: 'dateTime', description: 'Submission time' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Submitted' }] } }
    ]
  },
  {
    name: 'TutoPeriodicAssessments',
    description: 'Periodic academic assessments',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Class ID', type: 'singleLineText', description: 'Reference to class' },
      { name: 'Assessment Type', type: 'singleSelect', options: { choices: [{ name: 'Monthly' }, { name: 'Quarterly' }, { name: 'Semester' }, { name: 'Annual' }] } },
      { name: 'Period', type: 'singleLineText', description: 'Assessment period' },
      { name: 'Date', type: 'date', description: 'Assessment date' },
      { name: 'Areas', type: 'multilineText', description: 'Assessment areas (JSON format)' },
      { name: 'Teacher Comments', type: 'multilineText', description: 'Teacher observations' },
      { name: 'Parent Feedback', type: 'multilineText', description: 'Parent feedback' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Published' }, { name: 'Archived' }] } },
      { name: 'Created By', type: 'singleLineText', description: 'Teacher who created assessment' }
    ]
  }
];

// Payment Tables
const paymentTables = [
  {
    name: 'TutoSchoolPayments',
    description: 'School tuition and fee payments',
    fields: [
      { name: 'Student ID', type: 'singleLineText', description: 'Reference to student' },
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Payment Type', type: 'singleSelect', options: { choices: [{ name: 'Tuition' }, { name: 'Activity Fee' }, { name: 'Meal Fee' }, { name: 'Transportation' }, { name: 'Other' }] } },
      { name: 'Amount', type: 'number', description: 'Payment amount' },
      { name: 'Currency', type: 'singleSelect', options: { choices: [{ name: 'VND' }, { name: 'USD' }] } },
      { name: 'Due Date', type: 'date', description: 'Payment due date' },
      { name: 'Paid Date', type: 'date', description: 'Date when paid' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Paid' }, { name: 'Overdue' }, { name: 'Cancelled' }] } },
      { name: 'Payment Method', type: 'singleSelect', options: { choices: [{ name: 'Cash' }, { name: 'Bank Transfer' }, { name: 'Credit Card' }, { name: 'Online Payment' }] } },
      { name: 'Receipt Number', type: 'singleLineText', description: 'Payment receipt number' },
      { name: 'Notes', type: 'multilineText', description: 'Payment notes' },
      { name: 'Created At', type: 'dateTime', description: 'Payment creation time' }
    ]
  },
  {
    name: 'TutoSchoolSubscriptions',
    description: 'School subscription plans and billing',
    fields: [
      { name: 'School ID', type: 'singleLineText', description: 'Reference to school' },
      { name: 'Plan Type', type: 'singleSelect', options: { choices: [{ name: 'Basic' }, { name: 'Standard' }, { name: 'Premium' }] } },
      { name: 'Monthly Fee', type: 'number', description: 'Monthly subscription fee' },
      { name: 'Start Date', type: 'date', description: 'Subscription start date' },
      { name: 'End Date', type: 'date', description: 'Subscription end date' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Cancelled' }] } },
      { name: 'Max Students', type: 'number', description: 'Maximum students allowed' },
      { name: 'Features', type: 'multilineText', description: 'Included features (JSON format)' },
      { name: 'Payment Status', type: 'singleSelect', options: { choices: [{ name: 'Paid' }, { name: 'Pending' }, { name: 'Overdue' }] } },
      { name: 'Last Payment Date', type: 'date', description: 'Last payment date' },
      { name: 'Next Payment Date', type: 'date', description: 'Next payment date' }
    ]
  }
];

// Combine all tables
const allTables = [
  ...schoolTables,
  ...communicationTables,
  ...healthTables,
  ...academicTables,
  ...paymentTables
];

async function createTable(tableConfig) {
  try {
    console.log(`Creating table: ${tableConfig.name}...`);
    
    // Create table
    const table = await base.createTable(tableConfig.name, tableConfig.description);
    
    // Add fields
    for (const field of tableConfig.fields) {
      await table.createField(field.name, field.type, field.options || {});
      console.log(`  - Added field: ${field.name}`);
    }
    
    console.log(`✅ Table ${tableConfig.name} created successfully!`);
    return table;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Table ${tableConfig.name} already exists, skipping...`);
      return null;
    } else {
      console.error(`❌ Error creating table ${tableConfig.name}:`, error.message);
      throw error;
    }
  }
}

async function createAllTables() {
  console.log('🚀 Starting table creation process...\n');
  
  for (const tableConfig of allTables) {
    try {
      await createTable(tableConfig);
      console.log('');
    } catch (error) {
      console.error(`Failed to create table ${tableConfig.name}:`, error);
      break;
    }
  }
  
  console.log('🎉 Table creation process completed!');
  console.log(`📊 Created ${allTables.length} tables for school management system`);
}

// Run the script
createAllTables().catch(console.error);






















