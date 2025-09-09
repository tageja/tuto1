const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('🚀 Populating Airtable Tables with Sample Data');
console.log('==============================================\n');

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.log('❌ Error: Missing Airtable credentials');
  console.log('Please set up your .env file with:');
  console.log('EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here');
  console.log('EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here');
  process.exit(1);
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Sample data for each table
const sampleData = {
  'Subjects': [
    {
      'Name': 'Mathematics',
      'Name Vietnamese': 'Toán học',
      'Icon': 'calculate',
      'Category': 'Academic',
      'Description': 'Advanced mathematics including algebra, geometry, and calculus',
      'Description Vietnamese': 'Toán học nâng cao bao gồm đại số, hình học và giải tích',
      'Color': '#FF6B6B',
      'Status': 'Active'
    },
    {
      'Name': 'English',
      'Name Vietnamese': 'Tiếng Anh',
      'Icon': 'language',
      'Category': 'Academic',
      'Description': 'English language learning and literature',
      'Description Vietnamese': 'Học tiếng Anh và văn học',
      'Color': '#4ECDC4',
      'Status': 'Active'
    },
    {
      'Name': 'Physics',
      'Name Vietnamese': 'Vật lý',
      'Icon': 'science',
      'Category': 'Academic',
      'Description': 'Physics concepts and practical experiments',
      'Description Vietnamese': 'Khái niệm vật lý và thí nghiệm thực tế',
      'Color': '#45B7D1',
      'Status': 'Active'
    },
    {
      'Name': 'Chemistry',
      'Name Vietnamese': 'Hóa học',
      'Icon': 'science',
      'Category': 'Academic',
      'Description': 'Chemical reactions and laboratory work',
      'Description Vietnamese': 'Phản ứng hóa học và công việc phòng thí nghiệm',
      'Color': '#96CEB4',
      'Status': 'Active'
    },
    {
      'Name': 'Literature',
      'Name Vietnamese': 'Văn học',
      'Icon': 'book',
      'Category': 'Academic',
      'Description': 'Literary analysis and creative writing',
      'Description Vietnamese': 'Phân tích văn học và viết sáng tạo',
      'Color': '#FFEAA7',
      'Status': 'Active'
    },
    {
      'Name': 'Biology',
      'Name Vietnamese': 'Sinh học',
      'Icon': 'biotech',
      'Category': 'Academic',
      'Description': 'Life sciences and biological systems',
      'Description Vietnamese': 'Khoa học sự sống và hệ thống sinh học',
      'Color': '#DDA0DD',
      'Status': 'Active'
    },
    {
      'Name': 'Piano',
      'Name Vietnamese': 'Piano',
      'Icon': 'piano',
      'Category': 'Extracurricular',
      'Description': 'Piano lessons for all skill levels',
      'Description Vietnamese': 'Bài học piano cho mọi trình độ',
      'Color': '#FFB6C1',
      'Status': 'Active'
    },
    {
      'Name': 'Guitar',
      'Name Vietnamese': 'Guitar',
      'Icon': 'music_note',
      'Category': 'Extracurricular',
      'Description': 'Guitar lessons and music theory',
      'Description Vietnamese': 'Bài học guitar và lý thuyết âm nhạc',
      'Color': '#98D8C8',
      'Status': 'Active'
    },
    {
      'Name': 'Swimming',
      'Name Vietnamese': 'Bơi lội',
      'Icon': 'pool',
      'Category': 'Extracurricular',
      'Description': 'Swimming lessons and water safety',
      'Description Vietnamese': 'Bài học bơi và an toàn dưới nước',
      'Color': '#87CEEB',
      'Status': 'Active'
    },
    {
      'Name': 'Football',
      'Name Vietnamese': 'Bóng đá',
      'Icon': 'sports_soccer',
      'Category': 'Extracurricular',
      'Description': 'Football training and team sports',
      'Description Vietnamese': 'Huấn luyện bóng đá và thể thao đồng đội',
      'Color': '#32CD32',
      'Status': 'Active'
    },
    {
      'Name': 'Basketball',
      'Name Vietnamese': 'Bóng rổ',
      'Icon': 'sports_basketball',
      'Category': 'Extracurricular',
      'Description': 'Basketball skills and team play',
      'Description Vietnamese': 'Kỹ năng bóng rổ và chơi đồng đội',
      'Color': '#FF8C00',
      'Status': 'Active'
    },
    {
      'Name': 'Drawing',
      'Name Vietnamese': 'Vẽ',
      'Icon': 'brush',
      'Category': 'Extracurricular',
      'Description': 'Art and drawing techniques',
      'Description Vietnamese': 'Nghệ thuật và kỹ thuật vẽ',
      'Color': '#FF69B4',
      'Status': 'Active'
    }
  ],
  'Parents': [
    {
      'Name': 'Phạm Thị Mai',
      'Email': 'mai.pham@example.com',
      'Phone': '+84 123 456 789',
      'Address': '123 Nguyễn Huệ, Quận 1, TP.HCM',
      'Payment Method': 'Credit Card',
      'Status': 'Active'
    },
    {
      'Name': 'Nguyễn Văn Hùng',
      'Email': 'hung.nguyen@example.com',
      'Phone': '+84 987 654 321',
      'Address': '456 Lê Lợi, Quận 3, TP.HCM',
      'Payment Method': 'Bank Transfer',
      'Status': 'Active'
    },
    {
      'Name': 'Vũ Thị Lan',
      'Email': 'lan.vu@example.com',
      'Phone': '+84 555 123 456',
      'Address': '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      'Payment Method': 'Digital Wallet',
      'Status': 'Active'
    },
    {
      'Name': 'Trần Thị Hoa',
      'Email': 'hoa.tran@example.com',
      'Phone': '+84 777 888 999',
      'Address': '321 Võ Văn Tần, Quận 3, TP.HCM',
      'Payment Method': 'Cash',
      'Status': 'Active'
    },
    {
      'Name': 'Lê Văn Minh',
      'Email': 'minh.le@example.com',
      'Phone': '+84 666 777 888',
      'Address': '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      'Payment Method': 'PayPal',
      'Status': 'Active'
    }
  ],
  'Students': [
    {
      'Name': 'Trần Minh Anh',
      'Age': 15,
      'Grade': '10th Grade',
      'Parent ID': 'rec_parent_1',
      'Subjects of Interest': ['Mathematics', 'English', 'Physics'],
      'Address': '123 Nguyễn Huệ, Quận 1, TP.HCM',
      'Phone': '+84 123 456 789',
      'Email': 'anh.tran@student.com',
      'Status': 'Active'
    },
    {
      'Name': 'Lê Hoàng Nam',
      'Age': 12,
      'Grade': '7th Grade',
      'Parent ID': 'rec_parent_2',
      'Subjects of Interest': ['Mathematics', 'English', 'Sports'],
      'Address': '456 Lê Lợi, Quận 3, TP.HCM',
      'Phone': '+84 987 654 321',
      'Email': 'nam.le@student.com',
      'Status': 'Active'
    },
    {
      'Name': 'Phạm Thị Linh',
      'Age': 14,
      'Grade': '9th Grade',
      'Parent ID': 'rec_parent_3',
      'Subjects of Interest': ['English', 'Literature', 'Art'],
      'Address': '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      'Phone': '+84 555 123 456',
      'Email': 'linh.pham@student.com',
      'Status': 'Active'
    },
    {
      'Name': 'Nguyễn Văn Bình',
      'Age': 16,
      'Grade': '11th Grade',
      'Parent ID': 'rec_parent_4',
      'Subjects of Interest': ['Physics', 'Chemistry', 'Mathematics'],
      'Address': '321 Võ Văn Tần, Quận 3, TP.HCM',
      'Phone': '+84 777 888 999',
      'Email': 'binh.nguyen@student.com',
      'Status': 'Active'
    },
    {
      'Name': 'Trần Thị Cúc',
      'Age': 13,
      'Grade': '8th Grade',
      'Parent ID': 'rec_parent_5',
      'Subjects of Interest': ['Music', 'Piano', 'English'],
      'Address': '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      'Phone': '+84 666 777 888',
      'Email': 'cuc.tran@student.com',
      'Status': 'Active'
    }
  ],
  'Teachers': [
    {
      'Name': 'Nguyễn Thị Anh',
      'Email': 'anh.nguyen@tuto.com',
      'Phone': '+84 111 222 333',
      'Avatar': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'Subjects': ['Mathematics', 'Physics'],
      'Qualifications': 'Master of Mathematics, University of Science',
      'Experience': 5,
      'Hourly Rate': 300000,
      'Rating': 4.8,
      'Review Count': 24,
      'Location Address': '123 Nguyễn Huệ, Quận 1, TP.HCM',
      'Latitude': 10.7769,
      'Longitude': 106.7009,
      'Availability Days': ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      'Availability Time Slots': '9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM',
      'Languages': ['Vietnamese', 'English'],
      'Description': 'Experienced mathematics teacher with 5 years of teaching experience. Specializes in algebra and calculus.',
      'Status': 'Active'
    },
    {
      'Name': 'Trần Văn Minh',
      'Email': 'minh.tran@tuto.com',
      'Phone': '+84 222 333 444',
      'Avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'Subjects': ['English', 'Literature'],
      'Qualifications': 'Bachelor of English Literature, University of Social Sciences',
      'Experience': 3,
      'Hourly Rate': 250000,
      'Rating': 4.6,
      'Review Count': 18,
      'Location Address': '456 Lê Lợi, Quận 3, TP.HCM',
      'Latitude': 10.7826,
      'Longitude': 106.6872,
      'Availability Days': ['Tuesday', 'Thursday', 'Saturday'],
      'Availability Time Slots': '10:00 AM - 1:00 PM, 3:00 PM - 7:00 PM',
      'Languages': ['Vietnamese', 'English'],
      'Description': 'Passionate English teacher with expertise in literature and creative writing.',
      'Status': 'Active'
    },
    {
      'Name': 'Lê Thu Hà',
      'Email': 'ha.le@tuto.com',
      'Phone': '+84 333 444 555',
      'Avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'Subjects': ['Music', 'Piano'],
      'Qualifications': 'Master of Music, Conservatory of Music',
      'Experience': 7,
      'Hourly Rate': 400000,
      'Rating': 4.9,
      'Review Count': 31,
      'Location Address': '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      'Latitude': 10.7540,
      'Longitude': 106.6674,
      'Availability Days': ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      'Availability Time Slots': '2:00 PM - 8:00 PM',
      'Languages': ['Vietnamese', 'English'],
      'Description': 'Professional pianist with 7 years of teaching experience. Specializes in classical and contemporary piano.',
      'Status': 'Active'
    },
    {
      'Name': 'Đỗ Quang Huy',
      'Email': 'huy.do@tuto.com',
      'Phone': '+84 444 555 666',
      'Avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'Subjects': ['Computer Science', 'Programming'],
      'Qualifications': 'Master of Computer Science, University of Technology',
      'Experience': 4,
      'Hourly Rate': 350000,
      'Rating': 4.7,
      'Review Count': 22,
      'Location Address': '321 Võ Văn Tần, Quận 3, TP.HCM',
      'Latitude': 10.7826,
      'Longitude': 106.6872,
      'Availability Days': ['Tuesday', 'Thursday', 'Saturday'],
      'Availability Time Slots': '9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM',
      'Languages': ['Vietnamese', 'English'],
      'Description': 'Software engineer turned educator. Teaches programming fundamentals and advanced concepts.',
      'Status': 'Active'
    },
    {
      'Name': 'Vũ Thị Lan',
      'Email': 'lan.vu@tuto.com',
      'Phone': '+84 555 666 777',
      'Avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'Subjects': ['Chemistry', 'Biology'],
      'Qualifications': 'PhD in Chemistry, University of Science',
      'Experience': 6,
      'Hourly Rate': 320000,
      'Rating': 4.8,
      'Review Count': 28,
      'Location Address': '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      'Latitude': 10.8019,
      'Longitude': 106.7148,
      'Availability Days': ['Monday', 'Wednesday', 'Friday'],
      'Availability Time Slots': '10:00 AM - 1:00 PM, 3:00 PM - 7:00 PM',
      'Languages': ['Vietnamese', 'English'],
      'Description': 'Research scientist with extensive experience in chemistry and biology education.',
      'Status': 'Active'
    }
  ]
};

