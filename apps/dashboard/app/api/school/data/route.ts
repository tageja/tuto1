import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * School Data API Route - Uses Supabase
 * 
 * GET /api/school/data?table=students&schoolId=X
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 * 
 * This is a legacy endpoint that provides data for the admin dashboard.
 * It supports multiple table types for backward compatibility.
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table');
    const schoolIdentifier = searchParams.get('schoolId');
    const userId = searchParams.get('userId');

    if (!schoolIdentifier || !table) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Resolve school identifier (name or UUID) to UUID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    let data: any[] = [];
    let singleRecord: any = null;

    switch (table) {
      case 'students':
        // Fetch students from Supabase
        const { data: students, error: studentsError } = await supabase
          .from('school_students')
          .select('*')
          .eq('school_id', schoolId);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          throw studentsError;
        }

        // Format to match legacy structure (flat object, not nested fields)
        data = (students || []).map((student: any) => ({
          id: student.id,
          'Student Name': `${student.first_name} ${student.last_name}`.trim(),
          'First Name': student.first_name,
          'Last Name': student.last_name,
          'Student Number': student.student_number,
          'Date of Birth': student.date_of_birth,
          'Gender': student.gender,
          'Status': student.status || 'active',
          'Class Name': student.class_id ? 'Loading...' : null, // Will be populated if needed
          'Parent Name': student.parent_name,
          'Parent Email': student.parent_email,
          'Parent Phone': student.parent_phone,
          'Address': student.address,
          'Enrollment Date': student.enrollment_date,
          // Keep original fields for compatibility
          first_name: student.first_name,
          last_name: student.last_name,
          student_number: student.student_number,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          status: student.status || 'active',
          class_id: student.class_id,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone,
          address: student.address,
          enrollment_date: student.enrollment_date,
        }));
        break;

      case 'teachers':
        // Fetch teachers from Supabase
        const { data: teachers, error: teachersError } = await supabase
          .from('school_teachers')
          .select('*')
          .eq('school_id', schoolId);

        if (teachersError) {
          console.error('Error fetching teachers:', teachersError);
          throw teachersError;
        }

        // Format to match legacy structure
        data = (teachers || []).map((teacher: any) => ({
          id: teacher.id,
          'Teacher Name': teacher.name,
          'Name': teacher.name,
          'Email': teacher.email,
          'Phone': teacher.phone,
          'Subjects': Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects,
          'Status': teacher.status || 'active',
          'Education': teacher.qualifications,
          'Qualifications': teacher.qualifications,
          'Hire Date': teacher.hire_date,
          'Rating': null, // Rating not available in school_teachers table
          // Keep original fields for compatibility
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          subjects: teacher.subjects,
          status: teacher.status || 'active',
          qualifications: teacher.qualifications,
          hire_date: teacher.hire_date,
        }));
        break;

      case 'attendance':
        // Fetch attendance records from Supabase
        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('school_id', schoolId)
          .order('date', { ascending: false })
          .limit(100);

        if (attendanceError) {
          console.error('Error fetching attendance:', attendanceError);
          // Don't throw - attendance might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (attendance || []).map((record: any) => ({
            id: record.id,
            'Date': record.date,
            'Student Name': record.student_id ? 'Loading...' : null,
            'Status': record.status || 'Present',
            'Notes': record.notes,
            // Keep original fields
            date: record.date,
            student_id: record.student_id,
            status: record.status || 'Present',
            notes: record.notes,
          }));
        }
        break;

      case 'events':
        // Fetch events from Supabase
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('school_id', schoolId)
          .order('start_date', { ascending: true })
          .limit(50);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          // Don't throw - events might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (events || []).map((event: any) => ({
            id: event.id,
            'Event Title': event.title,
            'Description': event.description,
            'Start Date': event.start_date,
            'End Date': event.end_date,
            'Status': event.status || 'Scheduled',
            'Location': event.location,
            // Keep original fields
            title: event.title,
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            status: event.status || 'Scheduled',
            location: event.location,
          }));
        }
        break;

      case 'payments':
        // Fetch payments from Supabase
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
          // Don't throw - payments might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (payments || []).map((payment: any) => ({
            id: payment.id,
            'Student Name': payment.student_id ? 'Loading...' : null,
            'Amount': payment.amount,
            'Status': payment.status || 'Pending',
            'Due Date': payment.due_date,
            'Paid Date': payment.paid_date,
            // Keep original fields
            student_id: payment.student_id,
            amount: payment.amount,
            status: payment.status || 'Pending',
            due_date: payment.due_date,
            paid_date: payment.paid_date,
          }));
        }
        break;

      case 'announcements':
        // Fetch announcements from Supabase
        const { data: announcements, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (announcementsError) {
          console.error('Error fetching announcements:', announcementsError);
          // Don't throw - announcements might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (announcements || []).map((announcement: any) => ({
            id: announcement.id,
            'Announcement Title': announcement.title,
            'Content': announcement.content,
            'Priority': announcement.priority || 'Normal',
            'Created At': announcement.created_at,
            // Keep original fields
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority || 'Normal',
            created_at: announcement.created_at,
          }));
        }
        break;

      case 'schoolDetails':
        // Fetch school details from Supabase
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single();

        if (schoolError) {
          console.error('Error fetching school:', schoolError);
          return NextResponse.json({ data: null });
        }

        // Format to match legacy structure
        singleRecord = {
          id: school.id,
          'School Name': school.name,
          'Name': school.name,
          'Type': school.type,
          'Address': school.address,
          'Phone': school.phone,
          'Email': school.email,
          'Status': school.status || 'active',
          // Keep original fields
          name: school.name,
          type: school.type,
          address: school.address,
          phone: school.phone,
          email: school.email,
          status: school.status || 'active',
        };
        return NextResponse.json({ data: singleRecord });

      case 'unreadMessages':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        
        // Fetch unread messages from Supabase
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('school_id', schoolId)
          .eq('recipient_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          // Don't throw - messages might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (messages || []).map((message: any) => ({
            id: message.id,
            'From User': message.sender_id ? 'Loading...' : null,
            'Message Subject': message.subject,
            'Message Content': message.content,
            'Sent Date': message.created_at,
            // Keep original fields
            sender_id: message.sender_id,
            subject: message.subject,
            content: message.content,
            created_at: message.created_at,
          }));
        }
        break;

      case 'upcomingHomework':
        // Fetch upcoming homework from Supabase
        const { data: homework, error: homeworkError } = await supabase
          .from('homework')
          .select('*')
          .eq('school_id', schoolId)
          .gte('due_date', new Date().toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(10);

        if (homeworkError) {
          console.error('Error fetching homework:', homeworkError);
          // Don't throw - homework might not be imported yet
          data = [];
        } else {
          // Format to match legacy structure
          data = (homework || []).map((hw: any) => ({
            id: hw.id,
            'Assignment Title': hw.title,
            'Class Name': hw.class_id ? 'Loading...' : null,
            'Due Date': hw.due_date,
            'Description': hw.description,
            // Keep original fields
            title: hw.title,
            class_id: hw.class_id,
            due_date: hw.due_date,
            description: hw.description,
          }));
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching school data:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
