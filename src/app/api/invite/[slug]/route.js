import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/invite/[slug] — public endpoint to load invitation by slug
export async function GET(request, { params }) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invitation not found', found: false }, { status: 200 });
  }

  return NextResponse.json({ invitation: data });
}
