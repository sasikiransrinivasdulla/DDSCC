import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const hasSession = cookies.has('ddscc_session');

  const isDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnboarding = nextUrl.pathname.startsWith('/onboarding');
  const isAuth = nextUrl.pathname.startsWith('/auth');

  if ((isDashboard || isOnboarding) && !hasSession) {
    // Redirect unauthenticated user to the auth page
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && hasSession) {
    // Redirect authenticated user immediately to the dashboard
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth', '/onboarding'],
};
