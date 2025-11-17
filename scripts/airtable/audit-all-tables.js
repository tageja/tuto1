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

async function testFilter(tableName, filter, description) {
  console.log(`\n  Testing: ${description}`);
  console.log(`    Filter: ${filter}`);
  
  try {
    const encoded = encodeURIComponent(filter);
    const result = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?filterByFormula=${encoded}&maxRecords=5`);
    
    if (result.records) {
      console.log(`    ✅ SUCCESS - Found ${result.records.length} records`);
      if (result.records.length > 0) {
        console.log(`    Sample:`, JSON.stringify(result.records[0].fields, null, 4).split('\n').map((line, i) => i === 0 ? line : '         ' + line).join('\n'));
      }
      return true;
    } else {
      console.log(`    ❌ FAILED - No records returned`);
      return false;
    }
  } catch (error) {
    console.log(`    ❌ ERROR:`, error.message);
    return false;
  }
}

async function auditTables() {
  console.log('═'.repeat(80));
  console.log('AIRTABLE SCHEMA & DATA AUDIT');
  console.log('═'.repeat(80));

  // Get all tables
  const schema = await makeRequest(`/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`);
  
  const relevantTables = [
    'TutoSchoolClasses',
    'TutoSchoolStudents', 
    'TutoAttendanceRecords',
    'TutoSchoolTeachers'
  ];

  for (const tableName of relevantTables) {
    console.log('\n' + '─'.repeat(80));
    console.log(`📊 TABLE: ${tableName}`);
    console.log('─'.repeat(80));
    
    const table = schema.tables.find(t => t.name === tableName);
    
    if (!table) {
      console.log('❌ TABLE NOT FOUND');
      continue;
    }

    // Show schema
    console.log('\n📋 FIELDS:');
    table.fields.forEach(f => {
      let fieldInfo = `  • ${f.name.padEnd(25)} (${f.type})`;
      if (f.type === 'multipleRecordLinks') {
        fieldInfo += ` → links to ${f.options?.linkedTableId}`;
      }
      console.log(fieldInfo);
    });

    // Get sample records
    console.log('\n📦 SAMPLE DATA (first 3 records):');
    try {
      const data = await makeRequest(`/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=3`);
      
      if (data.records && data.records.length > 0) {
        data.records.forEach((record, i) => {
          console.log(`\n  ${i + 1}. Record ID: ${record.id}`);
          console.log('     Fields:', JSON.stringify(record.fields, null, 6).split('\n').map((line, idx) => idx === 0 ? line : '     ' + line).join('\n'));
        });
      } else {
        console.log('  ⚠️  No records found');
      }
    } catch (error) {
      console.log('  ❌ Error fetching records:', error.message);
    }

    // Test filters that Firebase Functions uses
    console.log('\n🧪 TESTING FILTERS:');

    if (tableName === 'TutoSchoolClasses') {
      await testFilter(tableName, '{School Name}="Tuto Demo School"', 'Basic school filter');
      await testFilter(tableName, '{School Name}="Tuto Demo School" AND {Grade Level}="5"', 'School + grade filter');
    }

    if (tableName === 'TutoSchoolStudents') {
      await testFilter(tableName, '{School Name}="Tuto Demo School"', 'Basic school filter');
      await testFilter(tableName, '{School Name}="Tuto Demo School" AND {Class Name}="Class 5A"', 'School + class filter');
      await testFilter(tableName, '{School Name}="Tuto Demo School" AND {Grade Level}="5"', 'School + grade filter');
    }

    if (tableName === 'TutoAttendanceRecords') {
      await testFilter(tableName, '{School Name}="Tuto Demo School"', 'Basic school filter');
      await testFilter(tableName, '{School Name}="Tuto Demo School" AND {Class Name}="Class 5A"', 'School + class filter');
      
      // Test date filters
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      await testFilter(tableName, `{School Name}="Tuto Demo School" AND IS_AFTER({Date}, DATEADD('${dateStr}', -1, 'days'))`, 'School + date filter (IS_AFTER + DATEADD)');
      
      // Test simpler date filter
      await testFilter(tableName, `{School Name}="Tuto Demo School" AND {Date} >= '${dateStr}'`, 'School + date filter (simple comparison)');
      
      // Test combined
      await testFilter(tableName, `{School Name}="Tuto Demo School" AND {Class Name}="Class 5A" AND IS_AFTER({Date}, DATEADD('${dateStr}', -1, 'days'))`, 'Full filter (school + class + date)');
    }

    if (tableName === 'TutoSchoolTeachers') {
      await testFilter(tableName, '{School Name}="Tuto Demo School"', 'Basic school filter');
      await testFilter(tableName, '{School Name}="Tuto Demo School" AND {Status}="Active"', 'School + status filter');
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log('\n✅ Audit complete. Check above for any ❌ errors or mismatches.');
  console.log('\nKey things to look for:');
  console.log('  1. Field names match exactly (case-sensitive)');
  console.log('  2. Field types match what code expects (text vs. linked records)');
  console.log('  3. Sample data has the expected values');
  console.log('  4. Filters work without errors');
  console.log('  5. "Tuto Demo School" is the exact school name in records');
}

auditTables().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});










