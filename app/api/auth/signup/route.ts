import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, householdName } = await req.json();

    // 1. Create auth user (client-side auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authData.user) return NextResponse.json({ error: 'No user returned' }, { status: 400 });

    const userId = authData.user.id;

    // 2. Create household using service role (bypasses RLS)
    const { data: household, error: householdError } = await supabaseServer
      .from('households')
      .insert([{ name: householdName, created_by: userId }])
      .select()
      .single();
    if (householdError) return NextResponse.json({ error: householdError.message }, { status: 400 });

    // 3. Create user record using service role
    const { error: userError } = await supabaseServer
      .from('users')
      .insert([{
        auth_id: userId,
        email,
        display_name: displayName,
        household_id: household.id,
        role: 'admin',
      }]);
    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
