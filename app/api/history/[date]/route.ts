import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

interface RouteContext {
  params: Promise<{ date: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { date } = await context.params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ddscc_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Query for the specific date and user
    const mission = await DailyMission.findOne({ userId: user._id, dateString: date });
    if (!mission) {
      return NextResponse.json({ error: 'Daily mission not found for this date.' }, { status: 404 });
    }

    // Evaluate badge labels
    const score = mission.ddsccScore || 0;
    let badge = 'Pending';
    let badgeDesc = "Commitments registered. EOD seal pending.";
    let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

    if (mission.isCompleted) {
      if (score >= 90) {
        badge = 'Beast Mode';
        badgeDesc = "You're becoming harder to stop.";
        badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      } else if (score >= 75) {
        badge = 'Strong Day';
        badgeDesc = "You're becoming harder to stop.";
        badgeColor = 'text-green-400 bg-green-500/10 border-green-500/20';
      } else if (score >= 60) {
        badge = 'Consistent';
        badgeDesc = "Consistency compiles progress.";
        badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      } else if (score >= 40) {
        badge = 'Could Be Better';
        badgeDesc = "Tomorrow is another chance to show up.";
        badgeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      } else {
        badge = 'Show Up Tomorrow';
        badgeDesc = "Consistency resets. Growth doesn't.";
        badgeColor = 'text-red-400 bg-red-500/10 border-red-500/20';
      }
    } else if (mission.isMissed) {
      badge = 'Missed';
      badgeDesc = "Streak auto-decay triggered.";
      badgeColor = 'text-red-500 bg-red-500/5 border-red-500/15';
    }

    return NextResponse.json({
      success: true,
      mission,
      badge: {
        label: badge,
        description: badgeDesc,
        className: badgeColor,
      },
    });
  } catch (error) {
    console.error('Day details fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve detailed day logs.' }, { status: 500 });
  }
}
