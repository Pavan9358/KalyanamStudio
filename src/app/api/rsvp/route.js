import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/rsvp
export async function POST(request) {
  try {
    const { invitation_id, guest_name, attending, message, guest_count } = await request.json();

    if (!invitation_id || !guest_name || attending === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rsvps')
      .insert({
        invitation_id,
        guest_name,
        attending,
        message: message || '',
        guest_count: guest_count || 1,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ rsvp: data });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}

// GET /api/rsvp?invitation_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invitation_id = searchParams.get('invitation_id');

  if (!invitation_id) {
    return NextResponse.json({ error: 'Missing invitation_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitation_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ rsvps: data });
}
