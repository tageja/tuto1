/**
 * Diagnostic script for Google Auth configuration
 * Run with: node scripts/diagnose-google-auth.js
 */

require('dotenv').config();

console.log('\n🔍 GOOGLE AUTH DIAGNOSTIC\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('=' .repeat(60));

const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
];

const optionalVars = [
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌ MISSING';
  console.log(`${status} ${varName}`);
  if (value && varName.includes('CLIENT_ID')) {
    console.log(`   └─ Value: ${value.substring(0, 20)}...`);
  }
  if (!value) allPresent = false;
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️  Not set';
  console.log(`${status} ${varName}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n🔑 Google Cloud Console Configuration Needed:');
console.log('=' .repeat(60));

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (webClientId) {
  console.log(`\nClient ID: ${webClientId}`);
  console.log('\nRequired Redirect URIs:');
  console.log('  1. For Expo Go (development):');
  console.log('     https://auth.expo.io/@YOUR_EXPO_USERNAME/tuto');
  console.log('  \n  2. For standalone builds (production):');
  console.log('     - Will be different, needs native setup');
  
  console.log('\n\nRequired JavaScript Origins:');
  console.log('  • https://auth.expo.io');
  
  console.log('\n\n📝 Setup Instructions:');
  console.log('=' .repeat(60));
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log(`2. Find OAuth 2.0 Client ID: ${webClientId}`);
  console.log('3. Click EDIT');
  console.log('4. Under "Authorized JavaScript origins", add:');
  console.log('   • https://auth.expo.io');
  console.log('5. Under "Authorized redirect URIs", add:');
  console.log('   • https://auth.expo.io/@YOUR_EXPO_USERNAME/tuto');
  console.log('   (Replace YOUR_EXPO_USERNAME with your actual Expo username)');
  console.log('6. Click SAVE');
  console.log('7. Wait 1-2 minutes for changes to propagate\n');
} else {
  console.log('\n❌ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not found in .env');
  console.log('\nAdd this to your .env file:');
  console.log('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com\n');
}

console.log('\n🔍 Find Your Expo Username:');
console.log('=' .repeat(60));
console.log('Run: npx expo whoami');
console.log('If not logged in, run: npx expo login');
console.log('If using @anonymous, you need to create an Expo account\n');

console.log('\n🎯 Alternative Approach (Recommended for Production):');
console.log('=' .repeat(60));
console.log('Use native Google Sign-In SDK instead of expo-auth-session');
console.log('1. Install: @react-native-google-signin/google-signin');
console.log('2. Create iOS and Android OAuth clients in Google Cloud');
console.log('3. Add google-services.json (Android) and GoogleService-Info.plist (iOS)');
console.log('4. Build standalone app (not Expo Go)');
console.log('\nThis provides better UX and fewer configuration issues.\n');

if (allPresent) {
  console.log('\n✅ All required environment variables are present!');
  console.log('Next step: Configure Google Cloud Console redirect URIs\n');
} else {
  console.log('\n❌ Missing required environment variables');
  console.log('Please add them to your .env file\n');
}





