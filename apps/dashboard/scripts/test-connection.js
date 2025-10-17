/**
 * Test Firebase and Backend Connectivity for Tuto Dashboard
 * 
 * This script tests the connection to Firebase and the backend API
 * without needing actual Firebase credentials (uses the mobile app's setup).
 */

const https = require('https');

console.log('\n🧪 Tuto Dashboard - Connection Test\n');
console.log('='.repeat(60));

// Known configuration from project
const FIREBASE_PROJECT_ID = 'tuto1-73fc4';
const FUNCTIONS_REGION = 'asia-southeast1';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM'; // From scripts/update-env.js

console.log('\n📋 Configuration:');
console.log(`   Firebase Project: ${FIREBASE_PROJECT_ID}`);
console.log(`   Functions Region: ${FUNCTIONS_REGION}`);
console.log(`   Airtable Base: ${AIRTABLE_BASE_ID}`);

// Test 1: Firebase Functions Health Check
async function testBackendAPI() {
  return new Promise((resolve) => {
    const apiUrl = `https://${FUNCTIONS_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/api`;
    
    console.log('\n\n🔍 Test 1: Backend API Health Check');
    console.log(`   URL: ${apiUrl}`);
    console.log('   Testing...');
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Backend API is reachable!');
          console.log(`   Status: ${res.statusCode} OK`);
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json)}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
          resolve({ success: true, message: 'Backend API is healthy' });
        } else {
          console.log(`   ⚠️  Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve({ success: false, message: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Failed to connect: ${err.message}`);
      resolve({ success: false, message: err.message });
    });
  });
}

// Test 2: Tables List (Airtable via Functions)
async function testAirtableTables() {
  return new Promise((resolve) => {
    const apiUrl = `https://${FUNCTIONS_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/api/tables/TutoTeachers?maxRecords=1`;
    
    console.log('\n\n🔍 Test 2: Airtable Connection (via Functions)');
    console.log(`   Table: TutoTeachers`);
    console.log(`   URL: ${apiUrl}`);
    console.log('   Testing...');
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            if (json.records) {
              console.log(`   ✅ Airtable connection successful!`);
              console.log(`   Records found: ${json.records.length}`);
              if (json.records.length > 0) {
                const teacher = json.records[0];
                console.log(`   Sample record ID: ${teacher.id}`);
                if (teacher.fields && teacher.fields.Name) {
                  console.log(`   Teacher name: ${teacher.fields.Name}`);
                }
              }
              resolve({ success: true, message: 'Airtable accessible' });
            } else {
              console.log(`   ⚠️  Unexpected response format`);
              resolve({ success: false, message: 'Invalid response' });
            }
          } catch (e) {
            console.log(`   ❌ Failed to parse response: ${e.message}`);
            resolve({ success: false, message: e.message });
          }
        } else {
          console.log(`   ❌ Status: ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
          resolve({ success: false, message: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Failed to connect: ${err.message}`);
      resolve({ success: false, message: err.message });
    });
  });
}

// Test 3: Check Firebase Auth Endpoint
async function testFirebaseAuth() {
  return new Promise((resolve) => {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/projects?key=demo`;
    
    console.log('\n\n🔍 Test 3: Firebase Auth Service');
    console.log('   Testing if Firebase Auth is accessible...');
    
    https.get(authUrl, (res) => {
      if (res.statusCode === 400 || res.statusCode === 401) {
        // Expected - means the service is up but we need a valid key
        console.log('   ✅ Firebase Auth service is reachable!');
        console.log('   (Expected 400/401 without valid API key)');
        resolve({ success: true, message: 'Firebase Auth accessible' });
      } else {
        console.log(`   Status: ${res.statusCode}`);
        resolve({ success: true, message: 'Firebase Auth service check passed' });
      }
    }).on('error', (err) => {
      console.log(`   ⚠️  Could not reach Firebase Auth: ${err.message}`);
      resolve({ success: false, message: err.message });
    });
  });
}

// Run all tests
async function runAllTests() {
  const results = [];
  
  results.push(await testBackendAPI());
  results.push(await testAirtableTables());
  results.push(await testFirebaseAuth());
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Test Results Summary\n');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`   Tests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n   ✅ All tests passed!');
    console.log('\n   🎉 Your backend is configured and working!');
    console.log('\n   📝 Next Steps:');
    console.log('   1. Get Firebase web credentials from console');
    console.log('   2. Create apps/dashboard/.env.local file');
    console.log('   3. Add your Firebase web app configuration');
    console.log('   4. Run: cd apps/dashboard && npm run dev');
    console.log('   5. Open: http://localhost:3000/setup\n');
  } else {
    console.log('\n   ⚠️  Some tests failed. Please check the errors above.\n');
    console.log('   Common issues:');
    console.log('   - Firebase Functions not deployed');
    console.log('   - Functions region mismatch');
    console.log('   - Airtable credentials not configured in Functions');
    console.log('   - Network/firewall issues\n');
  }
  
  console.log('='.repeat(60));
  console.log();
}

// Run tests
runAllTests().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});







