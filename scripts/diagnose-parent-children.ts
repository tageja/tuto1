#!/usr/bin/env ts-node
/**
 * Diagnose Parent-Children Relationship Issues
 * Usage: npx ts-node scripts/diagnose-parent-children.ts tarun.tageja@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnoseParentChildren(email: string) {
  console.log(`\n🔍 Diagnosing parent-children relationship for: ${email}\n`);
  console.log('='.repeat(80));

  // Step 1: Check if user exists in auth.users
  console.log('\n1️⃣ Checking auth.users table...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!authUser) {
    console.log(`   ❌ No auth user found for email: ${email}`);
    console.log('   💡 This user needs to sign up first');
    return;
  }
  
  console.log(`   ✅ Auth user found:`);
  console.log(`      - Auth ID: ${authUser.id}`);
  console.log(`      - Email: ${authUser.email}`);
  console.log(`      - Created: ${authUser.created_at}`);

  // Step 2: Check if user exists in public.users table
  console.log('\n2️⃣ Checking public.users table...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (userError) {
    console.log(`   ❌ Error querying users table:`, userError);
    return;
  }

  if (!userData) {
    console.log(`   ❌ No user record found in public.users table`);
    console.log(`   💡 Need to create user record with auth_user_id: ${authUser.id}`);
    
    // Check if email exists in users table but with wrong auth_user_id
    const { data: emailUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase());
    
    if (emailUsers && emailUsers.length > 0) {
      console.log(`   ⚠️  Found ${emailUsers.length} user(s) with matching email but wrong/missing auth_user_id:`);
      emailUsers.forEach((u, i) => {
        console.log(`      ${i + 1}. ID: ${u.id}, auth_user_id: ${u.auth_user_id || 'NULL'}, role: ${u.role}`);
      });
    }
    return;
  }

  console.log(`   ✅ User record found:`);
  console.log(`      - User ID: ${userData.id}`);
  console.log(`      - Email: ${userData.email}`);
  console.log(`      - Role: ${userData.role}`);
  console.log(`      - Auth User ID: ${userData.auth_user_id}`);

  // Step 3: Check students with this parent email
  console.log('\n3️⃣ Checking school_students with parent_email...');
  const { data: students, error: studentsError } = await supabase
    .from('school_students')
    .select('id, school_id, first_name, last_name, parent_email, parent_name, class_id, status')
    .ilike('parent_email', email);

  if (studentsError) {
    console.log(`   ❌ Error querying students:`, studentsError);
    return;
  }

  if (!students || students.length === 0) {
    console.log(`   ❌ No students found with parent_email: ${email}`);
    console.log(`   💡 Add students with this parent_email, or update existing students`);
    return;
  }

  console.log(`   ✅ Found ${students.length} student(s) with parent_email:`);
  students.forEach((s, i) => {
    console.log(`      ${i + 1}. ${s.first_name} ${s.last_name}`);
    console.log(`         - Student ID: ${s.id}`);
    console.log(`         - School ID: ${s.school_id}`);
    console.log(`         - Class ID: ${s.class_id || 'N/A'}`);
    console.log(`         - Status: ${s.status}`);
    console.log(`         - Parent Name: ${s.parent_name || 'N/A'}`);
  });

  // Step 4: Check school_parent_students mapping
  console.log('\n4️⃣ Checking school_parent_students mapping table...');
  const { data: mappings, error: mappingsError } = await supabase
    .from('school_parent_students')
    .select('*')
    .eq('parent_user_id', userData.id);

  if (mappingsError) {
    console.log(`   ❌ Error querying mappings:`, mappingsError);
    return;
  }

  if (!mappings || mappings.length === 0) {
    console.log(`   ❌ No mappings found in school_parent_students table`);
    console.log(`   💡 Need to create mappings for this parent`);
    console.log(`\n📝 Required mappings:`);
    students.forEach((s, i) => {
      console.log(`      ${i + 1}. school_id: ${s.school_id}, parent_user_id: ${userData.id}, student_id: ${s.id}`);
    });
    
    // Offer to create mappings
    console.log(`\n💡 To fix this, run the following SQL:`);
    students.forEach((s) => {
      console.log(`INSERT INTO school_parent_students (school_id, parent_user_id, student_id)`);
      console.log(`VALUES ('${s.school_id}', '${userData.id}', '${s.id}')`);
      console.log(`ON CONFLICT DO NOTHING;\n`);
    });
    
    return;
  }

  console.log(`   ✅ Found ${mappings.length} mapping(s):`);
  mappings.forEach((m, i) => {
    console.log(`      ${i + 1}. School: ${m.school_id}, Student: ${m.student_id}`);
    
    // Check if this student is in our list
    const matchingStudent = students.find(s => s.id === m.student_id);
    if (matchingStudent) {
      console.log(`         → Mapped to: ${matchingStudent.first_name} ${matchingStudent.last_name} ✓`);
    } else {
      console.log(`         → ⚠️  Student not found or parent_email doesn't match`);
    }
  });

  // Step 5: Verify the query that the medicine page uses
  console.log('\n5️⃣ Testing the exact query used by medicine page...');
  for (const student of students) {
    const { data: testQuery, error: testError } = await supabase
      .from('school_parent_students')
      .select(`
        student_id,
        school_students!inner(id, first_name, last_name, school_id)
      `)
      .eq('parent_user_id', userData.id)
      .eq('school_id', student.school_id);

    if (testError) {
      console.log(`   ❌ Query failed for school ${student.school_id}:`, testError);
    } else if (!testQuery || testQuery.length === 0) {
      console.log(`   ⚠️  Query returned no results for school ${student.school_id}`);
    } else {
      console.log(`   ✅ Query successful for school ${student.school_id}: Found ${testQuery.length} child(ren)`);
      testQuery.forEach((child: any) => {
        console.log(`      - ${child.school_students.first_name} ${child.school_students.last_name}`);
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Diagnosis complete!\n');
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: npx ts-node scripts/diagnose-parent-children.ts email@example.com');
  process.exit(1);
}

diagnoseParentChildren(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  });


