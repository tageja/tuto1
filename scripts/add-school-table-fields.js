const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY }).base(process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID);

// Field definitions for each table
const tableFields = {
  'TutoSchools': [
    { name: 'School Code', type: 'singleLineText' },
    { name: 'Address', type: 'multilineText' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Email', type: 'email' },
    { name: 'Website', type: 'url' },
    { name: 'Principal Name', type: 'singleLineText' },
    { name: 'Principal Email', type: 'email' },
    { name: 'Principal Phone', type: 'phoneNumber' },
    { name: 'School Type', type: 'singleSelect', options: { choices: [{ name: 'Public' }, { name: 'Private' }, { name: 'International' }] } },
    { name: 'Grade Levels', type: 'multipleSelects', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Student Count', type: 'number' },
    { name: 'Teacher Count', type: 'number' },
    { name: 'Founded Year', type: 'number' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Pending' }] } },
    { name: 'Created Date', type: 'date' },
    { name: 'Updated Date', type: 'date' }
  ],

  'TutoSchoolInvitations': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' },
    { name: 'Expiry Date', type: 'date' },
    { name: 'Max Uses', type: 'number' },
    { name: 'Current Uses', type: 'number' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Disabled' }] } },
    { name: 'Used By', type: 'multipleSelects', options: { choices: [{ name: 'Parent' }, { name: 'Student' }, { name: 'Teacher' }] } }
  ],

  'TutoSchoolClasses': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleSelect', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Class Teacher', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolTeachers' } },
    { name: 'Student Count', type: 'number' },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Room Number', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolStudents': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'singleLineText' },
    { name: 'Date of Birth', type: 'date' },
    { name: 'Gender', type: 'singleSelect', options: { choices: [{ name: 'Male' }, { name: 'Female' }, { name: 'Other' }] } },
    { name: 'Grade Level', type: 'singleSelect', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Parent Email', type: 'email' },
    { name: 'Parent Phone', type: 'phoneNumber' },
    { name: 'Address', type: 'multilineText' },
    { name: 'Emergency Contact', type: 'singleLineText' },
    { name: 'Emergency Phone', type: 'phoneNumber' },
    { name: 'Medical Notes', type: 'multilineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Graduated' }] } },
    { name: 'Enrollment Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolTeachers': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Position', type: 'singleSelect', options: { choices: [{ name: 'Teacher' }, { name: 'Principal' }, { name: 'Vice Principal' }, { name: 'Admin' }, { name: 'Specialist' }] } },
    { name: 'Subjects', type: 'multipleSelects', options: { choices: [
      { name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, 
      { name: 'Art' }, { name: 'Music' }, { name: 'PE' }, { name: 'Technology' }, { name: 'Language' }
    ] } },
    { name: 'Grade Levels', type: 'multipleSelects', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Experience Years', type: 'number' },
    { name: 'Education', type: 'multilineText' },
    { name: 'Bio', type: 'multilineText' },
    { name: 'Profile Picture', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'On Leave' }] } },
    { name: 'Hire Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoDailyActivities': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Activity Type', type: 'singleSelect', options: { choices: [{ name: 'Academic' }, { name: 'Sports' }, { name: 'Arts' }, { name: 'Field Trip' }, { name: 'Assembly' }, { name: 'Other' }] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Start Time', type: 'dateTime' },
    { name: 'End Time', type: 'dateTime' },
    { name: 'Teacher', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolTeachers' } },
    { name: 'Students Present', type: 'number' },
    { name: 'Photos', type: 'multipleAttachments' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Planned' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoMessages': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'From User', type: 'singleLineText' },
    { name: 'From Role', type: 'singleSelect', options: { choices: [{ name: 'Teacher' }, { name: 'Parent' }, { name: 'Student' }, { name: 'Admin' }] } },
    { name: 'To User', type: 'singleLineText' },
    { name: 'To Role', type: 'singleSelect', options: { choices: [{ name: 'Teacher' }, { name: 'Parent' }, { name: 'Student' }, { name: 'Admin' }] } },
    { name: 'Message Content', type: 'multilineText' },
    { name: 'Priority', type: 'singleSelect', options: { choices: [{ name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Urgent' }] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Sent' }, { name: 'Delivered' }, { name: 'Read' }, { name: 'Archived' }] } },
    { name: 'Sent Date', type: 'dateTime' },
    { name: 'Read Date', type: 'dateTime' },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAbsenceRequests': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Request Type', type: 'singleSelect', options: { choices: [{ name: 'Sick Leave' }, { name: 'Personal Leave' }, { name: 'Emergency' }, { name: 'Other' }] } },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Reason', type: 'multilineText' },
    { name: 'Supporting Documents', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Approved' }, { name: 'Rejected' }] } },
    { name: 'Approved By', type: 'singleLineText' },
    { name: 'Approval Date', type: 'date' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAnnouncements': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Content', type: 'multilineText' },
    { name: 'Category', type: 'singleSelect', options: { choices: [{ name: 'General' }, { name: 'Academic' }, { name: 'Sports' }, { name: 'Events' }, { name: 'Emergency' }] } },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [{ name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }] } },
    { name: 'Priority', type: 'singleSelect', options: { choices: [{ name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Urgent' }] } },
    { name: 'Publish Date', type: 'date' },
    { name: 'Expiry Date', type: 'date' },
    { name: 'Author', type: 'singleLineText' },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Published' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoHealthRecords': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Record Type', type: 'singleSelect', options: { choices: [{ name: 'Medical Checkup' }, { name: 'Vaccination' }, { name: 'Allergy' }, { name: 'Medication' }, { name: 'Emergency' }] } },
    { name: 'Date', type: 'date' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Doctor Name', type: 'singleLineText' },
    { name: 'Hospital/Clinic', type: 'singleLineText' },
    { name: 'Documents', type: 'multipleAttachments' },
    { name: 'Allergies', type: 'multipleSelects', options: { choices: [{ name: 'None' }, { name: 'Peanuts' }, { name: 'Dairy' }, { name: 'Gluten' }, { name: 'Latex' }, { name: 'Other' }] } },
    { name: 'Medications', type: 'multilineText' },
    { name: 'Emergency Contact', type: 'singleLineText' },
    { name: 'Emergency Phone', type: 'phoneNumber' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoMedicineReminders': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Medicine Name', type: 'singleLineText' },
    { name: 'Dosage', type: 'singleLineText' },
    { name: 'Frequency', type: 'singleSelect', options: { choices: [{ name: 'Once Daily' }, { name: 'Twice Daily' }, { name: 'Three Times Daily' }, { name: 'As Needed' }] } },
    { name: 'Time', type: 'dateTime' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Instructions', type: 'multilineText' },
    { name: 'Administered By', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoPhotoAlbums': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleSelect', options: { choices: [{ name: 'Class Activity' }, { name: 'School Event' }, { name: 'Field Trip' }, { name: 'Sports' }, { name: 'Graduation' }, { name: 'Other' }] } },
    { name: 'Date', type: 'date' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Photos', type: 'multipleAttachments' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Teacher', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolTeachers' } },
    { name: 'Privacy', type: 'singleSelect', options: { choices: [{ name: 'Public' }, { name: 'Private' }, { name: 'Parents Only' }] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoExtracurricularActivities': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Activity Type', type: 'singleSelect', options: { choices: [{ name: 'Sports' }, { name: 'Arts' }, { name: 'Music' }, { name: 'Drama' }, { name: 'Science' }, { name: 'Technology' }, { name: 'Language' }, { name: 'Other' }] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Teacher', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolTeachers' } },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Max Students', type: 'number' },
    { name: 'Current Students', type: 'number' },
    { name: 'Grade Levels', type: 'multipleSelects', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Fee', type: 'currency' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Full' }] } },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSurveys': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Survey Type', type: 'singleSelect', options: { choices: [{ name: 'Parent Feedback' }, { name: 'Student Feedback' }, { name: 'Teacher Feedback' }, { name: 'General' }] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Questions', type: 'multilineText' },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [{ name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }] } },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Responses', type: 'number' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Active' }, { name: 'Closed' }, { name: 'Archived' }] } },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolPayments': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Payment Type', type: 'singleSelect', options: { choices: [{ name: 'Tuition' }, { name: 'Extracurricular' }, { name: 'Lunch' }, { name: 'Transportation' }, { name: 'Other' }] } },
    { name: 'Amount', type: 'currency' },
    { name: 'Due Date', type: 'date' },
    { name: 'Payment Date', type: 'date' },
    { name: 'Payment Method', type: 'singleSelect', options: { choices: [{ name: 'Cash' }, { name: 'Bank Transfer' }, { name: 'Credit Card' }, { name: 'Online' }] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Paid' }, { name: 'Overdue' }, { name: 'Cancelled' }] } },
    { name: 'Receipt', type: 'multipleAttachments' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSubscriptions': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Plan Name', type: 'singleSelect', options: { choices: [{ name: 'Basic' }, { name: 'Standard' }, { name: 'Premium' }, { name: 'Enterprise' }] } },
    { name: 'Features', type: 'multipleSelects', options: { choices: [{ name: 'Daily Activities' }, { name: 'Messages' }, { name: 'Health Records' }, { name: 'Photo Albums' }, { name: 'Payments' }, { name: 'Analytics' }] } },
    { name: 'Monthly Price', type: 'currency' },
    { name: 'Annual Price', type: 'currency' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Cancelled' }] } },
    { name: 'Payment Status', type: 'singleSelect', options: { choices: [{ name: 'Paid' }, { name: 'Pending' }, { name: 'Overdue' }] } },
    { name: 'Next Billing Date', type: 'date' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolEvents': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleSelect', options: { choices: [{ name: 'Academic' }, { name: 'Sports' }, { name: 'Cultural' }, { name: 'Parent Meeting' }, { name: 'Holiday' }, { name: 'Other' }] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Start Time', type: 'dateTime' },
    { name: 'End Time', type: 'dateTime' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Organizer', type: 'singleLineText' },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [{ name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }] } },
    { name: 'Registration Required', type: 'checkbox' },
    { name: 'Max Attendees', type: 'number' },
    { name: 'Current Attendees', type: 'number' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Upcoming' }, { name: 'Ongoing' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoHomeworkAssignments': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleSelect', options: { choices: [{ name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, { name: 'Art' }, { name: 'Music' }, { name: 'PE' }] } },
    { name: 'Teacher', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolTeachers' } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Due Date', type: 'date' },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Total Students', type: 'number' },
    { name: 'Submitted Count', type: 'number' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Due' }, { name: 'Completed' }, { name: 'Overdue' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoProgressReports': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Term', type: 'singleSelect', options: { choices: [{ name: 'First Term' }, { name: 'Second Term' }, { name: 'Third Term' }, { name: 'Final' }] } },
    { name: 'Subject', type: 'singleSelect', options: { choices: [{ name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, { name: 'Art' }, { name: 'Music' }, { name: 'PE' }] } },
    { name: 'Grade', type: 'singleLineText' },
    { name: 'Percentage', type: 'number' },
    { name: 'Teacher Comments', type: 'multilineText' },
    { name: 'Parent Comments', type: 'multilineText' },
    { name: 'Report Date', type: 'date' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Published' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAttendanceRecords': [
    { name: 'School ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchools' } },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolClasses' } },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Student ID', type: 'multipleRecordLinks', options: { linkedTableId: 'TutoSchoolStudents' } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Present' }, { name: 'Absent' }, { name: 'Late' }, { name: 'Excused' }] } },
    { name: 'Arrival Time', type: 'dateTime' },
    { name: 'Departure Time', type: 'dateTime' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Recorded By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ]
};

async function addFieldsToTable(tableName, fields) {
  try {
    console.log(`\n📋 Adding fields to table: ${tableName}`);
    
    for (const field of fields) {
      try {
        console.log(`  ➕ Adding field: ${field.name} (${field.type})`);
        
        const fieldConfig = {
          name: field.name,
          type: field.type
        };

        if (field.options) {
          fieldConfig.options = field.options;
        }

        await base.table(tableName).createField(fieldConfig);
        console.log(`  ✅ Successfully added: ${field.name}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  Field already exists: ${field.name}`);
        } else {
          console.log(`  ❌ Error adding field ${field.name}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Completed adding fields to: ${tableName}`);
    
  } catch (error) {
    console.error(`❌ Error processing table ${tableName}:`, error.message);
  }
}

async function addAllFields() {
  console.log('🚀 Starting to add fields to all school tables...\n');
  
  for (const [tableName, fields] of Object.entries(tableFields)) {
    await addFieldsToTable(tableName, fields);
  }
  
  console.log('\n🎉 All fields have been added to the school tables!');
}

// Run the script
addAllFields().catch(console.error);













