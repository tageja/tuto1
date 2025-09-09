import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.AIRTABLE_API_KEY
             || process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID
             || process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🧪 Simple Airtable Test');
console.log('=======================\n');

console.log('📋 Credentials:');
console.log(`   API Key: ${API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${BASE_ID}\n`);

async function simpleTest() {
  try {
    console.log('🔍 Testing basic read access...');
    
    // Try to read from the TutoTeachers table
    const url = `https://api.airtable.com/v0/${BASE_ID}/TutoTeachers`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`🛑 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Can read from TutoTeachers table.');
      console.log(`📊 Found ${data.records.length} records`);
      
      if (data.records.length > 0) {
        console.log('\n📋 Sample record:');
        console.log(JSON.stringify(data.records[0], null, 2));
      }
      
    } else {
      console.log('❌ Error reading from table');
      
      // Show response body for debugging
      const text = await response.text();
      console.log('📄 Response Body:', text);
    }
    
  } catch (error) {
    console.log('❌ Error testing read access:', error.message);
  }
}

simpleTest(); 