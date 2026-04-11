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

    // 1. Check if an invitation with this exact slug already exists for this user
    const { data: existing } = await supabase
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', decoded.userId)
      .single();

    let resultData;
    let resultError;

    if (existing) {
      // 2. Perform UPDATE if it exists (no unique DB constraints required)
      const { data, error } = await supabase
        .from('invitations')
        .update({
          template_id,
          status: 'draft',
          data_json,
        })
        .eq('id', existing.id)
        .select()
        .single();
      resultData = data;
      resultError = error;
    } else {
      // 3. Perform standard INSERT if it doesn't exist
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
      resultData = data;
      resultError = error;
    }

    if (resultError) throw resultError;

    return NextResponse.json({ invitation: resultData });
  } catch (err) {
    console.error('Create invitation error:', err);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
