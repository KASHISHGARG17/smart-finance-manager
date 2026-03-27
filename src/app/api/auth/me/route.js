import { NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/lib/auth';

export async function GET(req) {
  const token = req.cookies.get('sfm_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  
  const payload = await verifyAuth(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  return NextResponse.json({ user: payload });
}
