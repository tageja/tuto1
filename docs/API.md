# TutoApp API Documentation

## 📡 **API Overview**

TutoApp uses Airtable as the backend service for data management. This document outlines the API structure, endpoints, and data models.

## 🗄 **Airtable Integration**

### **Base Configuration**
```typescript
const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;
```

### **Service Structure**
```
AirtableService
├── Base Configuration
├── Table Mappings
├── Generic CRUD Operations
└── Specific Entity Methods
```

## 📊 **Data Models**

### **Teacher Interface**
```typescript
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  subjects: string[];
  qualifications: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  availability: {
    days: string[];
    timeSlots: string[];
  };
  languages: string[];
  description: string;
  status: 'active' | 'inactive';
}
```

### **Student Interface**
```typescript
interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentId: string;
  subjectsInterest: string[];
  address: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
}
```

### **Parent Interface**
```typescript
interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  children: string[]; // Array of student IDs
  paymentMethod?: string;
  status: 'active' | 'inactive';
}
```

### **Booking Interface**
```typescript
interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}
```

### **Review Interface**
```typescript
interface Review {
  id: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
```

## 🔧 **API Methods**

### **Generic CRUD Operations**

#### **Create Record**
```typescript
static async create(tableName: string, fields: Record<string, any>)
```
- **Purpose**: Create a new record in any table
- **Parameters**: 
  - `tableName`: Name of the Airtable table
  - `fields`: Object containing field data
- **Returns**: Created record with ID

#### **Get All Records**
```typescript
static async getAll(tableName: string, options?: {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  maxRecords?: number;
})
```
- **Purpose**: Retrieve all records from a table
- **Parameters**:
  - `tableName`: Name of the Airtable table
  - `options`: Optional filtering, sorting, and limiting
- **Returns**: Array of records

#### **Get Record by ID**
```typescript
static async getById(tableName: string, recordId: string)
```
- **Purpose**: Retrieve a specific record by ID
- **Parameters**:
  - `tableName`: Name of the Airtable table
  - `recordId`: Unique identifier of the record
- **Returns**: Single record object

#### **Update Record**
```typescript
static async update(tableName: string, recordId: string, fields: Record<string, any>)
```
- **Purpose**: Update an existing record
- **Parameters**:
  - `tableName`: Name of the Airtable table
  - `recordId`: Unique identifier of the record
  - `fields`: Object containing updated field data
- **Returns**: Updated record

#### **Delete Record**
```typescript
static async delete(tableName: string, recordId: string)
```
- **Purpose**: Delete a record from the table
- **Parameters**:
  - `tableName`: Name of the Airtable table
  - `recordId`: Unique identifier of the record
- **Returns**: Success status

### **Teacher-Specific Methods**

#### **Get Teachers**
```typescript
static async getTeachers(options?: {
  filterByFormula?: string;
  maxRecords?: number;
})
```
- **Purpose**: Retrieve teachers with optional filtering
- **Parameters**:
  - `options`: Optional filtering and limiting
- **Returns**: Array of Teacher objects

#### **Get Teacher by ID**
```typescript
static async getTeacherById(teacherId: string)
```
- **Purpose**: Retrieve a specific teacher by ID
- **Parameters**:
  - `teacherId`: Unique identifier of the teacher
- **Returns**: Teacher object

#### **Create Teacher**
```typescript
static async createTeacher(teacherData: {
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string[];
  experience: number;
  hourlyRate: number;
  location: Location;
  availability: Availability;
  languages: string[];
  description: string;
})
```
- **Purpose**: Create a new teacher record
- **Parameters**: Teacher data object
- **Returns**: Created Teacher object

#### **Update Teacher Rating**
```typescript
static async updateTeacherRating(teacherId: string)
```
- **Purpose**: Recalculate teacher rating based on reviews
- **Parameters**:
  - `teacherId`: Unique identifier of the teacher
- **Returns**: Updated Teacher object

### **Booking-Specific Methods**

#### **Create Booking**
```typescript
static async createBooking(bookingData: {
  studentId: string;
  teacherId: string;
  parentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
})
```
- **Purpose**: Create a new booking
- **Parameters**: Booking data object
- **Returns**: Created Booking object

#### **Get Bookings by Parent**
```typescript
static async getBookingsByParent(parentId: string)
```
- **Purpose**: Retrieve all bookings for a specific parent
- **Parameters**:
  - `parentId`: Unique identifier of the parent
- **Returns**: Array of Booking objects

#### **Get Bookings by Teacher**
```typescript
static async getBookingsByTeacher(teacherId: string)
```
- **Purpose**: Retrieve all bookings for a specific teacher
- **Parameters**:
  - `teacherId`: Unique identifier of the teacher
- **Returns**: Array of Booking objects

### **Student & Parent Methods**

#### **Create Student**
```typescript
static async createStudent(studentData: {
  name: string;
  age: number;
  grade: string;
  parentId: string;
  subjectsInterest: string[];
  address: string;
  phone?: string;
  email?: string;
})
```
- **Purpose**: Create a new student record
- **Parameters**: Student data object
- **Returns**: Created Student object

#### **Create Parent**
```typescript
static async createParent(parentData: {
  name: string;
  email: string;
  phone: string;
  address: string;
})
```
- **Purpose**: Create a new parent record
- **Parameters**: Parent data object
- **Returns**: Created Parent object

### **Review Methods**

