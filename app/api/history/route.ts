import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

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

    // Retrieve all historical missions for the user, newest first
    const missions = await DailyMission.find({ userId: user._id }).sort({ dateString: -1 });

    const formattedHistory = missions.map((m) => {
      // Map badge based on scores
      const score = m.ddsccScore || 0;
      let badge = 'Pending';
      if (m.isCompleted) {
        if (score >= 90) badge = 'Beast Mode';
        else if (score >= 75) badge = 'Strong Day';
        else if (score >= 60) badge = 'Consistent';
        else if (score >= 40) badge = 'Could Be Better';
        else badge = 'Show Up Tomorrow';
      } else if (m.isMissed) {
        badge = 'Missed';
      }

      return {
        id: m._id,
        dateString: m.dateString,
        ddsccScore: score,
        isCompleted: m.isCompleted,
        isMissed: m.isMissed,
        badge,
        summary: {
          dsaProblems: m.dsaTargets?.total || 0,
          devProject: m.development?.isBuilding ? m.development.projectName : null,
          skillsCount: m.skills?.length || 0,
          coreSubjects: (m.coreSubjects || []).map((c: any) => c.subject),
          commCount: m.communication?.options?.length || 0,
          aptTopic: m.aptitude?.plannedQuestions > 0 ? m.aptitude.topicName : null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      history: formattedHistory,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve placement history logs.' }, { status: 500 });
  }
}
