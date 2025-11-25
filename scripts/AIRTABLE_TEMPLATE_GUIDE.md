# Airtable Template Script Guide

**File**: `scripts/airtable-template.ts`  
**Purpose**: Reusable script for all Airtable operations (read/write tables, fields, records)  
**Last Updated**: November 5, 2025

---

## 🚀 Quick Start

### 1. **Add Your Credentials**

Edit `scripts/airtable-template.ts` lines 16-17:

```typescript
const AIRTABLE_PAT = 'patXXXXXXXXXXXXXX';  // Your Personal Access Token
const AIRTABLE_BASE_ID = 'appXXXXXXXXXXXXXX';  // Your Base ID
```

### 2. **Choose Your Operation**

In the `main()` function (line 450+), uncomment the operation you need:

```typescript
async function main() {
  // Uncomment one or more:
  
  await listTables();                    // See all tables
  await getTableSchema('TutoSchoolClasses');  // See table fields
  await listRecords('TutoSchoolClasses');     // See records
}
```

### 3. **Run the Script**

```bash
npx ts-node scripts/airtable-template.ts
```

---

## 📚 Common Use Cases

### **Use Case 1: Check What Tables Exist**

```typescript
async function main() {
  await listTables();
}
```

**Output**:
```
Found 15 tables:
📊 TutoSchoolClasses (tblXXXXXX)
📊 TutoSchoolStudents (tblYYYYYY)
...
```

---

### **Use Case 2: See All Fields in a Table**

```typescript
async function main() {
  await getTableSchema('TutoSchoolClasses');
}
```

**Output**:
```
📋 FIELDS (9):
  • Class Name (singleLineText)
  • School Name (singleLineText)
  • Grade Level (singleLineText)
  • Status (singleSelect)
  ...
```

---

### **Use Case 3: Check if a Table/Field Exists**

```typescript
async function main() {
  await checkTableExists('TutoSchoolClasses');
  await checkFieldExists('TutoSchoolClasses', 'Grade Level');
}
```

**Output**:
```
✅ Table "TutoSchoolClasses" exists
✅ Field "Grade Level" exists in "TutoSchoolClasses"
```

---

### **Use Case 4: Audit Schema (Compare Expected vs Actual)**

```typescript
async function main() {
  await auditTableSchema('TutoSchoolClasses', [
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect' },
    { name: 'Capacity', type: 'number' },  // Check if this exists
  ]);
}
```

**Output**:
```
  ✅ OK: Class Name (singleLineText)
  ✅ OK: Grade Level (singleLineText)
  ✅ OK: Status (singleSelect)
  ❌ MISSING: Capacity (number)

📈 SUMMARY:
   Present: 3/4
   Missing: 1
```

---

### **Use Case 5: Query Records with Filters**

```typescript
async function main() {
  await listRecords('TutoSchoolClasses', {
    filterByFormula: "AND({School Name}='ABC School', {Status}='Active')",
    maxRecords: 10,
    sort: [{ field: 'Grade Level', direction: 'asc' }],
    fields: ['Class Name', 'Grade Level', 'Status'],
  });
}
```

**Output**:
```
Found 5 records

📝 Sample Records (first 3):
  1. Record ID: recABCDEF
     Fields: {
       "Class Name": "Grade 5A",
       "Grade Level": "5",
       "Status": "Active"
     }
  ...
```

---

### **Use Case 6: Create a New Table**

```typescript
async function main() {
  await createTable('TutoNewTable', [
    { name: 'Name', type: 'singleLineText' },
    { name: 'Email', type: 'email' },
    { name: 'Status', type: 'singleSelect', options: {
        choices: [
          { name: 'Active', color: 'greenBright' },
          { name: 'Inactive', color: 'grayBright' },
        ]
      }
    },
  ], 'My new table description');
}
```

---

### **Use Case 7: Add a Field to Existing Table**

```typescript
async function main() {
  await addField('TutoSchoolClasses', {
    name: 'Capacity',
    type: 'number',
    description: 'Maximum number of students',
    options: {
      precision: 0,  // No decimals
    },
  });
}
```

---

### **Use Case 8: Create Records**

```typescript
async function main() {
  await createRecords('TutoSchoolClasses', [
    {
      fields: {
        'Class Name': 'Grade 5A',
        'School Name': 'ABC School',
        'Grade Level': '5',
        'Status': 'Active',
        'Created Date': new Date().toISOString().split('T')[0],
      },
    },
    {
      fields: {
        'Class Name': 'Grade 5B',
        'School Name': 'ABC School',
        'Grade Level': '5',
        'Status': 'Active',
        'Created Date': new Date().toISOString().split('T')[0],
      },
    },
  ]);
}
```

