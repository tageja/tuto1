const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Creating Airtable Tables for TutoApp');
console.log('========================================\n');

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.log('❌ Error: Missing Airtable credentials');
  console.log('Please set up your .env file with:');
  console.log('EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here');
  console.log('EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here');
  process.exit(1);
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Comprehensive table schemas based on your app's TypeScript interfaces
const tableSchemas = {
  'Teachers': {
    description: 'Teacher profiles with qualifications, subjects, and availability',
    fields: [
      { name: 'Name', type: 'Single line text', required: true },
      { name: 'Email', type: 'Email', required: true },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Avatar', type: 'Single line text' },
      { name: 'Subjects', type: 'Multiple select', options: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Literature', 'Biology', 'History', 'Geography', 'Computer Science', 'Music', 'Art', 'Sports', 'Piano', 'Guitar', 'Swimming', 'Football', 'Basketball', 'Drawing'] },
      { name: 'Qualifications', type: 'Long text' },
      { name: 'Experience', type: 'Number' },
      { name: 'Hourly Rate', type: 'Number' },
      { name: 'Rating', type: 'Number' },
      { name: 'Review Count', type: 'Number' },
      { name: 'Location Address', type: 'Long text' },
      { name: 'Latitude', type: 'Number' },
      { name: 'Longitude', type: 'Number' },
      { name: 'Availability Days', type: 'Multiple select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { name: 'Availability Time Slots', type: 'Long text' },
      { name: 'Languages', type: 'Multiple select', options: ['Vietnamese', 'English', 'Chinese', 'French', 'Korean', 'Japanese'] },
      { name: 'Description', type: 'Long text' },
      { name: 'Status', type: 'Single select', options: ['Active', 'Inactive', 'Pending'] }
    ]
  },
  'Students': {
    description: 'Student profiles with academic information and interests',
    fields: [
      { name: 'Name', type: 'Single line text', required: true },
      { name: 'Age', type: 'Number' },
      { name: 'Grade', type: 'Single line text' },
      { name: 'Parent ID', type: 'Single line text', required: true },
      { name: 'Subjects of Interest', type: 'Multiple select', options: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Literature', 'Biology', 'History', 'Geography', 'Computer Science', 'Music', 'Art', 'Sports', 'Piano', 'Guitar', 'Swimming', 'Football', 'Basketball', 'Drawing'] },
      { name: 'Address', type: 'Long text' },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Email', type: 'Email' },
      { name: 'Status', type: 'Single select', options: ['Active', 'Inactive'] }
    ]
  },
  'Parents': {
    description: 'Parent profiles with payment methods and children',
    fields: [
      { name: 'Name', type: 'Single line text', required: true },
      { name: 'Email', type: 'Email', required: true },
      { name: 'Phone', type: 'Phone number' },
      { name: 'Address', type: 'Long text' },
      { name: 'Children', type: 'Multiple record links', linkedTable: 'Students' },
      { name: 'Payment Method', type: 'Single select', options: ['Credit Card', 'Bank Transfer', 'Cash', 'Digital Wallet', 'PayPal'] },
      { name: 'Status', type: 'Single select', options: ['Active', 'Inactive'] }
    ]
  },
  'Bookings': {
    description: 'Tutoring session bookings and scheduling',
    fields: [
      { name: 'Student ID', type: 'Link to another record', linkedTable: 'Students', required: true },
      { name: 'Teacher ID', type: 'Link to another record', linkedTable: 'Teachers', required: true },
      { name: 'Parent ID', type: 'Link to another record', linkedTable: 'Parents', required: true },
      { name: 'Subject', type: 'Single line text', required: true },
      { name: 'Date', type: 'Date', required: true },
      { name: 'Time', type: 'Single line text', required: true },
      { name: 'Duration', type: 'Number' },
      { name: 'Status', type: 'Single select', options: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] },
      { name: 'Notes', type: 'Long text' },
      { name: 'Payment Status', type: 'Single select', options: ['Pending', 'Paid', 'Refunded'] },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Subjects': {
    description: 'Subject catalog with bilingual support',
    fields: [
      { name: 'Name', type: 'Single line text', required: true },
      { name: 'Name Vietnamese', type: 'Single line text' },
      { name: 'Icon', type: 'Single line text' },
      { name: 'Category', type: 'Single select', options: ['Academic', 'Extracurricular'] },
      { name: 'Description', type: 'Long text' },
      { name: 'Description Vietnamese', type: 'Long text' },
      { name: 'Color', type: 'Single line text' },
      { name: 'Status', type: 'Single select', options: ['Active', 'Inactive'] }
    ]
  },
  'Reviews': {
    description: 'Teacher reviews and ratings from students/parents',
    fields: [
      { name: 'Teacher ID', type: 'Link to another record', linkedTable: 'Teachers', required: true },
      { name: 'Student ID', type: 'Link to another record', linkedTable: 'Students', required: true },
      { name: 'Rating', type: 'Number', required: true },
      { name: 'Comment', type: 'Long text' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Payments': {
    description: 'Payment tracking for tutoring sessions',
    fields: [
      { name: 'Booking ID', type: 'Link to another record', linkedTable: 'Bookings', required: true },
      { name: 'Amount', type: 'Number', required: true },
      { name: 'Currency', type: 'Single line text' },
      { name: 'Status', type: 'Single select', options: ['Pending', 'Paid', 'Refunded'] },
      { name: 'Payment Method', type: 'Single line text' },
      { name: 'Transaction ID', type: 'Single line text' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Homework': {
    description: 'Homework assignments with adaptive learning levels',
    fields: [
      { name: 'Student ID', type: 'Link to another record', linkedTable: 'Students', required: true },
      { name: 'Teacher ID', type: 'Link to another record', linkedTable: 'Teachers', required: true },
      { name: 'Subject', type: 'Single line text', required: true },
      { name: 'Title', type: 'Single line text', required: true },
      { name: 'Description', type: 'Long text' },
      { name: 'Due Date', type: 'Date' },
      { name: 'Status', type: 'Single select', options: ['Assigned', 'Submitted', 'Graded'] },
      { name: 'Adaptive Level', type: 'Number' },
      { name: 'Created At', type: 'Date' }
    ]
  },
  'Posts': {
    description: 'Social feed posts for community engagement',
    fields: [
      { name: 'Author ID', type: 'Single line text', required: true },
      { name: 'Author Name', type: 'Single line text', required: true },
      { name: 'Author Role', type: 'Single select', options: ['teacher', 'parent', 'student'] },
      { name: 'Author Avatar', type: 'Single line text' },
      { name: 'Content Text', type: 'Long text', required: true },
      { name: 'Content Media Type', type: 'Single select', options: ['image', 'video'] },
      { name: 'Content Media URL', type: 'Single line text' },
      { name: 'Content Media Thumbnail', type: 'Single line text' },
      { name: 'Post Type', type: 'Single select', options: ['text', 'image', 'video', 'poll', 'resource'] },
      { name: 'Subjects', type: 'Multiple select', options: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Literature', 'Biology', 'History', 'Geography', 'Computer Science', 'Music', 'Art', 'Sports', 'Piano', 'Guitar', 'Swimming', 'Football', 'Basketball', 'Drawing', 'Education', 'Writing', 'Creativity', 'Programming', 'Tutoring'] },
      { name: 'Timestamp', type: 'Date' },
      { name: 'Likes Count', type: 'Number' },
      { name: 'Comments Count', type: 'Number' },
      { name: 'Shares Count', type: 'Number' },
      { name: 'Saves Count', type: 'Number' },
      { name: 'Privacy', type: 'Single select', options: ['public', 'center-only', 'network-only'] },
      { name: 'Status', type: 'Single select', options: ['Active', 'Hidden', 'Deleted'] }
    ]
  }
};

async function createTables() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection first
    await base('Table 1').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!\n');
    
    console.log('📋 Creating tables for TutoApp...\n');
    
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      console.log(`📊 Creating table: ${tableName}`);
      console.log(`   Description: ${schema.description}`);
      console.log(`   Fields: ${schema.fields.length}`);
      
      try {
        // Note: Airtable API doesn't support table creation via API
        // This script provides the exact schema you need to create manually
        console.log(`   ⚠️  Manual creation required for: ${tableName}`);
        console.log('   Fields to create:');
        
        schema.fields.forEach((field, index) => {
          const required = field.required ? ' (Required)' : '';
          const linkedTable = field.linkedTable ? ` → ${field.linkedTable}` : '';
          console.log(`      ${index + 1}. ${field.name} (${field.type})${required}${linkedTable}`);
          
          if (field.options) {
            console.log(`         Options: ${field.options.join(', ')}`);
          }
        });
        
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Error with ${tableName}: ${error.message}`);
      }
    }
    
    console.log('🎯 Manual Setup Instructions:');
    console.log('============================');
    console.log('');
    console.log('1. Go to your Airtable base: https://airtable.com/');
    console.log('2. Create the following tables manually:');
    console.log('');
    
    Object.entries(tableSchemas).forEach(([tableName, schema], index) => {
      console.log(`${index + 1}. Table: "${tableName}"`);
      console.log(`   Description: ${schema.description}`);
      console.log('   Fields:');
      schema.fields.forEach(field => {
        const required = field.required ? ' (Required)' : '';
        const linkedTable = field.linkedTable ? ` → ${field.linkedTable}` : '';
        console.log(`   - ${field.name} (${field.type})${required}${linkedTable}`);
        
        if (field.options) {
          console.log(`     Options: ${field.options.join(', ')}`);
        }
      });
      console.log('');
    });
    
    console.log('✅ Table schemas ready!');
    console.log('');
    console.log('🎉 After creating the tables:');
    console.log('1. Test the connection: npm run test:airtable');
    console.log('2. Start the app: npm start');
    console.log('3. Your app will be fully functional with real data!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid API key');
      console.log('   - API key doesn\'t have access to this base');
      console.log('   - Base ID is incorrect');
    } else if (error.message.includes('Not Found')) {
      console.log('\n💡 This usually means:');
      console.log('   - Base ID is incorrect');
      console.log('   - Base doesn\'t exist');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check that your API key has access to the base');
    console.log('3. Verify the Base ID is correct');
    console.log('4. Make sure the base exists and is accessible');
    
    process.exit(1);
  }
}

// Run the table creation
createTables(); 