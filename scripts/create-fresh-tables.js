const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🆕 Creating Fresh Tables for TutoApp');
console.log('=====================================\n');

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.log('❌ Error: Missing Airtable credentials');
  console.log('Please set up your .env file with:');
  console.log('EXPO_PUBLIC_AIRTABLE_API_KEY=your_pat_here');
  console.log('EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here');
  process.exit(1);
}

// Helper function for Metadata API calls
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

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error(`❌ API call failed: ${error.message}`);
    throw error;
  }
}

// Helper function for Data API calls
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

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error(`❌ API call failed: ${error.message}`);
    throw error;
  }
}

// Batch create records helper
async function batchCreateRecords(tableId, records) {
  console.log(`📝 Creating ${records.length} records in table ${tableId}...`);
  
  try {
    const result = await callDataAPI(tableId, 'POST', { records });
    console.log(`✅ Successfully created ${records.length} records`);
    return result;
  } catch (error) {
    console.error(`❌ Batch creation failed: ${error.message}`);
    throw error;
  }
}

// Comprehensive table schemas with proper field definitions
const tableSchemas = {
  'TutoTeachers': {
    description: 'Teacher profiles with qualifications, subjects, and availability',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Avatar', type: 'singleLineText' },
      { 
        name: 'Subjects', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' }
          ]
        }
      },
      { name: 'Qualifications', type: 'multilineText' },
      { name: 'Experience', type: 'number', options: { precision: 0 } },
      { name: 'Hourly Rate', type: 'number', options: { precision: 0 } },
      { name: 'Rating', type: 'number', options: { precision: 1 } },
      { name: 'Review Count', type: 'number', options: { precision: 0 } },
      { name: 'Location Address', type: 'multilineText' },
      { name: 'Latitude', type: 'number', options: { precision: 6 } },
      { name: 'Longitude', type: 'number', options: { precision: 6 } },
      { 
        name: 'Availability Days', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Monday' },
            { name: 'Tuesday' },
            { name: 'Wednesday' },
            { name: 'Thursday' },
            { name: 'Friday' },
            { name: 'Saturday' },
            { name: 'Sunday' }
          ]
        }
      },
      { name: 'Availability Time Slots', type: 'multilineText' },
      { 
        name: 'Languages', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Vietnamese' },
            { name: 'English' },
            { name: 'Chinese' },
            { name: 'French' },
            { name: 'Korean' },
            { name: 'Japanese' }
          ]
        }
      },
      { name: 'Description', type: 'multilineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Pending' }
          ]
        }
      }
    ]
  },
  'TutoStudents': {
    description: 'Student profiles with academic information and interests',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Age', type: 'number', options: { precision: 0 } },
      { name: 'Grade', type: 'singleLineText' },
      { name: 'Parent ID', type: 'singleLineText' },
      { 
        name: 'Subjects of Interest', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' }
          ]
        }
      },
      { name: 'Address', type: 'multilineText' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Email', type: 'email' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'TutoParents': {
    description: 'Parent profiles with payment methods and children',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Address', type: 'multilineText' },
      { 
        name: 'Payment Method', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Credit Card' },
            { name: 'Bank Transfer' },
            { name: 'Cash' },
            { name: 'Digital Wallet' },
            { name: 'PayPal' }
          ]
        }
      },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'TutoSubjects': {
    description: 'Subject catalog with bilingual support',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Name Vietnamese', type: 'singleLineText' },
      { name: 'Icon', type: 'singleLineText' },
      { 
        name: 'Category', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Academic' },
            { name: 'Extracurricular' }
          ]
        }
      },
      { name: 'Description', type: 'multilineText' },
      { name: 'Description Vietnamese', type: 'multilineText' },
      { name: 'Color', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Inactive' }
          ]
        }
      }
    ]
  },
  'TutoBookings': {
    description: 'Tutoring session bookings and scheduling',
    fields: [
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Parent ID', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { name: 'Time', type: 'singleLineText' },
      { name: 'Duration', type: 'number', options: { precision: 0 } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Confirmed' },
            { name: 'Completed' },
            { name: 'Cancelled' }
          ]
        }
      },
      { name: 'Notes', type: 'multilineText' },
      { 
        name: 'Payment Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Paid' },
            { name: 'Refunded' }
          ]
        }
      },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'TutoReviews': {
    description: 'Teacher reviews and ratings from students/parents',
    fields: [
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Rating', type: 'number', options: { precision: 1 } },
      { name: 'Comment', type: 'multilineText' },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'TutoPayments': {
    description: 'Payment tracking for tutoring sessions',
    fields: [
      { name: 'Booking ID', type: 'singleLineText' },
      { name: 'Amount', type: 'number', options: { precision: 0 } },
      { name: 'Currency', type: 'singleLineText' },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Pending' },
            { name: 'Paid' },
            { name: 'Refunded' }
          ]
        }
      },
      { name: 'Payment Method', type: 'singleLineText' },
      { name: 'Transaction ID', type: 'singleLineText' },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'TutoHomework': {
    description: 'Homework assignments with adaptive learning levels',
    fields: [
      { name: 'Student ID', type: 'singleLineText' },
      { name: 'Teacher ID', type: 'singleLineText' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Title', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Assigned' },
            { name: 'Submitted' },
            { name: 'Graded' }
          ]
        }
      },
      { name: 'Adaptive Level', type: 'number', options: { precision: 0 } },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } }
    ]
  },
  'TutoPosts': {
    description: 'Social feed posts for community engagement',
    fields: [
      { name: 'Author ID', type: 'singleLineText' },
      { name: 'Author Name', type: 'singleLineText' },
      { 
        name: 'Author Role', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'teacher' },
            { name: 'parent' },
            { name: 'student' }
          ]
        }
      },
      { name: 'Author Avatar', type: 'singleLineText' },
      { name: 'Content Text', type: 'multilineText' },
      { 
        name: 'Content Media Type', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'image' },
            { name: 'video' }
          ]
        }
      },
      { name: 'Content Media URL', type: 'singleLineText' },
      { name: 'Content Media Thumbnail', type: 'singleLineText' },
      { 
        name: 'Post Type', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'text' },
            { name: 'image' },
            { name: 'video' },
            { name: 'poll' },
            { name: 'resource' }
          ]
        }
      },
      { 
        name: 'Subjects', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Literature' },
            { name: 'Biology' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Computer Science' },
            { name: 'Music' },
            { name: 'Art' },
            { name: 'Sports' },
            { name: 'Piano' },
            { name: 'Guitar' },
            { name: 'Swimming' },
            { name: 'Football' },
            { name: 'Basketball' },
            { name: 'Drawing' },
            { name: 'Education' },
            { name: 'Writing' },
            { name: 'Creativity' },
            { name: 'Programming' },
            { name: 'Tutoring' }
          ]
        }
      },
      { name: 'Timestamp', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } },
      { name: 'Likes Count', type: 'number', options: { precision: 0 } },
      { name: 'Comments Count', type: 'number', options: { precision: 0 } },
      { name: 'Shares Count', type: 'number', options: { precision: 0 } },
      { name: 'Saves Count', type: 'number', options: { precision: 0 } },
      { 
        name: 'Privacy', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'public' },
            { name: 'center-only' },
            { name: 'network-only' }
          ]
        }
      },
      { 
        name: 'Status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'Active' },
            { name: 'Hidden' },
            { name: 'Deleted' }
          ]
        }
      }
    ]
  }
};