---

### **Use Case 9: Update Records**

```typescript
async function main() {
  await updateRecords('TutoSchoolClasses', [
    {
      id: 'recXXXXXXXXXXXXXX',  // Get this from listRecords()
      fields: {
        'Status': 'Inactive',
        'Notes': 'Updated via script',
      },
    },
  ]);
}
```

---

### **Use Case 10: Delete Records**

```typescript
async function main() {
  await deleteRecords('TutoSchoolClasses', [
    'recXXXXXXXXXXXXXX',  // Record ID to delete
  ]);
}
```

---

## 🎯 Quick Reference: Field Types

### **Most Common Field Types**

```typescript
// Text fields
{ name: 'Name', type: 'singleLineText' }
{ name: 'Description', type: 'multilineText' }

// Contact fields
{ name: 'Email', type: 'email' }
{ name: 'Phone', type: 'phoneNumber' }
{ name: 'Website', type: 'url' }

// Number fields
{ name: 'Count', type: 'number', options: { precision: 0 } }
{ name: 'Price', type: 'currency', options: { precision: 2, symbol: '$' } }
{ name: 'Percentage', type: 'percent', options: { precision: 1 } }

// Date/Time fields
{ name: 'Start Date', type: 'date', options: { dateFormat: { name: 'iso' } } }
{ name: 'Created At', type: 'dateTime' }
{ name: 'Duration', type: 'duration', options: { durationFormat: 'h:mm' } }

// Selection fields
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

{
  name: 'Tags',
  type: 'multipleSelects',
  options: {
    choices: [
      { name: 'Important', color: 'redBright' },
      { name: 'Urgent', color: 'orangeBright' },
    ]
  }
}

// Boolean
{ name: 'Is Active', type: 'checkbox' }

// Rating
{ name: 'Rating', type: 'rating', options: { max: 5 } }

// Link to another table
{
  name: 'School',
  type: 'multipleRecordLinks',
  options: {
    linkedTableId: 'tblXXXXXXXXXXXXXX',  // Get from listTables()
  }
}

// Auto timestamps
{ name: 'Created Time', type: 'createdTime' }
{ name: 'Last Modified', type: 'lastModifiedTime' }

// Auto user tracking
{ name: 'Created By', type: 'createdBy' }
{ name: 'Modified By', type: 'lastModifiedBy' }
```

---

## 🔍 Filter Formula Examples

### **Basic Filters**

```typescript
// Exact match
filterByFormula: "{Status}='Active'"

// Multiple values (OR)
filterByFormula: "OR({Status}='Active', {Status}='Pending')"

// Multiple conditions (AND)
filterByFormula: "AND({Status}='Active', {Grade}='5')"

// Not equal
filterByFormula: "{Status}!='Archived'"
```

### **Text Search**

```typescript
// Case-insensitive search
filterByFormula: "SEARCH('math', LOWER({Class Name}))"

// Starts with
filterByFormula: "SEARCH('Grade', {Class Name})=1"

// Contains any of multiple terms
filterByFormula: "OR(SEARCH('5A', {Class Name}), SEARCH('5B', {Class Name}))"
```

### **Number Filters**

```typescript
// Greater than
filterByFormula: "{Student Count} > 20"

// Between range
filterByFormula: "AND({Student Count} >= 10, {Student Count} <= 30)"

// Is empty
filterByFormula: "{Email} = ''"

// Is not empty
filterByFormula: "{Email} != ''"
```

### **Date Filters**

```typescript
// Today
filterByFormula: "{Date} = TODAY()"

// Last 7 days
filterByFormula: "IS_AFTER({Date}, DATEADD(TODAY(), -7, 'days'))"

// This month
filterByFormula: "AND(MONTH({Date})=MONTH(TODAY()), YEAR({Date})=YEAR(TODAY()))"

// Between dates
filterByFormula: "AND(IS_AFTER({Date}, '2025-01-01'), IS_BEFORE({Date}, '2025-12-31'))"
```

### **Complex Filters**

```typescript
// School + Active + Recent
filterByFormula: `
  AND(
    {School Name}='ABC School',
    {Status}='Active',
    IS_AFTER({Created Date}, '2025-01-01')
  )
`

// Multiple schools
filterByFormula: "OR({School Name}='School A', {School Name}='School B')"

// Grade 5 or 6, Active only
filterByFormula: "AND(OR({Grade}='5', {Grade}='6'), {Status}='Active')"
```

---

## 💡 Tips & Best Practices

