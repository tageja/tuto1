require('dotenv').config();

console.log('Environment Variables Test:');
console.log('==========================');
console.log('EXPO_PUBLIC_AIRTABLE_API_KEY:', process.env.EXPO_PUBLIC_AIRTABLE_API_KEY ? 'SET' : 'NOT SET');
console.log('EXPO_PUBLIC_AIRTABLE_BASE_ID:', process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID ? 'SET' : 'NOT SET');

if (process.env.EXPO_PUBLIC_AIRTABLE_API_KEY) {
  console.log('API Key (first 20 chars):', process.env.EXPO_PUBLIC_AIRTABLE_API_KEY.substring(0, 20) + '...');
}
if (process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID) {
  console.log('Base ID:', process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID);
}



