// Sample data for population
const sampleData = {
  'TutoSubjects': [
    { fields: { 'Name': 'Mathematics', 'Name Vietnamese': 'Toán học', 'Icon': 'math.png', 'Category': 'Academic', 'Description': 'Advanced mathematics and problem solving', 'Description Vietnamese': 'Toán học nâng cao và giải quyết vấn đề', 'Color': '#FF6B6B', 'Status': 'Active' } },
    { fields: { 'Name': 'English', 'Name Vietnamese': 'Tiếng Anh', 'Icon': 'english.png', 'Category': 'Academic', 'Description': 'English language and literature', 'Description Vietnamese': 'Ngôn ngữ và văn học tiếng Anh', 'Color': '#4ECDC4', 'Status': 'Active' } },
    { fields: { 'Name': 'Physics', 'Name Vietnamese': 'Vật lý', 'Icon': 'physics.png', 'Category': 'Academic', 'Description': 'Physical sciences and mechanics', 'Description Vietnamese': 'Khoa học vật lý và cơ học', 'Color': '#45B7D1', 'Status': 'Active' } },
    { fields: { 'Name': 'Chemistry', 'Name Vietnamese': 'Hóa học', 'Icon': 'chemistry.png', 'Category': 'Academic', 'Description': 'Chemical sciences and reactions', 'Description Vietnamese': 'Khoa học hóa học và phản ứng', 'Color': '#96CEB4', 'Status': 'Active' } },
    { fields: { 'Name': 'Literature', 'Name Vietnamese': 'Văn học', 'Icon': 'literature.png', 'Category': 'Academic', 'Description': 'Literary arts and creative writing', 'Description Vietnamese': 'Nghệ thuật văn học và sáng tác', 'Color': '#FFEAA7', 'Status': 'Active' } },
    { fields: { 'Name': 'Biology', 'Name Vietnamese': 'Sinh học', 'Icon': 'biology.png', 'Category': 'Academic', 'Description': 'Life sciences and living organisms', 'Description Vietnamese': 'Khoa học sự sống và sinh vật', 'Color': '#DDA0DD', 'Status': 'Active' } },
    { fields: { 'Name': 'Piano', 'Name Vietnamese': 'Piano', 'Icon': 'piano.png', 'Category': 'Extracurricular', 'Description': 'Piano lessons and music theory', 'Description Vietnamese': 'Bài học piano và lý thuyết âm nhạc', 'Color': '#98D8C8', 'Status': 'Active' } },
    { fields: { 'Name': 'Guitar', 'Name Vietnamese': 'Guitar', 'Icon': 'guitar.png', 'Category': 'Extracurricular', 'Description': 'Guitar lessons and string instruments', 'Description Vietnamese': 'Bài học guitar và nhạc cụ dây', 'Color': '#F7DC6F', 'Status': 'Active' } },
    { fields: { 'Name': 'Swimming', 'Name Vietnamese': 'Bơi lội', 'Icon': 'swimming.png', 'Category': 'Extracurricular', 'Description': 'Swimming lessons and water sports', 'Description Vietnamese': 'Bài học bơi lội và thể thao dưới nước', 'Color': '#74B9FF', 'Status': 'Active' } },
    { fields: { 'Name': 'Football', 'Name Vietnamese': 'Bóng đá', 'Icon': 'football.png', 'Category': 'Extracurricular', 'Description': 'Football training and team sports', 'Description Vietnamese': 'Huấn luyện bóng đá và thể thao đồng đội', 'Color': '#55A3FF', 'Status': 'Active' } },
    { fields: { 'Name': 'Basketball', 'Name Vietnamese': 'Bóng rổ', 'Icon': 'basketball.png', 'Category': 'Extracurricular', 'Description': 'Basketball training and court sports', 'Description Vietnamese': 'Huấn luyện bóng rổ và thể thao sân', 'Color': '#FF7675', 'Status': 'Active' } },
    { fields: { 'Name': 'Drawing', 'Name Vietnamese': 'Vẽ', 'Icon': 'drawing.png', 'Category': 'Extracurricular', 'Description': 'Art and drawing lessons', 'Description Vietnamese': 'Bài học nghệ thuật và vẽ', 'Color': '#FD79A8', 'Status': 'Active' } }
  ],
  'TutoParents': [
    { fields: { 'Name': 'Nguyễn Văn An', 'Email': 'nguyen.an@email.com', 'Phone': '+84 912 345 678', 'Address': '123 Đường ABC, Quận 1, TP.HCM', 'Payment Method': 'Credit Card', 'Status': 'Active' } },
    { fields: { 'Name': 'Trần Thị Bình', 'Email': 'tran.binh@email.com', 'Phone': '+84 923 456 789', 'Address': '456 Đường XYZ, Quận 3, TP.HCM', 'Payment Method': 'Bank Transfer', 'Status': 'Active' } },
    { fields: { 'Name': 'Lê Văn Cường', 'Email': 'le.cuong@email.com', 'Phone': '+84 934 567 890', 'Address': '789 Đường DEF, Quận 7, TP.HCM', 'Payment Method': 'Digital Wallet', 'Status': 'Active' } },
    { fields: { 'Name': 'Phạm Thị Dung', 'Email': 'pham.dung@email.com', 'Phone': '+84 945 678 901', 'Address': '321 Đường GHI, Quận 2, TP.HCM', 'Payment Method': 'Cash', 'Status': 'Active' } },
    { fields: { 'Name': 'Hoàng Văn Em', 'Email': 'hoang.em@email.com', 'Phone': '+84 956 789 012', 'Address': '654 Đường JKL, Quận 5, TP.HCM', 'Payment Method': 'PayPal', 'Status': 'Active' } }
  ],
  'TutoTeachers': [
    { fields: { 'Name': 'Nguyễn Thị Giáo', 'Email': 'nguyen.giao@tuto.com', 'Phone': '+84 967 890 123', 'Avatar': 'teacher1.jpg', 'Subjects': ['Mathematics', 'Physics'], 'Qualifications': 'Master in Mathematics, 5 years teaching experience', 'Experience': 5, 'Hourly Rate': 500000, 'Rating': 4.8, 'Review Count': 25, 'Location Address': '123 Teaching Street, District 1, HCMC', 'Latitude': 10.7769, 'Longitude': 106.7009, 'Availability Days': ['Monday', 'Wednesday', 'Friday'], 'Availability Time Slots': '9:00 AM - 5:00 PM', 'Languages': ['Vietnamese', 'English'], 'Description': 'Experienced math and physics teacher with excellent track record', 'Status': 'Active' } },
    { fields: { 'Name': 'Trần Văn Sư', 'Email': 'tran.su@tuto.com', 'Phone': '+84 978 901 234', 'Avatar': 'teacher2.jpg', 'Subjects': ['English', 'Literature'], 'Qualifications': 'Bachelor in English Literature, 3 years experience', 'Experience': 3, 'Hourly Rate': 400000, 'Rating': 4.5, 'Review Count': 18, 'Location Address': '456 Learning Avenue, District 3, HCMC', 'Latitude': 10.7829, 'Longitude': 106.6879, 'Availability Days': ['Tuesday', 'Thursday', 'Saturday'], 'Availability Time Slots': '2:00 PM - 8:00 PM', 'Languages': ['Vietnamese', 'English'], 'Description': 'Passionate English teacher specializing in literature and writing', 'Status': 'Active' } },
    { fields: { 'Name': 'Lê Thị Học', 'Email': 'le.hoc@tuto.com', 'Phone': '+84 989 012 345', 'Avatar': 'teacher3.jpg', 'Subjects': ['Chemistry', 'Biology'], 'Qualifications': 'PhD in Chemistry, 8 years research and teaching', 'Experience': 8, 'Hourly Rate': 600000, 'Rating': 4.9, 'Review Count': 32, 'Location Address': '789 Science Road, District 7, HCMC', 'Latitude': 10.7308, 'Longitude': 106.7317, 'Availability Days': ['Monday', 'Tuesday', 'Thursday'], 'Availability Time Slots': '10:00 AM - 6:00 PM', 'Languages': ['Vietnamese', 'English'], 'Description': 'Expert in chemistry and biology with research background', 'Status': 'Active' } },
    { fields: { 'Name': 'Phạm Văn Dạy', 'Email': 'pham.day@tuto.com', 'Phone': '+84 990 123 456', 'Avatar': 'teacher4.jpg', 'Subjects': ['Piano', 'Music'], 'Qualifications': 'Conservatory graduate, 6 years music teaching', 'Experience': 6, 'Hourly Rate': 450000, 'Rating': 4.7, 'Review Count': 22, 'Location Address': '321 Music Lane, District 2, HCMC', 'Latitude': 10.7879, 'Longitude': 106.7493, 'Availability Days': ['Wednesday', 'Friday', 'Sunday'], 'Availability Time Slots': '1:00 PM - 9:00 PM', 'Languages': ['Vietnamese', 'English'], 'Description': 'Professional pianist and music educator', 'Status': 'Active' } },
    { fields: { 'Name': 'Hoàng Thị Thể', 'Email': 'hoang.the@tuto.com', 'Phone': '+84 901 234 567', 'Avatar': 'teacher5.jpg', 'Subjects': ['Swimming', 'Sports'], 'Qualifications': 'National swimming coach, 4 years experience', 'Experience': 4, 'Hourly Rate': 350000, 'Rating': 4.6, 'Review Count': 15, 'Location Address': '654 Sports Center, District 5, HCMC', 'Latitude': 10.7540, 'Longitude': 106.6624, 'Availability Days': ['Tuesday', 'Thursday', 'Saturday'], 'Availability Time Slots': '6:00 AM - 2:00 PM', 'Languages': ['Vietnamese', 'English'], 'Description': 'Certified swimming instructor and sports coach', 'Status': 'Active' } }
  ],
  'TutoStudents': [
    { fields: { 'Name': 'Nguyễn Văn Học', 'Age': 15, 'Grade': '10th Grade', 'Parent ID': 'parent1', 'Subjects of Interest': ['Mathematics', 'Physics'], 'Address': '123 Student Street, District 1, HCMC', 'Phone': '+84 912 345 678', 'Email': 'nguyen.hoc@student.com', 'Status': 'Active' } },
    { fields: { 'Name': 'Trần Thị Sinh', 'Age': 14, 'Grade': '9th Grade', 'Parent ID': 'parent2', 'Subjects of Interest': ['English', 'Literature'], 'Address': '456 Learning Avenue, District 3, HCMC', 'Phone': '+84 923 456 789', 'Email': 'tran.sinh@student.com', 'Status': 'Active' } },
    { fields: { 'Name': 'Lê Văn Viên', 'Age': 16, 'Grade': '11th Grade', 'Parent ID': 'parent3', 'Subjects of Interest': ['Chemistry', 'Biology'], 'Address': '789 Study Road, District 7, HCMC', 'Phone': '+84 934 567 890', 'Email': 'le.vien@student.com', 'Status': 'Active' } },
    { fields: { 'Name': 'Phạm Thị Nhạc', 'Age': 12, 'Grade': '7th Grade', 'Parent ID': 'parent4', 'Subjects of Interest': ['Piano', 'Music'], 'Address': '321 Art Lane, District 2, HCMC', 'Phone': '+84 945 678 901', 'Email': 'pham.nhac@student.com', 'Status': 'Active' } },
    { fields: { 'Name': 'Hoàng Văn Thể', 'Age': 13, 'Grade': '8th Grade', 'Parent ID': 'parent5', 'Subjects of Interest': ['Swimming', 'Sports'], 'Address': '654 Sports Street, District 5, HCMC', 'Phone': '+84 956 789 012', 'Email': 'hoang.the@student.com', 'Status': 'Active' } }
  ]
};

