import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, initDB } from '@/backend/lib/db';
import { signAuth } from '@/backend/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    // Ensure DB is initialized
    await initDB();

    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password, // Plain text for sandbox simplicity
      role: 'user'
    };
    
    await createUser(newUser);

    const token = await signAuth({ id: newUser.id, role: newUser.role, name: newUser.name });

    const response = NextResponse.json({ user: { id: newUser.id, name: newUser.name, role: newUser.role } });
    response.cookies.set({
      name: 'sfm_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (err) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

