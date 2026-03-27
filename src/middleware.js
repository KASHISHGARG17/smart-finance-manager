import { NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/admin');
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = req.cookies.get('sfm_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyAuth(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('sfm_token');
    return response;
  }

  if (path.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
