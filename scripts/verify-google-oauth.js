/**
 * Verify Google OAuth Configuration
 * Run: node scripts/verify-google-oauth.js
 */

require('dotenv').config();
const { execSync } = require('child_process');

console.log('\n🔐 GOOGLE OAUTH VERIFICATION\n');
console.log('='.repeat(70));

let allGood = true;

// Step 1: Check Expo Account
console.log('\n✓ Step 1: Checking Expo Account...');
console.log('-'.repeat(70));

try {
  const expoWhoami = execSync('npx expo whoami', { encoding: 'utf-8' }).trim();
  
  if (expoWhoami.includes('Not logged in')) {
    console.log('❌ PROBLEM: Not logged in to Expo');
    console.log('   FIX: Run "npx expo login" to log in\n');
    allGood = false;
  } else if (expoWhoami.includes('@anonymous')) {
    console.log('❌ PROBLEM: Using @anonymous (won\'t work for OAuth)');
    console.log('   FIX: Run "npx expo login" or "npx expo register"\n');
    allGood = false;
  } else {
    const username = expoWhoami.replace('@', '');
    console.log(`✅ Logged in as: @${username}`);
    console.log(`✅ Your redirect URI should be:`);
    console.log(`   https://auth.expo.io/@${username}/tuto\n`);
  }
} catch (error) {
  console.log('⚠️  Could not check Expo account');
  console.log('   Try running: npx expo whoami\n');
}

// Step 2: Check Environment Variables
console.log('✓ Step 2: Checking Environment Variables...');
console.log('-'.repeat(70));

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (!webClientId) {
  console.log('❌ PROBLEM: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not found in .env');
  console.log('   FIX: Add this line to your .env file:');
  console.log('   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com\n');
  allGood = false;
} else {
  console.log(`✅ Google Web Client ID: ${webClientId.substring(0, 30)}...`);
  console.log(`   Full ID: ${webClientId}\n`);
}

if (!firebaseApiKey) {
  console.log('❌ PROBLEM: EXPO_PUBLIC_FIREBASE_API_KEY not found in .env');
  allGood = false;
} else {
  console.log(`✅ Firebase API Key configured\n`);
}

if (!firebaseProjectId) {
  console.log('❌ PROBLEM: EXPO_PUBLIC_FIREBASE_PROJECT_ID not found in .env');
  allGood = false;
} else {
  console.log(`✅ Firebase Project: ${firebaseProjectId}\n`);
}

// Step 3: Google Cloud Console Configuration
console.log('✓ Step 3: Google Cloud Console Configuration...');
console.log('-'.repeat(70));

console.log('\nYou need to configure these in Google Cloud Console:');
console.log(`🔗 URL: https://console.cloud.google.com/apis/credentials?project=${firebaseProjectId || 'tuto1-73fc4'}`);
console.log('\nFind OAuth 2.0 Client ID and verify these settings:');
console.log('\n📋 Authorized JavaScript origins:');
console.log('   ✓ https://auth.expo.io');
console.log('\n📋 Authorized redirect URIs:');

try {
  const expoWhoami = execSync('npx expo whoami', { encoding: 'utf-8' }).trim();
  if (!expoWhoami.includes('Not logged in') && !expoWhoami.includes('@anonymous')) {
    const username = expoWhoami.replace('@', '');
    console.log(`   ✓ https://auth.expo.io/@${username}/tuto`);
  } else {
    console.log('   ✓ https://auth.expo.io/@YOUR_USERNAME/tuto');
    console.log('     (Replace YOUR_USERNAME with your Expo username)');
  }
} catch {
  console.log('   ✓ https://auth.expo.io/@YOUR_USERNAME/tuto');
}

console.log('\n⚠️  IMPORTANT: After adding these URIs in Google Cloud Console:');
console.log('   1. Click SAVE');
console.log('   2. Wait 1-2 minutes for changes to propagate');
console.log('   3. Restart Expo: npx expo start --clear\n');

// Step 4: App Configuration
console.log('✓ Step 4: Checking app.config.js...');
console.log('-'.repeat(70));

try {
  const appConfig = require('../app.config.js');
  const config = appConfig.expo;
  
  console.log(`✅ App slug: ${config.slug}`);
  console.log(`✅ App scheme: ${config.scheme}`);
  
  if (config.owner) {
    console.log(`✅ App owner: ${config.owner}`);
  } else {
    console.log('⚠️  App owner not set in app.config.js');
    console.log('   (Optional, but helps with clarity)');
  }
  
  console.log('');
} catch (error) {
  console.log('❌ Could not read app.config.js');
  console.log('');
}

// Summary
console.log('='.repeat(70));
console.log('\n📊 SUMMARY\n');

if (allGood) {
  console.log('✅ All checks passed!');
  console.log('\nNext steps:');
  console.log('1. Configure redirect URIs in Google Cloud Console (see above)');
  console.log('2. Wait 1-2 minutes after saving');
  console.log('3. Run: npx expo start --clear');
  console.log('4. Test Google Sign-In in the app\n');
} else {
  console.log('❌ Some issues found. Please fix them and run this script again.\n');
}

console.log('📚 For detailed instructions, see:');
console.log('   • docs/GOOGLE_AUTH_QUICK_FIX.md (quick 5-minute fix)');
console.log('   • docs/GOOGLE_AUTH_FIX_GUIDE.md (comprehensive guide)\n');





