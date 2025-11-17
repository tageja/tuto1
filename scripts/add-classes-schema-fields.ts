/**
 * ADD MISSING FIELDS FOR CLASSES FEATURE
 * 
 * This script adds important missing fields to create a complete schema
 * for the Classes page functionality.
 * 
 * Strategy: Add new fields WITHOUT removing existing ones
 * Result: More complete, semantic data model
 * 
 * Run: npx ts-node scripts/add-classes-schema-fields.ts
 */

const AIRTABLE_PAT = 'patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';

const METADATA_API_BASE = 'https://api.airtable.com/v0/meta/bases';

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
  'Content-Type': 'application/json',
};

function logSection(title: string) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(80));
}

function log(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string, error?: any) {
  console.error(`❌ ${message}`);
  if (error) console.error(error);
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return response.json();
}

async function getTableId(tableName: string): Promise<string | null> {
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    const table = data.tables.find((t: any) => t.name === tableName);
    return table?.id || null;
  } catch (error) {
    logError(`Failed to get table ID for ${tableName}`, error);
    return null;
  }
}

async function checkFieldExists(tableId: string, fieldName: string): Promise<boolean> {
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    const table = data.tables.find((t: any) => t.id === tableId);
    if (!table) return false;
    
    return table.fields.some((f: any) => f.name === fieldName);
  } catch (error) {
    return false;
  }
}

async function addField(tableId: string, tableName: string, field: any) {
  try {
    // Check if field already exists
    const exists = await checkFieldExists(tableId, field.name);
    
    if (exists) {
      console.log(`⏭️  Field "${field.name}" already exists in ${tableName} - skipping`);
      return null;
    }
    
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(field),
    });
    
    const data = await handleResponse(response);
    log(`Added field "${field.name}" to ${tableName}`);
    return data;
  } catch (error) {
    logError(`Failed to add field "${field.name}" to ${tableName}`, error);
    throw error;
  }
}

