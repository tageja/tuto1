const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🔍 Verifying Airtable Base Access');
console.log('=================================\n');

console.log('📋 Your Credentials:');
console.log(`   API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${AIRTABLE_BASE_ID}\n`);

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function verifyBase() {
  try {
    console.log('🔍 Testing basic connection...');
    
    // Try to create a simple record to test permissions
    const testRecord = await base('TestTable').create([
      {
        fields: {
          'Name': 'Test Record',
          'Created': new Date().toISOString()
        }
      }
    ]);
    
    console.log('✅ Success! You have write permissions.');
    console.log('Created test record:', testRecord[0].id);
    
    // Clean up - delete the test record
    await base('TestTable').destroy(testRecord[0].id);
    console.log('🧹 Cleaned up test record.\n');
    
    console.log('🎉 Your Airtable credentials are working perfectly!');
    console.log('You can now set up the required tables.');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('You are not authorized')) {
      console.log('\n🔧 This means:');
      console.log('   - Your API key is valid');
      console.log('   - But you don\'t have permission to access this base');
      console.log('\n💡 Solutions:');
      console.log('1. Check if the base is shared with your account');
      console.log('2. Verify the Base ID is correct');
      console.log('3. Make sure your API key has access to this base');
      console.log('4. Try creating a new base and testing with that');
    } else if (error.message.includes('Table not found')) {
      console.log('\n✅ Good news! Your connection is working.');
      console.log('The base exists but the test table doesn\'t.');
      console.log('This is normal for a new base.');
    } else if (error.message.includes('Base not found')) {
      console.log('\n❌ The Base ID appears to be incorrect.');
      console.log('Please verify your Base ID.');
    }
    
    console.log('\n📝 To verify your Base ID:');
    console.log('1. Go to https://airtable.com');
    console.log('2. Open your base');
    console.log('3. Look at the URL: https://airtable.com/appXXXXXXXXXXXXXX/...');
    console.log('4. The part after "app" is your Base ID');
  }
}

verifyBase(); 