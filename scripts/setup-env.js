const fs = require('fs');
const path = require('path');

console.log('🔧 TutoApp Environment Setup');
console.log('=============================\n');

// Your Airtable API key
const AIRTABLE_API_KEY = 'patlzauOLrLxsf4QM.9736ae2105ab3a8511d531542feab2695442b5d26e29c7618185f9fcb121737c';

console.log('✅ Airtable API Key:');
console.log(`   ${AIRTABLE_API_KEY}\n`);

// Create .env content
const envContent = `# Airtable Configuration
EXPO_PUBLIC_AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here

# App Configuration
EXPO_PUBLIC_APP_NAME=TutoApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENVIRONMENT=development
`;

// Instructions
console.log('📝 Next Steps:');
console.log('1. Create a .env file in the root directory');
console.log('2. Copy the following content into the .env file:\n');
console.log('='.repeat(50));
console.log(envContent);
console.log('='.repeat(50));

console.log('\n3. Replace "your_base_id_here" with your actual Airtable Base ID');
console.log('4. Run the Airtable setup script: node scripts/setup-airtable.js');

// Check if .env already exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('\n⚠️  .env file already exists!');
  console.log('Please update it with the new Airtable API key.');
} else {
  console.log('\n📁 .env file will be created when you follow the steps above.');
}

console.log('\n🎯 To get your Airtable Base ID:');
console.log('1. Go to https://airtable.com');
console.log('2. Open your base');
console.log('3. Click on "Help" → "API Documentation"');
console.log('4. Copy the Base ID from the URL');
console.log('5. Replace "your_base_id_here" in the .env file');

console.log('\n🚀 After setup, you can test the connection with:');
console.log('   npm run test:airtable'); 