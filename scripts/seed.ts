#!/usr/bin/env ts-node

/**
 * Seed & Sample Data Scripts for Tuto App
 * 
 * This script creates realistic sample data for QA/dev environments.
 * NEVER run this in production!
 */

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Environment guard - prevent production seeding
if (NODE_ENV === 'production') {
  console.error('❌ SEEDING BLOCKED: Cannot seed production environment');
  console.error('Set NODE_ENV=development to allow seeding');
  process.exit(1);
}

console.log('🌱 Tuto App Seed Data Script');
console.log('============================');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Base ID: ${AIRTABLE_BASE_ID ? 'Set' : 'Missing'}`);
console.log(`PAT: ${AIRTABLE_PAT ? 'Set' : 'Missing'}\n`);

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: Missing Airtable credentials');
  console.error('Please set up your .env file with:');
  console.error('EXPO_PUBLIC_AIRTABLE_API_KEY=your_pat_here');
  console.error('EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here');
  process.exit(1);
}

// Helper function for Airtable API calls
async function callAirtableAPI(tableId: string, method: string = 'GET', body?: any) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
  
  const options: any = {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ API call failed: ${errorMessage}`);
    throw error;
  }
}

// Sample data generators
const sampleTeachers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0101',
    role: 'teacher',
    subjects: ['Mathematics', 'Physics'],
    qualifications: ['MSc Mathematics', 'BEd Secondary Education'],
    experience: 8,
    hourlyRate: 45,
    rating: 4.8,
    reviewCount: 23,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market St, San Francisco, CA'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['09:00-12:00', '14:00-17:00']
    },
    description: 'Experienced math and physics tutor with 8 years of teaching experience. Specializes in algebra, calculus, and physics.',
    languages: ['English', 'Spanish'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isSeedData: true
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1-555-0102',
    role: 'teacher',
    subjects: ['Chemistry', 'Biology'],
    qualifications: ['PhD Chemistry', 'Teaching Certificate'],
    experience: 12,
    hourlyRate: 55,
    rating: 4.9,
    reviewCount: 31,
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '456 Mission St, San Francisco, CA'
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['10:00-13:00', '15:00-18:00']
    },
    description: 'PhD in Chemistry with extensive research background. Passionate about making science accessible to students.',
    languages: ['English', 'Mandarin'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isSeedData: true
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1-555-0103',
    role: 'teacher',
    subjects: ['English Literature', 'Writing'],
    qualifications: ['MA English Literature', 'TESOL Certificate'],
    experience: 6,
    hourlyRate: 40,
    rating: 4.7,
    reviewCount: 18,
    location: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: '789 Castro St, San Francisco, CA'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['09:00-12:00', '13:00-16:00']
    },
    description: 'Literature enthusiast and writing coach. Helps students improve their analytical and creative writing skills.',
    languages: ['English', 'Spanish'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isSeedData: true
  }
];

const sampleParents = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0201',
    role: 'parent',
    children: [
      {
        name: 'Alex Smith',
        age: 15,
        grade: '10th Grade',
        subjects: ['Mathematics', 'Physics']
      }
    ],
    isSeedData: true
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    phone: '+1-555-0202',
    role: 'parent',
    children: [
      {
        name: 'Emma Wang',
        age: 13,
        grade: '8th Grade',
        subjects: ['Chemistry', 'Biology']
      },
      {
        name: 'David Wang',
        age: 16,
        grade: '11th Grade',
        subjects: ['English Literature', 'Writing']
      }
    ],
    isSeedData: true
  }
];

const sampleBookings = [
  {
    teacherId: '', // Will be filled after teacher creation
    parentId: '', // Will be filled after parent creation
    studentName: 'Alex Smith',
    subject: 'Mathematics',
    date: '2024-01-15',
    time: '10:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Need help with algebra homework',
    isSeedData: true
  },
  {
    teacherId: '', // Will be filled after teacher creation
    parentId: '', // Will be filled after parent creation
    studentName: 'Emma Wang',
    subject: 'Chemistry',
    date: '2024-01-16',
    time: '14:00',
    duration: 90,
    status: 'pending',
    notes: 'Preparing for chemistry exam',
    isSeedData: true
  }
];

// Main seeding functions
async function seedTeachers(): Promise<string[]> {
  console.log('👨‍🏫 Seeding teachers...');
  const teacherIds: string[] = [];
  
  for (const teacher of sampleTeachers) {
    try {
      const response = await callAirtableAPI('Teachers', 'POST', {
        fields: teacher
      });
      
      if (response && response.id) {
        teacherIds.push(response.id);
        console.log(`✅ Created teacher: ${teacher.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to create teacher ${teacher.name}:`, errorMessage);
    }
  }
  
  console.log(`📊 Created ${teacherIds.length} teachers\n`);
  return teacherIds;
}

async function seedParents(): Promise<string[]> {
  console.log('👨‍👩‍👧‍👦 Seeding parents...');
  const parentIds: string[] = [];
  
  for (const parent of sampleParents) {
    try {
      const response = await callAirtableAPI('Users', 'POST', {
        fields: parent
      });
      
      if (response && response.id) {
        parentIds.push(response.id);
        console.log(`✅ Created parent: ${parent.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to create parent ${parent.name}:`, errorMessage);
    }
  }
  
  console.log(`📊 Created ${parentIds.length} parents\n`);
  return parentIds;
}

async function seedBookings(teacherIds: string[], parentIds: string[]): Promise<void> {
  console.log('📅 Seeding bookings...');
  
  // Update booking data with actual IDs
  const bookingsWithIds = sampleBookings.map((booking, index) => ({
    ...booking,
    teacherId: teacherIds[index % teacherIds.length],
    parentId: parentIds[index % parentIds.length]
  }));
  
  for (const booking of bookingsWithIds) {
    try {
      const response = await callAirtableAPI('Bookings', 'POST', {
        fields: booking
      });
      
      if (response && response.id) {
        console.log(`✅ Created booking for ${booking.studentName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to create booking for ${booking.studentName}:`, errorMessage);
    }
  }
  
  console.log(`📊 Created ${bookingsWithIds.length} bookings\n`);
}

async function resetSeedData(): Promise<void> {
  console.log('🧹 Resetting seed data...');
  
  const tables = ['Teachers', 'Users', 'Bookings'];
  
  for (const table of tables) {
    try {
      // Get all records with isSeedData = true
      const response = await callAirtableAPI(`${table}?filterByFormula={isSeedData}=TRUE`);
      
      if (response && response.records) {
        const recordIds = response.records.map((record: any) => record.id);
        
        if (recordIds.length > 0) {
          // Delete records in batches of 10 (Airtable limit)
          for (let i = 0; i < recordIds.length; i += 10) {
            const batch = recordIds.slice(i, i + 10);
            await callAirtableAPI(`${table}?records[]=${batch.join('&records[]=')}`, 'DELETE');
          }
          
          console.log(`🗑️  Deleted ${recordIds.length} seed records from ${table}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to reset ${table}:`, errorMessage);
    }
  }
  
  console.log('✅ Seed data reset complete\n');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'reset':
        await resetSeedData();
        break;
      case 'seed':
      default:
        await resetSeedData(); // Clean slate
        const teacherIds = await seedTeachers();
        const parentIds = await seedParents();
        await seedBookings(teacherIds, parentIds);
        console.log('🎉 Seeding complete!');
        break;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Seeding failed:', errorMessage);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedTeachers, seedParents, seedBookings, resetSeedData };
