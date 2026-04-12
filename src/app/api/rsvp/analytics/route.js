import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/rsvp/analytics?invitation_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invitation_id = searchParams.get('invitation_id');

  if (!invitation_id) {
    return NextResponse.json({ error: 'Missing invitation_id' }, { status: 400 });
  }

  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitation_id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --- Pre-compute aggregates ---
  const total = rsvps.length;
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  const totalGuests = rsvps
    .filter((r) => r.attending)
    .reduce((acc, r) => acc + (r.guest_count || 1), 0);
  const responseRate = total > 0 ? Math.round((attending / total) * 100) : 0;

  // --- Build timeline (group by calendar date) ---
  const dateMap = {};
  rsvps.forEach((r) => {
    const d = new Date(r.created_at);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!dateMap[label]) dateMap[label] = { date: label, total: 0, attending: 0 };
    dateMap[label].total += 1;
    if (r.attending) dateMap[label].attending += 1;
  });
  const timeline = Object.values(dateMap);

  return NextResponse.json({
    total,
    attending,
    declined,
    totalGuests,
    responseRate,
    timeline,
    rsvps: rsvps.reverse(), // newest first for the table
  });
}
