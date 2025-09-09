# 🚀 Automated Airtable Setup Guide - TutoApp

This guide explains how to use the new **automated scripts** that create tables and populate data using Airtable's Metadata API and direct REST calls.

## 🎯 **What's New**

### **Automated Table Creation**
- **No more manual table creation** - tables are created programmatically
- **Uses Metadata API** (`/v0/meta/bases/{baseId}/tables`) for schema operations
- **Proper field definitions** with correct options for number/date types
- **Comprehensive error handling** with detailed logging

### **Automated Data Population**
- **Direct REST API calls** instead of Airtable SDK limitations
- **Batch creation** with proper rate limiting
- **Automatic table ID discovery** using Metadata API
- **Robust error handling** for each batch

## 🔧 **Available Scripts**

### **Automated Table Creation**
```bash
npm run create:tables:auto
```
- Creates all 9 tables using Metadata API
- Includes proper field definitions with options
- Handles existing tables gracefully
- Returns table IDs for reference

### **Automated Data Population**
```bash
npm run populate:tables:auto
```
- Populates tables with comprehensive sample data
- Uses direct REST API for batch creation
- Automatically discovers table IDs
- Includes rate limiting and error handling

### **Legacy Scripts (Manual Instructions)**
```bash
npm run create:tables      # Shows manual table creation instructions
npm run populate:tables    # Uses Airtable SDK (limited functionality)
```

## 📊 **Table Schemas Created**

### **1. Teachers Table**
**Fields**: Name, Email, Phone, Avatar, Subjects (multiple select), Qualifications, Experience, Hourly Rate, Rating, Review Count, Location Address, Latitude, Longitude, Availability Days, Availability Time Slots, Languages, Description, Status

### **2. Students Table**
**Fields**: Name, Age, Grade, Parent ID, Subjects of Interest (multiple select), Address, Phone, Email, Status

### **3. Parents Table**
**Fields**: Name, Email, Phone, Address, Children (multiple record links), Payment Method, Status

### **4. Bookings Table**
**Fields**: Student ID, Teacher ID, Parent ID, Subject, Date, Time, Duration, Status, Notes, Payment Status, Created At

### **5. Subjects Table**
**Fields**: Name, Name Vietnamese, Icon, Category, Description, Description Vietnamese, Color, Status

### **6. Reviews Table**
**Fields**: Teacher ID, Student ID, Rating, Comment, Created At

### **7. Payments Table**
**Fields**: Booking ID, Amount, Currency, Status, Payment Method, Transaction ID, Created At

### **8. Homework Table**
**Fields**: Student ID, Teacher ID, Subject, Title, Description, Due Date, Status, Adaptive Level, Created At

### **9. Posts Table**
**Fields**: Author ID, Author Name, Author Role, Author Avatar, Content Text, Content Media Type, Content Media URL, Content Media Thumbnail, Post Type, Subjects, Timestamp, Likes Count, Comments Count, Shares Count, Saves Count, Privacy, Status

## 🔧 **Technical Implementation**

### **Metadata API Helper**
```javascript
async function callMetadataAPI(endpoint, method = 'GET', body = null) {
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }
  
  return responseText ? JSON.parse(responseText) : null;
}
```

### **Data API Helper**
```javascript
async function callDataAPI(tableId, method = 'GET', body = null) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }
  
  return responseText ? JSON.parse(responseText) : null;
}
```

### **Batch Creation Helper**
```javascript
async function batchCreateRecords(tableId, records) {
  const result = await callDataAPI(tableId, 'POST', { records });
  return result;
}
```

## 📋 **Field Type Specifications**

### **Number Fields**
```javascript
{
  name: "Experience",
  type: "number",
  options: { precision: 0 }
}
```

### **Multiple Select Fields**
```javascript
{
  name: "Subjects",
  type: "multipleSelects",
  options: {
    choices: [
      { name: "Mathematics" },
      { name: "English" },
      // ... more choices
    ]
  }
}
```

### **Single Select Fields**
```javascript
{
  name: "Status",
  type: "singleSelect",
  options: {
    choices: [
      { name: "Active" },
      { name: "Inactive" }
    ]
  }
}
```

### **Date/DateTime Fields**
```javascript
{
  name: "Created At",
  type: "dateTime"
}
```

