const fetch = require('node-fetch');
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🏫 Populating school management tables with sample data...');

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

// Sample data for schools
const sampleSchools = [
  {
    fields: {
      'School Name': 'Mầm non Xanh CN Vinhomes Grand Park'
    }
  },
  {
    fields: {
      'School Name': 'Trường Mầm non Hoa Hồng'
    }
  }
];

// Sample data for invitations
const sampleInvitations = [
  {
    fields: {
      'Invitation Code': 'SCHOOL001'
    }
  },
  {
    fields: {
      'Invitation Code': 'SCHOOL002'
    }
  }
];

async function populateSchoolData() {
  try {
    console.log('🚀 Starting data population process...\n');
    
    // Populate Schools
    console.log('📚 Populating TutoSchools...');
    try {
      await batchCreateRecords('TutoSchools', sampleSchools);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Schools already exist, skipping...');
      } else {
        console.log(`❌ Error populating TutoSchools: ${error.message}`);
      }
    }
    
    // Populate Invitations
    console.log('\n🎫 Populating TutoSchoolInvitations...');
    try {
      await batchCreateRecords('TutoSchoolInvitations', sampleInvitations);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Invitations already exist, skipping...');
      } else {
        console.log(`❌ Error populating TutoSchoolInvitations: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Data population completed!');
    console.log('\n📋 Summary:');
    console.log('- Schools: 2 records');
    console.log('- Invitations: 2 records');
    console.log('\n✅ You can now test the school features in the app!');
    
  } catch (error) {
    console.log('❌ Error during data population:', error.message);
    process.exit(1);
  }
}

// Run the data population
populateSchoolData();
