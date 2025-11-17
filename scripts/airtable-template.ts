/**
 * AIRTABLE OPERATIONS TEMPLATE
 * 
 * A reusable script for all Airtable operations:
 * - Read tables/fields (Metadata API)
 * - Read/Write records (Data API)
 * - Create tables/fields
 * - Update/Delete operations
 * 
 * Usage:
 * 1. Add your AIRTABLE_PAT and AIRTABLE_BASE_ID below
 * 2. Edit the operation you want in the main() function
 * 3. Run: npx ts-node scripts/airtable-template.ts
 * 
 * Last Updated: 2025-11-05
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - EDIT THESE VALUES
// ═══════════════════════════════════════════════════════════════════════════

const AIRTABLE_PAT = 'patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46';
const AIRTABLE_BASE_ID = 'app34330Do0nm4qvM';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const METADATA_API_BASE = 'https://api.airtable.com/v0/meta/bases';
const DATA_API_BASE = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
  'Content-Type': 'application/json',
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function log(message: string, data?: any) {
  console.log(`\n✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message: string, error?: any) {
  console.error(`\n❌ ${message}`);
  if (error) {
    console.error(error);
  }
}

function logSection(title: string) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(80));
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// METADATA API OPERATIONS (Tables & Fields)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List all tables in the base with their schemas
 */
async function listTables() {
  logSection('LISTING ALL TABLES');
  
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    log(`Found ${data.tables.length} tables:`);
    
    data.tables.forEach((table: any) => {
      console.log(`\n📊 ${table.name} (${table.id})`);
      console.log(`   Description: ${table.description || 'None'}`);
      console.log(`   Fields: ${table.fields.length}`);
      console.log(`   Primary Field: ${table.primaryFieldId}`);
    });
    
    return data.tables;
  } catch (error) {
    logError('Failed to list tables', error);
    throw error;
  }
}

/**
 * Get detailed schema for a specific table
 */
async function getTableSchema(tableNameOrId: string) {
  logSection(`GET SCHEMA: ${tableNameOrId}`);
  
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    const table = data.tables.find((t: any) => 
      t.name === tableNameOrId || t.id === tableNameOrId
    );
    
    if (!table) {
      throw new Error(`Table "${tableNameOrId}" not found`);
    }
    
    log(`Table: ${table.name}`);
    console.log(`\n📋 FIELDS (${table.fields.length}):`);
    
    table.fields.forEach((field: any) => {
      console.log(`\n  • ${field.name} (${field.type})`);
      console.log(`    ID: ${field.id}`);
      if (field.description) console.log(`    Description: ${field.description}`);
      if (field.options) {
        console.log(`    Options:`, JSON.stringify(field.options, null, 6));
      }
    });
    
    return table;
  } catch (error) {
    logError(`Failed to get schema for ${tableNameOrId}`, error);
    throw error;
  }
}

/**
 * Create a new table with fields
 */
async function createTable(tableName: string, fields: any[], description?: string) {
  logSection(`CREATE TABLE: ${tableName}`);
  
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const payload = {
      name: tableName,
      description: description || '',
      fields: fields,
    };
    
    log('Payload:', payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    const data = await handleResponse(response);
    log(`Table "${tableName}" created successfully!`, data);
    
    return data;
  } catch (error) {
    logError(`Failed to create table "${tableName}"`, error);
    throw error;
  }
}

/**
 * Add a field to an existing table
 */