async function main() {
  logSection('ADD MISSING FIELDS FOR CLASSES FEATURE');
  
  console.log('\n🎯 GOAL: Create a complete, semantic schema for Classes page');
  console.log('📝 STRATEGY: Add new fields, keep existing ones\n');
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Add Fields to TutoSchoolClasses
    // ═══════════════════════════════════════════════════════════════════════
    
    logSection('STEP 1: TutoSchoolClasses - Add Missing Fields');
    
    const classesTableId = await getTableId('TutoSchoolClasses');
    
    if (!classesTableId) {
      throw new Error('TutoSchoolClasses table not found');
    }
    
    console.log('\n📚 Adding fields to TutoSchoolClasses...\n');
    
    // Field 1: Capacity (separate from Student Count)
    await addField(classesTableId, 'TutoSchoolClasses', {
      name: 'Capacity',
      type: 'number',
      description: 'Maximum number of students allowed in this class',
      options: {
        precision: 0,
      },
    });
    
    // Field 2: Homeroom Teacher (link to Teachers table)
    const teachersTableId = await getTableId('TutoSchoolTeachers');
    if (teachersTableId) {
      await addField(classesTableId, 'TutoSchoolClasses', {
        name: 'Homeroom Teacher',
        type: 'multipleRecordLinks',
        description: 'The primary teacher responsible for this class',
        options: {
          linkedTableId: teachersTableId,
        },
      });
    }
    
    // Field 3: Teacher Name (lookup from Homeroom Teacher)
    // NOTE: This requires the Homeroom Teacher field to exist first
    // We'll add this manually later as it needs the field IDs
    
    // Field 4: Class Size (formula: student count)
    await addField(classesTableId, 'TutoSchoolClasses', {
      name: 'Enrollment Count',
      type: 'number',
      description: 'Current number of enrolled students (will be auto-calculated later)',
      options: {
        precision: 0,
      },
    });
    
    // Field 5: Capacity Utilization (formula: enrollment / capacity * 100)
    // We'll add this as a formula field
    // NOTE: Formula fields need to reference existing field IDs, so we'll skip for now
    
    log('TutoSchoolClasses fields updated!');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Add Fields to TutoSchoolTeachers
    // ═══════════════════════════════════════════════════════════════════════
    
    logSection('STEP 2: TutoSchoolTeachers - Add Missing Fields');
    
    if (teachersTableId) {
      console.log('\n👨‍🏫 Adding fields to TutoSchoolTeachers...\n');
      
      // Field 1: Rating (if doesn't exist)
      await addField(teachersTableId, 'TutoSchoolTeachers', {
        name: 'Rating',
        type: 'rating',
        description: 'Teacher performance rating (1-5 stars)',
        options: {
          max: 5,
          icon: 'star',
          color: 'yellowBright',
        },
      });
      
      // Field 2: Profile Photo
      await addField(teachersTableId, 'TutoSchoolTeachers', {
        name: 'Profile Photo',
        type: 'multipleAttachments',
        description: 'Teacher profile photo',
      });
      
      log('TutoSchoolTeachers fields updated!');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Add Fields to TutoSchoolStudents
    // ═══════════════════════════════════════════════════════════════════════
    
    logSection('STEP 3: TutoSchoolStudents - Add Missing Fields');
    
    const studentsTableId = await getTableId('TutoSchoolStudents');
    
    if (studentsTableId) {
      console.log('\n👨‍🎓 Adding fields to TutoSchoolStudents...\n');
      
      // Field 1: Profile Photo
      await addField(studentsTableId, 'TutoSchoolStudents', {
        name: 'Profile Photo',
        type: 'multipleAttachments',
        description: 'Student profile photo',
      });
      
      // Field 2: Blood Type (for health records)
      await addField(studentsTableId, 'TutoSchoolStudents', {
        name: 'Blood Type',
        type: 'singleSelect',
        description: 'Student blood type for emergency medical care',
        options: {
          choices: [
            { name: 'A+', color: 'redBright' },
            { name: 'A-', color: 'redLight1' },
            { name: 'B+', color: 'orangeBright' },
            { name: 'B-', color: 'orangeLight1' },
            { name: 'AB+', color: 'yellowBright' },
            { name: 'AB-', color: 'yellowLight1' },
            { name: 'O+', color: 'greenBright' },
            { name: 'O-', color: 'greenLight1' },
            { name: 'Unknown', color: 'grayLight2' },
          ],
        },
      });
      
      // Field 3: Allergies
      await addField(studentsTableId, 'TutoSchoolStudents', {
        name: 'Allergies',
        type: 'multilineText',
        description: 'Known allergies or medical conditions',
      });
      
      log('TutoSchoolStudents fields updated!');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    
    logSection('SCHEMA ENHANCEMENT COMPLETE');
    
    console.log('\n📊 FIELDS ADDED:\n');
    console.log('TutoSchoolClasses:');
    console.log('  ✅ Capacity (number) - Max students allowed');
    console.log('  ✅ Homeroom Teacher (link) - Link to teacher record');
    console.log('  ✅ Enrollment Count (number) - Current student count');
    
    console.log('\nTutoSchoolTeachers:');
    console.log('  ✅ Rating (rating) - 1-5 stars');
    console.log('  ✅ Profile Photo (attachments) - Teacher photo');
    
    console.log('\nTutoSchoolStudents:');
    console.log('  ✅ Profile Photo (attachments) - Student photo');
    console.log('  ✅ Blood Type (select) - Medical info');
    console.log('  ✅ Allergies (text) - Medical notes');
    
    console.log('\n✨ NEXT STEPS:\n');
    console.log('1. Update existing records with Capacity values');
    console.log('2. Link Homeroom Teachers to Classes');
    console.log('3. Add formula field for "Capacity Utilization %"');
    console.log('4. Add lookup field for "Teacher Name" from linked record');
    console.log('5. Update code to use new fields (lib/airtable/classes.ts)');
    
    console.log('\n🎉 Your schema is now more complete and semantic!');
    
  } catch (error) {
    logError('Script failed', error);
    process.exit(1);
  }
}

main().catch(error => {
  logError('Fatal error', error);
  process.exit(1);
});













