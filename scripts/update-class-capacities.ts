/**
 * UPDATE CLASS CAPACITY VALUES
 * 
 * Now that we have separate Capacity and Student Count fields,
 * let's set proper capacity values for all classes.
 * 
 * Run: npx ts-node scripts/update-class-capacities.ts
 */

const AIRTABLE_PAT = 'patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';
const DATA_API_BASE = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
  'Content-Type': 'application/json',
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return response.json();
}

async function main() {
  console.log('═'.repeat(80));
  console.log('  UPDATE CLASS CAPACITIES');
  console.log('═'.repeat(80));
  
  try {
    // Fetch all classes for "Tuto Demo School"
    const filterFormula = "{School Name}='Tuto Demo School'";
    const url = `${DATA_API_BASE}/TutoSchoolClasses?filterByFormula=${encodeURIComponent(filterFormula)}`;
    
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    console.log(`\nFound ${data.records.length} classes\n`);
    
    // Update each class with proper capacity
    const updates = data.records.map((record: any) => {
      const className = record.fields['Class Name'];
      let capacity = 25; // Default
      
      // Set realistic capacities based on grade
      if (className.includes('5')) capacity = 25;
      else if (className.includes('6')) capacity = 30;
      else if (className.includes('7')) capacity = 28;
      else if (className.includes('8')) capacity = 26;
      
      return {
        id: record.id,
        fields: {
          'Capacity': capacity,
          'Enrollment Count': record.fields['Student Count'] || 0,
        },
      };
    });
    
    // Update in batches
    for (let i = 0; i < updates.length; i += 10) {
      const batch = updates.slice(i, i + 10);
      
      const updateUrl = `${DATA_API_BASE}/TutoSchoolClasses`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: batch }),
      });
      
      await handleResponse(updateResponse);
      console.log(`✅ Updated ${batch.length} classes`);
    }
    
    console.log('\n📊 CAPACITY VALUES SET:\n');
    updates.forEach((u: any) => {
      const record = data.records.find((r: any) => r.id === u.id);
      console.log(`  ${record.fields['Class Name']}: Capacity = ${u.fields.Capacity}, Enrolled = ${u.fields['Enrollment Count']}`);
    });
    
    console.log('\n🎉 All class capacities updated!');
    console.log('\n💡 TIP: Your Classes page will now show accurate capacity usage percentages!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();

















