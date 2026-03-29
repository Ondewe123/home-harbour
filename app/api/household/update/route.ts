import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { householdName, displayName, householdId } = await req.json();

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabaseServer.auth.getUser(token);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: callerRecord } = await supabaseServer
      .from('users')
      .select('id, role, household_id')
      .eq('auth_id', caller.id)
      .single();

    if (!callerRecord || callerRecord.role !== 'admin' || callerRecord.household_id !== householdId) {
      return NextResponse.json({ error: 'Only admins can update household details' }, { status: 403 });
    }

    const updates = [];

    if (householdName) {
      updates.push(
        supabaseServer.from('households').update({ name: householdName }).eq('id', householdId)
      );
    }

    if (displayName) {
      updates.push(
        supabaseServer.from('users').update({ display_name: displayName }).eq('id', callerRecord.id)
      );
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
