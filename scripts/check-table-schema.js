const fetch = require('node-fetch');
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

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

async function checkTableSchema() {
  try {
    console.log('🔍 Checking table schemas...\n');
    
    const tables = await callMetadataAPI('/tables');
    
    if (tables && tables.tables) {
      tables.tables.forEach(table => {
        console.log(`📋 Table: ${table.name} (ID: ${table.id})`);
        console.log(`   Description: ${table.description || 'No description'}`);
        console.log('   Fields:');
        
        table.fields.forEach(field => {
          console.log(`     - ${field.name} (${field.type})`);
        });
        
        console.log('');
      });
    } else {
      console.log('❌ No tables found or invalid response');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkTableSchema();



































