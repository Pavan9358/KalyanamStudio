import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// GET /api/invitations/[id]
export async function GET(request, { params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  return NextResponse.json({ invitation: data });
}

// PUT /api/invitations/[id]
export async function PUT(request, { params }) {
  const token = getTokenFromRequest(request);
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('invitations')
    .update({
      data_json: body.data_json,
      status: body.status || 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', decoded.userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invitation: data });
}

// DELETE /api/invitations/[id]
export async function DELETE(request, { params }) {
  const token = getTokenFromRequest(request);
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('user_id', decoded.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
