const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🧪 Testing Airtable Connection');
console.log('==============================\n');

if (!AIRTABLE_API_KEY) {
  console.log('❌ Error: AIRTABLE_API_KEY not found in environment variables');
  console.log('Please create a .env file with your Airtable API key');
  process.exit(1);
}

if (!AIRTABLE_BASE_ID || AIRTABLE_BASE_ID === 'your_base_id_here') {
  console.log('❌ Error: AIRTABLE_BASE_ID not configured');
  console.log('Please update your .env file with the correct Base ID');
  process.exit(1);
}

console.log('✅ Environment variables loaded:');
console.log(`   API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${AIRTABLE_BASE_ID}\n`);

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function testConnection() {
  try {
    console.log('🔍 Testing connection to Airtable...');
    
    // Try to access a table (we'll use a test table or create one)
    const testTableName = 'TestTable';
    
    // Try to list records from a table
    const records = await base(testTableName).select({
      maxRecords: 1,
      view: 'Grid view'
    }).firstPage();
    
    console.log('✅ Successfully connected to Airtable!');
    console.log(`📊 Found ${records.length} records in test table\n`);
    
    console.log('🎉 Airtable connection is working perfectly!');
    console.log('You can now use the app with real data from Airtable.');
    
  } catch (error) {
    console.log('❌ Error connecting to Airtable:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid API key');
      console.log('   - API key doesn\'t have access to this base');
      console.log('   - Base ID is incorrect');
    } else if (error.message.includes('Not Found')) {
      console.log('\n💡 This usually means:');
      console.log('   - Base ID is incorrect');
      console.log('   - Base doesn\'t exist');
    } else if (error.message.includes('Table not found')) {
      console.log('\n💡 This means:');
      console.log('   - The base exists and is accessible');
      console.log('   - But the test table doesn\'t exist yet');
      console.log('   - This is normal for a new base');
      console.log('\n✅ Your Airtable connection is working!');
      console.log('   You can now set up the required tables.');
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
testConnection(); 