### **Security**
- ✅ Never commit PAT to git
- ✅ Use `.env` for production
- ✅ Rotate PATs quarterly
- ✅ Use scoped permissions (read-only when possible)

### **Performance**
- ✅ Use `fields` parameter to fetch only needed fields
- ✅ Use `maxRecords` to limit results
- ✅ Filter on the server (Airtable) vs client (JavaScript)
- ✅ Batch operations (create/update up to 10 records at once)

### **Error Handling**
- ✅ Always wrap in try/catch
- ✅ Check response.ok before parsing
- ✅ Log errors with context
- ✅ Handle rate limits (429 errors)

### **Testing**
- ✅ Test on a staging base first
- ✅ Use small batches for destructive operations
- ✅ Backup before bulk updates/deletes
- ✅ Verify schema before creating tables

---

## 🔧 Common Workflows

### **Workflow 1: Add a New Field to Existing Table**

```typescript
// Step 1: Check if table exists
await checkTableExists('TutoSchoolClasses');

// Step 2: See current schema
await getTableSchema('TutoSchoolClasses');

// Step 3: Add the field
await addField('TutoSchoolClasses', {
  name: 'New Field Name',
  type: 'singleLineText',
  description: 'Field description',
});

// Step 4: Verify it was added
await getTableSchema('TutoSchoolClasses');
```

---

### **Workflow 2: Create Table from Scratch**

```typescript
// Step 1: Check if name is available
await checkTableExists('TutoNewTable');

// Step 2: Create the table
await createTable('TutoNewTable', [
  { name: 'Name', type: 'singleLineText' },
  { name: 'Email', type: 'email' },
  { name: 'Status', type: 'singleSelect', options: {
      choices: [
        { name: 'Active', color: 'greenBright' },
        { name: 'Inactive', color: 'grayBright' },
      ]
    }
  },
  { name: 'Created Date', type: 'date' },
], 'Table description');

// Step 3: Verify it was created
await getTableSchema('TutoNewTable');
```

---

### **Workflow 3: Populate Table with Data**

```typescript
// Step 1: Verify schema
await getTableSchema('TutoSchoolClasses');

// Step 2: Create records (batch of 10 max)
await createRecords('TutoSchoolClasses', [
  {
    fields: {
      'Class Name': 'Grade 5A',
      'School Name': 'ABC School',
      'Grade Level': '5',
      'Status': 'Active',
    },
  },
  // ... up to 10 records
]);

// Step 3: Verify records created
await listRecords('TutoSchoolClasses', {
  filterByFormula: "{School Name}='ABC School'",
  maxRecords: 5,
});
```

---

### **Workflow 4: Schema Audit**

```typescript
async function main() {
  // Define expected schema
  const expectedFields = [
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleLineText' },
    { name: 'Capacity', type: 'number' },
    { name: 'Status', type: 'singleSelect' },
  ];
  
  // Run audit
  const result = await auditTableSchema('TutoSchoolClasses', expectedFields);
  
  // Add missing fields
  for (const fieldName of result.missing) {
    const expectedField = expectedFields.find(f => f.name === fieldName);
    if (expectedField) {
      await addField('TutoSchoolClasses', {
        name: expectedField.name,
        type: expectedField.type,
      });
    }
  }
}
```

---

### **Workflow 5: Bulk Update Records**

```typescript
async function main() {
  // Step 1: Find records to update
  const records = await listRecords('TutoSchoolClasses', {
    filterByFormula: "{Status}='Pending'",
  });
  
  // Step 2: Update them (max 10 at a time)
  const updates = records.slice(0, 10).map((record: any) => ({
    id: record.id,
    fields: { 'Status': 'Active' },
  }));
  
  await updateRecords('TutoSchoolClasses', updates);
}
```

---

## 📖 Available Functions

### **Metadata Operations**

| Function | Purpose | Parameters |
|----------|---------|------------|
| `listTables()` | List all tables in base | None |
| `getTableSchema(tableName)` | Get detailed schema | Table name or ID |
| `createTable(name, fields, desc)` | Create new table | Name, fields array, description |
| `addField(table, field)` | Add field to table | Table name, field object |
| `updateField(table, field, updates)` | Update field properties | Table name, field name, updates |
| `checkTableExists(name)` | Check if table exists | Table name |
| `checkFieldExists(table, field)` | Check if field exists | Table name, field name |
| `auditTableSchema(table, expected)` | Compare schema | Table name, expected fields |

### **Data Operations**

