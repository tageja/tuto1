**Batch Creation & Schema Automation Guide for Cursor AI**

This document collates all the context, credentials, IDs, encountered issues, and solutions needed for Cursor AI to generate, troubleshoot, and run scripts for Airtable batch creation and schema modifications.

---

## 1. Overview

We use Airtable as the backend for TutoApp. All automated schema changes and data operations are done via scripts, using Airtable's Metadata and Data APIs. Cursor AI should:

* Create new tables
* Add new fields to existing tables
* Batch-insert multiple records

This guide includes:

* **Credentials & IDs** (PAT, Base ID, Table IDs)
* **Required API scopes**
* **Common endpoints**
* **Environment setup**
* **Issues encountered & solutions**
* **Example scripts** (PowerShell & Bash)
* **CRITICAL: Connection Issue & Solution**

---

## 2. Credentials & Identifiers

### 2.1 Personal Access Token (PAT)

```
patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
```

Scopes granted:

* `data.bases:read`
* `data.records:read`
* `data.records:write`
* `meta.bases:read`
* `meta.tables:write`

### 2.2 Base ID

```
app34330Do0nm4qvM
```

### 2.3 Table IDs in Tuto Base

| Table Name                  | Table ID          |
| --------------------------- | ----------------- |
| Teachers                    | tblyQHaIDP4yP7ppJ |
| Institutes                  | tbl1XRPop3NNcAaxF |
| Students                    | tbl1cOkQ1qMbeZgn4 |
| Student Performance Records | tbluIGW2rsO1lhDf9 |
| Courses                     | tblTh2jUWSVxg4iUz |
| Assignments                 | tbl0tbIWrxn8olVWJ |
| Attendance Records          | tblQQ6TNTxJhV88sl |
| Class Schedules             | tblXiMEfCxenxGCLq |
| Booking                     | tblPJkcyttJNPf82U |
| TestTableScript             | tbl2Y0sJusr3gzf2j |

### 2.4 Tuto Prefixed Tables (Current Working Tables)

| Table Name                  | Table ID          |
| --------------------------- | ----------------- |
| TutoTeachers                | tblpr7UDdiC9027S5 |
| TutoStudents                | tblLPSq9m8p1vVhTS |
| TutoParents                 | tblOlcO32CaHcPpQd |
| TutoSubjects                | tblqpBtOdhMamwACY |
| TutoBookings                | tblzrzLFkqQMvC9vu |
| TutoReviews                 | tblTbpQT8WOsic358 |
| TutoPayments                | tbl7USIqwvEZxuWcT |
| TutoHomework                | tblLWGXOHXIbIZvYa |
| TutoPosts                   | tblnFXggvbpx4Xkrm |

---

## 3. API Endpoints

### 3.1 Metadata API (Schema operations)

* **Create table**  : `POST https://api.airtable.com/v0/meta/bases/{baseId}/tables`
* **Add field**    : `POST https://api.airtable.com/v0/meta/bases/{baseId}/tables/{tableId}/fields`
* **List tables**  : `GET https://api.airtable.com/v0/meta/bases/{baseId}/tables`

### 3.2 Data API (Record operations)

* **Batch-create** : `POST https://api.airtable.com/v0/{baseId}/{tableId}` with body `{ "records": [ { "fields": {...} }, ... ] }`
* **Single create**: `POST https://api.airtable.com/v0/{baseId}/{tableId}`
* **Read records** : `GET https://api.airtable.com/v0/{baseId}/{tableId}`
* **Update**       : `PATCH https://api.airtable.com/v0/{baseId}/{tableId}/{recordId}` with `{ "fields": {...} }`

Headers for **all** requests:

```
Authorization: Bearer <PAT>
Content-Type : application/json
```

---

## 4. Environment Setup

* **PowerShell scripts** run on Windows with ExecutionPolicy `RemoteSigned`.
* **Bash scripts** run in Git Bash or WSL on Windows.
* Store credentials in environment variables or an `.env` file:

  ```ini
  AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba...
  AIRTABLE_BASE_ID=app34330Do0nm4qvM
  ```

