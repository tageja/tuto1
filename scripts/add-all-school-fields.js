const fetch = require('node-fetch');
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🔧 Adding all fields to school tables...');

// Helper function for Metadata API calls
async function callMetadataAPI(endpoint, method = 'GET', body = null) {
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error(`❌ API call failed: ${error.message}`);
    throw error;
  }
}

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
    { name: 'Student Count', type: 'number', options: { precision: 0 } },
    { name: 'Teacher Count', type: 'number', options: { precision: 0 } },
    { name: 'Founded Year', type: 'number', options: { precision: 0 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Pending' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Updated Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSchoolInvitations': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Max Uses', type: 'number', options: { precision: 0 } },
    { name: 'Current Uses', type: 'number', options: { precision: 0 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Disabled' }] } },
    { name: 'Used By', type: 'multipleSelects', options: { choices: [{ name: 'Parent' }, { name: 'Student' }, { name: 'Teacher' }] } }
  ],

  'TutoSchoolClasses': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleSelect', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Student Count', type: 'number', options: { precision: 0 } },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Room Number', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSchoolStudents': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'singleLineText' },
    { name: 'Date of Birth', type: 'date', options: { dateFormat: { name: 'local' } } },
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
    { name: 'Enrollment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSchoolTeachers': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Position', type: 'singleSelect', options: { choices: [
      { name: 'Teacher' }, { name: 'Principal' }, { name: 'Vice Principal' }, { name: 'Admin' }, { name: 'Specialist' }
    ] } },
    { name: 'Subjects', type: 'multipleSelects', options: { choices: [
      { name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, 
      { name: 'Art' }, { name: 'Music' }, { name: 'PE' }, { name: 'Technology' }, { name: 'Language' }
    ] } },
    { name: 'Grade Levels', type: 'multipleSelects', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Experience Years', type: 'number', options: { precision: 0 } },
    { name: 'Education', type: 'multilineText' },
    { name: 'Bio', type: 'multilineText' },
    { name: 'Profile Picture', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'On Leave' }] } },
    { name: 'Hire Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoDailyActivities': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Activity Type', type: 'singleSelect', options: { choices: [
      { name: 'Academic' }, { name: 'Sports' }, { name: 'Arts' }, { name: 'Field Trip' }, { name: 'Assembly' }, { name: 'Other' }
    ] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Start Time', type: 'dateTime' },
    { name: 'End Time', type: 'dateTime' },
    { name: 'Students Present', type: 'number', options: { precision: 0 } },
    { name: 'Photos', type: 'multipleAttachments' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Planned' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoMessages': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'From User', type: 'singleLineText' },
    { name: 'From Role', type: 'singleSelect', options: { choices: [
      { name: 'Teacher' }, { name: 'Parent' }, { name: 'Student' }, { name: 'Admin' }
    ] } },
    { name: 'To User', type: 'singleLineText' },
    { name: 'To Role', type: 'singleSelect', options: { choices: [
      { name: 'Teacher' }, { name: 'Parent' }, { name: 'Student' }, { name: 'Admin' }
    ] } },
    { name: 'Message Content', type: 'multilineText' },
    { name: 'Priority', type: 'singleSelect', options: { choices: [
      { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Urgent' }
    ] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Sent' }, { name: 'Delivered' }, { name: 'Read' }, { name: 'Archived' }
    ] } },
    { name: 'Sent Date', type: 'dateTime' },
    { name: 'Read Date', type: 'dateTime' },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoAbsenceRequests': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Request Type', type: 'singleSelect', options: { choices: [
      { name: 'Sick Leave' }, { name: 'Personal Leave' }, { name: 'Emergency' }, { name: 'Other' }
    ] } },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Reason', type: 'multilineText' },
    { name: 'Supporting Documents', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Pending' }, { name: 'Approved' }, { name: 'Rejected' }] } },
    { name: 'Approved By', type: 'singleLineText' },
    { name: 'Approval Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoAnnouncements': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Content', type: 'multilineText' },
    { name: 'Category', type: 'singleSelect', options: { choices: [
      { name: 'General' }, { name: 'Academic' }, { name: 'Sports' }, { name: 'Events' }, { name: 'Emergency' }
    ] } },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [
      { name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }
    ] } },
    { name: 'Priority', type: 'singleSelect', options: { choices: [
      { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Urgent' }
    ] } },
    { name: 'Publish Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Author', type: 'singleLineText' },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Published' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoHealthRecords': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Record Type', type: 'singleSelect', options: { choices: [
      { name: 'Medical Checkup' }, { name: 'Vaccination' }, { name: 'Allergy' }, { name: 'Medication' }, { name: 'Emergency' }
    ] } },
    { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Doctor Name', type: 'singleLineText' },
    { name: 'Hospital/Clinic', type: 'singleLineText' },
    { name: 'Documents', type: 'multipleAttachments' },
    { name: 'Allergies', type: 'multipleSelects', options: { choices: [
      { name: 'None' }, { name: 'Peanuts' }, { name: 'Dairy' }, { name: 'Gluten' }, { name: 'Latex' }, { name: 'Other' }
    ] } },
    { name: 'Medications', type: 'multilineText' },
    { name: 'Emergency Contact', type: 'singleLineText' },
    { name: 'Emergency Phone', type: 'phoneNumber' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoMedicineReminders': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Medicine Name', type: 'singleLineText' },
    { name: 'Dosage', type: 'singleLineText' },
    { name: 'Frequency', type: 'singleSelect', options: { choices: [
      { name: 'Once Daily' }, { name: 'Twice Daily' }, { name: 'Three Times Daily' }, { name: 'As Needed' }
    ] } },
    { name: 'Time', type: 'dateTime' },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Instructions', type: 'multilineText' },
    { name: 'Administered By', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoPhotoAlbums': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleSelect', options: { choices: [
      { name: 'Class Activity' }, { name: 'School Event' }, { name: 'Field Trip' }, { name: 'Sports' }, { name: 'Graduation' }, { name: 'Other' }
    ] } },
    { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Photos', type: 'multipleAttachments' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Privacy', type: 'singleSelect', options: { choices: [
      { name: 'Public' }, { name: 'Private' }, { name: 'Parents Only' }
    ] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoExtracurricularActivities': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Activity Type', type: 'singleSelect', options: { choices: [
      { name: 'Sports' }, { name: 'Arts' }, { name: 'Music' }, { name: 'Drama' }, { name: 'Science' }, { name: 'Technology' }, { name: 'Language' }, { name: 'Other' }
    ] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Max Students', type: 'number', options: { precision: 0 } },
    { name: 'Current Students', type: 'number', options: { precision: 0 } },
    { name: 'Grade Levels', type: 'multipleSelects', options: { choices: [
      { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
      { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
      { name: '11' }, { name: '12' }
    ] } },
    { name: 'Fee', type: 'currency' },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Full' }] } },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSurveys': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Survey Type', type: 'singleSelect', options: { choices: [
      { name: 'Parent Feedback' }, { name: 'Student Feedback' }, { name: 'Teacher Feedback' }, { name: 'General' }
    ] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Questions', type: 'multilineText' },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [
      { name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }
    ] } },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Responses', type: 'number', options: { precision: 0 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Draft' }, { name: 'Active' }, { name: 'Closed' }, { name: 'Archived' }
    ] } },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSchoolPayments': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Payment Type', type: 'singleSelect', options: { choices: [
      { name: 'Tuition' }, { name: 'Extracurricular' }, { name: 'Lunch' }, { name: 'Transportation' }, { name: 'Other' }
    ] } },
    { name: 'Amount', type: 'currency' },
    { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Payment Method', type: 'singleSelect', options: { choices: [
      { name: 'Cash' }, { name: 'Bank Transfer' }, { name: 'Credit Card' }, { name: 'Online' }
    ] } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Pending' }, { name: 'Paid' }, { name: 'Overdue' }, { name: 'Cancelled' }
    ] } },
    { name: 'Receipt', type: 'multipleAttachments' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSubscriptions': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Plan Name', type: 'singleSelect', options: { choices: [
      { name: 'Basic' }, { name: 'Standard' }, { name: 'Premium' }, { name: 'Enterprise' }
    ] } },
    { name: 'Features', type: 'multipleSelects', options: { choices: [
      { name: 'Daily Activities' }, { name: 'Messages' }, { name: 'Health Records' }, { name: 'Photo Albums' }, { name: 'Payments' }, { name: 'Analytics' }
    ] } },
    { name: 'Monthly Price', type: 'currency' },
    { name: 'Annual Price', type: 'currency' },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Expired' }, { name: 'Cancelled' }] } },
    { name: 'Payment Status', type: 'singleSelect', options: { choices: [
      { name: 'Paid' }, { name: 'Pending' }, { name: 'Overdue' }
    ] } },
    { name: 'Next Billing Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoSchoolEvents': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleSelect', options: { choices: [
      { name: 'Academic' }, { name: 'Sports' }, { name: 'Cultural' }, { name: 'Parent Meeting' }, { name: 'Holiday' }, { name: 'Other' }
    ] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Start Time', type: 'dateTime' },
    { name: 'End Time', type: 'dateTime' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Organizer', type: 'singleLineText' },
    { name: 'Target Audience', type: 'multipleSelects', options: { choices: [
      { name: 'All' }, { name: 'Parents' }, { name: 'Students' }, { name: 'Teachers' }, { name: 'Specific Class' }
    ] } },
    { name: 'Registration Required', type: 'checkbox' },
    { name: 'Max Attendees', type: 'number', options: { precision: 0 } },
    { name: 'Current Attendees', type: 'number', options: { precision: 0 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Upcoming' }, { name: 'Ongoing' }, { name: 'Completed' }, { name: 'Cancelled' }
    ] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoHomeworkAssignments': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleSelect', options: { choices: [
      { name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, { name: 'Art' }, { name: 'Music' }, { name: 'PE' }
    ] } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Attachments', type: 'multipleAttachments' },
    { name: 'Total Students', type: 'number', options: { precision: 0 } },
    { name: 'Submitted Count', type: 'number', options: { precision: 0 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Active' }, { name: 'Due' }, { name: 'Completed' }, { name: 'Overdue' }
    ] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoProgressReports': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Term', type: 'singleSelect', options: { choices: [
      { name: 'First Term' }, { name: 'Second Term' }, { name: 'Third Term' }, { name: 'Final' }
    ] } },
    { name: 'Subject', type: 'singleSelect', options: { choices: [
      { name: 'Math' }, { name: 'Science' }, { name: 'English' }, { name: 'History' }, { name: 'Geography' }, { name: 'Art' }, { name: 'Music' }, { name: 'PE' }
    ] } },
    { name: 'Grade', type: 'singleLineText' },
    { name: 'Percentage', type: 'number', options: { precision: 1 } },
    { name: 'Teacher Comments', type: 'multilineText' },
    { name: 'Parent Comments', type: 'multilineText' },
    { name: 'Report Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Draft' }, { name: 'Published' }, { name: 'Archived' }] } },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ],

  'TutoAttendanceRecords': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'Present' }, { name: 'Absent' }, { name: 'Late' }, { name: 'Excused' }
    ] } },
    { name: 'Arrival Time', type: 'dateTime' },
    { name: 'Departure Time', type: 'dateTime' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Recorded By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
  ]
};

