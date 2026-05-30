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

    // Check duplicate registrations
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Hash user password securely using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save registration in database
    const newUser = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
      lastLogin: new Date(),
      isFirstLogin: true,
    });

    // Generate persistent session token
    const token = signToken({
      userId: newUser._id.toString(),
      username: newUser.username,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created and authenticated successfully.',
      user: {
        username: newUser.username,
        isFirstLogin: newUser.isFirstLogin,
        motivationText: newUser.motivationText,
        targetRole: newUser.targetRole,
      },
    });

    // Set high-security httpOnly session cookie (persists for 7 days)
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
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred during registration.' },
      { status: 500 }
    );
  }
}
