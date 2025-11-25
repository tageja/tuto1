const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Create School Tables with Complete Fields (with _NEW suffix)');
console.log('================================================================\n');

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.log('❌ Error: Missing Airtable credentials');
  console.log('Please set up your .env file with:');
  console.log('EXPO_PUBLIC_AIRTABLE_API_KEY=your_pat_here');
  console.log('EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here');
  process.exit(1);
}

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

// School table schemas with complete field definitions (with _NEW suffix)
const schoolTableSchemas = {
  'TutoSchools_NEW': {
    description: 'School information and management',
    fields: [
      { name: 'School Name', type: 'singleLineText' },
      { name: 'School Code', type: 'singleLineText' },
      { name: 'Address', type: 'multilineText' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Email', type: 'email' },
      { name: 'Website', type: 'url' },
      { name: 'Principal Name', type: 'singleLineText' },
      { name: 'Principal Email', type: 'email' },
      { name: 'Principal Phone', type: 'phoneNumber' },
      { 
        name: 'School Type', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Public' },
            { name: 'Private' },
            { name: 'International' }
          ]
        }
      },
      { 
        name: 'Grade Levels', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Pre-K' }, { name: 'K' }, { name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, 
            { name: '5' }, { name: '6' }, { name: '7' }, { name: '8' }, { name: '9' }, { name: '10' }, 
            { name: '11' }, { name: '12' }
          ]
        }
      },
      { name: 'Student Count', type: 'number', options: { precision: 0 } },
      { name: 'Teacher Count', type: 'number', options: { precision: 0 } },
      { name: 'Founded Year', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Pending' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Updated Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSchoolInvitations_NEW': {
    description: 'School invitation codes for access control',
    fields: [
      { name: 'Invitation Code', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Created By', type: 'singleLineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Max Uses', type: 'number', options: { precision: 0 } },
      { name: 'Current Uses', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Expired' },
            { name: 'Used Up' }
          ]
        }
      },
      { name: 'Used By', type: 'multilineText' }
    ]
  },
  'TutoSchoolClasses_NEW': {
    description: 'Class information and management',
    fields: [
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Grade Level', type: 'singleLineText' },
      { name: 'Academic Year', type: 'singleLineText' },
      { name: 'Student Count', type: 'number', options: { precision: 0 } },
      { name: 'Schedule', type: 'multilineText' },
      { name: 'Room Number', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Completed' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSchoolStudents_NEW': {
    description: 'Student information and profiles',
    fields: [
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Date of Birth', type: 'date', options: { dateFormat: { name: 'local' } } },
      { 
        name: 'Gender', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Male' },
            { name: 'Female' },
            { name: 'Other' }
          ]
        }
      },
      { name: 'Grade Level', type: 'singleLineText' },
      { name: 'Parent Name', type: 'singleLineText' },
      { name: 'Parent Email', type: 'email' },
      { name: 'Parent Phone', type: 'phoneNumber' },
      { name: 'Address', type: 'multilineText' },
      { name: 'Emergency Contact', type: 'singleLineText' },
      { name: 'Emergency Phone', type: 'phoneNumber' },
      { name: 'Medical Notes', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Graduated' }
          ]
        }
      },
      { name: 'Enrollment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSchoolTeachers_NEW': {
    description: 'Teacher information and profiles',
    fields: [
      { name: 'Teacher Name', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Position', type: 'singleLineText' },
      { name: 'Subjects', type: 'multilineText' },
      { name: 'Grade Levels', type: 'multilineText' },
      { name: 'Experience Years', type: 'number', options: { precision: 0 } },
      { name: 'Education', type: 'multilineText' },
      { name: 'Bio', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'On Leave' }
          ]
        }
      },
      { name: 'Hire Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoDailyActivities_NEW': {
    description: 'Daily activities and events tracking',
    fields: [
      { name: 'Activity Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Activity Type', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Location', type: 'singleLineText' },
      { name: 'Start Time', type: 'singleLineText' },
      { name: 'End Time', type: 'singleLineText' },
      { name: 'Students Present', type: 'multilineText' },
      { name: 'Notes', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Scheduled' },
            { name: 'In Progress' },
            { name: 'Completed' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoMessages_NEW': {
    description: 'Internal messaging system',
    fields: [
      { name: 'Message Subject', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'From User', type: 'singleLineText' },
      { name: 'From Role', type: 'singleLineText' },
      { name: 'To User', type: 'singleLineText' },
      { name: 'To Role', type: 'singleLineText' },
      { name: 'Message Content', type: 'multilineText' },
      { 
        name: 'Priority', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Low' },
            { name: 'Normal' },
            { name: 'High' },
            { name: 'Urgent' }
          ]
        }
      },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Sent' },
            { name: 'Delivered' },
            { name: 'Read' }
          ]
        }
      },
      { name: 'Sent Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Read Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoAbsenceRequests_NEW': {
    description: 'Student absence request management',
    fields: [
      { name: 'Request ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'Parent Name', type: 'singleLineText' },
      { name: 'Request Type', type: 'singleLineText' },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Reason', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Approved' },
            { name: 'Rejected' }
          ]
        }
      },
      { name: 'Approved By', type: 'singleLineText' },
      { name: 'Approval Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoAnnouncements_NEW': {
    description: 'School announcements and notifications',
    fields: [
      { name: 'Announcement Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Content', type: 'multilineText' },
      { name: 'Category', type: 'singleLineText' },
      { name: 'Target Audience', type: 'multilineText' },
      { 
        name: 'Priority', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Low' },
            { name: 'Normal' },
            { name: 'High' },
            { name: 'Urgent' }
          ]
        }
      },
      { name: 'Publish Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Author', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Draft' },
            { name: 'Published' },
            { name: 'Archived' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoHealthRecords_NEW': {
    description: 'Student health records and medical information',
    fields: [
      { name: 'Record ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'Record Type', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Description', type: 'multilineText' },
      { name: 'Doctor Name', type: 'singleLineText' },
      { name: 'Hospital/Clinic', type: 'singleLineText' },
      { name: 'Allergies', type: 'multilineText' },
      { name: 'Medications', type: 'multilineText' },
      { name: 'Emergency Contact', type: 'singleLineText' },
      { name: 'Emergency Phone', type: 'phoneNumber' },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoMedicineReminders_NEW': {
    description: 'Medicine administration reminders',
    fields: [
      { name: 'Reminder ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'Medicine Name', type: 'singleLineText' },
      { name: 'Dosage', type: 'singleLineText' },
      { name: 'Frequency', type: 'singleLineText' },
      { name: 'Time', type: 'singleLineText' },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Instructions', type: 'multilineText' },
      { name: 'Administered By', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Completed' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoPhotoAlbums_NEW': {
    description: 'Photo albums and media sharing',
    fields: [
      { name: 'Album Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Event Type', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Description', type: 'multilineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Privacy', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Archived' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoExtracurricularActivities_NEW': {
    description: 'Extracurricular activities and clubs',
    fields: [
      { name: 'Activity Name', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Activity Type', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Schedule', type: 'multilineText' },
      { name: 'Location', type: 'singleLineText' },
      { name: 'Max Students', type: 'number', options: { precision: 0 } },
      { name: 'Current Students', type: 'number', options: { precision: 0 } },
      { name: 'Grade Levels', type: 'multilineText' },
      { name: 'Fee', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Full' }
          ]
        }
      },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSurveys_NEW': {
    description: 'Surveys and feedback collection',
    fields: [
      { name: 'Survey Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Survey Type', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Questions', type: 'multilineText' },
      { name: 'Target Audience', type: 'multilineText' },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Responses', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Draft' },
            { name: 'Active' },
            { name: 'Closed' }
          ]
        }
      },
      { name: 'Created By', type: 'singleLineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSchoolPayments_NEW': {
    description: 'School payment tracking and management',
    fields: [
      { name: 'Payment ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'Parent Name', type: 'singleLineText' },
      { name: 'Payment Type', type: 'singleLineText' },
      { name: 'Amount', type: 'number', options: { precision: 0 } },
      { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Payment Method', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Paid' },
            { name: 'Overdue' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSubscriptions_NEW': {
    description: 'School subscription plans and billing',
    fields: [
      { name: 'Subscription ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Plan Name', type: 'singleLineText' },
      { name: 'Features', type: 'multilineText' },
      { name: 'Monthly Price', type: 'number', options: { precision: 0 } },
      { name: 'Annual Price', type: 'number', options: { precision: 0 } },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Expired' }
          ]
        }
      },
      { name: 'Payment Status', type: 'singleLineText' },
      { name: 'Next Billing Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoSchoolEvents_NEW': {
    description: 'School events and calendar management',
    fields: [
      { name: 'Event Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Event Type', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Start Time', type: 'singleLineText' },
      { name: 'End Time', type: 'singleLineText' },
      { name: 'Location', type: 'singleLineText' },
      { name: 'Organizer', type: 'singleLineText' },
      { name: 'Target Audience', type: 'multilineText' },
      { name: 'Registration Required', type: 'singleLineText' },
      { name: 'Max Attendees', type: 'number', options: { precision: 0 } },
      { name: 'Current Attendees', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Scheduled' },
            { name: 'In Progress' },
            { name: 'Completed' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoHomeworkAssignments_NEW': {
    description: 'Homework assignments and submissions',
    fields: [
      { name: 'Assignment Title', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Total Students', type: 'number', options: { precision: 0 } },
      { name: 'Submitted Count', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Due' },
            { name: 'Completed' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoProgressReports_NEW': {
    description: 'Student progress reports and assessments',
    fields: [
      { name: 'Report ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Student Name', type: 'singleLineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Academic Year', type: 'singleLineText' },
      { name: 'Term', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Grade', type: 'singleLineText' },
      { name: 'Percentage', type: 'number', options: { precision: 1 } },
      { name: 'Teacher Comments', type: 'multilineText' },
      { name: 'Parent Comments', type: 'multilineText' },
      { name: 'Report Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Draft' },
            { name: 'Published' },
            { name: 'Reviewed' }
          ]
        }
      },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  },
  'TutoAttendanceRecords_NEW': {
    description: 'Student attendance tracking',
    fields: [
      { name: 'Record ID', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Student Name', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Present' },
            { name: 'Absent' },
            { name: 'Late' },
            { name: 'Excused' }
          ]
        }
      },
      { name: 'Arrival Time', type: 'singleLineText' },
      { name: 'Departure Time', type: 'singleLineText' },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Recorded By', type: 'singleLineText' },
      { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
    ]
  }
};

async function createSchoolTablesWithSuffix() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection by fetching base info
    const baseInfo = await callMetadataAPI('/tables');
    console.log('✅ Connection successful!\n');
    
    console.log('📋 Creating school tables with _NEW suffix...\n');
    
    const createdTables = {};
    
    for (const [tableName, schema] of Object.entries(schoolTableSchemas)) {
      console.log(`📊 Creating table: ${tableName}`);
      console.log(`   Description: ${schema.description}`);
      console.log(`   Fields: ${schema.fields.length}`);
      
      try {
        // Create table using Metadata API with all fields
        const tablePayload = {
          name: tableName,
          description: schema.description,
          fields: schema.fields
        };
        
        const result = await callMetadataAPI('/tables', 'POST', tablePayload);
        
        if (result && result.id) {
          createdTables[tableName] = result.id;
          console.log(`   ✅ Successfully created table: ${tableName} (ID: ${result.id})`);
        } else {
          console.log(`   ⚠️  Table creation response:`, result);
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Error creating ${tableName}: ${error.message}`);
      }
    }
    
    console.log('🎯 Table Creation Summary:');
    console.log('==========================');
    console.log('');
    
    if (Object.keys(createdTables).length > 0) {
      console.log('✅ Successfully created tables:');
      Object.entries(createdTables).forEach(([name, id]) => {
        console.log(`   - ${name}: ${id}`);
      });
      
      console.log('\n📝 MANUAL RENAMING INSTRUCTIONS:');
      console.log('================================');
      console.log('1. Go to your Airtable base in the web interface');
      console.log('2. For each table with _NEW suffix:');
      console.log('   - Click on the table name to edit it');
      console.log('   - Remove the "_NEW" suffix');
      console.log('   - Save the changes');
      console.log('3. Delete the old tables with minimal fields');
      console.log('4. Update your app code to use the new table names');
      
      console.log('\n📋 Tables to rename:');
      Object.keys(createdTables).forEach(name => {
        const newName = name.replace('_NEW', '');
        console.log(`   - ${name} → ${newName}`);
      });
      
    } else {
      console.log('⚠️  No tables were created');
    }
    
    console.log('');
    console.log('🎉 Next Steps:');
    console.log('1. Rename the tables in Airtable web interface');
    console.log('2. Delete old tables with minimal fields');
    console.log('3. Populate tables with sample data: npm run populate:school:data:auto');
    console.log('4. Test the connection: npm run test:airtable');
    console.log('5. Start the app: npm start');
    
    return createdTables;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid API key or missing scopes');
      console.log('   - API key doesn\'t have access to the base');
      console.log('   - Base ID is incorrect');
    } else if (error.message.includes('404')) {
      console.log('\n💡 This usually means:');
      console.log('   - Base ID is incorrect');
      console.log('   - Base doesn\'t exist');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check that your API key has access to the base');
    console.log('3. Verify the Base ID is correct');
    console.log('4. Make sure the base exists and is accessible');
    console.log('5. Ensure your PAT has the required scopes:');
    console.log('   - data.bases:read');
    console.log('   - data.records:read');
    console.log('   - data.records:write');
    console.log('   - meta.bases:read');
    console.log('   - meta.tables:write');
    
    process.exit(1);
  }
}

// Run the table creation
createSchoolTablesWithSuffix();



































