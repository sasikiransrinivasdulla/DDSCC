import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Session terminated successfully.',
  });

  // Instantly expire the secure session cookie
  response.cookies.set({
    name: 'ddscc_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // Set epoch expiration to clear cookie
    path: '/',
  });

  return response;
}
