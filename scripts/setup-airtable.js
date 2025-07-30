const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Starting Airtable setup...');
console.log('=============================\n');

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.log('❌ Error: Missing Airtable credentials');
  console.log('Please set up your .env file with AIRTABLE_API_KEY and AIRTABLE_BASE_ID');
  process.exit(1);
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Table schemas
const tableSchemas = {
  'Teachers': {
    fields: [
      { name: 'Name', type: 'Single line text' },
      { name: 'Email', type: 'Email' },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Avatar', type: 'Attachment' },
      { name: 'Subjects', type: 'Multiple select' },
      { name: 'Qualifications', type: 'Long text' },
      { name: 'Experience', type: 'Number' },
      { name: 'Hourly Rate', type: 'Number' },
      { name: 'Rating', type: 'Number' },
      { name: 'Review Count', type: 'Number' },
      { name: 'Location', type: 'Single line text' },
      { name: 'Latitude', type: 'Number' },
      { name: 'Longitude', type: 'Number' },
      { name: 'Availability', type: 'Long text' },
      { name: 'Languages', type: 'Multiple select' },
      { name: 'Description', type: 'Long text' },
      { name: 'Status', type: 'Single select' }
    ]
  },
  'Students': {
    fields: [
      { name: 'Name', type: 'Single line text' },
      { name: 'Age', type: 'Number' },
      { name: 'Grade', type: 'Single line text' },
      { name: 'Parent ID', type: 'Single line text' },
      { name: 'Subjects of Interest', type: 'Multiple select' },
      { name: 'Address', type: 'Long text' },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Email', type: 'Email' },
      { name: 'Status', type: 'Single select' }
    ]
  },
  'Parents': {
    fields: [
      { name: 'Name', type: 'Single line text' },
      { name: 'Email', type: 'Email' },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Address', type: 'Long text' },
      { name: 'Children', type: 'Multiple record links' },
      { name: 'Payment Method', type: 'Single select' },
      { name: 'Status', type: 'Single select' }
    ]
  },
  'Bookings': {
    fields: [
      { name: 'Student ID', type: 'Single line text' },
      { name: 'Teacher ID', type: 'Single line text' },
      { name: 'Parent ID', type: 'Single line text' },
      { name: 'Subject', type: 'Single line text' },
      { name: 'Date', type: 'Date' },
      { name: 'Time', type: 'Single line text' },
      { name: 'Duration', type: 'Number' },
      { name: 'Status', type: 'Single select' },
      { name: 'Notes', type: 'Long text' },
      { name: 'Payment Status', type: 'Single select' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Reviews': {
    fields: [
      { name: 'Teacher ID', type: 'Single line text' },
      { name: 'Student ID', type: 'Single line text' },
      { name: 'Rating', type: 'Number' },
      { name: 'Comment', type: 'Long text' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Subjects': {
    fields: [
      { name: 'Name', type: 'Single line text' },
      { name: 'Name Vi', type: 'Single line text' },
      { name: 'Category', type: 'Single select' },
      { name: 'Description', type: 'Long text' },
      { name: 'Description Vi', type: 'Long text' },
      { name: 'Color', type: 'Single line text' }
    ]
  },
  'Payments': {
    fields: [
      { name: 'Booking ID', type: 'Single line text' },
      { name: 'Amount', type: 'Number' },
      { name: 'Currency', type: 'Single line text' },
      { name: 'Status', type: 'Single select' },
      { name: 'Payment Method', type: 'Single line text' },
      { name: 'Transaction ID', type: 'Single line text' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Homework': {
    fields: [
      { name: 'Student ID', type: 'Single line text' },
      { name: 'Teacher ID', type: 'Single line text' },
      { name: 'Subject', type: 'Single line text' },
      { name: 'Title', type: 'Single line text' },
      { name: 'Description', type: 'Long text' },
      { name: 'Due Date', type: 'Date' },
      { name: 'Status', type: 'Single select' },
      { name: 'Created At', type: 'Date' }
    ]
  }
};

async function setupAirtable() {
  try {
    console.log('🔍 Checking existing tables...');
    
    // Test connection first
    await base('Table 1').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!\n');
    
    console.log('📋 Required tables for TutoApp:');
    Object.keys(tableSchemas).forEach((tableName, index) => {
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    console.log('\n📝 Manual Setup Instructions:');
    console.log('Since Airtable API doesn\'t support table creation, please:');
    console.log('1. Go to your Airtable base: https://airtable.com/app6C8JZ9m6vFWNEf');
    console.log('2. Create the following tables manually:');
    
    Object.entries(tableSchemas).forEach(([tableName, schema]) => {
      console.log(`\n📊 Table: ${tableName}`);
      console.log('   Fields:');
      schema.fields.forEach(field => {
        console.log(`   - ${field.name} (${field.type})`);
      });
    });
    
    console.log('\n🎯 After creating the tables:');
    console.log('1. Test the connection: npm run test:airtable');
    console.log('2. Start the app: npm start');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n💡 Please check your Airtable credentials and try again.');
  }
}

setupAirtable(); 