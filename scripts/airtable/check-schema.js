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

async function checkSchema() {
  console.log('Checking TutoSchoolStudents schema...\n');
  
  // Get table schema
  const schema = await makeRequest(`/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`);
  
  const studentsTable = schema.tables.find(t => t.name === 'TutoSchoolStudents');
  
  if (studentsTable) {
    console.log('Fields in TutoSchoolStudents:');
    studentsTable.fields.forEach(f => {
      console.log(`  - ${f.name} (${f.type})`);
      if (f.type === 'multipleRecordLinks' || f.type === 'multipleLookupValues') {
        console.log(`    Options:`, JSON.stringify(f.options, null, 4));
      }
    });
  }
  
  console.log('\n\nChecking actual data...');
  
  // Get one record to see the actual data structure
  const data = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/TutoSchoolStudents?maxRecords=1`);
  
  if (data.records && data.records.length > 0) {
    console.log('\nSample record:');
    console.log(JSON.stringify(data.records[0].fields, null, 2));
  }
}

checkSchema();














