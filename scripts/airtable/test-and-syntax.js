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
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testVariations() {
  console.log('Testing different AND syntax variations...\n');

  const tests = [
    // Different AND syntaxes
    '{School Name}="Tuto Demo School",AND,{Class Name}="Class 5A"',
    'AND({School Name}="Tuto Demo School",{Class Name}="Class 5A")',
    '{School Name}="Tuto Demo School"&{Class Name}="Class 5A"',
    '{School Name}="Tuto Demo School" AND {Class Name}="Class 5A"',
    
    // Parentheses
    '({School Name}="Tuto Demo School") AND ({Class Name}="Class 5A")',
    
    // Different operators
    '{School Name}="Tuto Demo School",{Class Name}="Class 5A"',
    
    // Single quotes
    "{School Name}='Tuto Demo School' AND {Class Name}='Class 5A'",
    
    // Using OR
    'OR({School Name}="Tuto Demo School",{Class Name}="Class 5A")',
  ];

  for (const filter of tests) {
    console.log(`\nTesting: ${filter}`);
    try {
      const encoded = encodeURIComponent(filter);
      const result = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/TutoSchoolStudents?filterByFormula=${encoded}&maxRecords=2`);
      
      if (result.records && result.records.length > 0) {
        console.log(`✅ SUCCESS - Found ${result.records.length} records`);
        console.log(`   First: ${result.records[0].fields['Student Name']} - ${result.records[0].fields['Class Name']}`);
      } else {
        console.log(`⚠️  No records found (filter might work but no matching data)`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('CONCLUSION');
  console.log('='.repeat(80));
  console.log('The working syntax will be used to fix the Firebase Functions.');
}

testVariations();















