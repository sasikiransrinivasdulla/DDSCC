import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

// Helper to convert Date to YYYY-MM-DD string in Indian Standard Time (IST) offset (+5.5)
function getISTDateString(date: Date) {
  const utcOffset = 5.5; // IST is UTC+5.5
  const localTime = new Date(date.getTime() + utcOffset * 3600000);
  return localTime.toISOString().split('T')[0];
}

// Helper to get past dates range
function getDatesInRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (start <= end) {
    dates.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }
  return dates;
}

export async function GET() {
  try {
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

    // Determine the calendar sweep boundaries
    // We sweep from the user's registration date up to yesterday
    const todayStr = getISTDateString(new Date());
    const registerStr = getISTDateString(new Date(user.createdAt || user.updatedAt || new Date()));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getISTDateString(yesterday);

    let missedDaysAddedCount = 0;

    // Only sweep if the user registered before today
    if (registerStr < todayStr) {
      const datesToSweep = getDatesInRange(registerStr, yesterdayStr);

      for (const dateStr of datesToSweep) {
        const existing = await DailyMission.findOne({
          userId: user._id,
          dateString: dateStr,
        });

        // If no daily mission exists for a calendar date, insert a missed record
        if (!existing) {
          await DailyMission.create({
            userId: user._id,
            dateString: dateStr,
            isCompleted: true,
            isMissed: true,
            ddsccScore: 0,
          });
          missedDaysAddedCount++;
        }
      }
    }

    // Chronologically recalculate current & longest streaks
    const allMissions = await DailyMission.find({ userId: user._id }).sort({ dateString: 1 });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Longest Streak calculation (scan entire history in ascending order)
    for (const mission of allMissions) {
      if (mission.isCompleted && !mission.isMissed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current Streak calculation (trace backward starting from today or yesterday)
    const todayMission = allMissions.find((m) => m.dateString === todayStr);
    const yesterdayMission = allMissions.find((m) => m.dateString === yesterdayStr);

    let startTracingFromToday = false;

    if (todayMission && todayMission.isCompleted && !todayMission.isMissed) {
      startTracingFromToday = true;
    }

    if (startTracingFromToday) {
      let traceDate = new Date();
      while (true) {
        const traceStr = getISTDateString(traceDate);
        const match = allMissions.find((m) => m.dateString === traceStr);
        if (match && match.isCompleted && !match.isMissed) {
          currentStreak++;
          traceDate.setDate(traceDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (yesterdayMission && yesterdayMission.isCompleted && !yesterdayMission.isMissed) {
      let traceDate = new Date();
      traceDate.setDate(traceDate.getDate() - 1); // Start from yesterday
      while (true) {
        const traceStr = getISTDateString(traceDate);
        const match = allMissions.find((m) => m.dateString === traceStr);
        if (match && match.isCompleted && !match.isMissed) {
          currentStreak++;
          traceDate.setDate(traceDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    // Persist calculated values
    user.currentStreak = currentStreak;
    user.longestStreak = Math.max(user.longestStreak || 0, longestStreak);
    await user.save();

    return NextResponse.json({
      success: true,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      missedDaysSwept: missedDaysAddedCount,
    });
  } catch (error) {
    console.error('Streak sync sweeper error:', error);
    return NextResponse.json({ error: 'Failed to sync streaks.' }, { status: 500 });
  }
}
