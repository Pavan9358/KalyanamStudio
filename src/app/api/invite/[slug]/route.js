import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force this API route to always fetch fresh data from Supabase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
