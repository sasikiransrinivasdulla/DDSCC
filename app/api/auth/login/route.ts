import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Verify user exists in database records
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare bcryptjs hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login metrics
    user.lastLogin = new Date();
    await user.save();

    // Generate persistent 7-day token
    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        username: user.username,
        isFirstLogin: user.isFirstLogin,
        motivationText: user.motivationText,
        targetRole: user.targetRole,
      },
    });

    // Establish persistent 7-day httpOnly session cookie
    response.cookies.set({
      name: 'ddscc_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
