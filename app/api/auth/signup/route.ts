import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, householdName } = await req.json();

    // 1. Create auth user via admin API (server-side, no browser client needed)
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation for dev
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authData.user) return NextResponse.json({ error: 'User creation failed' }, { status: 400 });

    const userId = authData.user.id;

    // 2. Create household
    const { data: household, error: householdError } = await supabaseServer
      .from('households')
      .insert([{ name: householdName, created_by: userId }])
      .select()
      .single();
    if (householdError) {
      // Rollback auth user if household fails
      await supabaseServer.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: householdError.message }, { status: 400 });
    }

    // 3. Create user profile record
    const { error: userError } = await supabaseServer
      .from('users')
      .insert([{
        auth_id: userId,
        email,
        display_name: displayName,
        household_id: household.id,
        role: 'admin',
      }]);
    if (userError) {
      // Rollback both if user record fails
      await supabaseServer.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
