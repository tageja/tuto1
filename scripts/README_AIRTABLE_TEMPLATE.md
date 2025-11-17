# Airtable Template Script - Overview

Your Swiss Army knife for all Airtable operations! 🛠️

---

## 📁 Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `airtable-template.ts` | Main executable script | ~600 |
| `AIRTABLE_TEMPLATE_GUIDE.md` | Detailed documentation | Full guide |
| `AIRTABLE_QUICK_REF.md` | Quick reference card | Cheat sheet |
| `README_AIRTABLE_TEMPLATE.md` | This overview | You are here |

---

## ⚡ Quick Start (30 seconds)

### Step 1: Add Your Credentials
Open `scripts/airtable-template.ts` and edit lines 16-17:

```typescript
const AIRTABLE_PAT = 'YOUR_PAT_HERE';      // ← Put your PAT here
const AIRTABLE_BASE_ID = 'YOUR_BASE_HERE'; // ← Put your Base ID here
```

### Step 2: Choose an Operation
In the `main()` function (line 450+), uncomment what you need:

```typescript
async function main() {
  // Uncomment one:
  await listTables();                        // See all tables
  await getTableSchema('TutoSchoolClasses'); // See table fields
  await listRecords('TutoSchoolClasses');    // See records
}
```

### Step 3: Run It
```bash
npx ts-node scripts/airtable-template.ts
```

**That's it!** The script will show you the results in the console.

---

## 🎯 What Can This Script Do?

### **Read Operations** (Check database)
- ✅ List all tables in base
- ✅ Get detailed schema for any table
- ✅ Query records with filters
- ✅ Check if table/field exists
- ✅ Audit schema compliance

### **Write Operations** (Modify database)
- ✅ Create new tables
- ✅ Add fields to existing tables
- ✅ Update field properties
- ✅ Create records (CRUD)
- ✅ Update records (CRUD)
- ✅ Delete records (CRUD)

### **Utilities**
- ✅ Field type reference
- ✅ Filter formula examples
- ✅ Error handling
- ✅ Logging and debugging

---

## 📖 Which File to Read?

### **Just Starting?**
👉 Read `AIRTABLE_QUICK_REF.md` (5 min read)
- Quick 3-step guide
- Common operations
- Field types cheat sheet
- Filter formulas

### **Need More Details?**
👉 Read `AIRTABLE_TEMPLATE_GUIDE.md` (15 min read)
- Full documentation
- All 10 use cases with examples
- Workflow guides
- Pro tips

### **Ready to Code?**
👉 Edit `airtable-template.ts`
- All functions documented
- Copy-paste templates
- Just uncomment and run

---

## 💡 Common Scenarios

### **"I need to check if a field exists"**
```typescript
await checkFieldExists('TutoSchoolClasses', 'Capacity');
```
Run: `npx ts-node scripts/airtable-template.ts`

---

### **"I need to add a new field"**
```typescript
await addField('TutoSchoolClasses', {
  name: 'Capacity',
  type: 'number',
  options: { precision: 0 },
});
```
Run: `npx ts-node scripts/airtable-template.ts`

---

### **"I need to create a new table"**
```typescript
await createTable('TutoNewTable', [
  { name: 'Name', type: 'singleLineText' },
  { name: 'Status', type: 'singleSelect', options: {
      choices: [{ name: 'Active', color: 'greenBright' }]
    }
  },
]);
```
Run: `npx ts-node scripts/airtable-template.ts`

---

### **"I need to see what's in a table"**
```typescript
await listRecords('TutoSchoolClasses', {
  maxRecords: 5,
  filterByFormula: "{Status}='Active'",
});
```
Run: `npx ts-node scripts/airtable-template.ts`

---

## 🔒 Security Note

**IMPORTANT**: After adding your PAT and BASE_ID:
- ✅ `.gitignore` already excludes `.env` files
- ✅ This script is also safe (credentials in constants, not committed)
- ⚠️ If you want extra safety, use environment variables:

```typescript
// Option 1: Hard-code (current approach)
const AIRTABLE_PAT = 'patXXXXXXXXXXXXXX';

// Option 2: Use .env file (more secure)
import dotenv from 'dotenv';
dotenv.config();
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
```

---

## 🎨 Example: Full Workflow

**Goal**: Add "Capacity" field to TutoSchoolClasses

```typescript
async function main() {
  // Step 1: Check current schema
  console.log('\n📊 STEP 1: Current Schema');
  await getTableSchema('TutoSchoolClasses');
  
  // Step 2: Check if field already exists
  console.log('\n📊 STEP 2: Check Field');
  const exists = await checkFieldExists('TutoSchoolClasses', 'Capacity');
  
  // Step 3: Add field if missing
  if (!exists) {
    console.log('\n📊 STEP 3: Adding Field');
    await addField('TutoSchoolClasses', {
      name: 'Capacity',
      type: 'number',
      description: 'Maximum number of students allowed in class',
      options: { precision: 0 },
    });
    
    console.log('\n✅ Field added successfully!');
  } else {
    console.log('\n✅ Field already exists, nothing to do.');
  }
  
  // Step 4: Verify
  console.log('\n📊 STEP 4: Verify Schema');
  await getTableSchema('TutoSchoolClasses');
}
```

Run: `npx ts-node scripts/airtable-template.ts`

---

## 📞 Support

**Questions?**
- 📖 Full docs: `scripts/AIRTABLE_TEMPLATE_GUIDE.md`
- ⚡ Quick ref: `scripts/AIRTABLE_QUICK_REF.md`
- 🔧 Main script: `scripts/airtable-template.ts`

**Airtable API Docs**: https://airtable.com/developers/web/api/introduction

---

**Happy scripting!** 🚀