async function createFreshTables() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection by fetching base info
    const baseInfo = await callMetadataAPI('/tables');
    console.log('✅ Connection successful!\n');
    
    // Create fresh tables
    console.log('📊 Creating fresh tables with correct schema...');
    const createdTables = {};
    
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      console.log(`📊 Creating table: ${tableName}`);
      console.log(`   Description: ${schema.description}`);
      console.log(`   Fields: ${schema.fields.length}`);
      
      try {
        // Create table using Metadata API
        const tablePayload = {
          name: tableName,
          description: schema.description,
          fields: schema.fields
        };
        
        const result = await callMetadataAPI('/tables', 'POST', tablePayload);
        
        if (result && result.id) {
          createdTables[tableName] = result.id;
          console.log(`   ✅ Successfully created table: ${tableName} (ID: ${result.id})`);
        } else {
          console.log(`   ⚠️  Table creation response:`, result);
        }
        
        console.log('');
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   ❌ Error creating ${tableName}: ${error.message}`);
      }
    }
    
    // Populate tables with sample data
    console.log('📝 Populating tables with sample data...');
    
    for (const [tableName, records] of Object.entries(sampleData)) {
      if (createdTables[tableName]) {
        console.log(`📝 Adding ${records.length} records to ${tableName} (${createdTables[tableName]})...`);
        
        try {
          // Split records into batches of 10
          const batchSize = 10;
          for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await batchCreateRecords(createdTables[tableName], batch);
            
            // Add delay between batches
            if (i + batchSize < records.length) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          console.log(`   🎉 Successfully populated ${tableName} with ${records.length} records`);
          
        } catch (error) {
          console.log(`   ❌ Error populating ${tableName}: ${error.message}`);
        }
        
        console.log('');
      }
    }
    
    console.log('🎯 Fresh Tables Creation Summary:');
    console.log('==================================');
    console.log('');
    
    if (Object.keys(createdTables).length > 0) {
      console.log('✅ Fresh tables created:');
      Object.entries(createdTables).forEach(([name, id]) => {
        console.log(`   - ${name}: ${id}`);
      });
    }
    
    console.log('');
    console.log('🎉 Fresh tables creation completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Test the connection: npm run test:airtable');
    console.log('2. Start the app: npm start');
    console.log('3. Your database now has fresh tables with correct schema!');
    
    return createdTables;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid API key or missing scopes');
      console.log('   - API key doesn\'t have access to the base');
      console.log('   - Base ID is incorrect');
    } else if (error.message.includes('404')) {
      console.log('\n💡 This usually means:');
      console.log('   - Base ID is incorrect');
      console.log('   - Base doesn\'t exist');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check that your API key has access to the base');
    console.log('3. Verify the Base ID is correct');
    console.log('4. Make sure the base exists and is accessible');
    console.log('5. Ensure your PAT has the required scopes:');
    console.log('   - data.bases:read');
    console.log('   - data.records:read');
    console.log('   - data.records:write');
    console.log('   - meta.bases:read');
    console.log('   - meta.tables:write');
    
    process.exit(1);
  }
}

// Run the fresh tables creation
createFreshTables(); 