#### **Create Review**
```typescript
static async createReview(reviewData: {
  teacherId: string;
  studentId: string;
  rating: number;
  comment: string;
})
```
- **Purpose**: Create a new review
- **Parameters**: Review data object
- **Returns**: Created Review object

## 📋 **Table Schema**

### **Teachers Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | Unique identifier |
| Name | Single line text | Teacher's full name |
| Email | Email | Contact email |
| Phone | Phone number | Contact phone |
| Avatar | Attachment | Profile picture |
| Subjects | Multiple select | Subjects taught |
| Qualifications | Long text | Educational background |
| Experience | Number | Years of experience |
| Hourly Rate | Number | Price per hour |
| Rating | Number | Average rating |
| Review Count | Number | Number of reviews |
| Location | Single line text | Address |
| Latitude | Number | GPS latitude |
| Longitude | Number | GPS longitude |
| Availability | Long text | Available days/times |
| Languages | Multiple select | Languages spoken |
| Description | Long text | About the teacher |
| Status | Single select | Active/Inactive |

### **Students Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | Unique identifier |
| Name | Single line text | Student's full name |
| Age | Number | Student's age |
| Grade | Single line text | Current grade level |
| Parent ID | Single line text | Reference to parent |
| Subjects of Interest | Multiple select | Preferred subjects |
| Address | Long text | Home address |
| Phone | Phone number | Contact phone |
| Email | Email | Contact email |
| Status | Single select | Active/Inactive |

### **Parents Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | Unique identifier |
| Name | Single line text | Parent's full name |
| Email | Email | Contact email |
| Phone | Phone number | Contact phone |
| Address | Long text | Home address |
| Children | Multiple record links | Linked student records |
| Payment Method | Single select | Preferred payment |
| Status | Single select | Active/Inactive |

### **Bookings Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | Unique identifier |
| Student ID | Single line text | Reference to student |
| Teacher ID | Single line text | Reference to teacher |
| Parent ID | Single line text | Reference to parent |
| Subject | Single line text | Subject being taught |
| Date | Date | Class date |
| Time | Single line text | Class time |
| Duration | Number | Class duration (minutes) |
| Status | Single select | Pending/Confirmed/Completed/Cancelled |
| Notes | Long text | Additional notes |
| Payment Status | Single select | Pending/Paid/Refunded |
| Created At | Date | Booking creation date |

### **Reviews Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | Unique identifier |
| Teacher ID | Single line text | Reference to teacher |
| Student ID | Single line text | Reference to student |
| Rating | Number | Rating (1-5) |
| Comment | Long text | Review text |
| Created At | Date | Review creation date |

## 🔍 **Filtering Examples**

### **Get Teachers by Subject**
```typescript
const filterFormula = `SEARCH("Mathematics", {Subjects}) > 0`;
const teachers = await AirtableService.getTeachers({ filterByFormula: filterFormula });
```

### **Get Teachers by Location**
```typescript
const filterFormula = `{Location} = "District 1, Ho Chi Minh City"`;
const teachers = await AirtableService.getTeachers({ filterByFormula: filterFormula });
```

### **Get Teachers by Rating**
```typescript
const filterFormula = `{Rating} >= 4.5`;
const teachers = await AirtableService.getTeachers({ filterByFormula: filterFormula });
```

### **Get Active Teachers**
```typescript
const filterFormula = `{Status} = "active"`;
const teachers = await AirtableService.getTeachers({ filterByFormula: filterFormula });
```

## 📊 **Sorting Examples**

### **Sort by Rating (High to Low)**
```typescript
const teachers = await AirtableService.getTeachers({
  sort: [{ field: 'Rating', direction: 'desc' }]
});
```

### **Sort by Price (Low to High)**
```typescript
const teachers = await AirtableService.getTeachers({
  sort: [{ field: 'Hourly Rate', direction: 'asc' }]
});
```

### **Sort by Experience (High to Low)**
```typescript
const teachers = await AirtableService.getTeachers({
  sort: [{ field: 'Experience', direction: 'desc' }]
});
```

## ⚠️ **Error Handling**

### **Common Error Types**
- **Network Errors**: Connection issues
- **Authentication Errors**: Invalid API key
- **Rate Limit Errors**: Too many requests
- **Validation Errors**: Invalid data format
- **Permission Errors**: Insufficient access rights

### **Error Response Format**
```typescript
interface ApiError {
  message: string;
  code: string;
  details?: any;
}
```

### **Error Handling Example**
```typescript
try {
  const teachers = await AirtableService.getTeachers();
  // Handle success
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Handle rate limiting
  } else if (error.code === 'AUTHENTICATION') {
    // Handle authentication error
  } else {
    // Handle generic error
  }
}
```

## 🔒 **Security Considerations**

### **API Key Management**
- Store API keys in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate API keys regularly

### **Data Validation**
- Validate all input data before sending to API
- Sanitize user inputs to prevent injection attacks
- Implement proper error handling for malformed data

### **Rate Limiting**
- Implement request throttling
- Handle rate limit errors gracefully
- Use caching to reduce API calls

## 📈 **Performance Optimization**

### **Caching Strategies**
- Cache frequently accessed data
- Implement cache invalidation
- Use local storage for offline data

### **Request Optimization**
- Limit the number of records per request
- Use filtering to reduce data transfer
- Implement pagination for large datasets

### **Error Recovery**
- Implement retry logic for failed requests
- Use exponential backoff for rate limits
- Provide fallback data when API is unavailable

---

This API documentation provides a comprehensive guide to the TutoApp backend integration, ensuring proper usage and maintenance of the Airtable service. 