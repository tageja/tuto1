const fs = require('fs');
const path = require('path');

console.log('🔧 Updating .env file with Base ID');
console.log('==================================\n');

// Your Airtable credentials
const AIRTABLE_API_KEY = 'patlzauOLrLxsf4QM.9736ae2105ab3a8511d531542feab2695442b5d26e29c7618185f9fcb121737c';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';

// Create .env content
const envContent = `# Airtable Configuration
EXPO_PUBLIC_AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
EXPO_PUBLIC_AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}

# App Configuration
EXPO_PUBLIC_APP_NAME=TutoApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENVIRONMENT=development
`;

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

try {
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!');
  console.log(`📁 Location: ${envPath}\n`);
  
  console.log('🔑 Airtable Configuration:');
  console.log(`   API Key: ${AIRTABLE_API_KEY.substring(0, 20)}...`);
  console.log(`   Base ID: ${AIRTABLE_BASE_ID}\n`);
  
  console.log('🧪 Ready to test connection!');
  console.log('Run: npm run test:airtable');
  
} catch (error) {
  console.log('❌ Error updating .env file:');
  console.log(`   ${error.message}`);
} 