async function addFieldsToTables() {
  try {
    console.log('🔍 Getting existing tables...');
    
    // Get existing tables
    const tables = await callMetadataAPI('/tables');
    
    if (!tables || !tables.tables) {
      console.log('❌ No tables found');
      return;
    }

    console.log(`📋 Found ${tables.tables.length} tables\n`);
    
    let totalFieldsAdded = 0;
    let totalTablesProcessed = 0;

    for (const table of tables.tables) {
      // Only process school tables
      if (!table.name.startsWith('Tuto')) {
        continue;
      }

      const fieldsToAdd = tableFields[table.name];
      if (!fieldsToAdd) {
        console.log(`⚠️  No field definition found for ${table.name}, skipping...`);
        continue;
      }

      console.log(`🔧 Processing table: ${table.name}`);
      
      // Get existing field names to avoid duplicates
      const existingFields = table.fields.map(f => f.name);
      const newFields = fieldsToAdd.filter(field => !existingFields.includes(field.name));
      
      if (newFields.length === 0) {
        console.log(`   ✅ All fields already exist in ${table.name}`);
        totalTablesProcessed++;
        continue;
      }

      console.log(`   📝 Adding ${newFields.length} fields to ${table.name}...`);
      
      try {
        // Add fields to the table
        const updatePayload = {
          fields: newFields
        };
        
        const result = await callMetadataAPI(`/tables/${table.id}/fields`, 'POST', updatePayload);
        
        if (result && result.fields) {
          console.log(`   ✅ Successfully added ${newFields.length} fields to ${table.name}`);
          totalFieldsAdded += newFields.length;
        } else {
          console.log(`   ⚠️  Unexpected response for ${table.name}:`, result);
        }
        
        totalTablesProcessed++;
        
      } catch (error) {
        console.log(`   ❌ Error adding fields to ${table.name}: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎯 Field Addition Summary:');
    console.log('==========================');
    console.log(`📊 Tables processed: ${totalTablesProcessed}`);
    console.log(`📝 Total fields added: ${totalFieldsAdded}`);
    console.log('');
    console.log('✅ Field addition completed!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the field addition
addFieldsToTables();


