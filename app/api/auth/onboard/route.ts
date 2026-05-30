import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ddscc_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Session expired or invalid.' },
        { status: 401 }
      );
    }

    const { targetRole, motivationText } = await request.json();

    if (!targetRole || !motivationText) {
      return NextResponse.json(
        { error: 'Target role and motivation text are required.' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    // Update first-time onboarding parameters
    user.isFirstLogin = false;
    user.targetRole = targetRole;
    user.motivationText = motivationText.trim();
    user.lastLogin = new Date(); // Update activity log

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Onboarding commitment sealed. Active chamber initialized.',
      user: {
        username: user.username,
        isFirstLogin: user.isFirstLogin,
        motivationText: user.motivationText,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    console.error('Onboarding endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
