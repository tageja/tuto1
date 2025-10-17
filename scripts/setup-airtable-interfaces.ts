/**
 * Setup Airtable Interfaces for Admin Dashboards
 * 
 * This script provides setup instructions and validation for Airtable Interfaces
 * to create admin dashboards and triage boards.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE;

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing required environment variables: AIRTABLE_PAT, AIRTABLE_BASE');
  process.exit(1);
}

// Helper for Airtable API calls
async function callAirtableApi(endpoint: string, method: string, data?: any) {
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_PAT}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Airtable API call failed: ${errorMessage}`);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Check if required tables exist
async function validateTables() {
  console.log('🔍 Validating required tables...');
  
  const requiredTables = [
    'TutoBookings',
    'TutoTeachers', 
    'TutoUsers',
    'TutoReports',
    'TutoPosts',
    'TutoComments',
    'TutoReviews'
  ];

  try {
    const tables = await callAirtableApi('/tables', 'GET');
    const existingTables = tables.tables.map((table: any) => table.name);
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.error('❌ Missing required tables:', missingTables);
      console.log('Please create these tables before setting up interfaces.');
      return false;
    }
    
    console.log('✅ All required tables exist');
    return true;
  } catch (error) {
    console.error('Error validating tables:', error);
    return false;
  }
}

// Check if required fields exist in tables
async function validateFields() {
  console.log('🔍 Validating required fields...');
  
  const requiredFields = {
    'TutoBookings': ['Status', 'Teacher', 'Student', 'StartTime', 'EndTime', 'Amount', 'PaymentStatus'],
    'TutoTeachers': ['Name', 'Email', 'Subject', 'Experience', 'Rating', 'ApprovalStatus', 'Active'],
    'TutoUsers': ['Name', 'Email', 'Role', 'Status', 'CreatedAt'],
    'TutoReports': ['ReportType', 'ReportedItem', 'Reporter', 'Reason', 'Status', 'ReportDate'],
    'TutoPosts': ['Author', 'Content', 'Timestamp', 'Likes Count', 'Comments Count', 'Status'],
    'TutoComments': ['Post', 'Author', 'Content', 'CreatedAt', 'Status'],
    'TutoReviews': ['Teacher', 'Student', 'Rating', 'Content', 'CreatedAt', 'Status']
  };

  try {
    const tables = await callAirtableApi('/tables', 'GET');
    const tableMap = new Map(tables.tables.map((table: any) => [table.name, table]));
    
    let allFieldsValid = true;
    
    for (const [tableName, fields] of Object.entries(requiredFields)) {
      const table = tableMap.get(tableName);
      if (!table) {
        console.error(`❌ Table ${tableName} not found`);
        allFieldsValid = false;
        continue;
      }
      
      const existingFields = (table as any).fields.map((field: any) => field.name);
      const missingFields = fields.filter(field => !existingFields.includes(field));
      
      if (missingFields.length > 0) {
        console.error(`❌ Missing fields in ${tableName}:`, missingFields);
        allFieldsValid = false;
      } else {
        console.log(`✅ All required fields exist in ${tableName}`);
      }
    }
    
    return allFieldsValid;
  } catch (error) {
    console.error('Error validating fields:', error);
    return false;
  }
}

// Generate interface setup instructions
function generateSetupInstructions() {
  console.log('\n📋 Airtable Interfaces Setup Instructions');
  console.log('==========================================\n');
  
  console.log('1. Access Airtable Interfaces:');
  console.log('   - Open your Airtable base');
  console.log('   - Click "Interfaces" in the left sidebar');
  console.log('   - Click "Create new interface"\n');
  
  console.log('2. Create Booking Management Interface:');
  console.log('   - Name: "Booking Management"');
  console.log('   - Description: "Admin interface for managing booking requests"');
  console.log('   - Icon: Calendar');
  console.log('   - Color: Blue\n');
  
  console.log('3. Create Teacher Approval Interface:');
  console.log('   - Name: "Teacher Approval"');
  console.log('   - Description: "Review and approve teacher applications"');
  console.log('   - Icon: User Check');
  console.log('   - Color: Green\n');
  
  console.log('4. Create Report Management Interface:');
  console.log('   - Name: "Report Management"');
  console.log('   - Description: "Handle content and user reports"');
  console.log('   - Icon: Flag');
  console.log('   - Color: Red\n');
  
  console.log('5. Create Analytics Dashboard Interface:');
  console.log('   - Name: "Analytics Dashboard"');
  console.log('   - Description: "System metrics and performance monitoring"');
  console.log('   - Icon: Bar Chart');
  console.log('   - Color: Purple\n');
  
  console.log('6. Configure Access Control:');
  console.log('   - Go to each interface settings');
  console.log('   - Click "Share" tab');
  console.log('   - Add admin users by email');
  console.log('   - Set appropriate permission levels\n');
  
  console.log('7. Set Up Views:');
  console.log('   - Create filtered views for each interface');
  console.log('   - Configure sorting and grouping');
  console.log('   - Add action buttons for common tasks\n');
  
  console.log('📖 For detailed setup instructions, see: docs/airtable-interfaces.md');
}

// Generate view configurations
function generateViewConfigurations() {
  console.log('\n📊 Recommended View Configurations');
  console.log('===================================\n');
  
  console.log('Booking Management Views:');
  console.log('- Pending Bookings: Filter by Status = "Pending", Sort by Created At');
  console.log('- Active Bookings: Filter by Status = "Active", Sort by Start Time');
  console.log('- Completed Bookings: Filter by Status = "Completed", Sort by End Time\n');
  
  console.log('Teacher Approval Views:');
  console.log('- New Applications: Filter by Approval Status = "Pending"');
  console.log('- Verification Queue: Filter by Verification Status = "Pending"');
  console.log('- Approved Teachers: Filter by Approval Status = "Approved"\n');
  
  console.log('Report Management Views:');
  console.log('- Pending Reports: Filter by Report Status = "Pending"');
  console.log('- Content Reports: Filter by Report Type = "Content"');
  console.log('- User Reports: Filter by Report Type = "User"\n');
  
  console.log('Analytics Dashboard Views:');
  console.log('- Booking Metrics: Group by Week, Sort by Date');
  console.log('- Teacher Performance: Sort by Rating, Group by Subject');
  console.log('- User Engagement: Group by Month, Sort by Activity\n');
}

// Generate permission matrix
function generatePermissionMatrix() {
  console.log('\n🔐 Permission Matrix');
  console.log('===================\n');
  
  console.log('| Interface | Admin | Moderator | Support |');
  console.log('|-----------|-------|-----------|---------|');
  console.log('| Booking Management | Full | View Only | Edit |');
  console.log('| Teacher Approval | Full | View Only | View Only |');
  console.log('| Report Management | Full | Full | View Only |');
  console.log('| Analytics Dashboard | Full | Limited | None |\n');
  
  console.log('Permission Levels:');
  console.log('- Full: Complete access to all functions');
  console.log('- Edit: Can view and edit records');
  console.log('- View Only: Can view but not edit');
  console.log('- Limited: Restricted access to specific functions');
  console.log('- None: No access to interface\n');
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Airtable Interfaces setup validation...');
    console.log(`📋 Base ID: ${AIRTABLE_BASE_ID}\n`);
    
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ This script should not be run in production!');
      process.exit(1);
    }

    // Validate tables and fields
    const tablesValid = await validateTables();
    if (!tablesValid) {
      console.log('\n❌ Table validation failed. Please create missing tables first.');
      process.exit(1);
    }

    const fieldsValid = await validateFields();
    if (!fieldsValid) {
      console.log('\n❌ Field validation failed. Please add missing fields first.');
      process.exit(1);
    }

    console.log('\n✅ All validations passed!');
    
    // Generate setup instructions
    generateSetupInstructions();
    generateViewConfigurations();
    generatePermissionMatrix();
    
    console.log('\n🎉 Airtable Interfaces setup validation complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Follow the setup instructions above');
    console.log('2. Create the four main interfaces');
    console.log('3. Configure views and permissions');
    console.log('4. Test with admin users');
    console.log('5. Train admin team on interface usage');

  } catch (error) {
    console.error('❌ Error during setup validation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { validateTables, validateFields, generateSetupInstructions };
