import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Receipt API Route - Uses Supabase
 * 
 * POST /api/school/payments/receipt
 * 
 * Finalizes payment: marks item as paid, creates receipt, refreshes materialized view
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      schoolId: schoolIdentifier,
      payment_item_id,
      payment_intent_id,
      method = 'card',
      reference,
    } = body;

    if (!schoolIdentifier || !payment_item_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: schoolId and payment_item_id' },
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

    // Fetch payment item
    const { data: paymentItem, error: itemError } = await supabase
      .from('payment_items')
      .select('id, amount_cents, status, student_id, school_id')
      .eq('id', payment_item_id)
      .eq('school_id', schoolId)
      .single();

    if (itemError || !paymentItem) {
      return NextResponse.json(
        { success: false, error: 'Payment item not found' },
        { status: 404 }
      );
    }

    if (paymentItem.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment item is already paid' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update payment item to paid
    const { data: updatedItem, error: updateError } = await supabase
      .from('payment_items')
      .update({
        status: 'paid',
        paid_at: now,
        method: method || null,
      })
      .eq('id', payment_item_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment item:', updateError);
      throw updateError;
    }

    // Create receipt
    const receiptUrl = `/receipts/${schoolId}/${payment_item_id}-${Date.now()}.pdf`; // Stub URL

    const { data: receipt, error: receiptError } = await supabase
      .from('payment_receipts')
      .insert({
        school_id: schoolId,
        student_id: paymentItem.student_id,
        payment_item_id,
        amount_cents: paymentItem.amount_cents,
        method: method || 'card',
        reference: reference || null,
        url: receiptUrl,
        issued_at: now,
      })
      .select()
      .single();

    if (receiptError) {
      console.error('Error creating receipt:', receiptError);
      // Don't fail if receipt creation fails - payment is already marked as paid
    }

    // Link receipt to payment item
    if (receipt) {
      await supabase
        .from('payment_items')
        .update({ receipt_id: receipt.id })
        .eq('id', payment_item_id);
    }

    // Update payment intent status if provided
    if (payment_intent_id) {
      await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('id', payment_intent_id);
    }

    // Refresh materialized view (async - don't wait)
    supabase.rpc('refresh_revenue_daily_view')
      .catch((err) => {
        console.error('Error refreshing materialized view:', err);
        // Non-critical - continue
      });

    return NextResponse.json({
      success: true,
      data: {
        payment_item: updatedItem,
        receipt: receipt || null,
        receipt_url: receiptUrl,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in payments receipt API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

