import { createServerSupabaseClient } from '../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'School code is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // Call the RPC function
    const { data, error } = await supabase.rpc('validate_school_code', {
      code: code
    });

    if (error) {
      console.error('RPC Error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    if (!data.success) {
      return NextResponse.json({ success: false, message: data.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}










