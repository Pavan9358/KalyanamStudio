import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest, generateSlug } from '@/lib/auth';

// GET /api/invitations — list user's invitations
export async function GET(request) {
  const token = getTokenFromRequest(request);
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('user_id', decoded.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invitations: data });
}

// POST /api/invitations — create new invitation
export async function POST(request) {
  const token = getTokenFromRequest(request);
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template_id, data_json } = body;

    const groomName = data_json?.groom_name || 'groom';
    const brideName = data_json?.bride_name || 'bride';
    const slug = generateSlug(groomName, brideName);

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        user_id: decoded.userId,
        template_id,
        slug,
        status: 'draft',
        data_json,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ invitation: data });
  } catch (err) {
    console.error('Create invitation error:', err);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
