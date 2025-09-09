const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.EXPO_PUBLIC_AIRTABLE_API_KEY }).base(process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID);

console.log('🏫 Populating school management tables with sample data...');

// Sample data for schools
const sampleSchools = [
  {
    'Name': 'Mầm non Xanh CN Vinhomes Grand Park',
    'Code': 'MNX001',
    'Address': 'NX-LP 124, Khu đô thị Vinhomes Grand Park, đường nguyễn xiển - long phước, p.phước long B, TP Thủ đức, TP.HCM',
    'Phone': '0918121525',
    'Email': 'ditour2010@gmail.com',
    'Principal': 'Thọ Nguyễn',
    'Subscription Plan': 'Premium',
    'Status': 'Active',
    'Max Students': 200,
    'Current Students': 45
  },
  {
    'Name': 'Trường Mầm non Hoa Hồng',
    'Code': 'MNH002',
    'Address': '123 Đường ABC, Quận 1, TP.HCM',
    'Phone': '0901234567',
    'Email': 'hoahong@school.edu.vn',
    'Principal': 'Mai Trần',
    'Subscription Plan': 'Standard',
    'Status': 'Active',
    'Max Students': 150,
    'Current Students': 32
  }
];

// Sample data for classes
const sampleClasses = [
  {
    'Name': 'Orange',
    'School ID': 'MNX001',
    'Grade Level': 'Kindergarten',
    'Capacity': 25,
    'Current Students': 18,
    'Schedule': 'Monday-Friday: 7:30 AM - 4:30 PM',
    'Description': 'Kindergarten class for children aged 5-6 years',
    'Status': 'Active'
  },
  {
    'Name': 'Red',
    'School ID': 'MNX001',
    'Grade Level': 'Pre-K',
    'Capacity': 20,
    'Current Students': 15,
    'Schedule': 'Monday-Friday: 8:00 AM - 4:00 PM',
    'Description': 'Pre-K class for children aged 4-5 years',
    'Status': 'Active'
  },
  {
    'Name': 'Blue',
    'School ID': 'MNH002',
    'Grade Level': 'Kindergarten',
    'Capacity': 22,
    'Current Students': 20,
    'Schedule': 'Monday-Friday: 7:00 AM - 5:00 PM',
    'Description': 'Kindergarten class for children aged 5-6 years',
    'Status': 'Active'
  }
];

// Sample data for students
const sampleStudents = [
  {
    'Full Name': 'Hán Lê Bảo Vương',
    'Nickname': 'Mung',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Parent ID': 'parent001',
    'Date of Birth': '2021-09-18',
    'Gender': 'Male',
    'Student ID': 'ST001',
    'Address': 'Vinhomes Grand Park',
    'Province': 'Tỉnh Đồng Nai',
    'District': 'Xã Bình An',
    'Emergency Contact': '0901234567',
    'Allergies': 'None',
    'Medical Notes': 'Healthy child',
    'Status': 'Active',
    'Enrollment Date': '2024-09-01'
  },
  {
    'Full Name': 'Nguyễn Thị Minh Anh',
    'Nickname': 'Anh',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Parent ID': 'parent002',
    'Date of Birth': '2021-03-15',
    'Gender': 'Female',
    'Student ID': 'ST002',
    'Address': 'Vinhomes Grand Park',
    'Province': 'Tỉnh Đồng Nai',
    'District': 'Xã Bình An',
    'Emergency Contact': '0909876543',
    'Allergies': 'Peanuts',
    'Medical Notes': 'Allergic to peanuts',
    'Status': 'Active',
    'Enrollment Date': '2024-09-01'
  },
  {
    'Full Name': 'Trần Văn Hoàng',
    'Nickname': 'Hoàng',
    'School ID': 'MNH002',
    'Class ID': 'Blue',
    'Parent ID': 'parent003',
    'Date of Birth': '2021-07-22',
    'Gender': 'Male',
    'Student ID': 'ST003',
    'Address': 'Quận 1, TP.HCM',
    'Province': 'TP.HCM',
    'District': 'Quận 1',
    'Emergency Contact': '0905555555',
    'Allergies': 'None',
    'Medical Notes': 'Healthy child',
    'Status': 'Active',
    'Enrollment Date': '2024-08-15'
  }
];