| Function | Purpose | Parameters |
|----------|---------|------------|
| `listRecords(table, options)` | Query records | Table name, filter/sort options |
| `getRecord(table, id)` | Get single record | Table name, record ID |
| `createRecords(table, records)` | Create records (max 10) | Table name, records array |
| `updateRecords(table, records)` | Update records (max 10) | Table name, records with IDs |
| `deleteRecords(table, ids)` | Delete records (max 10) | Table name, record IDs |

---

## 🎨 Field Type Templates

### **Copy-Paste Field Definitions**

```typescript
// Single line text
{ name: 'Class Name', type: 'singleLineText' }

// Multi-line text
{ name: 'Description', type: 'multilineText' }

// Email
{ name: 'Email', type: 'email' }

// Phone
{ name: 'Phone', type: 'phoneNumber' }

// Number (integer)
{ 
  name: 'Student Count', 
  type: 'number',
  options: { precision: 0 }
}

// Currency
{
  name: 'Tuition Fee',
  type: 'currency',
  options: {
    precision: 2,
    symbol: '$',
  }
}

// Percentage
{
  name: 'Attendance Rate',
  type: 'percent',
  options: { precision: 1 }
}

// Checkbox
{ name: 'Is Active', type: 'checkbox' }

// Single select dropdown
{
  name: 'Status',
  type: 'singleSelect',
  options: {
    choices: [
      { name: 'Active', color: 'greenBright' },
      { name: 'Pending', color: 'yellowBright' },
      { name: 'Inactive', color: 'grayBright' },
      { name: 'Archived', color: 'redBright' },
    ]
  }
}

// Multiple select tags
{
  name: 'Subjects',
  type: 'multipleSelects',
  options: {
    choices: [
      { name: 'Math', color: 'blueBright' },
      { name: 'Science', color: 'greenBright' },
      { name: 'English', color: 'purpleBright' },
    ]
  }
}

// Date (YYYY-MM-DD)
{
  name: 'Start Date',
  type: 'date',
  options: {
    dateFormat: { name: 'iso' }
  }
}

// Date & Time
{ name: 'Created At', type: 'dateTime' }

// Rating (1-5 stars)
{
  name: 'Rating',
  type: 'rating',
  options: {
    max: 5,
    icon: 'star',
    color: 'yellowBright',
  }
}

// Link to another table
{
  name: 'School',
  type: 'multipleRecordLinks',
  options: {
    linkedTableId: 'tblXXXXXXXXXXXXXX',  // Get from listTables()
  }
}

// File attachments
{ name: 'Documents', type: 'multipleAttachments' }

// Auto-created timestamp
{ name: 'Created Time', type: 'createdTime' }

// Auto-modified timestamp
{ name: 'Last Modified', type: 'lastModifiedTime' }

// User who created
{ name: 'Created By', type: 'createdBy' }

// User who last modified
{ name: 'Last Modified By', type: 'lastModifiedBy' }

// Formula (calculated field)
{
  name: 'Full Name',
  type: 'formula',
  options: {
    formula: "CONCATENATE({First Name}, ' ', {Last Name})"
  }
}

// Rollup (aggregate from linked records)
{
  name: 'Total Students',
  type: 'rollup',
  options: {
    linkedTableId: 'tblXXXXXXXXXXXXXX',
    linkedFieldId: 'fldXXXXXXXXXXXXXX',
    referencedFieldId: 'fldYYYYYYYYYYYYYY',
    function: 'COUNT',
  }
}

// Lookup (fetch from linked record)
{
  name: 'School Name',
  type: 'multipleLookupValues',
  options: {
    linkedTableId: 'tblXXXXXXXXXXXXXX',
    linkedFieldId: 'fldXXXXXXXXXXXXXX',
    referencedFieldId: 'fldYYYYYYYYYYYYYY',
  }
}
```

---

## 🎯 Pro Tips

### **Getting Table/Field IDs**

```typescript
// Get all table IDs
const tables = await listTables();
tables.forEach(t => console.log(`${t.name}: ${t.id}`));

// Get all field IDs for a table
const table = await getTableSchema('TutoSchoolClasses');
table.fields.forEach(f => console.log(`${f.name}: ${f.id}`));
```

### **Safe Field Updates**

```typescript
// Always check before updating
const exists = await checkFieldExists('TutoSchoolClasses', 'Old Name');
if (exists) {
  await updateField('TutoSchoolClasses', 'Old Name', {
    name: 'New Name',
    description: 'Updated description',
  });
}
```

### **Batch Operations**

