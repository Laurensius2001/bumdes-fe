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

  // Redirect to dashboard directly if already logged in and trying to access auth pages
  // Note: Avoid redirecting to '/' because '/' redirects to '/login' if client state isn't loaded yet
  if (isLoggedIn && (pathname === '/login' || pathname === '/sign-up' || pathname === '/forgot-password')) {
    const userRole = request.cookies.get('bumdes_role')?.value;
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'pelanggan') {
      return NextResponse.redirect(new URL('/pelanggan/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/pelanggan/:path*', '/login', '/sign-up', '/forgot-password'],
};
