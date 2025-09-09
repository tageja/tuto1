const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;

console.log('🔍 Testing API Key Access');
console.log('=========================\n');

console.log('📋 Your API Key:');
console.log(`   ${AIRTABLE_API_KEY.substring(0, 20)}...\n`);

async function testApiKey() {
  try {
    console.log('🔍 Testing API key validity...');
    
    // Try to list bases (this should work if the API key is valid)
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log(`📊 Found ${data.bases.length} bases you have access to:`);
      
      data.bases.forEach((base, index) => {
        console.log(`   ${index + 1}. ${base.name} (ID: ${base.id})`);
      });
      
      console.log('\n💡 Use one of these Base IDs in your .env file');
      
    } else {
      console.log('❌ API key is not valid or has insufficient permissions');
      console.log(`Status: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.log('❌ Error testing API key:', error.message);
  }
}

testApiKey(); 