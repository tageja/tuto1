import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Student Health Detail API Route
 * 
 * GET /api/health/student/[studentId]
 * 
 * Returns full health profile: medical info, allergies, medications, 
 * emergency contacts, vaccinations, vitals (last 12)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get student basic info
    const { data: student, error: studentError } = await supabase
      .from('school_students')
      .select('id, first_name, last_name, date_of_birth, class_id, school_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
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
    const allergies = generalRecords
      .filter(r => r.details?.type === 'allergy')
      .map(r => ({
        id: r.id,
        name: r.details?.name || '',
        severity: r.details?.severity || '',
        notes: r.details?.notes || '',
        recordedAt: r.recorded_at,
      }));

    const medications = generalRecords
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
    const vaccinations = vaccinationRecords.map(r => ({
      id: r.id,
      vaccine: r.details?.vaccine || '',
      status: r.details?.status || '',
      date: r.details?.date || r.recorded_at,
      recordedAt: r.recorded_at,
    }));

    // Format vitals (last 12)
    const vitals = vitalsRecords
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

    return NextResponse.json({
      success: true,
      data: {
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
          title: r.title || '',
          details: r.details,
          recordedAt: r.recorded_at,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching student health detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student health detail', message: error.message },
      { status: 500 }
    );
  }
}

