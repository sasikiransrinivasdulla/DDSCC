import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import DailyMission from '@/lib/models/DailyMission';
import { verifyToken } from '@/lib/jwt';

// Helper to convert Date to YYYY-MM-DD string in IST
function getISTDateString(date: Date) {
  const utcOffset = 5.5;
  const localTime = new Date(date.getTime() + utcOffset * 3600000);
  return localTime.toISOString().split('T')[0];
}

// Dynamic EOD Category Score Evaluator (matching API rules)
function evaluateCategoryScores(mission: any) {
  if (!mission.isCompleted) {
    return { dsa: 0, dev: 0, skills: 0, core: 0, comm: 0, apt: 0 };
  }
  if (mission.isMissed) {
    return { dsa: 0, dev: 0, skills: 0, core: 0, comm: 0, apt: 0 };
  }

  const actuals = mission.eodActuals || {};

  // 1. DSA (30% weight)
  let dsaScore = 100;
  const dsaPlanned = mission.dsaTargets?.total || 0;
  if (dsaPlanned > 0) {
    const act = actuals.dsa || {};
    const dsaCompleted = (Number(act.easy) || 0) + (Number(act.medium) || 0) + (Number(act.hard) || 0);
    dsaScore = Math.min(100, (dsaCompleted / dsaPlanned) * 100);
  }

  // 2. Development (20% weight)
  let devScore = 100;
  if (mission.development?.isBuilding) {
    const devAct = actuals.development || {};
    const satRating = Number(devAct.satisfactionRating) || 3;
    const hoursPoints = (satRating / 5) * 50;
    const pushPoints = devAct.githubPushed ? 25 : 0;
    const explorePoints = devAct.exploreNew ? 25 : 0;
    devScore = Math.min(100, hoursPoints + pushPoints + explorePoints);
  }

  // 3. Skills (15% weight)
  let skillsScore = 100;
  const skillsPlanned = mission.skills?.length || 0;
  if (skillsPlanned > 0) {
    const skillsCompleted = (actuals.skills || []).length;
    skillsScore = Math.min(100, (skillsCompleted / skillsPlanned) * 100);
  }

  // 4. Core Subjects (15% weight)
  let coreScore = 100;
  const corePlannedCount = mission.coreSubjects?.length || 0;
  if (corePlannedCount > 0) {
    let accumulatedRatioSum = 0;
    const actCore = actuals.coreSubjects || [];
    for (const plannedSub of mission.coreSubjects) {
      const matchingActual = actCore.find((a: any) => a.subject === plannedSub.subject);
      const actualEff = matchingActual ? Number(matchingActual.actualEffort) || 0 : 0;
      const plannedEff = Number(plannedSub.plannedEffort) || 50;
      accumulatedRatioSum += Math.min(100, (actualEff / plannedEff) * 100);
    }
    coreScore = accumulatedRatioSum / corePlannedCount;
  }

  // 5. Communication (10% weight)
  let commScore = 100;
  const commPlannedCount = mission.communication?.options?.length || 0;
  if (commPlannedCount > 0) {
    const commAct = actuals.communication || {};
    const actualCompleted = (commAct.options || []).length;
    const tasksPoints = (actualCompleted / commPlannedCount) * 80;
    const actualRating = Number(commAct.confidenceRating) || 3;
    const confidencePoints = (actualRating / 5) * 20;
    commScore = Math.min(100, tasksPoints + confidencePoints);
  }

  // 6. Aptitude (10% weight)
  let aptScore = 100;
  const aptPlanned = mission.aptitude?.plannedQuestions || 0;
  if (aptPlanned > 0) {
    const aptAct = actuals.aptitude || {};
    const aptCompleted = Number(aptAct.actualQuestions) || 0;
    aptScore = Math.min(100, (aptCompleted / aptPlanned) * 100);
  }

  return {
    dsa: dsaScore,
    dev: devScore,
    skills: skillsScore,
    core: coreScore,
    comm: commScore,
    apt: aptScore,
  };
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

    // Fetch user's completed / missed history
    const allMissions = await DailyMission.find({ userId: user._id }).sort({ dateString: 1 });

    const totalActiveDays = allMissions.filter(m => m.isCompleted && !m.isMissed).length;
    const averageDdsccScore = totalActiveDays > 0
      ? Math.round(
          allMissions
            .filter(m => m.isCompleted && !m.isMissed)
            .reduce((sum, m) => sum + (m.ddsccScore || 0), 0) / totalActiveDays
        )
      : 0;

    // 1. Weekly Trend Data (last 7 completed/missed days)
    const last7Days = allMissions.slice(-7).map((m) => ({
      date: m.dateString.slice(5), // MM-DD formatting for chart
      score: m.ddsccScore || 0,
      isMissed: m.isMissed,
    }));

    // 2. Month-over-Month Growth Calculation
    const today = new Date();
    const currentMonthPrefix = today.toISOString().slice(0, 7); // e.g. YYYY-MM
    
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthPrefix = prevMonthDate.toISOString().slice(0, 7);

    const currentMonthMissions = allMissions.filter(
      (m) => m.dateString.startsWith(currentMonthPrefix) && m.isCompleted && !m.isMissed
    );
    const prevMonthMissions = allMissions.filter(
      (m) => m.dateString.startsWith(prevMonthPrefix) && m.isCompleted && !m.isMissed
    );

    const currentMonthAvg = currentMonthMissions.length > 0
      ? currentMonthMissions.reduce((sum, m) => sum + m.ddsccScore, 0) / currentMonthMissions.length
      : 0;

    const prevMonthAvg = prevMonthMissions.length > 0
      ? prevMonthMissions.reduce((sum, m) => sum + m.ddsccScore, 0) / prevMonthMissions.length
      : 0;

    let growthPercentage = 0;
    if (prevMonthAvg > 0) {
      growthPercentage = Math.round(((currentMonthAvg - prevMonthAvg) / prevMonthAvg) * 100);
    } else if (currentMonthAvg > 0) {
      growthPercentage = 100; // 100% growth since prev month had 0
    }

    // 3. GitHub Heatmap Grid (Last 90 Days)
    const heatmapGrid: Record<string, number> = {};
    const dateCursor = new Date();
    dateCursor.setDate(dateCursor.getDate() - 89); // 90 days ago

    for (let i = 0; i < 90; i++) {
      const dateStr = getISTDateString(dateCursor);
      const match = allMissions.find((m) => m.dateString === dateStr);
      heatmapGrid[dateStr] = match ? match.ddsccScore || 0 : -1; // -1 means no mission created
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    // 4. Category Lifetime Averages
    let dsaTotal = 0, devTotal = 0, skillsTotal = 0, coreTotal = 0, commTotal = 0, aptTotal = 0;
    let categoryDaysCount = 0;
    let skillsPlannedCount = 0;
    let skillsCompletedCount = 0;

    for (const mission of allMissions) {
      if (mission.isCompleted && !mission.isMissed) {
        const scores = evaluateCategoryScores(mission);
        dsaTotal += scores.dsa;
        devTotal += scores.dev;
        skillsTotal += scores.skills;
        coreTotal += scores.core;
        commTotal += scores.comm;
        aptTotal += scores.apt;
        categoryDaysCount++;

        // Skills stats specifically for insights
        skillsPlannedCount += mission.skills?.length || 0;
        skillsCompletedCount += (mission.eodActuals?.skills || []).length;
      }
    }

    const categoryAverages = {
      dsa: categoryDaysCount > 0 ? Math.round(dsaTotal / categoryDaysCount) : 0,
      development: categoryDaysCount > 0 ? Math.round(devTotal / categoryDaysCount) : 0,
      skills: categoryDaysCount > 0 ? Math.round(skillsTotal / categoryDaysCount) : 0,
      core: categoryDaysCount > 0 ? Math.round(coreTotal / categoryDaysCount) : 0,
      communication: categoryDaysCount > 0 ? Math.round(commTotal / categoryDaysCount) : 0,
      aptitude: categoryDaysCount > 0 ? Math.round(aptTotal / categoryDaysCount) : 0,
    };

    // 5. Dynamic Data-Driven Insights compiler
    const insights: string[] = [];

    if (categoryDaysCount > 0) {
      // Find strongest/weakest category
      const categoriesList = [
        { name: 'DSA', score: categoryAverages.dsa },
        { name: 'Development', score: categoryAverages.development },
        { name: 'Skills Practice', score: categoryAverages.skills },
        { name: 'Core CS Fundamentals', score: categoryAverages.core },
        { name: 'Communication', score: categoryAverages.communication },
        { name: 'Aptitude & Analytical', score: categoryAverages.aptitude },
      ];

      categoriesList.sort((a, b) => b.score - a.score);
      const strongest = categoriesList[0];
      const weakest = categoriesList[categoriesList.length - 1];

      insights.push(`${strongest.name} is your strongest discipline, with an elite average score of ${strongest.score}%.`);
      if (weakest.score < 60) {
        insights.push(`${weakest.name} needs revision, currently averaging ${weakest.score}%. Dedicate more morning focus hours here.`);
      }

      // Skills completion rate insight
      if (skillsPlannedCount > 0) {
        const rate = Math.round((skillsCompletedCount / skillsPlannedCount) * 100);
        insights.push(`You complete your target technical skills ${rate}% of the time.`);
      }

      // Weekday vs Weekend checks
      let weekdaySum = 0, weekdayCount = 0, weekendSum = 0, weekendCount = 0;
      for (const m of allMissions) {
        if (m.isCompleted && !m.isMissed) {
          const dateObj = new Date(m.dateString);
          const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
          if (day === 0 || day === 6) {
            weekendSum += m.ddsccScore;
            weekendCount++;
          } else {
            weekdaySum += m.ddsccScore;
            weekdayCount++;
          }
        }
      }

      const weekdayAvg = weekdayCount > 0 ? weekdaySum / weekdayCount : 0;
      const weekendAvg = weekendCount > 0 ? weekendSum / weekendCount : 0;

      if (weekdayAvg > weekendAvg + 5) {
        insights.push(`Your discipline shimmers on weekdays—protect weekend routines to avoid score decay.`);
      } else {
        insights.push(`You perform best on weekends - your Saturday/Sunday study sessions show incredible consistency.`);
      }
    }

    if (user.longestStreak > 0) {
      insights.push(`You successfully maintained a streak for ${user.longestStreak} consecutive days. Relive that beast mode today.`);
    }

    if (insights.length === 0) {
      insights.push("Continue sealing daily morning oaths and night reflections to unlock dynamic growth insights.");
    }

    // 6. Chronological Activity Timeline Feed
    const activityTimeline: any[] = [];
    // Loop backwards to get newest days first
    for (let i = allMissions.length - 1; i >= 0; i--) {
      const m = allMissions[i];
      const dateLabel = m.dateString;
      
      if (m.isMissed) {
        activityTimeline.push({
          id: `${m._id}-missed`,
          date: dateLabel,
          type: 'missed',
          message: `Missed daily oath commitment. Streak decay triggered.`,
        });
      } else {
        if (m.isCompleted) {
          activityTimeline.push({
            id: `${m._id}-eod`,
            date: dateLabel,
            type: 'eod',
            message: `Night reflection sealed with DDSCC discipline score of ${m.ddsccScore}%.`,
          });
          
          const act = m.eodActuals || {};
          
          // DSA Target
          const actDsa = act.dsa || {};
          const dsaCount = (Number(actDsa.easy) || 0) + (Number(actDsa.medium) || 0) + (Number(actDsa.hard) || 0);
          if (dsaCount > 0) {
            activityTimeline.push({
              id: `${m._id}-dsa`,
              date: dateLabel,
              type: 'dsa',
              message: `Completed DSA Target: solved ${dsaCount} computer algorithm problems.`,
            });
          }
          
          // Development Built
          if (m.development?.isBuilding) {
            const devAct = act.development || {};
            activityTimeline.push({
              id: `${m._id}-dev`,
              date: dateLabel,
              type: 'dev',
              message: `Project Built: completed coding build for "${m.development.projectName}".`,
            });
            if (devAct.githubPushed) {
              activityTimeline.push({
                id: `${m._id}-github`,
                date: dateLabel,
                type: 'github',
                message: `GitHub Push Completed: code uploaded to repository.`,
              });
            }
          }
          
          // Skills Goal
          const actSkills = act.skills || [];
          if (actSkills.length > 0) {
            activityTimeline.push({
              id: `${m._id}-skills`,
              date: dateLabel,
              type: 'skills',
              message: `Completed Skill Goal: practiced ${actSkills.length} technical skills.`,
            });
          }

          // Aptitude Goal
          const actApt = act.aptitude || {};
          const aptCount = Number(actApt.actualQuestions) || 0;
          if (aptCount > 0) {
            activityTimeline.push({
              id: `${m._id}-apt`,
              date: dateLabel,
              type: 'aptitude',
              message: `Completed Aptitude Goal: answered ${aptCount} analytical questions.`,
            });
          }

          // Communication
          const actComm = act.communication || {};
          if ((actComm.options || []).length > 0) {
            activityTimeline.push({
              id: `${m._id}-comm`,
              date: dateLabel,
              type: 'comm',
              message: `Completed Communication Goal: speaking mock completed.`,
            });
          }
        }
        
        // Morning oath is always logged!
        activityTimeline.push({
          id: `${m._id}-oath`,
          date: dateLabel,
          type: 'mission',
          message: `Morning Placement Oath sealed for today's goals.`,
        });
      }
    }
    
    // Slice to the most recent 12 timeline actions to fit visual layout
    const slicedTimeline = activityTimeline.slice(0, 12);

    return NextResponse.json({
      success: true,
      stats: {
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        averageDdsccScore,
        totalActiveDays,
      },
      weeklyTrend: last7Days,
      monthlyPerformance: {
        currentMonthAvg: Math.round(currentMonthAvg),
        prevMonthAvg: Math.round(prevMonthAvg),
        growthPercentage,
      },
      heatmap: heatmapGrid,
      categoryAverages,
      insights,
      activityTimeline: slicedTimeline,
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return NextResponse.json({ error: 'Failed to aggregate analytics.' }, { status: 500 });
  }
}
