/**
 * Seed Attendance Data
 * Generates 8 weeks of realistic attendance data with smart weekend detection
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  school_id: string;
  class_id: string;
}

async function seedAttendance() {
  console.log('🌱 Starting attendance seeding...\n');

  try {
    // 1. Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name')
      .ilike('status', 'active');

    if (schoolsError) throw schoolsError;
    if (!schools || schools.length === 0) {
      console.log('⚠️  No active schools found');
      return;
    }

    console.log(`📚 Found ${schools.length} school(s)\n`);

    for (const school of schools) {
      console.log(`\n🏫 Processing: ${school.name}`);
      await seedSchoolAttendance(school.id, school.name);
    }

    // 2. Populate parent-student mappings
    await populateParentStudentMappings();

    console.log('\n✅ Attendance seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    process.exit(1);
  }
}

async function seedSchoolAttendance(schoolId: string, schoolName: string) {
  // Get all students for this school
  const { data: students, error: studentsError } = await supabase
    .from('school_students')
    .select('id, first_name, last_name, school_id, class_id')
    .eq('school_id', schoolId)
    .ilike('status', 'active');

  if (studentsError) throw studentsError;
  if (!students || students.length === 0) {
    console.log(`  ⚠️  No students found`);
    return;
  }

  console.log(`  👥 Found ${students.length} student(s)`);

  // Check if school has weekend classes
  const { data: hasWeekendData } = await supabase.rpc(
    'school_has_weekend_classes',
    { p_school_id: schoolId }
  );
  const hasWeekendClasses = hasWeekendData === true;
  console.log(`  📅 Weekend classes: ${hasWeekendClasses ? 'Yes' : 'No'}`);

  // Generate last 8 weeks of data
  const records: any[] = [];
  const today = new Date();
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(today.getDate() - 56); // 8 weeks = 56 days

  let recordCount = 0;

  for (const student of students) {
    const currentDate = new Date(eightWeeksAgo);

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Skip weekends if school doesn't have weekend classes
      if (!hasWeekendClasses && (dayOfWeek === 0 || dayOfWeek === 6)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Don't create future records
      if (currentDate > today) {
        break;
      }

      // Generate status with realistic distribution
      const rand = Math.random();
      let status: string;
      let lateMinutes = 0;

      if (rand < 0.88) {
        // 88% present
        status = 'present';
      } else if (rand < 0.94) {
        // 6% late
        status = 'late';
        lateMinutes = Math.floor(Math.random() * 16) + 5; // 5-20 minutes
      } else if (rand < 0.97) {
        // 3% absent
        status = 'absent';
      } else {
        // 3% excused
        status = 'excused';
      }

      const dateStr = currentDate.toISOString().split('T')[0];

      records.push({
        school_id: schoolId,
        student_id: student.id,
        class_id: student.class_id,
        date: dateStr,
        status,
        late_minutes: lateMinutes,
        notes: status === 'excused' ? 'Medical appointment' : null,
      });

      recordCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log(`  📝 Generated ${recordCount} attendance records`);

  // Insert in batches of 500 to avoid timeouts
  const batchSize = 500;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('school_attendance')
      .insert(batch)
      .select('id');

    if (insertError) {
      // If it's a unique constraint violation, that's okay (idempotent)
      if (insertError.code !== '23505') {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, insertError);
      }
    } else {
      console.log(`  ✓ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
    }
  }
}

async function populateParentStudentMappings() {
  console.log('\n👨‍👩‍👧‍👦 Populating parent-student mappings...');

  // Get all students with parent emails
  const { data: students, error: studentsError } = await supabase
    .from('school_students')
    .select('id, school_id, parent_email')
    .not('parent_email', 'is', null)
    .ilike('status', 'active');

  if (studentsError) throw studentsError;
  if (!students || students.length === 0) {
    console.log('  ⚠️  No students with parent emails found');
    return;
  }

  console.log(`  👥 Found ${students.length} student(s) with parent emails`);

  const mappings: any[] = [];

  for (const student of students) {
    // Look up or create parent user
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', student.parent_email.toLowerCase())
      .limit(1);

    if (users && users.length > 0) {
      mappings.push({
        school_id: student.school_id,
        parent_user_id: users[0].id,
        student_id: student.id,
      });
    }
  }

  if (mappings.length > 0) {
    // Insert mappings (idempotent with ON CONFLICT DO NOTHING)
    const { error: mappingError } = await supabase
      .from('school_parent_students')
      .insert(mappings)
      .select('parent_user_id');

    if (mappingError && mappingError.code !== '23505') {
      console.error('  ❌ Error creating mappings:', mappingError);
    } else {
      console.log(`  ✓ Created ${mappings.length} parent-student mapping(s)`);
    }
  } else {
    console.log('  ⚠️  No valid parent users found');
  }
}

// Run the seeding
seedAttendance();

