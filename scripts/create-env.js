const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env file for TutoApp');
console.log('==================================\n');

// Your Airtable API key
const AIRTABLE_API_KEY = 'patlzauOLrLxsf4QM.9736ae2105ab3a8511d531542feab2695442b5d26e29c7618185f9fcb121737c';

// Create .env content
const envContent = `# Airtable Configuration
EXPO_PUBLIC_AIRTABLE_API_KEY=${AIRTABLE_API_KEY}
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here

# App Configuration
EXPO_PUBLIC_APP_NAME=TutoApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENVIRONMENT=development
`;

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('Updating with new Airtable API key...\n');
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file created successfully!');
  console.log(`📁 Location: ${envPath}\n`);
  
  console.log('📝 Next Steps:');
  console.log('1. Replace "your_base_id_here" with your actual Airtable Base ID');
  console.log('2. To get your Base ID:');
  console.log('   - Go to https://airtable.com');
  console.log('   - Open your base');
  console.log('   - Click "Help" → "API Documentation"');
  console.log('   - Copy the Base ID from the URL\n');
  
  console.log('3. Test the connection:');
  console.log('   npm run test:airtable\n');
  
  console.log('4. Set up your Airtable base:');
  console.log('   npm run setup:airtable');
  
} catch (error) {
  console.log('❌ Error creating .env file:');
  console.log(`   ${error.message}`);
  console.log('\n💡 Please create the .env file manually with the content above.');
} 