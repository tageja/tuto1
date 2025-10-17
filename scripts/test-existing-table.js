const Airtable = require('airtable');
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🧪 Testing Airtable Connection with Existing Table');
console.log('================================================\n');

if (!AIRTABLE_API_KEY) {
  console.log('❌ Error: API Key not found');
  process.exit(1);
}

if (!AIRTABLE_BASE_ID) {
  console.log('❌ Error: Base ID not found');
  process.exit(1);
}

console.log('✅ Environment variables loaded:');
console.log(`   API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${AIRTABLE_BASE_ID}\n`);

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function testExistingTable() {
  try {
    console.log('🔍 Testing connection with existing table...');
    
    // Try to access an existing table (TutoTeachers)
    const tableName = 'TutoTeachers';
    
    console.log(`📊 Trying to access table: ${tableName}`);
    
    const records = await base(tableName).select({
      maxRecords: 1,
      view: 'Grid view'
    }).firstPage();
    
    console.log('✅ Successfully connected to Airtable!');
    console.log(`📊 Found ${records.length} records in ${tableName}\n`);
    
    console.log('🎉 Airtable connection is working perfectly!');
    console.log('You can now create the school tables.');
    
  } catch (error) {
    console.log('❌ Error connecting to Airtable:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('Table not found')) {
      console.log('\n💡 This means:');
      console.log('   - The base exists and is accessible');
      console.log('   - But the TutoTeachers table doesn\'t exist');
      console.log('   - This is normal if you haven\'t set up the tables yet');
      console.log('\n✅ Your Airtable connection is working!');
      console.log('   You can now create the required tables.');
      return;
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check that your API key has access to the base');
    console.log('3. Verify the Base ID is correct');
    console.log('4. Make sure the base exists and is accessible');
    
    process.exit(1);
  }
}

// Run the test
testExistingTable();













