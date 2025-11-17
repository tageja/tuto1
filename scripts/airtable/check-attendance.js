const https = require('https');

const AIRTABLE_PAT = 'patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkAttendance() {
  console.log('Checking TutoAttendanceRecords schema...\n');
  
  // Get table schema
  const schema = await makeRequest(`/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`);
  
  const attendanceTable = schema.tables.find(t => t.name === 'TutoAttendanceRecords');
  
  if (attendanceTable) {
    console.log('Fields in TutoAttendanceRecords:');
    attendanceTable.fields.forEach(f => {
      console.log(`  - ${f.name} (${f.type})`);
    });
  }
  
  console.log('\n\nChecking actual attendance data...');
  
  // Get one record to see the actual data structure
  const data = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/TutoAttendanceRecords?maxRecords=3`);
  
  if (data.records && data.records.length > 0) {
    console.log('\nSample records:');
    data.records.forEach((r, i) => {
      console.log(`\n${i + 1}. Record ID: ${r.id}`);
      console.log(JSON.stringify(r.fields, null, 2));
    });
  }
  
  // Try the exact filter that's failing
  console.log('\n\n=== Testing Filter ===');
  const filter = encodeURIComponent('{School Name}="Tuto Demo School" AND {Date} >= "2025-10-07"');
  console.log('Filter:', '{School Name}="Tuto Demo School" AND {Date} >= "2025-10-07"');
  
  try {
    const result = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/TutoAttendanceRecords?filterByFormula=${filter}&maxRecords=3`);
    console.log('\n✅ Filter works! Found', result.records?.length || 0, 'records');
  } catch (e) {
    console.log('\n❌ Filter failed:', e.message);
  }
}

checkAttendance();