// Sample data for teachers
const sampleTeachers = [
  {
    'Full Name': 'Trần Thị Giang',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Email': 'giang.tran@school.edu.vn',
    'Phone': '0901111111',
    'Qualifications': 'Bachelor in Early Childhood Education',
    'Experience': 5,
    'Specializations': ['Early Childhood'],
    'Status': 'Active',
    'Hire Date': '2020-08-01'
  },
  {
    'Full Name': 'Lê Văn Minh',
    'School ID': 'MNX001',
    'Class ID': 'Red',
    'Email': 'minh.le@school.edu.vn',
    'Phone': '0902222222',
    'Qualifications': 'Master in Education',
    'Experience': 8,
    'Specializations': ['Early Childhood', 'Special Education'],
    'Status': 'Active',
    'Hire Date': '2019-06-01'
  },
  {
    'Full Name': 'Phạm Thị Lan',
    'School ID': 'MNH002',
    'Class ID': 'Blue',
    'Email': 'lan.pham@school.edu.vn',
    'Phone': '0903333333',
    'Qualifications': 'Bachelor in Education',
    'Experience': 3,
    'Specializations': ['Early Childhood'],
    'Status': 'Active',
    'Hire Date': '2021-09-01'
  }
];

// Sample data for daily activities
const sampleDailyActivities = [
  {
    'Student ID': 'ST001',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Date': '2025-01-13',
    'Learning Activities': 'Learning alphabet letters A, B, C. Drawing activities with crayons. Story time with teacher.',
    'Meals': 'Breakfast: Bread and milk\nLunch: Rice, chicken, vegetables\nSnack: Fruits',
    'Sleep': '2 hours - Good sleep',
    'Teacher Comments': 'Hán was very active today and participated well in all activities. He showed good progress in learning letters.',
    'Attendance': 'Present',
    'Mood': 'Happy',
    'Created By': 'Trần Thị Giang'
  },
  {
    'Student ID': 'ST002',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Date': '2025-01-13',
    'Learning Activities': 'Learning numbers 1-5. Singing songs. Outdoor play activities.',
    'Meals': 'Breakfast: Porridge\nLunch: Rice, fish, vegetables\nSnack: Yogurt',
    'Sleep': '1.5 hours - Restless',
    'Teacher Comments': 'Minh Anh was a bit tired today but still participated in activities. She enjoyed the singing session.',
    'Attendance': 'Present',
    'Mood': 'Tired',
    'Created By': 'Trần Thị Giang'
  }
];

// Sample data for messages
const sampleMessages = [
  {
    'From User ID': 'parent001',
    'To User ID': 'teacher001',
    'Student ID': 'ST001',
    'School ID': 'MNX001',
    'Content': 'Chào cô, hôm nay con Hán có mang thêm áo trong cặp, nếu trưa ngủ con lạnh nhờ cô mặc vào giúp con ạ.',
    'Type': 'Morning',
    'Status': 'Sent',
    'Date': '2025-01-13T07:00:00.000Z'
  },
  {
    'From User ID': 'teacher001',
    'To User ID': 'parent001',
    'Student ID': 'ST001',
    'School ID': 'MNX001',
    'Content': 'Dạ, cô đã nhận được thông tin. Cô sẽ chú ý mặc áo cho con khi ngủ trưa.',
    'Type': 'General',
    'Status': 'Read',
    'Date': '2025-01-13T07:15:00.000Z',
    'Read At': '2025-01-13T08:30:00.000Z'
  }
];

// Sample data for absence requests
const sampleAbsenceRequests = [
  {
    'Student ID': 'ST001',
    'Parent ID': 'parent001',
    'School ID': 'MNX001',
    'Start Date': '2025-01-15',
    'End Date': '2025-01-16',
    'Reason': 'Gia đình có việc riêng, xin phép cho con nghỉ 2 ngày.',
    'Status': 'Pending',
    'Created At': '2025-01-12T10:00:00.000Z'
  }
];