async function addField(tableNameOrId: string, field: any) {
  logSection(`ADD FIELD TO: ${tableNameOrId}`);
  
  try {
    // First, get table ID if name provided
    const tables = await fetch(`${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`, { headers });
    const tablesData = await handleResponse(tables);
    const table = tablesData.tables.find((t: any) => 
      t.name === tableNameOrId || t.id === tableNameOrId
    );
    
    if (!table) {
      throw new Error(`Table "${tableNameOrId}" not found`);
    }
    
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables/${table.id}/fields`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(field),
    });
    
    const data = await handleResponse(response);
    log(`Field "${field.name}" added to "${table.name}"`, data);
    
    return data;
  } catch (error) {
    logError(`Failed to add field to ${tableNameOrId}`, error);
    throw error;
  }
}

/**
 * Update a field in a table
 */
async function updateField(tableNameOrId: string, fieldNameOrId: string, updates: any) {
  logSection(`UPDATE FIELD: ${fieldNameOrId} in ${tableNameOrId}`);
  
  try {
    // Get table
    const tables = await fetch(`${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`, { headers });
    const tablesData = await handleResponse(tables);
    const table = tablesData.tables.find((t: any) => 
      t.name === tableNameOrId || t.id === tableNameOrId
    );
    
    if (!table) {
      throw new Error(`Table "${tableNameOrId}" not found`);
    }
    
    // Get field
    const field = table.fields.find((f: any) => 
      f.name === fieldNameOrId || f.id === fieldNameOrId
    );
    
    if (!field) {
      throw new Error(`Field "${fieldNameOrId}" not found in table "${table.name}"`);
    }
    
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables/${table.id}/fields/${field.id}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    
    const data = await handleResponse(response);
    log(`Field "${field.name}" updated`, data);
    
    return data;
  } catch (error) {
    logError(`Failed to update field ${fieldNameOrId}`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA API OPERATIONS (Records CRUD)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List records from a table with optional filters
 */
async function listRecords(
  tableName: string, 
  options?: {
    filterByFormula?: string;
    maxRecords?: number;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    fields?: string[];
  }
) {
  logSection(`LIST RECORDS: ${tableName}`);
  
  try {
    const params = new URLSearchParams();
    
    if (options?.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options?.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }
    if (options?.sort) {
      options.sort.forEach((s, i) => {
        params.append(`sort[${i}][field]`, s.field);
        params.append(`sort[${i}][direction]`, s.direction);
      });
    }
    if (options?.fields) {
      options.fields.forEach(f => params.append('fields[]', f));
    }
    
    const url = `${DATA_API_BASE}/${encodeURIComponent(tableName)}?${params}`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    log(`Found ${data.records.length} records`);
    
    // Display first 3 records as sample
    if (data.records.length > 0) {
      console.log('\n📝 Sample Records (first 3):');
      data.records.slice(0, 3).forEach((record: any, i: number) => {
        console.log(`\n  ${i + 1}. Record ID: ${record.id}`);
        console.log(`     Fields:`, JSON.stringify(record.fields, null, 8));
      });
    }
    
    return data.records;
  } catch (error) {
    logError(`Failed to list records from ${tableName}`, error);
    throw error;
  }
}

/**
 * Get a single record by ID
 */
async function getRecord(tableName: string, recordId: string) {
  logSection(`GET RECORD: ${recordId} from ${tableName}`);
  
  try {
    const url = `${DATA_API_BASE}/${encodeURIComponent(tableName)}/${recordId}`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    log(`Record retrieved:`, data);
    
    return data;
  } catch (error) {
    logError(`Failed to get record ${recordId}`, error);
    throw error;
  }
}

/**
 * Create one or more records
 */
async function createRecords(tableName: string, records: Array<{ fields: any }>) {
  logSection(`CREATE RECORDS: ${records.length} in ${tableName}`);
  
  try {
    const url = `${DATA_API_BASE}/${encodeURIComponent(tableName)}`;
    const payload = { records };
    
    log('Creating records with payload:', payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    const data = await handleResponse(response);
    log(`${data.records.length} records created successfully!`, data.records);
    
    return data.records;
  } catch (error) {
    logError(`Failed to create records in ${tableName}`, error);
    throw error;
  }
}

/**
 * Update one or more records
 */
async function updateRecords(tableName: string, records: Array<{ id: string; fields: any }>) {
  logSection(`UPDATE RECORDS: ${records.length} in ${tableName}`);
  
  try {
    const url = `${DATA_API_BASE}/${encodeURIComponent(tableName)}`;
    const payload = { records };
    
    log('Updating records with payload:', payload);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    
    const data = await handleResponse(response);
    log(`${data.records.length} records updated successfully!`, data.records);
    
    return data.records;
  } catch (error) {
    logError(`Failed to update records in ${tableName}`, error);
    throw error;
  }
}

/**
 * Delete one or more records
 */
async function deleteRecords(tableName: string, recordIds: string[]) {
  logSection(`DELETE RECORDS: ${recordIds.length} from ${tableName}`);
  
  try {
    const params = recordIds.map(id => `records[]=${id}`).join('&');
    const url = `${DATA_API_BASE}/${encodeURIComponent(tableName)}?${params}`;
    
    log('Deleting record IDs:', recordIds);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    const data = await handleResponse(response);
    log(`${data.records.length} records deleted successfully!`, data.records);
    
    return data.records;
  } catch (error) {
    logError(`Failed to delete records from ${tableName}`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TEMPLATES - Copy these to main() and edit
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TEMPLATE: Create a new table
 * Copy this to main() and customize the fields array
 */
function templateCreateTable() {
  const tableName = 'YourTableName';
  const description = 'Description of your table';
  
  const fields = [
    {
      name: 'Name',
      type: 'singleLineText',
      description: 'Primary name field',
    },
    {
      name: 'Status',
      type: 'singleSelect',
      options: {
        choices: [
          { name: 'Active', color: 'greenBright' },
          { name: 'Inactive', color: 'grayBright' },
          { name: 'Archived', color: 'redBright' },
        ],
      },
    },
    {
      name: 'Email',
      type: 'email',
    },
    {
      name: 'Phone',
      type: 'phoneNumber',
    },
    {
      name: 'Created Date',
      type: 'date',
      options: {
        dateFormat: { name: 'iso' },
      },
    },
    {
      name: 'Notes',
      type: 'multilineText',
    },
    {
      name: 'Count',
      type: 'number',
      options: {
        precision: 0,
      },
    },
    {
      name: 'Is Active',
      type: 'checkbox',
    },
    // Link to another table
    {
      name: 'Related Records',
      type: 'multipleRecordLinks',
      options: {
        linkedTableId: 'tblXXXXXXXXXXXXXX', // Replace with actual table ID
      },
    },
  ];
  
  return createTable(tableName, fields, description);
}

/**
 * TEMPLATE: Add a field to existing table
 * Copy this to main() and customize
 */
function templateAddField() {
  const tableName = 'YourTableName';
  
  const field = {
    name: 'New Field Name',
    type: 'singleLineText', // See field types below
    description: 'Field description',
  };
  
  return addField(tableName, field);
}

/**
 * TEMPLATE: Create records
 * Copy this to main() and customize
 */
function templateCreateRecords() {
  const tableName = 'YourTableName';
  
  const records = [
    {
      fields: {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Status': 'Active',
        'Created Date': new Date().toISOString().split('T')[0],
      },
    },
    {
      fields: {
        'Name': 'Jane Smith',
        'Email': 'jane@example.com',
        'Status': 'Active',
        'Created Date': new Date().toISOString().split('T')[0],
      },
    },
  ];
  
  return createRecords(tableName, records);
}

/**
 * TEMPLATE: Update records
 * Copy this to main() and customize
 */
function templateUpdateRecords() {
  const tableName = 'YourTableName';
  
  const records = [
    {
      id: 'recXXXXXXXXXXXXXX', // Replace with actual record ID
      fields: {
        'Status': 'Inactive',
        'Notes': 'Updated via script',
      },
    },
  ];
  
  return updateRecords(tableName, records);
}

/**
 * TEMPLATE: Query records with filter
 * Copy this to main() and customize
 */
function templateQueryRecords() {
  const tableName = 'YourTableName';
  
  const options = {
    filterByFormula: "{Status}='Active'", // Airtable formula
    maxRecords: 10,
    sort: [{ field: 'Created Date', direction: 'desc' as const }],
    fields: ['Name', 'Email', 'Status'], // Only fetch these fields
  };
  
  return listRecords(tableName, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD TYPE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_TYPES_REFERENCE = `
AIRTABLE FIELD TYPES REFERENCE:

Basic Types:
  • singleLineText         - Short text (< 1 line)
  • multilineText          - Long text (multiple lines)
  • email                  - Email address
  • url                    - Website URL
  • phoneNumber            - Phone number
  • number                 - Numeric value
  • percent                - Percentage (0-100)
  • currency               - Money value
  • checkbox               - True/false checkbox
  • date                   - Date only
  • dateTime               - Date and time
  • duration               - Time duration
  • rating                 - Star rating (1-10)

Selection Types:
  • singleSelect           - Single choice from list
  • multipleSelects        - Multiple choices from list

Advanced Types:
  • multipleRecordLinks    - Link to other table records
  • multipleAttachments    - File uploads
  • barcode                - Barcode/QR code
  • button                 - Action button
  • multipleLookupValues   - Lookup from linked records
  • rollup                 - Calculate from linked records
  • count                  - Count linked records
  • formula                - Calculated formula

AI/Automation:
  • aiText                 - AI-generated text
  • createdBy              - User who created record
  • createdTime            - Auto timestamp on create
  • lastModifiedBy         - User who last modified
  • lastModifiedTime       - Auto timestamp on update

Examples:

1. Single Select:
{
  name: 'Status',
  type: 'singleSelect',
  options: {
    choices: [
      { name: 'Active', color: 'greenBright' },
      { name: 'Inactive', color: 'grayBright' },
    ]
  }
}

2. Number with Precision:
{
  name: 'Price',
  type: 'currency',
  options: {
    precision: 2,
    symbol: '$',
  }
}

3. Link to Another Table:
{
  name: 'School',
  type: 'multipleRecordLinks',
  options: {
    linkedTableId: 'tblXXXXXXXXXXXXXX',
  }
}

4. Formula Field:
{
  name: 'Full Name',
  type: 'formula',
  options: {
    formula: 'CONCATENATE({First Name}, " ", {Last Name})',
  }
}

5. Date with Format:
{
  name: 'Start Date',
  type: 'date',
  options: {
    dateFormat: { name: 'iso' }, // YYYY-MM-DD
  }
}
`;

function showFieldTypes() {
  console.log(FIELD_TYPES_REFERENCE);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON OPERATIONS - EDIT THESE FOR YOUR USE CASES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const url = `${METADATA_API_BASE}/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    
    const exists = data.tables.some((t: any) => t.name === tableName);
    
    if (exists) {
      log(`✅ Table "${tableName}" exists`);
    } else {
      log(`❌ Table "${tableName}" does NOT exist`);
    }
    
    return exists;
  } catch (error) {
    logError(`Failed to check if table ${tableName} exists`, error);
    return false;
  }
}

/**
 * Check if a field exists in a table
 */
async function checkFieldExists(tableName: string, fieldName: string): Promise<boolean> {
  try {
    const table = await getTableSchema(tableName);
    const exists = table.fields.some((f: any) => f.name === fieldName);
    
    if (exists) {
      log(`✅ Field "${fieldName}" exists in "${tableName}"`);
    } else {
      log(`❌ Field "${fieldName}" does NOT exist in "${tableName}"`);
    }
    
    return exists;
  } catch (error) {
    logError(`Failed to check field ${fieldName}`, error);
    return false;
  }
}

/**
 * Compare schema with expected fields
 */
async function auditTableSchema(
  tableName: string, 
  expectedFields: Array<{ name: string; type: string }>
) {
  logSection(`AUDIT TABLE SCHEMA: ${tableName}`);
  
  try {
    const table = await getTableSchema(tableName);
    
    console.log('\n📊 SCHEMA AUDIT RESULTS:\n');
    
    const missing: string[] = [];
    const present: string[] = [];
    const typeMismatch: Array<{ field: string; expected: string; actual: string }> = [];
    
    expectedFields.forEach(expected => {
      const field = table.fields.find((f: any) => f.name === expected.name);
      
      if (!field) {
        missing.push(expected.name);
        console.log(`  ❌ MISSING: ${expected.name} (${expected.type})`);
      } else if (field.type !== expected.type) {
        typeMismatch.push({
          field: expected.name,
          expected: expected.type,
          actual: field.type,
        });
        console.log(`  ⚠️  TYPE MISMATCH: ${expected.name}`);
        console.log(`      Expected: ${expected.type}`);
        console.log(`      Actual: ${field.type}`);
      } else {
        present.push(expected.name);
        console.log(`  ✅ OK: ${expected.name} (${expected.type})`);
      }
    });
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Present: ${present.length}/${expectedFields.length}`);
    console.log(`   Missing: ${missing.length}`);
    console.log(`   Type Mismatches: ${typeMismatch.length}`);
    
    return { present, missing, typeMismatch };
  } catch (error) {
    logError(`Failed to audit ${tableName}`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE SAMPLE DATA FOR CLASSES PAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Populate comprehensive test data for Classes page
 * Creates records in: Schools, Teachers, Classes, Students, Attendance
 */
async function populateClassesPageData() {
  logSection('POPULATING CLASSES PAGE DATA');
  
  const schoolName = 'Tuto Demo School';
  const currentYear = new Date().getFullYear();
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Create School Record (if needed)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n📍 STEP 1: Creating School...');
    
    const schoolRecords = await createRecords('TutoSchools', [
      {
        fields: {
          'School Name': schoolName,
          'School Code': 'TDS001',
          'Address': '123 Education Street, Hanoi, Vietnam',
          'Phone': '+84 24 1234 5678',
          'Email': 'contact@tutodemo.edu.vn',
          'Principal Name': 'Nguyen Van A',
          'Principal Email': 'principal@tutodemo.edu.vn',
          'Principal Phone': '+84 98 999 8888',
          'School Type': 'Private',
          'Status': 'Active',
          'Founded Year': 2010,  // Number, not string
          'Student Count': 450,
          'Teacher Count': 25,
        },
      },
    ]);
    
    log('School created!', { name: schoolName });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Create Teachers
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n👨‍🏫 STEP 2: Creating Teachers...');
    
    const teacherRecords = await createRecords('TutoSchoolTeachers', [
      {
        fields: {
          'Teacher Name': 'Mrs. Tran Thi Lan',
          'School Name': schoolName,
          'Email': 'lan.tran@tutodemo.edu.vn',
          'Phone': '+84 98 111 2222',
          'Position': 'Homeroom Teacher - Grade 5',
          'Subjects': 'Math, Science',
          'Grade Levels': '5',
          'Experience Years': 12,
          'Education': 'Master of Education',
          'Bio': 'Experienced educator passionate about mathematics and science education. Loves helping students discover the joy of learning.',
          'Status': 'Active',
          'Hire Date': '2013-09-01',
        },
      },
      {
        fields: {
          'Teacher Name': 'Mr. Le Van Minh',
          'School Name': schoolName,
          'Email': 'minh.le@tutodemo.edu.vn',
          'Phone': '+84 98 333 4444',
          'Position': 'Homeroom Teacher - Grade 5',
          'Subjects': 'English, Literature',
          'Grade Levels': '5',
          'Experience Years': 8,
          'Education': 'Bachelor of Arts in English',
          'Bio': 'Dedicated English teacher with a passion for literature and creative writing.',
          'Status': 'Active',
          'Hire Date': '2017-09-01',
        },
      },
      {
        fields: {
          'Teacher Name': 'Ms. Pham Thi Hoa',
          'School Name': schoolName,
          'Email': 'hoa.pham@tutodemo.edu.vn',
          'Phone': '+84 98 555 6666',
          'Position': 'Homeroom Teacher - Grade 6',
          'Subjects': 'Math, Physics',
          'Grade Levels': '6',
          'Experience Years': 15,
          'Education': 'PhD in Mathematics Education',
          'Bio': 'Senior mathematics educator with extensive research background. Specialized in making complex concepts accessible.',
          'Status': 'Active',
          'Hire Date': '2010-09-01',
        },
      },
      {
        fields: {
          'Teacher Name': 'Mr. Hoang Van Tuan',
          'School Name': schoolName,
          'Email': 'tuan.hoang@tutodemo.edu.vn',
          'Phone': '+84 98 777 8888',
          'Position': 'Subject Teacher',
          'Subjects': 'History, Geography',
          'Grade Levels': '6, 7, 8',
          'Experience Years': 5,
          'Education': 'Bachelor of History',
          'Bio': 'Young and enthusiastic history teacher bringing fresh perspectives to social studies.',
          'Status': 'Active',
          'Hire Date': '2020-09-01',
        },
      },
    ]);
    
    log(`Created ${teacherRecords.length} teachers`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Create Classes
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n📚 STEP 3: Creating Classes...');
    
    const classRecords = await createRecords('TutoSchoolClasses', [
      {
        fields: {
          'Class Name': 'Class 5A',
          'School Name': schoolName,
          'Grade Level': '5',
          'Student Count': 25,
          'Schedule': 'Mon-Fri, 8:00 AM - 3:00 PM',
          'Room Number': 'R201',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
      {
        fields: {
          'Class Name': 'Class 5B',
          'School Name': schoolName,
          'Grade Level': '5',
          'Student Count': 28,
          'Schedule': 'Mon-Fri, 8:00 AM - 3:00 PM',
          'Room Number': 'R202',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
      {
        fields: {
          'Class Name': 'Class 6A',
          'School Name': schoolName,
          'Grade Level': '6',
          'Student Count': 30,
          'Schedule': 'Mon-Fri, 8:00 AM - 3:30 PM',
          'Room Number': 'R301',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
      {
        fields: {
          'Class Name': 'Class 6B',
          'School Name': schoolName,
          'Grade Level': '6',
          'Student Count': 27,
          'Schedule': 'Mon-Fri, 8:00 AM - 3:30 PM',
          'Room Number': 'R302',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
      {
        fields: {
          'Class Name': 'Class 7A',
          'School Name': schoolName,
          'Grade Level': '7',
          'Student Count': 26,
          'Schedule': 'Mon-Fri, 7:30 AM - 3:30 PM',
          'Room Number': 'R401',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
      {
        fields: {
          'Class Name': 'Class 8A',
          'School Name': schoolName,
          'Grade Level': '8',
          'Student Count': 24,
          'Schedule': 'Mon-Fri, 7:30 AM - 4:00 PM',
          'Room Number': 'R501',
          'Status': 'Active',
          'Academic Year': currentYear.toString(),
          'Created Date': new Date().toISOString().split('T')[0],
        },
      },
    ]);
    
    log(`Created ${classRecords.length} classes`);
    
    // Store class IDs for linking students
    const class5A = classRecords[0].id;
    const class5B = classRecords[1].id;
    const class6A = classRecords[2].id;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Create Students
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n👨‍🎓 STEP 4: Creating Students...');
    
    // Helper function to generate birth date for age
    const generateDOB = (age: number) => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);
      return dob.toISOString().split('T')[0];
    };
    
    // Class 5A Students (10 students)
    const students5A = await createRecords('TutoSchoolStudents', [
      {
        fields: {
          'Student ID': 'STU001',
          'Student Name': 'Nguyen Minh Anh',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Nguyen Van Binh',
          'Parent Email': 'binh.nguyen@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU002',
          'Student Name': 'Tran Hoang Long',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Tran Van Cuong',
          'Parent Email': 'cuong.tran@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU003',
          'Student Name': 'Le Thi Mai',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Le Van Duc',
          'Parent Email': 'duc.le@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU004',
          'Student Name': 'Pham Quoc Huy',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Pham Van Hung',
          'Parent Email': 'hung.pham@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU005',
          'Student Name': 'Vo Thi Lan',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Vo Van Khanh',
          'Parent Email': 'khanh.vo@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU006',
          'Student Name': 'Hoang Minh Tri',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Hoang Van Thang',
          'Parent Email': 'thang.hoang@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU007',
          'Student Name': 'Dang Thi Ngoc',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Dang Van Nam',
          'Parent Email': 'nam.dang@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU008',
          'Student Name': 'Bui Quang Vinh',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Bui Van Tuan',
          'Parent Email': 'tuan.bui@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU009',
          'Student Name': 'Nguyen Thi Ha',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Nguyen Van Hai',
          'Parent Email': 'hai.nguyen@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU010',
          'Student Name': 'Tran Duc Khang',
          'School Name': schoolName,
          'Class Name': class5A,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Tran Van Kien',
          'Parent Email': 'kien.tran@email.com',
        },
      },
    ]);
    
    log(`Created ${students5A.length} students for Class 5A`);
    
    // Class 5B Students (10 students)
    const students5B = await createRecords('TutoSchoolStudents', [
      {
        fields: {
          'Student ID': 'STU011',
          'Student Name': 'Le Thi Huong',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Le Van Long',
          'Parent Email': 'long.le@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU012',
          'Student Name': 'Pham Gia Bao',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Pham Van Phuc',
          'Parent Email': 'phuc.pham@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU013',
          'Student Name': 'Nguyen Thi Thao',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Nguyen Van Thanh',
          'Parent Email': 'thanh.nguyen2@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU014',
          'Student Name': 'Tran Quoc Dat',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Tran Van Dung',
          'Parent Email': 'dung.tran@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU015',
          'Student Name': 'Vo Thi Linh',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Vo Van Loi',
          'Parent Email': 'loi.vo@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU016',
          'Student Name': 'Hoang Gia Phong',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Hoang Van Phuong',
          'Parent Email': 'phuong.hoang@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU017',
          'Student Name': 'Dang Thi Quynh',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Dang Van Quang',
          'Parent Email': 'quang.dang@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU018',
          'Student Name': 'Bui Hoang Son',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Bui Van Sang',
          'Parent Email': 'sang.bui@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU019',
          'Student Name': 'Nguyen Thi Tuyet',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(11),
          'Gender': 'Female',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Nguyen Van Truong',
          'Parent Email': 'truong.nguyen@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU020',
          'Student Name': 'Tran Van Uyen',
          'School Name': schoolName,
          'Class Name': class5B,
          'Date of Birth': generateDOB(10),
          'Gender': 'Male',
          'Grade Level': '5',
          'Status': 'Active',
          'Enrollment Date': '2024-09-01',
          'Parent Name': 'Tran Van Ut',
          'Parent Email': 'ut.tran@email.com',
        },
      },
    ]);
    
    log(`Created ${students5B.length} students for Class 5B`);
    
    // Class 6A Students (8 students)
    const students6A = await createRecords('TutoSchoolStudents', [
      {
        fields: {
          'Student ID': 'STU021',
          'Student Name': 'Le Van Anh',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Male',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Le Van An',
          'Parent Email': 'an.le@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU022',
          'Student Name': 'Pham Thi Bich',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Female',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Pham Van Binh',
          'Parent Email': 'binh.pham@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU023',
          'Student Name': 'Nguyen Quoc Cuong',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Male',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Nguyen Van Chinh',
          'Parent Email': 'chinh.nguyen@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU024',
          'Student Name': 'Tran Thi Diep',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Female',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Tran Van Dong',
          'Parent Email': 'dong.tran@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU025',
          'Student Name': 'Hoang Van Hieu',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Male',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Hoang Van Ha',
          'Parent Email': 'ha.hoang@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU026',
          'Student Name': 'Vu Thi Kim',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Female',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Vu Van Khai',
          'Parent Email': 'khai.vu@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU027',
          'Student Name': 'Do Van Lam',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Male',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Do Van Linh',
          'Parent Email': 'linh.do@email.com',
        },
      },
      {
        fields: {
          'Student ID': 'STU028',
          'Student Name': 'Ly Thi My',
          'School Name': schoolName,
          'Class Name': class6A,
          'Date of Birth': generateDOB(12),
          'Gender': 'Female',
          'Grade Level': '6',
          'Status': 'Active',
          'Enrollment Date': '2023-09-01',
          'Parent Name': 'Ly Van Manh',
          'Parent Email': 'manh.ly@email.com',
        },
      },
    ]);
    
    log(`Created ${students6A.length} students for Class 6A`);
    
    const totalStudents = students5A.length + students5B.length + students6A.length;
    log(`Total students created: ${totalStudents}`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Create Attendance Records (Last 30 Days)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n✅ STEP 5: Creating Attendance Records...');
    
    // Generate attendance for last 30 days (weekdays only)
    const attendanceRecords: Array<{ fields: any }> = [];
    const today = new Date();
    
    // Last 30 days of attendance
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Create attendance for Class 5A students (90% present rate)
      students5A.forEach((student: any) => {
        const isPresent = Math.random() > 0.1; // 90% present
        attendanceRecords.push({
          fields: {
            'Record ID': `ATT-${student.fields['Student ID']}-${dateStr}`,
            'School Name': schoolName,
            'Class Name': class5A,
            'Student Name': student.fields['Student Name'],
            'Date': dateStr,
            'Status': isPresent ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'),
            'Recorded By': 'System',
          },
        });
      });
      
      // Class 5B (85% present rate)
      students5B.forEach((student: any) => {
        const isPresent = Math.random() > 0.15;
        attendanceRecords.push({
          fields: {
            'Record ID': `ATT-${student.fields['Student ID']}-${dateStr}`,
            'School Name': schoolName,
            'Class Name': class5B,
            'Student Name': student.fields['Student Name'],
            'Date': dateStr,
            'Status': isPresent ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'),
            'Recorded By': 'System',
          },
        });
      });
      
      // Class 6A (92% present rate)
      students6A.forEach((student: any) => {
        const isPresent = Math.random() > 0.08;
        attendanceRecords.push({
          fields: {
            'Record ID': `ATT-${student.fields['Student ID']}-${dateStr}`,
            'School Name': schoolName,
            'Class Name': class6A,
            'Student Name': student.fields['Student Name'],
            'Date': dateStr,
            'Status': isPresent ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'),
            'Recorded By': 'System',
          },
        });
      });
    }
    
    // Create attendance in batches of 10
    console.log(`\nCreating ${attendanceRecords.length} attendance records in batches...`);
    let createdCount = 0;
    
    for (let i = 0; i < attendanceRecords.length; i += 10) {
      const batch = attendanceRecords.slice(i, i + 10);
      await createRecords('TutoAttendanceRecords', batch);
      createdCount += batch.length;
      console.log(`  Progress: ${createdCount}/${attendanceRecords.length}`);
      
      // Rate limit protection
      if (i + 10 < attendanceRecords.length) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    
    log(`Created ${attendanceRecords.length} attendance records`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    
    logSection('DATA POPULATION COMPLETE');
    
    console.log('\n📊 SUMMARY:');
    console.log(`   School: 1 (${schoolName})`);
    console.log(`   Teachers: ${teacherRecords.length}`);
    console.log(`   Classes: ${classRecords.length}`);
    console.log(`   Students: ${totalStudents}`);
    console.log(`     • Class 5A: ${students5A.length} students`);
    console.log(`     • Class 5B: ${students5B.length} students`);
    console.log(`     • Class 6A: ${students6A.length} students`);
    console.log(`   Attendance Records: ${attendanceRecords.length}`);
    
    console.log('\n✅ Your Classes page should now display:');
    console.log('   • 6 classes total');
    console.log('   • 28 students total');
    console.log('   • Realistic attendance rates (85-92%)');
    console.log('   • All KPI cards populated');
    console.log('   • Grade filter with grades 5, 6, 7, 8');
    console.log('   • Searchable classes');
    console.log('   • Student rosters for each class');
    
    console.log('\n🎉 Classes page is ready to test with real data!');
    
  } catch (error) {
    logError('Failed to populate data', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION - EDIT THIS TO RUN YOUR DESIRED OPERATION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  logSection('AIRTABLE OPERATIONS SCRIPT');
  
  console.log('Configuration:');
  console.log(`  Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`  PAT: ${AIRTABLE_PAT ? '✅ Set' : '❌ Not set'}`);
  console.log('');
  
  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHOOSE YOUR OPERATION(S) - UNCOMMENT THE ONE YOU NEED
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 1. LIST ALL TABLES
    // await listTables();
    
    // 2. GET SCHEMA FOR A SPECIFIC TABLE
    // await getTableSchema('TutoSchoolClasses');
    
    // 3. CHECK IF TABLE EXISTS
    // await checkTableExists('TutoSchoolClasses');
    
    // 4. CHECK IF FIELD EXISTS
    // await checkFieldExists('TutoSchoolClasses', 'Grade Level');
    
    // 5. AUDIT TABLE SCHEMA (compare expected vs actual)
    // await auditTableSchema('TutoSchoolClasses', [
    //   { name: 'Class Name', type: 'singleLineText' },
    //   { name: 'School Name', type: 'singleLineText' },
    //   { name: 'Grade Level', type: 'singleLineText' },
    //   { name: 'Status', type: 'singleSelect' },
    // ]);
    
    // 6. LIST RECORDS FROM A TABLE
    // await listRecords('TutoSchoolClasses', {
    //   filterByFormula: "{Status}='Active'",
    //   maxRecords: 5,
    //   sort: [{ field: 'Created Date', direction: 'desc' }],
    // });
    
    // 7. GET A SINGLE RECORD
    // await getRecord('TutoSchoolClasses', 'recXXXXXXXXXXXXXX');
    
    // 8. CREATE RECORDS
    // await createRecords('TutoSchoolClasses', [
    //   {
    //     fields: {
    //       'Class Name': 'Grade 5A',
    //       'School Name': 'Test School',
    //       'Grade Level': '5',
    //       'Status': 'Active',
    //     },
    //   },
    // ]);
    
    // 9. UPDATE RECORDS
    // await updateRecords('TutoSchoolClasses', [
    //   {
    //     id: 'recXXXXXXXXXXXXXX',
    //     fields: { 'Status': 'Inactive' },
    //   },
    // ]);
    
    // 10. DELETE RECORDS
    // await deleteRecords('TutoSchoolClasses', ['recXXXXXXXXXXXXXX']);
    
    // 11. CREATE A NEW TABLE
    // await templateCreateTable();
    
    // 12. ADD A FIELD TO TABLE
    // await addField('TutoSchoolClasses', {
    //   name: 'New Field',
    //   type: 'singleLineText',
    //   description: 'This is a new field',
    // });
    
    // 13. UPDATE A FIELD
    // await updateField('TutoSchoolClasses', 'Old Field Name', {
    //   name: 'New Field Name',
    //   description: 'Updated description',
    // });
    
    // 14. SHOW FIELD TYPES REFERENCE
    // showFieldTypes();
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // POPULATE CLASSES PAGE DATA (All field names verified!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    await populateClassesPageData();
    
    // If you need to check schema again, uncomment these:
    // await getTableSchema('TutoSchools');
    // await getTableSchema('TutoSchoolTeachers');
    // await getTableSchema('TutoSchoolClasses');
    // await getTableSchema('TutoSchoolStudents');
    // await getTableSchema('TutoAttendanceRecords');
    
    // Example: Audit TutoSchoolClasses schema
    /*
    const auditResult = await auditTableSchema('TutoSchoolClasses', [
      { name: 'Class Name', type: 'singleLineText' },
      { name: 'School Name', type: 'singleLineText' },
      { name: 'Grade Level', type: 'singleLineText' },
      { name: 'Student Count', type: 'number' },
      { name: 'Schedule', type: 'multilineText' },
      { name: 'Room Number', type: 'singleLineText' },
      { name: 'Status', type: 'singleSelect' },
      { name: 'Academic Year', type: 'singleLineText' },
      { name: 'Created Date', type: 'date' },
    ]);
    
    // Save audit results
    if (auditResult.missing.length > 0) {
      console.log('\n⚠️  Missing fields detected. Consider adding them.');
    } else {
      console.log('\n✅ All expected fields are present!');
    }
    */
    
  } catch (error) {
    logError('Script execution failed', error);
    process.exit(1);
  }
  
  logSection('SCRIPT COMPLETE');
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN THE SCRIPT
// ═══════════════════════════════════════════════════════════════════════════

main().catch(error => {
  logError('Fatal error', error);
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════
// QUICK REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/*

COMMON AIRTABLE FORMULAS:

1. Filter by field value:
   {Status}='Active'

2. Filter by multiple values (OR):
   OR({Status}='Active', {Status}='Pending')

3. Filter by multiple conditions (AND):
   AND({Status}='Active', {Grade}='5')

4. Search text (case-insensitive):
   SEARCH('math', LOWER({Class Name}))

5. Date filters:
   IS_AFTER({Date}, '2025-01-01')
   IS_BEFORE({Date}, '2025-12-31')

6. Greater than/less than:
   {Count} > 10
   {Rating} >= 4

7. Not empty:
   {Email} != ''

8. Record ID filter:
   OR(RECORD_ID()='recXXX', RECORD_ID()='recYYY')

FILTER EXAMPLES:

List active classes in grade 5:
  {
    filterByFormula: "AND({School Name}='School123', {Grade Level}='5', {Status}='Active')"
  }

List students enrolled in last 30 days:
  {
    filterByFormula: "IS_AFTER({Enrollment Date}, DATEADD(TODAY(), -30, 'days'))"
  }

SORT EXAMPLES:

Sort by created date (newest first):
  {
    sort: [{ field: 'Created Date', direction: 'desc' }]
  }

Multiple sort (name then date):
  {
    sort: [
      { field: 'Name', direction: 'asc' },
      { field: 'Created Date', direction: 'desc' },
    ]
  }

*/