---

## 5. CRITICAL: Connection Issue & Solution

### 5.1 The Problem

**Issue**: Airtable SDK vs Direct REST API Connection Problems

When using the Airtable SDK (`const base = new Airtable({ apiKey }).base(baseId)`), we encountered:
- ❌ "You are not authorized to perform this operation"
- ❌ "You should provide valid api key to perform this operation"
- ❌ SDK has different permission requirements than direct REST API

**Root Cause**: The Airtable SDK requires different permissions and has stricter access controls than direct REST API calls.

### 5.2 The Solution

**Use Direct REST API calls instead of Airtable SDK**

**Working Approach**:
```javascript
import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.AIRTABLE_API_KEY
             || process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID
             || process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

// ✅ WORKING: Direct REST API call
const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/TutoTeachers`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

**❌ FAILING: Airtable SDK approach**
```javascript
const Airtable = require('airtable');
const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);
// This fails with authorization errors
```

### 5.3 Environment Variables

**Correct .env file structure**:
```ini
# Airtable Configuration
EXPO_PUBLIC_AIRTABLE_API_KEY=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
EXPO_PUBLIC_AIRTABLE_BASE_ID=app34330Do0nm4qvM

# App Configuration
EXPO_PUBLIC_APP_NAME=TutoApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENVIRONMENT=development
```

### 5.4 Working Test Scripts

**debug-metadata.js** (Working):
```javascript
import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.AIRTABLE_API_KEY
             || process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID
             || process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;

const response = await fetch(url, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

### 5.5 Key Differences

| Aspect | Airtable SDK | Direct REST API |
|--------|--------------|-----------------|
| **Import** | `const Airtable = require('airtable')` | `import fetch from 'node-fetch'` |
| **Environment** | `require('dotenv').config()` | `import 'dotenv/config'` |
| **Connection** | `new Airtable({ apiKey }).base(baseId)` | `fetch(url, { headers })` |
| **Permissions** | Stricter, requires specific scopes | More flexible, works with basic scopes |
| **Error Handling** | Generic SDK errors | Detailed HTTP status codes |
| **Success Rate** | ❌ Fails with auth errors | ✅ Works consistently |

### 5.6 Verification Steps

**To verify connection is working**:
1. Run `node debug-metadata.js` - should show 26 tables
2. Run `node scripts/simple-test.js` - should show 5 teacher records
3. Check status code is 200 OK
4. Verify data is being returned correctly

---

## 6. Issues Encountered & Solutions

1. **403 Forbidden / INVALID\_PERMISSIONS**

   * Missing scopes: ensure `data.bases:read`, `data.records:read`, `data.records:write`, `meta.bases:read`, `meta.tables:write`.
   * PAT must belong to same workspace as base.
   * **SOLUTION**: Use direct REST API instead of Airtable SDK.

2. **"You are not authorized to perform this operation"**

   * **CAUSE**: Airtable SDK has stricter permissions than REST API
   * **SOLUTION**: Switch to direct REST API calls
   * **VERIFICATION**: Use `debug-metadata.js` to test connection

3. **"You should provide valid api key to perform this operation"**

   * **CAUSE**: API key expired or incorrect
   * **SOLUTION**: Verify API key in Airtable account
   * **TEST**: Use `node scripts/test-any-base.js` to list accessible bases

4. **UNKNOWN\_FIELD\_NAME**

   * Error when payload includes fields not present in target table.
   * Solution: fetch table schema or use table ID to confirm valid field names.

5. **INVALID\_FIELD\_TYPE\_OPTIONS\_FOR\_CREATE**

   * Number fields require `options: { "precision": 0 }` in Metadata API payload.

6. **Name collision on table creation**

   * Creating a table with existing name returns empty failure. Use unique names or delete existing table.

7. **Empty error body on failure**

   * Use `Invoke-WebRequest` to capture `StatusCode`, `StatusDescription`, and raw `Content`.

---

## 7. Example Scripts

### 7.1 Working Connection Test (JavaScript)

```javascript
// test-connection.js
import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

