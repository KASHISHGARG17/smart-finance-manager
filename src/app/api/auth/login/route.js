import { NextResponse } from 'next/server';
import { getUserByEmail, initDB } from '@/backend/lib/db';
import { signAuth } from '@/backend/lib/auth';

export async function POST(req) {
  try {
    // Ensure DB is initialized
    await initDB();

    const { email, password } = await req.json();

    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAuth({ id: user.id, role: user.role, name: user.name });

    const response = NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
    response.cookies.set({
      name: 'sfm_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

