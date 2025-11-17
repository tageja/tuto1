/**
 * Firebase Web Configuration Setup for Tuto Dashboard
 * 
 * This script helps set up the Firebase web configuration.
 * 
 * To get your web app credentials:
 * 1. Go to https://console.firebase.google.com/project/tuto1-73fc4
 * 2. Click Project Settings (gear icon)
 * 3. Scroll down to "Your apps"
 * 4. If no web app exists, click "Add app" > Web
 * 5. Copy the firebaseConfig object
 * 6. Run: node scripts/setup-firebase-web.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Firebase Web Configuration Setup for Tuto Dashboard\n');
console.log('=' .repeat(60));

// Known Firebase project ID from .firebaserc
const FIREBASE_PROJECT_ID = 'tuto1-73fc4';

console.log('\n📋 Firebase Project Information:');
console.log(`   Project ID: ${FIREBASE_PROJECT_ID}`);
console.log(`   Console: https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}`);

console.log('\n📝 To complete setup, please:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/tuto1-73fc4/settings/general');
console.log('2. Scroll down to "Your apps" section');
console.log('3. If you don\'t have a web app, click "Add app" and select Web (</>) icon');
console.log('4. Register the app with nickname: "Tuto Web Dashboard"');
console.log('5. Copy the firebaseConfig object');
console.log('6. Paste the values below when creating .env.local\n');

// Template for .env.local
const envTemplate = `# Firebase Configuration (Web)
# Get these from: https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/settings/general

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_PROJECT_ID}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FIREBASE_PROJECT_ID}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Functions Configuration
NEXT_PUBLIC_FUNCTIONS_REGION=asia-southeast1

# Environment
NEXT_PUBLIC_APP_ENVIRONMENT=development

# App Configuration
NEXT_PUBLIC_APP_NAME=Tuto Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists!');
    console.log(`📁 Location: ${envPath}\n`);
    console.log('To recreate it, delete the file and run this script again.\n');
  } else {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env.local template created!');
    console.log(`📁 Location: ${envPath}\n`);
    console.log('⚠️  IMPORTANT: Edit .env.local and replace the placeholder values with your actual Firebase credentials.\n');
  }
  
  console.log('📖 .env.local template:');
  console.log('─'.repeat(60));
  console.log(envTemplate);
  console.log('─'.repeat(60));
  
  console.log('\n✨ Next Steps:');
  console.log('1. Get your Firebase web credentials from the console');
  console.log('2. Edit apps/dashboard/.env.local with the actual values');
  console.log('3. Run: cd apps/dashboard && npm run dev');
  console.log('4. Open: http://localhost:3000/setup');
  console.log('5. Click "Run All Tests" to verify connectivity\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

























