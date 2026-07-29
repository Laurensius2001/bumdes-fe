import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('bumdes_logged_in')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (!isLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect pelanggan routes
  if (!isLoggedIn && pathname.startsWith('/pelanggan')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to root if already logged in and trying to access auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/sign-up' || pathname === '/forgot-password')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/pelanggan/:path*', '/login', '/sign-up', '/forgot-password'],
};