async function testConnection() {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/TutoTeachers`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log(`📊 Found ${data.records.length} records`);
    } else {
      console.log('❌ Connection failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testConnection();
```

### 7.2 Create a new table (PowerShell)

```powershell
# CreateTable.ps1
$pat    = "$Env:AIRTABLE_PAT"
$baseId = "$Env:AIRTABLE_BASE_ID"
$uri = "https://api.airtable.com/v0/meta/bases/$baseId/tables"
$payload = @{
  name   = 'MyNewTable'
  fields = @(
    @{ name = 'ColA'; type='singleLineText' },
    @{ name = 'ColB'; type='number'; options=@{ precision=0 } }
  )
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri $uri -Headers @{ Authorization="Bearer $pat"; 'Content-Type'='application/json' } -Body $payload
```

### 7.3 Add a field (PowerShell)

```powershell
# AddField.ps1
$tableId = 'tbl2Y0sJusr3gzf2j'  # TestTableScript
$uri = "https://api.airtable.com/v0/meta/bases/$baseId/tables/$tableId/fields"
$payload = @{ name='NewColumnTest'; type='singleLineText' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers @{ Authorization="Bearer $pat"; 'Content-Type'='application/json' } -Body $payload
```

### 7.4 Batch-create records (PowerShell)

```powershell
# BatchCreate.ps1
$tableId = 'tblyQHaIDP4yP7ppJ'  # Teachers
$uri = "https://api.airtable.com/v0/$baseId/$tableId"
$records = @(
  @{ fields=@{ 'Teacher Name'='Script A'; 'Fee'='100,000'; 'Distance'='1.0' } },
  @{ fields=@{ 'Teacher Name'='Script B'; 'Fee'='200,000'; 'Distance'='2.0' } }
)
$body = @{ records=$records } | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri $uri -Headers @{ Authorization="Bearer $pat"; 'Content-Type'='application/json' } -Body $body
```

### 7.5 Batch-create records (Bash)

```bash
# batch_create.sh
API_KEY="$AIRTABLE_PAT"
BASE_ID="$AIRTABLE_BASE_ID"
TABLE_ID="tblyQHaIDP4yP7ppJ"
curl -X POST "https://api.airtable.com/v0/$BASE_ID/$TABLE_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "records": [ { "fields": { "Teacher Name":"A" } }, { "fields": { "Teacher Name":"B" } } ] }'
```

---

## 8. App Integration Guidelines

### 8.1 React Native App Integration

**Update src/services/airtable.ts**:
```typescript
// ❌ REMOVE: Airtable SDK approach
// const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// ✅ USE: Direct REST API approach
const API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

export class AirtableService {
  static async getAll(tableName: string) {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableName}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.records;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      throw error;
    }
  }
}
```

### 8.2 Environment Variables for App

**package.json scripts**:
```json
{
  "scripts": {
    "test:airtable": "node scripts/simple-test.js",
    "verify:base": "node scripts/test-metadata.js",
    "debug:connection": "node debug-metadata.js"
  }
}
```

---

## 9. Troubleshooting Checklist

### 9.1 Connection Issues

- [ ] Verify API key is correct and not expired
- [ ] Check Base ID matches your account
- [ ] Ensure using direct REST API (not Airtable SDK)
- [ ] Test with `debug-metadata.js` script
- [ ] Verify environment variables are loaded correctly

### 9.2 Permission Issues

- [ ] Check API key has required scopes
- [ ] Verify base is accessible with your account
- [ ] Test with metadata API first
- [ ] Use working `debug-metadata.js` as reference

### 9.3 Data Access Issues

- [ ] Verify table names are correct
- [ ] Check field names match Airtable schema
- [ ] Test with simple GET request first
- [ ] Use proper error handling

---

**CRITICAL REMINDER**: Always use direct REST API calls instead of Airtable SDK for consistent connection success.

Cursor AI can now reference this document to generate, debug, and execute scripts for batch creation and schema automation in Airtable without missing crucial details. Good luck!