// Sample data for school announcements
const sampleAnnouncements = [
  {
    'Title': 'Thông báo về lịch nghỉ Tết Nguyên Đán 2025',
    'Content': 'Kính gửi quý phụ huynh,\n\nTrường thông báo lịch nghỉ Tết Nguyên Đán 2025:\n- Nghỉ từ ngày 28/01/2025 đến 05/02/2025\n- Học lại từ ngày 06/02/2025\n\nChúc quý phụ huynh và các bé một năm mới an khang thịnh vượng!',
    'School ID': 'MNX001',
    'Author': 'Ban Giám Hiệu',
    'Type': 'Important',
    'Status': 'Published',
    'Published At': '2025-01-10T09:00:00.000Z'
  },
  {
    'Title': 'Hoạt động ngoại khóa tháng 1',
    'Content': 'Các hoạt động ngoại khóa tháng 1:\n- Ngày 20/01: Dã ngoại công viên\n- Ngày 25/01: Lớp học vẽ\n- Ngày 30/01: Biểu diễn văn nghệ\n\nPhụ huynh vui lòng đăng ký tham gia.',
    'School ID': 'MNX001',
    'Author': 'Cô Giang',
    'Type': 'Event',
    'Status': 'Published',
    'Published At': '2025-01-08T14:00:00.000Z'
  }
];

// Sample data for health records
const sampleHealthRecords = [
  {
    'Student ID': 'ST001',
    'School ID': 'MNX001',
    'Date': '2025-01-10',
    'Height': 105,
    'Weight': 18.5,
    'BMI': 16.8,
    'Health Notes': 'Phát triển bình thường, khỏe mạnh',
    'Allergies': 'Không có',
    'Medications': 'Không có',
    'Blood Type': 'O+',
    'Medical Conditions': 'Không có',
    'Recorded By': 'Y tá trường'
  }
];

// Sample data for medicine reminders
const sampleMedicineReminders = [
  {
    'Student ID': 'ST002',
    'School ID': 'MNX001',
    'Medicine Name': 'Vitamin D',
    'Dosage': '1 viên',
    'Time': '10:00 AM',
    'Instructions': 'Uống sau khi ăn sáng',
    'Start Date': '2025-01-01',
    'End Date': '2025-01-31',
    'Status': 'Active',
    'Administered': false,
    'Notes': 'Vitamin bổ sung cho trẻ'
  }
];

// Sample data for photo albums
const samplePhotoAlbums = [
  {
    'Title': 'Hoạt động học tập tháng 12',
    'Description': 'Những khoảnh khắc đáng yêu của các bé trong các hoạt động học tập',
    'School ID': 'MNX001',
    'Class ID': 'Orange',
    'Date': '2024-12-20',
    'Created By': 'Trần Thị Giang',
    'Likes': 15,
    'Status': 'Published'
  }
];

// Sample data for extracurricular activities
const sampleExtracurricularActivities = [
  {
    'Name': 'Lớp học vẽ',
    'School ID': 'MNX001',
    'Description': 'Lớp học vẽ dành cho trẻ mầm non, phát triển khả năng sáng tạo',
    'Category': 'Arts',
    'Schedule': 'Thứ 3 và Thứ 5: 15:00 - 16:00',
    'Capacity': 15,
    'Current Participants': 12,
    'Fee': 500000,
    'Registration Status': 'Open',
    'Start Date': '2025-01-15',
    'End Date': '2025-06-15'
  },
  {
    'Name': 'Lớp học nhạc',
    'School ID': 'MNX001',
    'Description': 'Lớp học đàn và hát cho trẻ mầm non',
    'Category': 'Music',
    'Schedule': 'Thứ 4 và Thứ 6: 15:00 - 16:00',
    'Capacity': 12,
    'Current Participants': 8,
    'Fee': 600000,
    'Registration Status': 'Open',
    'Start Date': '2025-01-16',
    'End Date': '2025-06-16'
  }
];

// Sample data for surveys
const sampleSurveys = [
  {
    'Title': 'Khảo sát mức độ hài lòng của phụ huynh',
    'Description': 'Khảo sát để cải thiện chất lượng giáo dục',
    'School ID': 'MNX001',
    'Target Audience': 'Parents',
    'Questions': JSON.stringify([
      {
        'question': 'Bạn đánh giá chất lượng giảng dạy của giáo viên?',
        'type': 'rating',
        'required': true
      },
      {
        'question': 'Bạn có hài lòng với cơ sở vật chất của trường?',
        'type': 'yesNo',
        'required': true
      },
      {
        'question': 'Bạn có góp ý gì để cải thiện trường?',
        'type': 'text',
        'required': false
      }
    ]),
    'Start Date': '2025-01-01',
    'End Date': '2025-01-31',
    'Status': 'Active',
    'Created By': 'Ban Giám Hiệu'
  }
];

