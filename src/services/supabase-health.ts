/**
 * Supabase Health Records Service
 * Handles all health record-related data operations for mobile app
 */

import { supabase } from '../config/supabase';
import { resolveSchoolId } from './school-id';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface HealthKPIs {
  totalStudents: number;
  allergies: number;
  medications: number;
  updatedThisMonth: number;
}

export interface StudentHealthSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string | null;
  className: string;
  hasAllergy: boolean;
  hasMedication: boolean;
}

export interface HealthFilters {
  classId?: string;
  studentId?: string;
  search?: string;
}

export interface AllergyRecord {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  recordedAt: string;
}

export interface MedicationRecord {
  id: string;
  name: string;
  dose?: string;
  schedule?: string;
  recordedAt: string;
}

export interface VaccinationRecord {
  id: string;
  vaccine: string;
  status: 'done' | 'pending' | 'due' | 'scheduled';
  date: string;
  recordedAt: string;
}

export interface VitalsRecord {
  id: string;
  heightCm?: number | null;
  weightKg?: number | null;
  recordedAt: string;
}

export interface StudentHealthDetail {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string | null;
    classId: string | null;
    className: string;
    schoolId: string;
  };
  allergies: AllergyRecord[];
  medications: MedicationRecord[];
  emergencyContacts: {
    primaryName: string | null;
    primaryPhone: string | null;
    altName: string | null;
    altPhone: string | null;
  };
  vaccinations: VaccinationRecord[];
  vitals: VitalsRecord[];
  notes: Array<{
    id: string;
    title: string | null;
    details: any;
    recordedAt: string;
  }>;
}

export interface CreateHealthRecordData {
  studentId: string;
  recordType: 'general' | 'vaccination' | 'vitals' | 'note';
  title?: string | null;
  details: Record<string, any>;
  recordedAt?: string;
}

export interface ParentChild {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string | null;
  className: string;
}

// ============================================================================
// Health KPIs
// ============================================================================

export async function fetchHealthKPIs(schoolIdentifier: string): Promise<HealthKPIs> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Get current month start and end
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Total Students
  const { count: totalStudents } = await supabase
    .from('school_students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active']);

  // Allergies: Count distinct students with allergy records
  const { data: allergyRecords } = await supabase
    .from('health_records')
    .select('student_id')
    .eq('school_id', schoolId)
    .eq('record_type', 'general')
    .eq('details->>type', 'allergy');

  const allergies = new Set(allergyRecords?.map(r => r.student_id) || []).size;

  // Medications: Count distinct students with medication records
  const { data: medicationRecords } = await supabase
    .from('health_records')
    .select('student_id')
    .eq('school_id', schoolId)
    .eq('record_type', 'general')
    .eq('details->>type', 'medication');

  const medications = new Set(medicationRecords?.map(r => r.student_id) || []).size;

  // Updated This Month: Count records where recorded_at is in current month
  const { count: updatedThisMonth } = await supabase
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .gte('recorded_at', monthStart.toISOString())
    .lte('recorded_at', monthEnd.toISOString());

  return {
    totalStudents: totalStudents || 0,
    allergies,
    medications,
    updatedThisMonth: updatedThisMonth || 0,
  };
}

// ============================================================================
// Health Students List
// ============================================================================