async function populateTables() {
  try {
    console.log('🔍 Testing Airtable connection...');
    
    // Test connection first
    await base('Table 1').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!\n');
    
    console.log('📊 Populating tables with sample data...\n');
    
    for (const [tableName, records] of Object.entries(sampleData)) {
      console.log(`📝 Adding ${records.length} records to ${tableName}...`);
      
      try {
        // Create records in batches of 10 (Airtable limit)
        const batchSize = 10;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const createdRecords = await base(tableName).create(batch.map(record => ({ fields: record })));
          
          console.log(`   ✅ Created ${createdRecords.length} records in batch ${Math.floor(i / batchSize) + 1}`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`   🎉 Successfully populated ${tableName} with ${records.length} records\n`);
        
      } catch (error) {
        console.log(`   ❌ Error populating ${tableName}: ${error.message}`);
        
        if (error.message.includes('Table not found')) {
          console.log(`   💡 Table "${tableName}" doesn't exist yet. Please create it first using the create-tables.js script.`);
        }
      }
    }
    
    console.log('🎯 Next Steps:');
    console.log('==============');
    console.log('');
    console.log('1. Test the connection: npm run test:airtable');
    console.log('2. Start the app: npm start');
    console.log('3. Your app will now have real sample data!');
    console.log('');
    console.log('💡 You can now:');
    console.log('   - Browse teachers in the app');
    console.log('   - Create bookings with real data');
    console.log('   - Test the social feed features');
    console.log('   - Explore all subjects and categories');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid API key');
      console.log('   - API key doesn\'t have access to this base');
      console.log('   - Base ID is incorrect');
    } else if (error.message.includes('Not Found')) {
      console.log('\n💡 This usually means:');
      console.log('   - Base ID is incorrect');
      console.log('   - Base doesn\'t exist');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check that your API key has access to the base');
    console.log('3. Verify the Base ID is correct');
    console.log('4. Make sure the base exists and is accessible');
    console.log('5. Ensure all tables are created before running this script');
    
    process.exit(1);
  }
}

// Run the population
populateTables(); 