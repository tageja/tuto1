#!/usr/bin/env node
/**
 * Diagnostic script to verify mobile OAuth configuration
 */

require('dotenv').config();

console.log('🔍 Mobile OAuth Configuration Diagnostic\n');
console.log('═'.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('─'.repeat(50));
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (length: ' + process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length + ')' : '❌ Missing');
console.log('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? '✅ Set' : '❌ Missing');

// Check app.json configuration
console.log('\n📱 App Configuration:');
console.log('─'.repeat(50));
try {
  const appJson = require('../app.json');
  console.log('App Scheme:', appJson.expo.scheme ? `✅ ${appJson.expo.scheme}` : '❌ Not set');
  console.log('Bundle ID (iOS):', appJson.expo.ios?.bundleIdentifier ? `✅ ${appJson.expo.ios.bundleIdentifier}` : '❌ Not set');
  console.log('Package (Android):', appJson.expo.android?.package ? `✅ ${appJson.expo.android.package}` : '❌ Not set');
} catch (error) {
  console.error('❌ Could not read app.json');
}

// Expected redirect URLs
console.log('\n🔗 Expected Redirect URLs for Supabase:');
console.log('─'.repeat(50));
const appScheme = 'tuto';
console.log(`1. ${appScheme}://auth/callback`);
console.log(`2. exp://192.168.101.29:8081/--/auth/callback`);
console.log(`3. http://localhost:8081/auth/callback`);

console.log('\n📝 Action Required:');
console.log('─'.repeat(50));
console.log('1. Go to https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Navigate to: Authentication → URL Configuration');
console.log('4. Add ALL the redirect URLs listed above');
console.log('5. Click "Save"');
console.log('\n6. Go to: Authentication → Providers → Google');
console.log('7. Ensure Google provider is ENABLED');
console.log('8. Verify Client ID and Secret are set');

console.log('\n' + '═'.repeat(50));
console.log('After updating Supabase, restart your Expo app');
console.log('Press Ctrl+C in the Expo terminal, then run: npm start');
console.log('═'.repeat(50) + '\n');