export async function fetchHealthStudents(
  schoolIdentifier: string,
  filters?: HealthFilters
): Promise<StudentHealthSummary[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Build student query
  let studentQuery = supabase
    .from('school_students')
    .select('id, first_name, last_name, class_id, school_id, status')
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active']);

  if (filters?.classId) {
    studentQuery = studentQuery.eq('class_id', filters.classId);
  }

  if (filters?.studentId) {
    studentQuery = studentQuery.eq('id', filters.studentId);
  }

  if (filters?.search) {
    studentQuery = studentQuery.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    );
  }

  const { data: students, error: studentsError } = await studentQuery;

  if (studentsError) {
    throw studentsError;
  }

  if (!students || students.length === 0) {
    return [];
  }

  const studentIds = students.map(s => s.id);

  // Get allergy flags
  const { data: allergyRecords } = await supabase
    .from('health_records')
    .select('student_id')
    .in('student_id', studentIds)
    .eq('record_type', 'general')
    .eq('details->>type', 'allergy');

  const studentsWithAllergies = new Set(
    allergyRecords?.map(r => r.student_id) || []
  );

  // Get medication flags
  const { data: medicationRecords } = await supabase
    .from('health_records')
    .select('student_id')
    .in('student_id', studentIds)
    .eq('record_type', 'general')
    .eq('details->>type', 'medication');

  const studentsWithMedications = new Set(
    medicationRecords?.map(r => r.student_id) || []
  );

  // Get class names
  const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))];
  const { data: classes } = await supabase
    .from('school_classes')
    .select('id, name')
    .in('id', classIds);

  const classMap = new Map(classes?.map(c => [c.id, c.name]) || []);

  // Combine data
  return students.map(student => ({
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    fullName: `${student.first_name} ${student.last_name}`,
    classId: student.class_id,
    className: student.class_id ? classMap.get(student.class_id) || 'N/A' : 'N/A',
    hasAllergy: studentsWithAllergies.has(student.id),
    hasMedication: studentsWithMedications.has(student.id),
  }));
}

// ============================================================================
// Student Health Detail
// ============================================================================

export async function fetchStudentHealthDetail(studentId: string): Promise<StudentHealthDetail> {
  // Get student basic info
  const { data: student, error: studentError } = await supabase
    .from('school_students')
    .select('id, first_name, last_name, date_of_birth, class_id, school_id')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    throw new Error('Student not found');
  }

  // Get all health records
  const { data: allRecords } = await supabase
    .from('health_records')
    .select('*')
    .eq('student_id', studentId)
    .order('recorded_at', { ascending: false });

  // Separate by type
  const generalRecords = allRecords?.filter(r => r.record_type === 'general') || [];
  const vaccinationRecords = allRecords?.filter(r => r.record_type === 'vaccination') || [];
  const vitalsRecords = allRecords?.filter(r => r.record_type === 'vitals') || [];
  const noteRecords = allRecords?.filter(r => r.record_type === 'note') || [];

  // Extract allergies and medications from general records
  const allergies: AllergyRecord[] = generalRecords
    .filter(r => r.details?.type === 'allergy')
    .map(r => ({
      id: r.id,
      name: r.details?.name || '',
      severity: (r.details?.severity || 'low') as 'low' | 'medium' | 'high',
      notes: r.details?.notes || '',
      recordedAt: r.recorded_at,
    }));

  const medications: MedicationRecord[] = generalRecords
    .filter(r => r.details?.type === 'medication')
    .map(r => ({
      id: r.id,
      name: r.details?.name || '',
      dose: r.details?.dose || '',
      schedule: r.details?.schedule || '',
      recordedAt: r.recorded_at,
    }));

  // Get emergency contacts
  const { data: contacts } = await supabase
    .from('health_emergency_contacts')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  // Format vaccinations
  const vaccinations: VaccinationRecord[] = vaccinationRecords.map(r => ({
    id: r.id,
    vaccine: r.details?.vaccine || r.title || '',
    status: (r.details?.status || 'done') as 'done' | 'pending' | 'due' | 'scheduled',
    date: r.details?.date || r.recorded_at,
    recordedAt: r.recorded_at,
  }));

  // Format vitals (last 12)
  const vitals: VitalsRecord[] = vitalsRecords
    .slice(0, 12)
    .map(r => ({
      id: r.id,
      heightCm: r.details?.height_cm || null,
      weightKg: r.details?.weight_kg || null,
      recordedAt: r.recorded_at,
    }));

  // Get class name
  const { data: classData } = await supabase
    .from('school_classes')
    .select('name')
    .eq('id', student.class_id)
    .maybeSingle();

  return {
    student: {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: `${student.first_name} ${student.last_name}`,
      dateOfBirth: student.date_of_birth,
      classId: student.class_id,
      className: classData?.name || 'N/A',
      schoolId: student.school_id,
    },
    allergies,
    medications,
    emergencyContacts: contacts || {
      primaryName: null,
      primaryPhone: null,
      altName: null,
      altPhone: null,
    },
    vaccinations,
    vitals,
    notes: noteRecords.map(r => ({
      id: r.id,
      title: r.title || null,
      details: r.details,
      recordedAt: r.recorded_at,
    })),
  };
}

