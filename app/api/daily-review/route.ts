import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

// Helper to convert Date to YYYY-MM-DD string in IST offset
function getISTDateString(date: Date) {
  const utcOffset = 5.5;
  const localTime = new Date(date.getTime() + utcOffset * 3600000);
  return localTime.toISOString().split('T')[0];
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { 
      dsa, 
      development, 
      skills, 
      coreSubjects, 
      communication, 
      aptitude,
      prideRating,
      reflectionNote
    } = body;

    // Apply robust input sanitizations and bounds checks defensively
    const sanitizedDsa = {
      easy: Math.max(0, Number(dsa?.easy || 0)),
      medium: Math.max(0, Number(dsa?.medium || 0)),
      hard: Math.max(0, Number(dsa?.hard || 0)),
    };

    const sanitizedDev = {
      projectName: String(development?.projectName || '').trim(),
      projectDesc: String(development?.projectDesc || '').trim(),
      githubPushed: !!development?.githubPushed,
      exploreNew: !!development?.exploreNew,
      satisfactionRating: Math.min(5, Math.max(1, Number(development?.satisfactionRating || 3))),
    };

    const sanitizedSkills = Array.isArray(skills) ? skills.map((s: any) => String(s || '').trim()).filter(Boolean) : [];

    const sanitizedCoreSubjects = (Array.isArray(coreSubjects) ? coreSubjects : []).map((c: any) => ({
      subject: String(c.subject || '').trim(),
      actualEffort: Math.min(100, Math.max(0, Number(c.actualEffort || 0))),
    })).filter(c => c.subject !== '');

    const sanitizedComm = {
      options: Array.isArray(communication?.options) ? communication.options.map((o: any) => String(o || '').trim()).filter(Boolean) : [],
      confidenceRating: Math.min(5, Math.max(1, Number(communication?.confidenceRating || 3))),
    };

    const sanitizedAptitude = {
      topicName: String(aptitude?.topicName || '').trim(),
      actualQuestions: Math.max(0, Number(aptitude?.actualQuestions || 0)),
    };

    const sanitizedPrideRating = Math.min(5, Math.max(1, Number(prideRating || 3)));
    const sanitizedReflectionNote = String(reflectionNote || '').trim();

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Resolve today's date in IST
    const todayStr = getISTDateString(new Date());

    // Fetch today's mission
    const mission = await DailyMission.findOne({
      userId: user._id,
      dateString: todayStr,
      isCompleted: false,
    });

    if (!mission) {
      return NextResponse.json({ 
        error: "Today's daily mission was not found or has already been reviewed." 
      }, { status: 400 });
    }

    // -------------------------------------------------------------
    // DDSCC SCORING ENGINE (WEIGHTED SCORING SYSTEM)
    // -------------------------------------------------------------

    // 1. DSA (30% weight)
    let dsaScore = 100;
    const dsaPlanned = mission.dsaTargets.total || 0;
    if (dsaPlanned > 0) {
      const dsaCompleted = sanitizedDsa.easy + sanitizedDsa.medium + sanitizedDsa.hard;
      dsaScore = Math.min(100, (dsaCompleted / dsaPlanned) * 100);
    }

    // 2. Development (20% weight)
    let devScore = 100;
    if (mission.development.isBuilding) {
      const hoursPoints = (sanitizedDev.satisfactionRating / 5) * 50; // Max 50 points
      const pushPoints = sanitizedDev.githubPushed ? 25 : 0;
      const explorePoints = sanitizedDev.exploreNew ? 25 : 0;
      devScore = Math.min(100, hoursPoints + pushPoints + explorePoints);
    }

    // 3. Skills (15% weight)
    let skillsScore = 100;
    const skillsPlanned = mission.skills.length || 0;
    if (skillsPlanned > 0) {
      const skillsCompleted = sanitizedSkills.length;
      skillsScore = Math.min(100, (skillsCompleted / skillsPlanned) * 100);
    }

    // 4. Core Subjects (15% weight)
    let coreScore = 100;
    const corePlannedCount = mission.coreSubjects.length || 0;
    if (corePlannedCount > 0) {
      let accumulatedRatioSum = 0;
      for (const plannedSub of mission.coreSubjects) {
        const matchingActual = sanitizedCoreSubjects.find(
          (a: any) => a.subject === plannedSub.subject
        );
        const actualEff = matchingActual ? matchingActual.actualEffort : 0;
        const plannedEff = Number(plannedSub.plannedEffort) || 50;
        accumulatedRatioSum += Math.min(100, (actualEff / plannedEff) * 100);
      }
      coreScore = accumulatedRatioSum / corePlannedCount;
    }

    // 5. Communication (10% weight)
    let commScore = 100;
    const commPlannedCount = mission.communication.options.length || 0;
    if (commPlannedCount > 0) {
      const actualCompleted = sanitizedComm.options.length;
      const tasksPoints = (actualCompleted / commPlannedCount) * 80;
      const confidencePoints = (sanitizedComm.confidenceRating / 5) * 20;
      commScore = Math.min(100, tasksPoints + confidencePoints);
    }

    // 6. Aptitude (10% weight)
    let aptScore = 100;
    const aptPlanned = mission.aptitude.plannedQuestions || 0;
    if (aptPlanned > 0) {
      const aptCompleted = sanitizedAptitude.actualQuestions;
      aptScore = Math.min(100, (aptCompleted / aptPlanned) * 100);
    }

    // Aggregate weighted scores
    const ddsccDailyScore = Math.round(
      dsaScore * 0.30 +
      devScore * 0.20 +
      skillsScore * 0.15 +
      coreScore * 0.15 +
      commScore * 0.10 +
      aptScore * 0.10
    );

    // Save reflection details to daily mission record
    mission.isCompleted = true;
    mission.ddsccScore = ddsccDailyScore;
    mission.eodActuals = {
      dsa: {
        easy: sanitizedDsa.easy,
        medium: sanitizedDsa.medium,
        hard: sanitizedDsa.hard,
        total: sanitizedDsa.easy + sanitizedDsa.medium + sanitizedDsa.hard,
      },
      development: {
        projectName: sanitizedDev.projectName,
        projectDesc: sanitizedDev.projectDesc,
        githubPushed: sanitizedDev.githubPushed,
        exploreNew: sanitizedDev.exploreNew,
        satisfactionRating: sanitizedDev.satisfactionRating,
      },
      skills: sanitizedSkills,
      coreSubjects: sanitizedCoreSubjects,
      communication: sanitizedComm,
      aptitude: {
        topicName: sanitizedAptitude.topicName,
        actualQuestions: sanitizedAptitude.actualQuestions,
      },
      prideRating: sanitizedPrideRating,
      reflectionNote: sanitizedReflectionNote,
    };

    await mission.save();

    // -------------------------------------------------------------
    // INSTANT STREAK SYSTEM RECALCULATION
    // -------------------------------------------------------------
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getISTDateString(yesterday);

    const allMissions = await DailyMission.find({ userId: user._id }).sort({ dateString: 1 });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Recalculate longest streak history
    for (const m of allMissions) {
      if (m.isCompleted && !m.isMissed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Recalculate active current streak trace backward
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
      traceDate.setDate(traceDate.getDate() - 1);
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

    // Persist calculations
    user.currentStreak = currentStreak;
    user.longestStreak = Math.max(user.longestStreak || 0, longestStreak);
    await user.save();

    return NextResponse.json({
      success: true,
      score: ddsccDailyScore,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });
  } catch (error) {
    console.error('EOD Reflection submission error:', error);
    return NextResponse.json({ error: 'Failed to process EOD reflection.' }, { status: 500 });
  }
}
