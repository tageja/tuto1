# 🚀 Automated Airtable Comments Table Setup

## Option 1: Automated Script (Recommended)

### Step 1: Get Your Airtable Credentials

1. **Get Personal Access Token (PAT)**:
   - Go to https://airtable.com/create/tokens
   - Click "Create new token"
   - Name it "TutoApp Comments"
   - Add these scopes:
     - `data.records:read`
     - `data.records:write` 
     - `schema.bases:read`
     - `schema.bases:write`
   - Add your base under "Access"
   - Copy the generated token

2. **Get Base ID**:
   - Open your Airtable base
   - Go to https://airtable.com/api
   - Click on your base
   - Copy the Base ID (starts with `app`)

### Step 2: Set Environment Variables

Create a `.env` file in your project root:

```bash
# Add these to your .env file
AIRTABLE_PAT=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### Step 3: Run the Automated Script

```bash
node scripts/create-comments-table.js
```

The script will automatically create the `TutoComments` table with all required fields!

---

## Option 2: Manual Setup (Fallback)

If the automated script doesn't work, create the table manually:

### Table Name: `TutoComments`

### Fields to Create:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `ID` | Single Line Text | Unique comment identifier |
| `Post ID` | Single Line Text | ID of the post this comment belongs to |
| `Author ID` | Single Line Text | ID of the user who wrote the comment |
| `Author Name` | Single Line Text | Display name of the comment author |
| `Content` | Long Text | The comment text content |
| `Created At` | Date | When the comment was created (ISO format) |

### Steps:
1. In your Airtable base, click the "+" to add a new table
2. Name it exactly `TutoComments`
3. Create each field above with the exact names and types
4. Save the table

---

## Verification

Once the table is created, your app will:
- ✅ Store comments permanently in Airtable
- ✅ Display comments across all user accounts
- ✅ Show real user names and timestamps
- ✅ Support cross-user comment visibility

## Troubleshooting

### Script Issues:
- **401 Error**: Check your PAT token and scopes
- **404 Error**: Verify your Base ID
- **422 Error**: Table might already exist

### Manual Issues:
- Ensure field names match exactly (case-sensitive)
- `Created At` should be Date/Time type with ISO format
- Table name must be exactly `TutoComments`

---

## Next Steps

After setup, restart your app and test:
1. Login as different users
2. Add comments to posts
3. Verify comments appear for all users
4. Check Airtable to see stored data
