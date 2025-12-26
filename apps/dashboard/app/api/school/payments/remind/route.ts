import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { createNotification } from '../../../../../lib/notifications.server';

/**
 * Payments Remind API Route - Uses Supabase
 * 
 * POST /api/school/payments/remind
 * 
 * Creates payment_due or payment_overdue notifications for parents
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      schoolId: schoolIdentifier,
      payment_item_ids, // Array of payment item IDs
    } = body;

    if (!schoolIdentifier || !payment_item_ids || !Array.isArray(payment_item_ids) || payment_item_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: schoolId and payment_item_ids array' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Fetch payment items with student and parent info
    const { data: paymentItems, error: itemsError } = await supabase
      .from('payment_items')
      .select(`
        id,
        title,
        amount_cents,
        due_date,
        status,
        student_id,
        school_students!inner(id, first_name, last_name, parent_email)
      `)
      .eq('school_id', schoolId)
      .in('id', payment_item_ids)
      .neq('status', 'paid')
      .neq('status', 'void');

    if (itemsError) {
      throw itemsError;
    }

    if (!paymentItems || paymentItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid payment items found' },
        { status: 400 }
      );
    }

    // Get parent user IDs from parent emails
    const parentEmails = [...new Set(paymentItems.map((item: any) => item.school_students?.parent_email).filter(Boolean))];
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('email', parentEmails);

    if (usersError) {
      throw usersError;
    }

    const emailToUserIdMap = new Map((users || []).map((u) => [u.email.toLowerCase(), u.id]));

    // Get parent-student mappings to find parent_user_id for each student
    const studentIds = paymentItems.map((item: any) => item.student_id);
    const { data: parentMappings, error: mappingError } = await supabase
      .from('school_parent_students')
      .select('parent_user_id, student_id')
      .eq('school_id', schoolId)
      .in('student_id', studentIds);

    if (mappingError) {
      console.error('Error fetching parent mappings:', mappingError);
      // Continue without mappings - we'll use email-based lookup
    }

    const studentToParentMap = new Map(
      (parentMappings || []).map((m) => [m.student_id, m.parent_user_id])
    );

    // Create notifications for each payment item
    const notificationPromises: Promise<any>[] = [];
    let notificationCount = 0;

    for (const item of paymentItems) {
      const student = item.school_students as any;
      const parentEmail = student?.parent_email;
      if (!parentEmail) continue;

      // Try to find parent_user_id from mapping, fallback to email lookup
      let parentUserId = studentToParentMap.get(item.student_id);
      if (!parentUserId) {
        parentUserId = emailToUserIdMap.get(parentEmail.toLowerCase());
      }

      if (!parentUserId) {
        console.warn(`Parent user not found for email: ${parentEmail}`);
        continue;
      }

      const isOverdue = item.status === 'overdue' || (item.due_date && new Date(item.due_date) < new Date());
      const formattedAmount = (item.amount_cents || 0).toLocaleString('vi-VN');
      const dueDateStr = item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : 'N/A';

      notificationPromises.push(
        createNotification({
          supabase,
          schoolId: schoolId,
          recipientUserId: parentUserId,
          recipientRole: 'parent',
          type: 'payment',
          priority: isOverdue ? 'urgent' : 'urgent', // Payment reminders are always urgent
          title: isOverdue ? 'Thanh Toán Quá Hạn / Payment Overdue' : 'Nhắc Thanh Toán / Payment Due',
          body: `${student?.first_name || ''} ${student?.last_name || ''} - ${item.title}: ${formattedAmount} ₫ hạn ${dueDateStr}`,
          targetType: 'payment',
          targetId: item.id,
          meta: {
            payment_item_id: item.id,
            student_id: item.student_id,
            student_name: `${student?.first_name || ''} ${student?.last_name || ''}`,
            title: item.title,
            amount_cents: item.amount_cents,
            due_date: item.due_date,
            status: item.status,
            is_overdue: isOverdue,
          },
        }).then(() => {
          notificationCount++;
        }).catch((notifError) => {
          console.error('Failed to create notification for parent:', parentUserId, notifError);
        })
      );
    }

    if (notificationPromises.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid parent users found for the payment items' },
        { status: 400 }
      );
    }

    // Wait for all notifications to be created
    await Promise.allSettled(notificationPromises);

    console.log('✅ Payment reminder notifications created:', notificationCount);

    return NextResponse.json({
      success: true,
      data: {
        count: notificationCount,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in payments remind API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

