const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Automated Airtable Table Creation for TutoApp');
console.log('================================================\n');

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

// Helper function for Data API calls
async function callDataAPI(tableId, method = 'GET', body = null) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
  
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

// Batch create records helper
async function batchCreateRecords(tableId, records) {
  console.log(`📝 Creating ${records.length} records in table ${tableId}...`);
  
  try {
    const result = await callDataAPI(tableId, 'POST', { records });
    console.log(`✅ Successfully created ${records.length} records`);
    return result;
  } catch (error) {
    console.error(`❌ Batch creation failed: ${error.message}`);
    throw error;
  }
}

// Comprehensive table schemas with proper field definitions
const tableSchemas = {
  'Teachers': {
    description: 'Teacher profiles with qualifications, subjects, and availability',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Avatar', type: 'singleLineText' },
      { 
        name: 'Subjects', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' }
          ]
        }
      },
      { name: 'Qualifications', type: 'multilineText' },
      { name: 'Experience', type: 'number', options: { precision: 0 } },
      { name: 'Hourly Rate', type: 'number', options: { precision: 0 } },
      { name: 'Rating', type: 'number', options: { precision: 1 } },
      { name: 'Review Count', type: 'number', options: { precision: 0 } },
      { name: 'Location Address', type: 'multilineText' },
      { name: 'Latitude', type: 'number', options: { precision: 6 } },
      { name: 'Longitude', type: 'number', options: { precision: 6 } },
      { 
        name: 'Availability Days', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Monday' },
            { name: 'Tuesday' },
            { name: 'Wednesday' },
            { name: 'Thursday' },
            { name: 'Friday' },
            { name: 'Saturday' },
            { name: 'Sunday' }
          ]
        }
      },
      { name: 'Availability Time Slots', type: 'multilineText' },
      { 
        name: 'Languages', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Vietnamese' },
            { name: 'English' },
            { name: 'Chinese' },
            { name: 'French' },
            { name: 'Korean' },
            { name: 'Japanese' }
          ]
        }
      },
      { name: 'Description', type: 'multilineText' },
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
      }
    ]
  },
  'Students': {
    description: 'Student profiles with academic information and interests',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Age', type: 'number', options: { precision: 0 } },
      { name: 'Grade', type: 'singleLineText' },
      { name: 'Parent ID', type: 'singleLineText' },
      { 
        name: 'Subjects of Interest', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' }
          ]
        }
      },
      { name: 'Address', type: 'multilineText' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Email', type: 'email' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'Parents': {
    description: 'Parent profiles with payment methods and children',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Address', type: 'multilineText' },
      { name: 'Children', type: 'multipleRecordLinks', options: { linkedTableId: 'tbl1cOkQ1qMbeZgn4' } },
      { 
        name: 'Payment Method', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Credit Card' },
            { name: 'Bank Transfer' },
            { name: 'Cash' },
            { name: 'Digital Wallet' },
            { name: 'PayPal' }
          ]
        }
      },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'Bookings': {
    description: 'Tutoring session bookings and scheduling',
    fields: [
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Parent ID', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Time', type: 'singleLineText' },
      { name: 'Duration', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Confirmed' },
            { name: 'Completed' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Notes', type: 'multilineText' },
      { 
        name: 'Payment Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Paid' },
            { name: 'Refunded' }
          ]
        }
      },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'Subjects': {
    description: 'Subject catalog with bilingual support',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Name Vietnamese', type: 'singleLineText' },
      { name: 'Icon', type: 'singleLineText' },
      { 
        name: 'Category', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Academic' },
            { name: 'Extracurricular' }
          ]
        }
      },
      { name: 'Description', type: 'multilineText' },
      { name: 'Description Vietnamese', type: 'multilineText' },
      { name: 'Color', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'Reviews': {
    description: 'Teacher reviews and ratings from students/parents',
    fields: [
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Rating', type: 'number', options: { precision: 1 } },
      { name: 'Comment', type: 'multilineText' },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'Payments': {
    description: 'Payment tracking for tutoring sessions',
    fields: [
      { name: 'Booking ID', type: 'singleLineText' },
      { name: 'Amount', type: 'number', options: { precision: 0 } },
      { name: 'Currency', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Paid' },
            { name: 'Refunded' }
          ]
        }
      },
      { name: 'Payment Method', type: 'singleLineText' },
      { name: 'Transaction ID', type: 'singleLineText' },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'Homework': {
    description: 'Homework assignments with adaptive learning levels',
    fields: [
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Title', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Assigned' },
            { name: 'Submitted' },
            { name: 'Graded' }
          ]
        }
      },
      { name: 'Adaptive Level', type: 'number', options: { precision: 0 } },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'Posts': {
    description: 'Social feed posts for community engagement',
    fields: [
      { name: 'Author ID', type: 'singleLineText' },
      { name: 'Author Name', type: 'singleLineText' },
      { 
        name: 'Author Role', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'teacher' },
            { name: 'parent' },
            { name: 'student' }
          ]
        }
      },
      { name: 'Author Avatar', type: 'singleLineText' },
      { name: 'Content Text', type: 'multilineText' },
      { 
        name: 'Content Media Type', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'image' },
            { name: 'video' }
          ]
        }
      },
      { name: 'Content Media URL', type: 'singleLineText' },
      { name: 'Content Media Thumbnail', type: 'singleLineText' },
      { 
        name: 'Post Type', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'text' },
            { name: 'image' },
            { name: 'video' },
            { name: 'poll' },
            { name: 'resource' }
          ]
        }
      },
      { 
        name: 'Subjects', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' },
            { name: 'Education' },
            { name: 'Writing' },
            { name: 'Creativity' },
            { name: 'Programming' },
            { name: 'Tutoring' }
          ]
        }
      },
      { name: 'Timestamp', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } },
      { name: 'Likes Count', type: 'number', options: { precision: 0 } },
      { name: 'Comments Count', type: 'number', options: { precision: 0 } },
      { name: 'Shares Count', type: 'number', options: { precision: 0 } },
      { name: 'Saves Count', type: 'number', options: { precision: 0 } },
      { 
        name: 'Privacy', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'public' },
            { name: 'center-only' },
            { name: 'network-only' }
          ]
        }
      },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Hidden' },
            { name: 'Deleted' }
          ]
        }
      }
    ]
  }
};

async function createTables() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection by fetching base info
    const baseInfo = await callMetadataAPI('/tables');
    console.log('✅ Connection successful!\n');
    
    console.log('📋 Creating tables for TutoApp...\n');
    
    const createdTables = {};
    
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      console.log(`📊 Creating table: ${tableName}`);
      console.log(`   Description: ${schema.description}`);
      console.log(`   Fields: ${schema.fields.length}`);
      
      try {
        // Create table using Metadata API
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
        
        if (error.message.includes('already exists')) {
          console.log(`   💡 Table "${tableName}" already exists, skipping...`);
        }
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
    } else {
      console.log('⚠️  No new tables were created (they may already exist)');
    }
    
    console.log('');
    console.log('🎉 Next Steps:');
    console.log('1. Populate tables with sample data: npm run populate:tables');
    console.log('2. Test the connection: npm run test:airtable');
    console.log('3. Start the app: npm start');
    
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
createTables(); 