## 🚨 **Error Handling**

### **Common Errors & Solutions**

1. **403 Forbidden**
   - **Cause**: Missing API scopes or invalid PAT
   - **Solution**: Ensure PAT has required scopes:
     - `data.bases:read`
     - `data.records:read`
     - `data.records:write`
     - `meta.bases:read`
     - `meta.tables:write`

2. **404 Not Found**
   - **Cause**: Invalid Base ID or base doesn't exist
   - **Solution**: Verify Base ID in .env file

3. **Table Already Exists**
   - **Cause**: Table with same name already exists
   - **Solution**: Script handles gracefully, skips existing tables

4. **Rate Limiting**
   - **Cause**: Too many API calls too quickly
   - **Solution**: Scripts include 100ms delays between batches

### **Debugging Tips**

1. **Check API Response**
   ```javascript
   console.log(`HTTP ${response.status}: ${responseText}`);
   ```

2. **Verify Table IDs**
   ```javascript
   const tableIds = await getTableIds();
   console.log('Available tables:', tableIds);
   ```

3. **Test Individual Operations**
   ```javascript
   // Test table creation
   const result = await callMetadataAPI('/tables', 'POST', tablePayload);
   
   // Test batch creation
   const result = await batchCreateRecords(tableId, records);
   ```

## 🎯 **Usage Workflow**

### **Step 1: Set Up Environment**
```bash
# Create .env file
EXPO_PUBLIC_AIRTABLE_API_KEY=your_pat_here
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
```

### **Step 2: Install Dependencies**
```bash
npm install node-fetch
```

### **Step 3: Create Tables**
```bash
npm run create:tables:auto
```

### **Step 4: Populate Data**
```bash
npm run populate:tables:auto
```

### **Step 5: Test Integration**
```bash
npm run test:airtable
```

### **Step 6: Start App**
```bash
npm start
```

## 📈 **Sample Data Included**

### **Teachers (5 records)**
- Nguyễn Thị Anh (Mathematics, Physics)
- Trần Văn Minh (English, Literature)
- Lê Thu Hà (Music, Piano)
- Đỗ Quang Huy (Computer Science, Programming)
- Vũ Thị Lan (Chemistry, Biology)

### **Students (5 records)**
- Trần Minh Anh (15 years, 10th Grade)
- Lê Hoàng Nam (12 years, 7th Grade)
- Phạm Thị Linh (14 years, 9th Grade)
- Nguyễn Văn Bình (16 years, 11th Grade)
- Trần Thị Cúc (13 years, 8th Grade)

### **Parents (5 records)**
- Phạm Thị Mai
- Nguyễn Văn Hùng
- Vũ Thị Lan
- Trần Thị Hoa
- Lê Văn Minh

### **Subjects (12 records)**
- **Academic**: Mathematics, English, Physics, Chemistry, Literature, Biology
- **Extracurricular**: Piano, Guitar, Swimming, Football, Basketball, Drawing

## 🔄 **Migration from Manual to Automated**

### **If You Have Existing Tables**
1. **Backup your data** (export from Airtable)
2. **Run automated creation** - it will skip existing tables
3. **Run automated population** - it will add sample data to existing tables
4. **Verify data integrity** - check that relationships are maintained

### **If Starting Fresh**
1. **Run automated creation** - creates all 9 tables
2. **Run automated population** - populates with sample data
3. **Test the app** - verify all features work with real data

## 🎉 **Benefits of Automated Approach**

### **✅ Advantages**
- **No manual work** - everything is automated
- **Consistent schema** - all tables have proper field definitions
- **Error handling** - comprehensive logging and debugging
- **Rate limiting** - prevents API throttling
- **Batch operations** - efficient data population
- **Type safety** - proper field types and options

### **✅ Production Ready**
- **Robust error handling** for CI/CD environments
- **Detailed logging** for debugging
- **Graceful failure** - continues on partial errors
- **Rate limiting** - respects API limits
- **Batch processing** - handles large datasets

## 📞 **Support**

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Verify your PAT has required scopes**
3. **Check the console for detailed error messages**
4. **Ensure all environment variables are set correctly**
5. **Verify your base exists and is accessible**

The automated scripts provide a complete, production-ready solution for setting up your TutoApp database! 🚀 