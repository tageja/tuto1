const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🧪 Simple Airtable Test');
console.log('=======================\n');

console.log('📋 Credentials:');
console.log(`   API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${AIRTABLE_BASE_ID}\n`);

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function simpleTest() {
  try {
    console.log('🔍 Testing basic read access...');
    
    // Try to read from the default table (usually "Table 1")
    const records = await base('Table 1').select({
      maxRecords: 1
    }).firstPage();
    
    console.log('✅ Success! Can read from base.');
    console.log(`📊 Found ${records.length} records`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('Table not found')) {
      console.log('\n💡 The base exists but has no tables yet.');
      console.log('This is normal for a new base.');
      console.log('✅ Your connection is working!');
    } else if (error.message.includes('You are not authorized')) {
      console.log('\n🔧 Authorization issue detected.');
      console.log('Possible solutions:');
      console.log('1. Check if you created the base with the same account');
      console.log('2. Verify the API key is from the same account');
      console.log('3. Try creating a new API key');
    }
  }
}

simpleTest(); 