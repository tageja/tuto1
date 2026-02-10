#!/usr/bin/env ts-node
/**
 * Seed one student linked to tarun.tageja@outlook.com and class 6A (Tuto Demo School).
 * Usage: npx ts-node scripts/seed-student-outlook.ts
 * Loads env from .env.local and apps/dashboard/.env.local for SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env: root .env.local then dashboard .env.local (has service role key). Run from repo root.
const root = process.cwd();
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, 'apps', 'dashboard', '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(url, key);

const PARENT_EMAIL = 'tarun.tageja@outlook.com';
const CLASS_NAME = '6A';
const SCHOOL_NAME = 'Tuto Demo School';
const STUDENT_FIRST = 'Outlook';
const STUDENT_LAST = 'Test';

async function main() {
  console.log('Finding school:', SCHOOL_NAME);
  const { data: schools, error: schoolErr } = await supabase
    .from('schools')
    .select('id, name')
    .ilike('name', `%${SCHOOL_NAME}%`)
    .limit(1);

  if (schoolErr || !schools?.length) {
    console.error('School not found:', schoolErr?.message || 'no rows');
    const { data: all } = await supabase.from('schools').select('id, name').limit(5);
    console.log('Available schools:', all);
    process.exit(1);
  }

  const schoolId = schools[0].id;
  console.log('School ID:', schoolId);

  console.log('Finding or creating class:', CLASS_NAME);
  let { data: classes, error: classErr } = await supabase
    .from('school_classes')
    .select('id, name')
    .eq('school_id', schoolId)
    .ilike('name', CLASS_NAME)
    .limit(1);

  if (classErr) {
    console.error('Class query error:', classErr);
    process.exit(1);
  }

  let classId: string;
  if (classes?.length) {
    classId = classes[0].id;
    console.log('Class ID (existing):', classId);
  } else {
    const { data: newClass, error: insertClassErr } = await supabase
      .from('school_classes')
      .insert({
        school_id: schoolId,
        name: CLASS_NAME,
        grade_level: '6',
        status: 'active',
      })
      .select('id')
      .single();
    if (insertClassErr || !newClass) {
      console.error('Failed to create class:', insertClassErr?.message);
      process.exit(1);
    }
    classId = newClass.id;
    console.log('Class created, ID:', classId);
  }

  console.log('Inserting student linked to', PARENT_EMAIL);
  const { data: student, error: studentErr } = await supabase
    .from('school_students')
    .insert({
      school_id: schoolId,
      class_id: classId,
      first_name: STUDENT_FIRST,
      last_name: STUDENT_LAST,
      parent_email: PARENT_EMAIL,
      parent_name: 'Tarun (Outlook)',
      status: 'active',
    })
    .select('id, first_name, last_name, parent_email, class_id')
    .single();

  if (studentErr || !student) {
    console.error('Failed to insert student:', studentErr?.message);
    process.exit(1);
  }

  console.log('Student inserted:', student.id, student.first_name, student.last_name);

  // Optionally link in school_parent_students if user exists
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .ilike('email', PARENT_EMAIL)
    .maybeSingle();

  if (userRow) {
    const { error: mapErr } = await supabase
      .from('school_parent_students')
      .upsert(
        {
          school_id: schoolId,
          parent_user_id: userRow.id,
          student_id: student.id,
        },
        { onConflict: 'school_id,parent_user_id,student_id' }
      );
    if (mapErr) {
      console.warn('Could not add school_parent_students link:', mapErr.message);
    } else {
      console.log('Linked in school_parent_students for parent user', userRow.id);
    }
  } else {
    console.log('No users row for', PARENT_EMAIL, '- student visible via parent_email fallback.');
  }

  console.log('Done. Student:', STUDENT_FIRST, STUDENT_LAST, '| Class:', CLASS_NAME, '| Parent:', PARENT_EMAIL);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
