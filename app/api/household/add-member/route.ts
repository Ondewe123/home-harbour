import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, householdId, role } = await req.json();

    // Verify requesting user is admin of this household
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabaseServer.auth.getUser(token);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: callerRecord } = await supabaseServer
      .from('users')
      .select('role, household_id')
      .eq('auth_id', caller.id)
      .single();

    if (!callerRecord || callerRecord.role !== 'admin' || callerRecord.household_id !== householdId) {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // Create user record in same household
    const { error: userError } = await supabaseServer.from('users').insert([{
      auth_id: authData.user.id,
      email,
      display_name: displayName,
      household_id: householdId,
      role: role || 'user',
    }]);
    if (userError) {
      await supabaseServer.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
