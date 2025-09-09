const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Automated School Tables Creation for TutoApp');
console.log('===============================================\n');

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

// School table schemas with proper field definitions
const schoolTableSchemas = {
  'TutoSchools': {
    description: 'School information and details',
    fields: [
      { name: 'Name', type: 'singleLineText' },
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

  'TutoSchoolInvitations': {
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
            { name: 'Disabled' }
          ]
        }
      },
      { 
        name: 'Used By', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Parent' },
            { name: 'Student' },
            { name: 'Teacher' }
          ]
        }
      }
    ]
  }
};

async function createSchoolTables() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection by fetching base info
    const baseInfo = await callMetadataAPI('/tables');
    console.log('✅ Connection successful!\n');
    
    console.log('📋 Creating school tables for TutoApp...\n');
    
    const createdTables = {};
    
    for (const [tableName, schema] of Object.entries(schoolTableSchemas)) {
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
    
    console.log('🎯 School Table Creation Summary:');
    console.log('=================================');
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
    console.log('1. Populate tables with sample data: npm run populate:school:data');
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
createSchoolTables();
