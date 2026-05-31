import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

// Helper to get today's date string in YYYY-MM-DD format in Asia/Kolkata (IST) or system default
function getTodayDateString(clientTimezoneOffset?: string) {
  // If offset or string date is provided, use it, otherwise fall back to Indian Standard Time (IST) offset which fits the user locale
  const now = new Date();
  const utcOffset = 5.5; // IST is UTC+5.5
  const localTime = new Date(now.getTime() + utcOffset * 3600000);
  return localTime.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ddscc_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Extract optional client-provided date string to keep timezone safe
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get('date');
    const targetDate = dateQuery || getTodayDateString();

    await dbConnect();
    const mission = await DailyMission.findOne({
      userId: decoded.userId,
      dateString: targetDate,
    });

    return NextResponse.json({
      success: true,
      exists: !!mission,
      mission: mission || null,
      date: targetDate,
    });
  } catch (error) {
    console.error('Fetch daily mission error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving mission.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ddscc_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      dateString,
      dsaTargets,
      development,
      skills,
      coreSubjects,
      communication,
      aptitude,
    } = body;

    const targetDate = dateString || getTodayDateString();

    await dbConnect();

    // Double-check unique constraint before creating to return a nice message
    const existing = await DailyMission.findOne({
      userId: decoded.userId,
      dateString: targetDate,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A mission is already active for today. You cannot create a second daily plan.' },
        { status: 409 }
      );
    }

    // Auto-calculate total planned problems with robust defensive bounds checks
    const easyCount = Math.max(0, Number(dsaTargets?.easy || 0));
    const mediumCount = Math.max(0, Number(dsaTargets?.medium || 0));
    const hardCount = Math.max(0, Number(dsaTargets?.hard || 0));
    const totalCount = easyCount + mediumCount + hardCount;

    // Clamp development planned hours to a maximum of 24
    const plannedHours = Math.min(24, Math.max(0, Number(development?.plannedHours || 0)));

    // Clean and validate custom tags lists to prevent database pollution
    const validatedSkills = (Array.isArray(skills) ? skills : [])
      .map((s: any) => String(s || '').trim())
      .filter(Boolean);

    const validatedCoreSubjects = (Array.isArray(coreSubjects) ? coreSubjects : [])
      .map((c: any) => ({
        subject: String(c.subject || '').trim(),
        plannedEffort: Math.min(100, Math.max(0, Number(c.plannedEffort || 50))),
      }))
      .filter((c) => c.subject !== '');

    // Clamp rating to [1, 5] inclusive
    const confidenceRating = Math.min(5, Math.max(1, Number(communication?.confidenceRating || 3)));
    
    // Validate planned aptitude questions
    const plannedQuestions = Math.max(0, Number(aptitude?.plannedQuestions || 0));

    const newMission = new DailyMission({
      userId: decoded.userId,
      dateString: targetDate,
      dsaTargets: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        total: totalCount,
      },
      development: {
        isBuilding: !!development?.isBuilding,
        projectName: String(development?.projectName || '').trim(),
        projectDesc: String(development?.projectDesc || '').trim(),
        plannedHours: plannedHours,
        willPushGithub: !!development?.willPushGithub,
        exploreNew: !!development?.exploreNew,
      },
      skills: validatedSkills,
      coreSubjects: validatedCoreSubjects,
      communication: {
        options: Array.isArray(communication?.options) ? communication.options.map((o: any) => String(o || '').trim()) : [],
        confidenceRating: confidenceRating,
      },
      aptitude: {
        topicName: String(aptitude?.topicName || '').trim(),
        plannedQuestions: plannedQuestions,
      },
    });

    await newMission.save();

    return NextResponse.json({
      success: true,
      message: 'Morning Oath Committed Successfully.',
      mission: newMission,
    });
  } catch (error) {
    console.error('Create daily mission error:', error);
    return NextResponse.json(
      { error: 'Failed to record morning mission.' },
      { status: 500 }
    );
  }
}
