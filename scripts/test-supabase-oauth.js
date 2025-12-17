#!/usr/bin/env node
/**
 * Test Supabase OAuth configuration
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase OAuth Configuration\n');
console.log('═'.repeat(60));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOAuth() {
  try {
    console.log('📞 Calling supabase.auth.signInWithOAuth({ provider: "google" })...\n');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'tuto://auth/callback',
      },
    });
    
    console.log('📦 Raw Response:');
    console.log('─'.repeat(60));
    console.log('data:', JSON.stringify(data, null, 2));
    console.log('error:', error);
    console.log('─'.repeat(60));
    
    if (data?.url) {
      console.log('\n✅ SUCCESS: OAuth URL generated');
      console.log('URL preview:', data.url.substring(0, 100) + '...');
      console.log('\n✅ Google OAuth is properly configured in Supabase');
    } else if (error) {
      console.log('\n❌ ERROR:', error.message);
      console.log('\n🔧 Fix: Check your Supabase configuration');
    } else {
      console.log('\n❌ FAILED: No URL and no error returned');
      console.log('\n🔧 This usually means:');
      console.log('   1. Google provider is NOT enabled in Supabase');
      console.log('   2. OR Google OAuth credentials are missing');
      console.log('\n📋 To Fix:');
      console.log('   1. Go to https://app.supabase.com');
      console.log('   2. Select your project');
      console.log('   3. Go to: Authentication → Providers → Google');
      console.log('   4. Make sure "Enabled" toggle is ON');
      console.log('   5. Add your Google OAuth Client ID and Secret');
      console.log('   6. Click Save');
    }
  } catch (err) {
    console.error('\n❌ Exception:', err.message);
  }
}

testOAuth();






