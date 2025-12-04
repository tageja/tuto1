import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Intent API Route - Uses Supabase
 * 
 * POST /api/school/payments/intent
 * 
 * Creates a payment_intent for processing (mock provider)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      schoolId: schoolIdentifier,
      payment_item_id,
      provider = 'mock', // 'stripe', 'momo', 'cash', 'mock'
      created_by,
    } = body;

    if (!schoolIdentifier || !payment_item_id || !created_by) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: schoolId, payment_item_id, created_by' },
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
      .select('id, amount_cents, status, student_id')
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

    // Generate mock client_secret for mock provider
    const clientSecret = provider === 'mock' 
      ? `mock_secret_${Date.now()}_${Math.random().toString(36).substring(7)}`
      : null;

    // Create payment intent
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .insert({
        school_id: schoolId,
        payment_item_id,
        amount_cents: paymentItem.amount_cents,
        provider: provider as 'stripe' | 'momo' | 'cash',
        client_secret,
        status: 'requires_payment',
        created_by,
      })
      .select()
      .single();

    if (intentError) {
      console.error('Error creating payment intent:', intentError);
      throw intentError;
    }

    // For mock provider, immediately mark as succeeded
    if (provider === 'mock') {
      // Update intent status
      await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('id', intent.id);

      return NextResponse.json({
        success: true,
        data: {
          intent: {
            ...intent,
            status: 'succeeded',
          },
          clientSecret,
        },
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        intent,
        clientSecret,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in payments intent API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

