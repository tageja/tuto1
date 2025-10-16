const fetch = require('node-fetch');
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🔧 Adding fields to school tables (simple approach)...');

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

// Simple field definitions (basic types only)
const simpleFields = {
  'TutoSchools': [
    { name: 'School Code', type: 'singleLineText' },
    { name: 'Address', type: 'multilineText' },
    { name: 'Phone', type: 'singleLineText' },
    { name: 'Email', type: 'singleLineText' },
    { name: 'Website', type: 'singleLineText' },
    { name: 'Principal Name', type: 'singleLineText' },
    { name: 'Principal Email', type: 'singleLineText' },
    { name: 'Principal Phone', type: 'singleLineText' },
    { name: 'School Type', type: 'singleLineText' },
    { name: 'Grade Levels', type: 'multilineText' },
    { name: 'Student Count', type: 'number' },
    { name: 'Teacher Count', type: 'number' },
    { name: 'Founded Year', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' },
    { name: 'Updated Date', type: 'date' }
  ],

  'TutoSchoolInvitations': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' },
    { name: 'Expiry Date', type: 'date' },
    { name: 'Max Uses', type: 'number' },
    { name: 'Current Uses', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Used By', type: 'multilineText' }
  ],

  'TutoSchoolClasses': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleLineText' },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Student Count', type: 'number' },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Room Number', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolStudents': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Student ID', type: 'singleLineText' },
    { name: 'Date of Birth', type: 'date' },
    { name: 'Gender', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Parent Email', type: 'singleLineText' },
    { name: 'Parent Phone', type: 'singleLineText' },
    { name: 'Address', type: 'multilineText' },
    { name: 'Emergency Contact', type: 'singleLineText' },
    { name: 'Emergency Phone', type: 'singleLineText' },
    { name: 'Medical Notes', type: 'multilineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Enrollment Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolTeachers': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Email', type: 'singleLineText' },
    { name: 'Phone', type: 'singleLineText' },
    { name: 'Position', type: 'singleLineText' },
    { name: 'Subjects', type: 'multilineText' },
    { name: 'Grade Levels', type: 'multilineText' },
    { name: 'Experience Years', type: 'number' },
    { name: 'Education', type: 'multilineText' },
    { name: 'Bio', type: 'multilineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Hire Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoDailyActivities': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Activity Type', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Start Time', type: 'singleLineText' },
    { name: 'End Time', type: 'singleLineText' },
    { name: 'Students Present', type: 'number' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoMessages': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'From User', type: 'singleLineText' },
    { name: 'From Role', type: 'singleLineText' },
    { name: 'To User', type: 'singleLineText' },
    { name: 'To Role', type: 'singleLineText' },
    { name: 'Message Content', type: 'multilineText' },
    { name: 'Priority', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Sent Date', type: 'singleLineText' },
    { name: 'Read Date', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAbsenceRequests': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Request Type', type: 'singleLineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Reason', type: 'multilineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Approved By', type: 'singleLineText' },
    { name: 'Approval Date', type: 'date' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAnnouncements': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Content', type: 'multilineText' },
    { name: 'Category', type: 'singleLineText' },
    { name: 'Target Audience', type: 'multilineText' },
    { name: 'Priority', type: 'singleLineText' },
    { name: 'Publish Date', type: 'date' },
    { name: 'Expiry Date', type: 'date' },
    { name: 'Author', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoHealthRecords': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Record Type', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Doctor Name', type: 'singleLineText' },
    { name: 'Hospital/Clinic', type: 'singleLineText' },
    { name: 'Allergies', type: 'multilineText' },
    { name: 'Medications', type: 'multilineText' },
    { name: 'Emergency Contact', type: 'singleLineText' },
    { name: 'Emergency Phone', type: 'singleLineText' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoMedicineReminders': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Medicine Name', type: 'singleLineText' },
    { name: 'Dosage', type: 'singleLineText' },
    { name: 'Frequency', type: 'singleLineText' },
    { name: 'Time', type: 'singleLineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Instructions', type: 'multilineText' },
    { name: 'Administered By', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoPhotoAlbums': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Privacy', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoExtracurricularActivities': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Activity Type', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Max Students', type: 'number' },
    { name: 'Current Students', type: 'number' },
    { name: 'Grade Levels', type: 'multilineText' },
    { name: 'Fee', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSurveys': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Survey Type', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Questions', type: 'multilineText' },
    { name: 'Target Audience', type: 'multilineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Responses', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolPayments': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Parent Name', type: 'singleLineText' },
    { name: 'Payment Type', type: 'singleLineText' },
    { name: 'Amount', type: 'number' },
    { name: 'Due Date', type: 'date' },
    { name: 'Payment Date', type: 'date' },
    { name: 'Payment Method', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSubscriptions': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Plan Name', type: 'singleLineText' },
    { name: 'Features', type: 'multilineText' },
    { name: 'Monthly Price', type: 'number' },
    { name: 'Annual Price', type: 'number' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Payment Status', type: 'singleLineText' },
    { name: 'Next Billing Date', type: 'date' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoSchoolEvents': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Event Type', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Start Date', type: 'date' },
    { name: 'End Date', type: 'date' },
    { name: 'Start Time', type: 'singleLineText' },
    { name: 'End Time', type: 'singleLineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Organizer', type: 'singleLineText' },
    { name: 'Target Audience', type: 'multilineText' },
    { name: 'Registration Required', type: 'singleLineText' },
    { name: 'Max Attendees', type: 'number' },
    { name: 'Current Attendees', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoHomeworkAssignments': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Due Date', type: 'date' },
    { name: 'Total Students', type: 'number' },
    { name: 'Submitted Count', type: 'number' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoProgressReports': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Academic Year', type: 'singleLineText' },
    { name: 'Term', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Grade', type: 'singleLineText' },
    { name: 'Percentage', type: 'number' },
    { name: 'Teacher Comments', type: 'multilineText' },
    { name: 'Parent Comments', type: 'multilineText' },
    { name: 'Report Date', type: 'date' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
  ],

  'TutoAttendanceRecords': [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Date', type: 'date' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Arrival Time', type: 'singleLineText' },
    { name: 'Departure Time', type: 'singleLineText' },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Recorded By', type: 'singleLineText' },
    { name: 'Created Date', type: 'date' }
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

      const fieldsToAdd = simpleFields[table.name];
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
      
      // Add fields one by one to avoid batch issues
      let addedCount = 0;
      for (const field of newFields) {
        try {
          const result = await callMetadataAPI(`/tables/${table.id}/fields`, 'POST', { fields: [field] });
          
          if (result && result.fields && result.fields.length > 0) {
            console.log(`     ✅ Added field: ${field.name}`);
            addedCount++;
          } else {
            console.log(`     ⚠️  Failed to add field: ${field.name}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`     ❌ Error adding field ${field.name}: ${error.message}`);
        }
      }
      
      totalFieldsAdded += addedCount;
      totalTablesProcessed++;
      console.log(`   📊 Added ${addedCount}/${newFields.length} fields to ${table.name}`);
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