// Sample data for payments
const samplePayments = [
  {
    'Student ID': 'ST001',
    'School ID': 'MNX001',
    'Payment Type': 'Tuition',
    'Amount': 2000000,
    'Currency': 'VND',
    'Due Date': '2025-01-15',
    'Status': 'Pending',
    'Payment Method': 'Bank Transfer',
    'Notes': 'Học phí tháng 1/2025'
  },
  {
    'Student ID': 'ST002',
    'School ID': 'MNX001',
    'Payment Type': 'Tuition',
    'Amount': 2000000,
    'Currency': 'VND',
    'Due Date': '2025-01-15',
    'Paid Date': '2025-01-10',
    'Status': 'Paid',
    'Payment Method': 'Online Payment',
    'Receipt Number': 'RCP001',
    'Notes': 'Học phí tháng 1/2025'
  }
];

// Sample data for school subscriptions
const sampleSubscriptions = [
  {
    'School ID': 'MNX001',
    'Plan Type': 'Premium',
    'Monthly Fee': 5000000,
    'Start Date': '2024-09-01',
    'End Date': '2025-08-31',
    'Status': 'Active',
    'Max Students': 200,
    'Features': JSON.stringify(['Daily Activities', 'Health Monitoring', 'Photo Albums', 'Payment System', 'Advanced Analytics']),
    'Payment Status': 'Paid',
    'Last Payment Date': '2025-01-01',
    'Next Payment Date': '2025-02-01'
  },
  {
    'School ID': 'MNH002',
    'Plan Type': 'Standard',
    'Monthly Fee': 3000000,
    'Start Date': '2024-08-01',
    'End Date': '2025-07-31',
    'Status': 'Active',
    'Max Students': 150,
    'Features': JSON.stringify(['Daily Activities', 'Health Monitoring', 'Photo Albums']),
    'Payment Status': 'Paid',
    'Last Payment Date': '2025-01-01',
    'Next Payment Date': '2025-02-01'
  }
];

async function populateTable(tableName, records) {
  try {
    console.log(`Populating ${tableName} with ${records.length} records...`);
    
    const table = base(tableName);
    const createdRecords = await table.create(records);
    
    console.log(`✅ Successfully created ${createdRecords.length} records in ${tableName}`);
    return createdRecords;
  } catch (error) {
    console.error(`❌ Error populating ${tableName}:`, error.message);
    throw error;
  }
}

async function populateAllTables() {
  console.log('🚀 Starting data population process...\n');
  
  try {
    // Populate schools first
    await populateTable('TutoSchools', sampleSchools);
    console.log('');
    
    // Populate classes
    await populateTable('TutoSchoolClasses', sampleClasses);
    console.log('');
    
    // Populate teachers
    await populateTable('TutoSchoolTeachers', sampleTeachers);
    console.log('');
    
    // Populate students
    await populateTable('TutoSchoolStudents', sampleStudents);
    console.log('');
    
    // Populate daily activities
    await populateTable('TutoDailyActivities', sampleDailyActivities);
    console.log('');
    
    // Populate messages
    await populateTable('TutoMessages', sampleMessages);
    console.log('');
    
    // Populate absence requests
    await populateTable('TutoAbsenceRequests', sampleAbsenceRequests);
    console.log('');
    
    // Populate announcements
    await populateTable('TutoSchoolAnnouncements', sampleAnnouncements);
    console.log('');
    
    // Populate health records
    await populateTable('TutoHealthRecords', sampleHealthRecords);
    console.log('');
    
    // Populate medicine reminders
    await populateTable('TutoMedicineReminders', sampleMedicineReminders);
    console.log('');
    
    // Populate photo albums
    await populateTable('TutoPhotoAlbums', samplePhotoAlbums);
    console.log('');
    
    // Populate extracurricular activities
    await populateTable('TutoExtracurricularActivities', sampleExtracurricularActivities);
    console.log('');
    
    // Populate surveys
    await populateTable('TutoSurveys', sampleSurveys);
    console.log('');
    
    // Populate payments
    await populateTable('TutoSchoolPayments', samplePayments);
    console.log('');
    
    // Populate subscriptions
    await populateTable('TutoSchoolSubscriptions', sampleSubscriptions);
    console.log('');
    
    console.log('🎉 Data population completed successfully!');
    console.log('📊 Sample data has been added to all school management tables');
    
  } catch (error) {
    console.error('❌ Error during data population:', error);
  }
}

// Run the script
populateAllTables().catch(console.error);


