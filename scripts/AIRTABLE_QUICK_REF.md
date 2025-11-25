# Airtable Template - Quick Reference Card

**File**: `scripts/airtable-template.ts`  
**Quick Start**: 3 steps to run any operation

---

## 🚀 3-Step Usage

### 1️⃣ **Add Credentials** (One-time setup)
```typescript
// Edit lines 16-17 in scripts/airtable-template.ts
const AIRTABLE_PAT = 'patXXXXXXXXXXXXXX';
const AIRTABLE_BASE_ID = 'appXXXXXXXXXXXXXX';
```

### 2️⃣ **Edit main() Function** (Choose operation)
```typescript
// Uncomment the operation you need (line 450+)
async function main() {
  await listTables();  // ← Uncomment this
}
```

### 3️⃣ **Run Script**
```bash
npx ts-node scripts/airtable-template.ts
```

---

## 📋 Most Common Operations

### **Check What's in the Database**
```typescript
// See all tables
await listTables();

// See fields in a table
await getTableSchema('TutoSchoolClasses');

// See records in a table
await listRecords('TutoSchoolClasses', { maxRecords: 5 });
```

### **Verify Schema**
```typescript
// Check if table exists
await checkTableExists('TutoSchoolClasses');

// Check if field exists
await checkFieldExists('TutoSchoolClasses', 'Capacity');

// Audit full schema
await auditTableSchema('TutoSchoolClasses', [
  { name: 'Class Name', type: 'singleLineText' },
  { name: 'Capacity', type: 'number' },
]);
```

### **Add New Stuff**
```typescript
// Add a field
await addField('TutoSchoolClasses', {
  name: 'Capacity',
  type: 'number',
  options: { precision: 0 },
});

// Create a table
await createTable('TutoNewTable', [
  { name: 'Name', type: 'singleLineText' },
  { name: 'Status', type: 'singleSelect', options: {
      choices: [{ name: 'Active', color: 'greenBright' }]
    }
  },
]);

// Create records
await createRecords('TutoSchoolClasses', [
  { fields: { 'Class Name': 'Grade 5A', 'Status': 'Active' } },
]);
```

---

## 🎨 Field Types Cheat Sheet

| Type | Use For | Example |
|------|---------|---------|
| `singleLineText` | Short text | Names, IDs, codes |
| `multilineText` | Long text | Descriptions, notes |
| `email` | Email addresses | user@example.com |
| `phoneNumber` | Phone numbers | +84 123 456 789 |
| `number` | Numbers | 25, 100, 1.5 |
| `currency` | Money | $50.00 |
| `percent` | Percentages | 85% |
| `checkbox` | True/false | Is Active |
| `singleSelect` | One choice | Status (Active/Inactive) |
| `multipleSelects` | Many choices | Tags, Categories |
| `date` | Date only | 2025-11-05 |
| `dateTime` | Date + time | 2025-11-05 10:30 AM |
| `rating` | Star rating | ⭐⭐⭐⭐⭐ |
| `multipleRecordLinks` | Link to table | School → Classes |
| `multipleAttachments` | Files | PDFs, images |

---

## 🔍 Filter Formula Cheat Sheet

```typescript
// Exact match
"{Status}='Active'"

// OR condition
"OR({Status}='Active', {Status}='Pending')"

// AND condition
"AND({School}='ABC', {Grade}='5')"

// Text search (case-insensitive)
"SEARCH('math', LOWER({Class Name}))"

// Number comparison
"{Count} > 20"

// Date range
"IS_AFTER({Date}, '2025-01-01')"

// Not empty
"{Email} != ''"

// Today only
"{Date} = TODAY()"

// Last 7 days
"IS_AFTER({Date}, DATEADD(TODAY(), -7, 'days'))"
```

---

## 📞 When to Use This Script

| Task | Command |
|------|---------|
| "Check if table X exists" | `await checkTableExists('X')` |
| "What fields does table X have?" | `await getTableSchema('X')` |
| "Add field Y to table X" | `await addField('X', {...})` |
| "Create table X" | `await createTable('X', [...])` |
| "Show me records from X" | `await listRecords('X')` |
| "Create test data in X" | `await createRecords('X', [...])` |
| "Update records in X" | `await updateRecords('X', [...])` |
| "Audit schema for X" | `await auditTableSchema('X', [...])` |

---

## 💾 Save Location

```
scripts/
├── airtable-template.ts          ← Main script (edit this)
├── AIRTABLE_TEMPLATE_GUIDE.md    ← Full documentation
└── AIRTABLE_QUICK_REF.md         ← This quick ref (print this!)
```

---

## 🎯 Next Time You Need It

1. Open `scripts/airtable-template.ts`
2. Find the `main()` function (line 450+)
3. Uncomment the operation you need
4. Edit parameters (table names, field names, etc.)
5. Run: `npx ts-node scripts/airtable-template.ts`
6. Check console output

**That's it!** 🎉

---

*Keep this card handy - bookmark it or print it!*

















