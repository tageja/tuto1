import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.AIRTABLE_API_KEY
             || process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID
             || process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🔍 Testing Metadata API Access');
console.log('==============================\n');

console.log('📋 Your Credentials:');
console.log(`   API Key: ${API_KEY.substring(0, 20)}...`);
console.log(`   Base ID: ${BASE_ID}\n`);

// Metadata endpoint for listing tables
const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;

async function testMetadata() {
  try {
    console.log('🔍 Testing Metadata API access...');
    console.log('▶️  Request URL:', url);
    
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
      console.log('✅ Metadata API access successful!');
      console.log(`📊 Tables found: ${data.tables.length}`);
      
      if (data.tables.length > 0) {
        console.log('\n📋 Available tables:');
        data.tables.forEach((table, index) => {
          console.log(`   ${index + 1}. ${table.name} (ID: ${table.id})`);
        });
      } else {
        console.log('\n💡 No tables found. This is normal for a new base.');
      }
      
    } else {
      console.log('❌ Metadata API access failed');
      
      // Show response body for debugging
      const text = await response.text();
      console.log('📄 Response Body:', text);
    }
    
  } catch (error) {
    console.log('❌ Error testing Metadata API:', error.message);
  }
}

testMetadata(); 