// ============================================================================
// Create Health Record
// ============================================================================

export async function createHealthRecord(data: CreateHealthRecordData): Promise<any> {
  // Get student to find school_id
  const { data: student, error: studentError } = await supabase
    .from('school_students')
    .select('school_id')
    .eq('id', data.studentId)
    .single();

  if (studentError || !student) {
    throw new Error('Student not found');
  }

  // Get authenticated user ID - use auth.uid() directly since created_by references auth.users(id)
  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id || null; // This is the auth.users.id, which is what the FK expects

  // Insert health record
  const { data: record, error: insertError } = await supabase
    .from('health_records')
    .insert({
      school_id: student.school_id,
      student_id: data.studentId,
      record_type: data.recordType,
      title: data.title || null,
      details: data.details,
      recorded_at: data.recordedAt || new Date().toISOString(),
      created_by: createdBy, // This can be null, FK allows ON DELETE SET NULL
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return record;
}

// ============================================================================
// Parent Children
// ============================================================================

export async function fetchParentChildren(schoolIdentifier: string): Promise<ParentChild[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user id from users table
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData) {
    throw new Error('User not found');
  }

  // Get parent-student relationships
  const { data: relationships } = await supabase
    .from('school_parent_students')
    .select('student_id')
    .eq('parent_user_id', userData.id);

  if (!relationships || relationships.length === 0) {
    return [];
  }

  const studentIds = relationships.map(r => r.student_id);

  // Get students
  const { data: students } = await supabase
    .from('school_students')
    .select('id, first_name, last_name, class_id')
    .in('id', studentIds)
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active']);

  if (!students || students.length === 0) {
    return [];
  }

  // Get class names
  const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))];
  const { data: classes } = await supabase
    .from('school_classes')
    .select('id, name')
    .in('id', classIds);

  const classMap = new Map(classes?.map(c => [c.id, c.name]) || []);

  return students.map(student => ({
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    fullName: `${student.first_name} ${student.last_name}`,
    classId: student.class_id,
    className: student.class_id ? classMap.get(student.class_id) || 'N/A' : 'N/A',
  }));
}

// ============================================================================
// Student Vitals for Growth Charts
// ============================================================================

export async function fetchStudentVitals(
  studentId: string,
  months: 3 | 6 | 12
): Promise<VitalsRecord[]> {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const { data: vitalsRecords } = await supabase
    .from('health_records')
    .select('*')
    .eq('student_id', studentId)
    .eq('record_type', 'vitals')
    .gte('recorded_at', cutoffDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (!vitalsRecords) {
    return [];
  }

  return vitalsRecords.map(r => ({
    id: r.id,
    heightCm: r.details?.height_cm || null,
    weightKg: r.details?.weight_kg || null,
    recordedAt: r.recorded_at,
  }));
}

// ============================================================================
// Update Emergency Contacts
// ============================================================================

export async function updateEmergencyContacts(
  studentId: string,
  contacts: {
    primaryName?: string;
    primaryPhone?: string;
    altName?: string;
    altPhone?: string;
  }
): Promise<any> {
  // Check if contact record exists
  const { data: existing } = await supabase
    .from('health_emergency_contacts')
    .select('id')
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('health_emergency_contacts')
      .update({
        primary_name: contacts.primaryName || null,
        primary_phone: contacts.primaryPhone || null,
        alt_name: contacts.altName || null,
        alt_phone: contacts.altPhone || null,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert
    const { data, error } = await supabase
      .from('health_emergency_contacts')
      .insert({
        student_id: studentId,
        primary_name: contacts.primaryName || null,
        primary_phone: contacts.primaryPhone || null,
        alt_name: contacts.altName || null,
        alt_phone: contacts.altPhone || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

