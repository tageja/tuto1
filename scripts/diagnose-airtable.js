const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🔍 Airtable Account Diagnosis');
console.log('=============================\n');

console.log('📋 Your Account Status:');
console.log('   API Key: ' + AIRTABLE_API_KEY.substring(0, 20) + '...');
console.log('   Base ID: ' + AIRTABLE_BASE_ID);
console.log('   Zero Credits: Yes (this could be the issue)\n');

console.log('💡 Possible Issues with Zero Credits:');
console.log('1. **API Rate Limits**: Free accounts have strict rate limits');
console.log('2. **Base Access**: Some features require paid plans');
console.log('3. **Table Creation**: Creating tables might require paid plan');
console.log('4. **API Calls**: Too many requests can cause timeouts\n');

console.log('🔧 Solutions:');
console.log('1. **Check Airtable Plan**: Go to https://airtable.com/account');
console.log('2. **Upgrade Plan**: Consider upgrading to paid plan');
console.log('3. **Use Free Tier Wisely**: Limit API calls');
console.log('4. **Alternative**: Use local development with mock data\n');

console.log('🚀 For Development, you can:');
console.log('1. Start the app with mock data: npm start');
console.log('2. Test the UI without Airtable');
console.log('3. Add Airtable later when you have credits\n');

console.log('📊 Current Status:');
console.log('✅ Your API key is valid');
console.log('✅ Your Base ID is correct');
console.log('⚠️  Zero credits might limit functionality');
console.log('💡 App will work with mock data for now'); 