```typescript
// Airtable allows max 10 records per operation
const allRecords = [...]; // Your data
const batchSize = 10;

for (let i = 0; i < allRecords.length; i += batchSize) {
  const batch = allRecords.slice(i, i + batchSize);
  await createRecords('TutoSchoolClasses', batch);
  
  // Rate limit protection: wait 200ms between batches
  await new Promise(resolve => setTimeout(resolve, 200));
}
```

---

## ⚠️ Important Notes

1. **Rate Limits**: Airtable has rate limits (5 requests/second). The script includes delays for batch operations.

2. **Field Types**: Once created, field types cannot be changed. You must delete and recreate.

3. **Primary Field**: Every table must have one primary field (first field, single-line text).

4. **Linked Records**: To link records, you need the `linkedTableId` from the table you're linking to.

5. **Formula Fields**: Formulas use Airtable's formula syntax, not JavaScript.

6. **Backup**: Always backup before bulk operations (delete, update).

---

## 📝 Example Scenarios

### **Scenario 1: I need to check if TutoSchoolClasses has all required fields**

```typescript
async function main() {
  await auditTableSchema('TutoSchoolClasses', [
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Grade Level', type: 'singleLineText' },
    { name: 'Capacity', type: 'number' },
    { name: 'Homeroom Teacher ID', type: 'multipleRecordLinks' },
    { name: 'Status', type: 'singleSelect' },
  ]);
}
```

Run: `npx ts-node scripts/airtable-template.ts`

---

### **Scenario 2: I need to add a "Capacity" field to TutoSchoolClasses**

```typescript
async function main() {
  await addField('TutoSchoolClasses', {
    name: 'Capacity',
    type: 'number',
    description: 'Maximum number of students allowed in class',
    options: {
      precision: 0,
    },
  });
}
```

Run: `npx ts-node scripts/airtable-template.ts`

---

### **Scenario 3: I need to create a new table for Extracurricular Activities**

```typescript
async function main() {
  await createTable('TutoExtracurricular', [
    { name: 'Activity Name', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { 
      name: 'Category', 
      type: 'singleSelect',
      options: {
        choices: [
          { name: 'Sports', color: 'greenBright' },
          { name: 'Arts', color: 'purpleBright' },
          { name: 'Music', color: 'blueBright' },
          { name: 'Technology', color: 'orangeBright' },
        ]
      }
    },
    { name: 'Max Participants', type: 'number', options: { precision: 0 } },
    { name: 'Schedule', type: 'multilineText' },
    { name: 'Status', type: 'singleSelect', options: {
        choices: [
          { name: 'Active', color: 'greenBright' },
          { name: 'Inactive', color: 'grayBright' },
        ]
      }
    },
    { name: 'Created Time', type: 'createdTime' },
  ], 'Tracks extracurricular activities offered by the school');
}
```

Run: `npx ts-node scripts/airtable-template.ts`

---

### **Scenario 4: I need to update all "Pending" classes to "Active"**

```typescript
async function main() {
  // Step 1: Find pending classes
  const records = await listRecords('TutoSchoolClasses', {
    filterByFormula: "{Status}='Pending'",
  });
  
  console.log(`\nFound ${records.length} pending classes`);
  
  // Step 2: Update them in batches of 10
  const updates = records.map((r: any) => ({
    id: r.id,
    fields: { 'Status': 'Active' },
  }));
  
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10);
    await updateRecords('TutoSchoolClasses', batch);
  }
}
```

Run: `npx ts-node scripts/airtable-template.ts`

---

## 🆘 Troubleshooting

### **Error: "Table not found"**
- Check table name spelling (case-sensitive)
- Run `listTables()` to see all available tables
- Table may be in different base

### **Error: "Field not found"**
- Check field name spelling (case-sensitive)
- Run `getTableSchema(table)` to see all fields
- Field may have been renamed

### **Error: "Invalid field type"**
- Check field type spelling (camelCase)
- Run `showFieldTypes()` to see all valid types
- Some types require options

### **Error: "Rate limit exceeded"**
- Wait 60 seconds and retry
- Reduce batch sizes
- Add delays between operations

### **Error: "Insufficient permissions"**
- Check PAT has write access (if creating/updating)
- Verify PAT is scoped to this base
- Generate new PAT with correct permissions

---

## 📌 Save This Script

**Location**: `scripts/airtable-template.ts`

**Whenever you need to**:
- ✅ Check table schema
- ✅ Add new fields
- ✅ Create new tables
- ✅ Query data
- ✅ Update records
- ✅ Audit schema compliance

**Just**:
1. Edit the `main()` function
2. Uncomment the operation you need
3. Run `npx ts-node scripts/airtable-template.ts`

---

**Keep this script handy - it's your Swiss Army knife for Airtable!** 🛠️

















