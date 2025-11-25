const https = require('https');

const AIRTABLE_PAT = 'patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';

console.log('='.repeat(80));
console.log('SYNC ATTENDANCE CLASS NAMES FROM STUDENTS TABLE');
console.log('='.repeat(80));

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function fetchAllRecords(tableName, filterFormula) {
  const records = [];
  let offset = null;
  
  do {
    let path = `/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?`;
    if (filterFormula) {
      path += `filterByFormula=${encodeURIComponent(filterFormula)}&`;
    }
    if (offset) {
      path += `offset=${offset}`;
    }
    
    const data = await makeRequest(path);
    
    if (data.records) {
      records.push(...data.records);
      offset = data.offset;
      if (offset) {
        console.log(`  Fetched ${records.length} records so far...`);
      }
    } else {
      console.error('Error fetching records:', data);
      break;
    }
  } while (offset);
  
  return records;
}

async function updateRecords(tableName, records) {
  const batchSize = 10;
  let updated = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const path = `/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
    const result = await makeRequest(path, 'PATCH', { records: batch });
    
    if (result.records) {
      updated += result.records.length;
      console.log(`  💾 Updated ${updated}/${records.length} records`);
    } else {
      console.error('Error updating batch:', result);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 250));
  }
}

async function main() {
  try {
    console.log('\n📚 Step 1: Loading students...');
    const students = await fetchAllRecords('TutoSchoolStudents', '{School Name}="Tuto Demo School"');
    console.log(`✓ Loaded ${students.length} students`);
    
    const studentMap = {};
    students.forEach(s => {
      const name = s.fields['Student Name'];
      const className = s.fields['Class Name'];
      if (name && className) {
        studentMap[name] = className;
      }
    });
    console.log(`✓ Mapped ${Object.keys(studentMap).length} students`);
    
    console.log('\n📊 Step 2: Loading attendance records...');
    const attendance = await fetchAllRecords('TutoAttendanceRecords', '{School Name}="Tuto Demo School"');
    console.log(`✓ Loaded ${attendance.length} attendance records`);
    
    console.log('\n🔄 Step 3: Preparing updates...');
    const updates = [];
    attendance.forEach(record => {
      const studentName = record.fields['Student Name'];
      if (studentName && studentMap[studentName]) {
        const correctClass = studentMap[studentName];
        if (record.fields['Class Name'] !== correctClass) {
          updates.push({
            id: record.id,
            fields: { 'Class Name': correctClass }
          });
        }
      }
    });
    console.log(`✓ Found ${updates.length} records to update`);
    
    if (updates.length > 0) {
      console.log('\n💾 Step 4: Updating records...');
      await updateRecords('TutoAttendanceRecords', updates);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ SYNC COMPLETE!');
    console.log(`   Students: ${students.length}`);
    console.log(`   Attendance records: ${attendance.length}`);
    console.log(`   Updated: ${updates.length}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

main();














