import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'sharefood_session';

const PROTECTED_PAGE_PREFIXES = [
  '/role-select',
  '/ambil-makanan',
  '/post-makanan',
  '/profil-penerima',
  '/profil-penjual',
  '/dashboard',
  '/makanan',
];

const PROTECTED_API_PREFIXES = [
  '/api/foods',
  '/api/requests',
  '/api/users',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();

  // Protect API mutation/user endpoints
  if (PROTECTED_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protect authenticated pages — redirect immediately to /login if no session cookie
  if (PROTECTED_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/role-select/:path*',
    '/ambil-makanan/:path*',
    '/post-makanan/:path*',
    '/profil-penerima/:path*',
    '/profil-penjual/:path*',
    '/dashboard/:path*',
    '/makanan/:path*',
    '/api/foods/:path*',
    '/api/requests/:path*',
    '/api/users/:path*',
  ],
};
