# 🗄️ Database Setup Guide - TutoApp

This guide will help you set up your Airtable database with all the necessary tables and sample data for your TutoApp.

## 🚀 Quick Start

### **Step 1: Get Your Airtable Credentials**

1. **Create an Airtable account** at [airtable.com](https://airtable.com)
2. **Create a new base** for your tutoring app
3. **Get your API key**:
   - Go to your account settings
   - Navigate to "API" section
   - Copy your Personal Access Token
4. **Get your Base ID**:
   - Open your base in Airtable
   - Go to Help → API Documentation
   - Copy the Base ID from the URL

### **Step 2: Set Up Environment Variables**

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
```

### **Step 3: Create Tables**

Run the table creation script:

```bash
npm run create:tables
```

This will show you exactly what tables and fields to create in Airtable.

### **Step 4: Create Tables Manually in Airtable**

Since Airtable API doesn't support table creation, you'll need to create the tables manually:

1. **Go to your Airtable base**
2. **Create the following 9 tables** with the exact field specifications shown by the script

### **Step 5: Populate with Sample Data**

Once your tables are created, populate them with sample data:

```bash
npm run populate:tables
```

### **Step 6: Test the Integration**

```bash
npm run test:airtable
```

---

## 📊 **Table Schemas**

### **1. Teachers Table**
**Purpose**: Teacher profiles with qualifications, subjects, and availability

**Fields**:
- `Name` (Single line text) - **Required**
- `Email` (Email) - **Required**
- `Phone` (Phone number)
- `Avatar` (Single line text)
- `Subjects` (Multiple select) - Options: Mathematics, English, Physics, Chemistry, Literature, Biology, History, Geography, Computer Science, Music, Art, Sports, Piano, Guitar, Swimming, Football, Basketball, Drawing
- `Qualifications` (Long text)
- `Experience` (Number)
- `Hourly Rate` (Number)
- `Rating` (Number)
- `Review Count` (Number)
- `Location Address` (Long text)
- `Latitude` (Number)
- `Longitude` (Number)
- `Availability Days` (Multiple select) - Options: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- `Availability Time Slots` (Long text)
- `Languages` (Multiple select) - Options: Vietnamese, English, Chinese, French, Korean, Japanese
- `Description` (Long text)
- `Status` (Single select) - Options: Active, Inactive, Pending

### **2. Students Table**
**Purpose**: Student profiles with academic information and interests

**Fields**:
- `Name` (Single line text) - **Required**
- `Age` (Number)
- `Grade` (Single line text)
- `Parent ID` (Single line text) - **Required**
- `Subjects of Interest` (Multiple select) - Options: Mathematics, English, Physics, Chemistry, Literature, Biology, History, Geography, Computer Science, Music, Art, Sports, Piano, Guitar, Swimming, Football, Basketball, Drawing
- `Address` (Long text)
- `Phone` (Phone number)
- `Email` (Email)
- `Status` (Single select) - Options: Active, Inactive

### **3. Parents Table**
**Purpose**: Parent profiles with payment methods and children

**Fields**:
- `Name` (Single line text) - **Required**
- `Email` (Email) - **Required**
- `Phone` (Phone number)
- `Address` (Long text)
- `Children` (Multiple record links) → Links to Students table
- `Payment Method` (Single select) - Options: Credit Card, Bank Transfer, Cash, Digital Wallet, PayPal
- `Status` (Single select) - Options: Active, Inactive

### **4. Bookings Table**
**Purpose**: Tutoring session bookings and scheduling

**Fields**:
- `Student ID` (Link to another record) → Links to Students table - **Required**
- `Teacher ID` (Link to another record) → Links to Teachers table - **Required**
- `Parent ID` (Link to another record) → Links to Parents table - **Required**
- `Subject` (Single line text) - **Required**
- `Date` (Date) - **Required**
- `Time` (Single line text) - **Required**
- `Duration` (Number)
- `Status` (Single select) - Options: Pending, Confirmed, Completed, Cancelled
- `Notes` (Long text)
- `Payment Status` (Single select) - Options: Pending, Paid, Refunded
- `Created At` (Date)

### **5. Subjects Table**
**Purpose**: Subject catalog with bilingual support

**Fields**:
- `Name` (Single line text) - **Required**
- `Name Vietnamese` (Single line text)
- `Icon` (Single line text)
- `Category` (Single select) - Options: Academic, Extracurricular
- `Description` (Long text)
- `Description Vietnamese` (Long text)
- `Color` (Single line text)
- `Status` (Single select) - Options: Active, Inactive

### **6. Reviews Table**
**Purpose**: Teacher reviews and ratings from students/parents

**Fields**:
- `Teacher ID` (Link to another record) → Links to Teachers table - **Required**
- `Student ID` (Link to another record) → Links to Students table - **Required**
- `Rating` (Number) - **Required**
- `Comment` (Long text)
- `Created At` (Date)

### **7. Payments Table**
**Purpose**: Payment tracking for tutoring sessions

**Fields**:
- `Booking ID` (Link to another record) → Links to Bookings table - **Required**
- `Amount` (Number) - **Required**
- `Currency` (Single line text)
- `Status` (Single select) - Options: Pending, Paid, Refunded
- `Payment Method` (Single line text)
- `Transaction ID` (Single line text)
- `Created At` (Date)

### **8. Homework Table**
**Purpose**: Homework assignments with adaptive learning levels

**Fields**:
- `Student ID` (Link to another record) → Links to Students table - **Required**
- `Teacher ID` (Link to another record) → Links to Teachers table - **Required**
- `Subject` (Single line text) - **Required**
- `Title` (Single line text) - **Required**
- `Description` (Long text)
- `Due Date` (Date)
- `Status` (Single select) - Options: Assigned, Submitted, Graded
- `Adaptive Level` (Number)
- `Created At` (Date)

### **9. Posts Table**
**Purpose**: Social feed posts for community engagement

**Fields**:
- `Author ID` (Single line text) - **Required**
- `Author Name` (Single line text) - **Required**
- `Author Role` (Single select) - Options: teacher, parent, student
- `Author Avatar` (Single line text)
- `Content Text` (Long text) - **Required**
- `Content Media Type` (Single select) - Options: image, video
- `Content Media URL` (Single line text)
- `Content Media Thumbnail` (Single line text)
- `Post Type` (Single select) - Options: text, image, video, poll, resource
- `Subjects` (Multiple select) - Options: Mathematics, English, Physics, Chemistry, Literature, Biology, History, Geography, Computer Science, Music, Art, Sports, Piano, Guitar, Swimming, Football, Basketball, Drawing, Education, Writing, Creativity, Programming, Tutoring
- `Timestamp` (Date)
- `Likes Count` (Number)
- `Comments Count` (Number)
- `Shares Count` (Number)
- `Saves Count` (Number)
- `Privacy` (Single select) - Options: public, center-only, network-only
- `Status` (Single select) - Options: Active, Hidden, Deleted

---

## 🔧 **Available Scripts**

### **Table Creation**
```bash
npm run create:tables
```
- Shows exact table schemas to create manually
- Provides field specifications and options
- Includes required field indicators

### **Data Population**
```bash
npm run populate:tables
```
- Populates tables with comprehensive sample data
- Includes 5 teachers, 5 students, 5 parents, 12 subjects
- Realistic Vietnamese names and addresses
- Proper relationships between tables

### **Connection Testing**
```bash
npm run test:airtable
```
- Tests Airtable connection
- Verifies credentials and base access
- Provides troubleshooting guidance

### **Environment Setup**
```bash
npm run setup:env
```
- Helps create .env file
- Guides through credential setup

---

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

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Unauthorized" Error**
   - Check your API key is correct
   - Ensure API key has access to the base
   - Verify Base ID is correct

2. **"Table not found" Error**
   - Create the missing table manually
   - Use the exact table name from the schema
   - Ensure all required fields are created

3. **"Field not found" Error**
   - Create the missing field manually
   - Use the exact field name from the schema
   - Ensure field type matches specification

4. **Rate Limiting**
   - Scripts include delays to avoid rate limits
   - If you hit limits, wait a few minutes and retry

### **Verification Steps**

1. **Test Connection**
   ```bash
   npm run test:airtable
   ```

2. **Check Tables Exist**
   - Verify all 9 tables are created in Airtable
   - Ensure field names match exactly

3. **Test Data Population**
   ```bash
   npm run populate:tables
   ```

4. **Start the App**
   ```bash
   npm start
   ```

---

## 🎯 **Next Steps**

Once your database is set up:

1. **Test the App**: Start the app and browse teachers
2. **Create Bookings**: Test the booking functionality
3. **Explore Features**: Try all app features with real data
4. **Customize Data**: Add your own teachers, students, and content
5. **Deploy**: Prepare for production deployment

---

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Airtable setup
3. Check the console for error messages
4. Ensure all environment variables are set correctly
5. Verify all tables and fields are created exactly as specified

Your TutoApp will be fully functional with real data once this setup is complete! 🚀 