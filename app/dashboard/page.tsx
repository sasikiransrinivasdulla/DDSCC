'use client';

import * as React from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProgressCircle } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/gtag';
import { 
  Flame, 
  Award, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  Code,
  Layers,
  Cpu,
  Database,
  MessageSquare,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DisciplineKey } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [todayMission, setTodayMission] = React.useState<any>(null);
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState('');
  const [hoveredDay, setHoveredDay] = React.useState<any>(null);

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date();
      deadline.setHours(23, 59, 59, 999);
      
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00h 00m 00s');
        return;
      }
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');
      
      setTimeLeft(`${hh}h ${mm}m ${ss}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const { 
    profile, 
    setProfile
  } = useProgressStore();

  React.useEffect(() => {
    setIsMounted(true);
    const checkSession = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch('/api/auth/me');
        const meTime = performance.now();
        if (!response.ok) {
          router.push('/auth');
          return;
        }

        const data = await response.json();
        if (data.success && data.user) {
          if (data.user.isFirstLogin) {
            router.push('/onboarding');
            return;
          }

          // 1. Sync streaks (extremely fast now, typically <5ms due to O(1) set optimization)
          const syncRes = await fetch('/api/sync-streaks');
          const syncTime = performance.now();

          // 2. Fetch live analytics payload & today's daily mission in parallel!
          const [analyticsRes, missionCheck] = await Promise.all([
            fetch('/api/analytics'),
            fetch('/api/daily-oath')
          ]);
          const parallelTime = performance.now();

          // Parse analytics payload
          if (analyticsRes.ok) {
            const aData = await analyticsRes.json();
            if (aData.success) {
              setAnalyticsData(aData);
              setProfile({
                name: data.user.username,
                role: data.user.targetRole || 'Aspiring Computer Engineer',
                oathText: data.user.motivationText || 'I will dedicate focused, deliberate effort toward my placement goals today. No excuses, no shortcuts, just relentless self-growth.',
                streakDays: aData.stats.currentStreak,
              });

              // Track dynamic achievement unlocks in GA4
              if (Array.isArray(aData.achievements)) {
                aData.achievements.forEach((ach: any) => {
                  if (ach.unlocked) {
                    trackEvent('achievement_unlocked', 'Achievement', ach.title);
                  }
                });
              }
            }
          }
          setAnalyticsLoading(false);

          // Parse daily oath check
          if (missionCheck.ok) {
            const missionData = await missionCheck.json();
            if (!missionData.exists) {
              router.push('/daily-oath');
              return;
            } else {
              setTodayMission(missionData.mission);
            }
          }

          const endTime = performance.now();
          console.log(`[PERFORMANCE LOG] Dashboard Hydration & Data Loading:
          - /api/auth/me Validation: ${(meTime - startTime).toFixed(2)}ms
          - /api/sync-streaks Execution: ${(syncTime - meTime).toFixed(2)}ms
          - Parallel Data Hydration (/api/analytics & /api/daily-oath): ${(parallelTime - syncTime).toFixed(2)}ms
          - Total Client Dashboard Loading Duration: ${(endTime - startTime).toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Session hydration failed:', error);
      } finally {
        setIsPageLoading(false);
      }
    };

    checkSession();
  }, [router, setProfile]);


  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: 'Beast Mode', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20', dot: 'bg-emerald-400', desc: "You're becoming harder to stop." };
    if (score >= 75) return { label: 'Strong Day', color: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-950/20', dot: 'bg-green-400', desc: "You're becoming harder to stop." };
    if (score >= 60) return { label: 'Consistent', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-950/20', dot: 'bg-amber-400', desc: "Consistency compiles progress." };
    if (score >= 40) return { label: 'Could Be Better', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-950/20', dot: 'bg-orange-400', desc: "Tomorrow is another chance to show up." };
    return { label: 'Show Up Tomorrow', color: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-950/20', dot: 'bg-red-400', desc: "Consistency resets. Growth doesn't." };
  };

  // Motivational quote rotates depending on progress level
  const getMotivationalQuote = () => {
    if (analyticsData?.motivationSlogan) {
      return `“${analyticsData.motivationSlogan}”`;
    }
    if (todayMission?.isCompleted) {
      const badge = getPerformanceBadge(todayMission.ddsccScore);
      return `“${badge.desc} Today's sealed score: ${todayMission.ddsccScore}%.”`;
    }
    return "“Great programs are written one character at a time. Show up, code, repeat.”";
  };

  // Render icons for disciplines dynamically
  const renderDisciplineIcon = (key: DisciplineKey) => {
    switch (key) {
      case 'dsa': return <Code className="w-4 h-4" />;
      case 'development': return <Layers className="w-4 h-4" />;
      case 'skills': return <Cpu className="w-4 h-4" />;
      case 'core': return <Database className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'aptitude': return <Award className="w-4 h-4" />;
    }
  };

  // Render descriptive names
  const getDisciplineName = (key: DisciplineKey) => {
    if (key === 'core') return 'Core CS';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Real 90-day consistency history squares from MongoDB data
  const renderRealHeatmapGrid = () => {
    if (!analyticsData || !analyticsData.heatmap) {
      // Return 90 mock loading blocks
      return Array.from({ length: 90 }).map((_, i) => (
        <span key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-[#111111] animate-pulse border border-white/5" />
      ));
    }
    
    const heatmapKeys = Object.keys(analyticsData.heatmap).sort(); // YYYY-MM-DD keys sorted ascending
    // Get the last 90 days
    const last90Keys = heatmapKeys.slice(-90);
    
    return last90Keys.map((dateStr) => {
      const score = analyticsData.heatmap[dateStr];
      let colorClass = 'bg-[#0a0a0a] border border-white/[0.02]'; // Missing day / No mission
      let scoreLabel = 'No commitment';
      
      if (score >= 0) {
        if (score === 0) {
          colorClass = 'bg-[#131313] border border-white/5 hover:border-white/20';
          scoreLabel = '0% Score';
        } else if (score > 0 && score <= 20) {
          colorClass = 'bg-[#131313] border border-white/5 hover:border-white/20';
          scoreLabel = `Score: ${score}%`;
        } else if (score > 20 && score <= 40) {
          colorClass = 'bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 hover:border-emerald-500/35 hover:bg-emerald-500/15';
          scoreLabel = `Score: ${score}%`;
        } else if (score > 40 && score <= 60) {
          colorClass = 'bg-emerald-500/30 border border-emerald-500/25 hover:border-emerald-500/45 hover:bg-emerald-500/35';
          scoreLabel = `Score: ${score}%`;
        } else if (score > 60 && score <= 75) {
          colorClass = 'bg-emerald-500/55 border border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/60';
          scoreLabel = `Score: ${score}%`;
        } else if (score > 75 && score <= 90) {
          colorClass = 'bg-emerald-500/80 border border-emerald-500/60 hover:border-emerald-500/90 hover:bg-emerald-500/80';
          scoreLabel = `Score: ${score}% (Strong Day)`;
        } else if (score > 90 && score <= 100) {
          colorClass = 'bg-primary-accent border border-primary-accent/80 shadow-[0_0_8px_rgba(16,185,129,0.15)] hover:shadow-[0_0_12px_rgba(16,185,129,0.45)] hover:border-white';
          scoreLabel = `Score: ${score}% (Beast Mode)`;
        }
      }
      
      const dateObj = new Date(dateStr);
      const displayDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });
      
      return (
        <motion.div 
          key={dateStr}
          whileHover={{ scale: 1.25, zIndex: 10 }}
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded transition-all duration-300 cursor-pointer ${colorClass}`}
          onMouseEnter={() => setHoveredDay({ date: displayDate, scoreText: scoreLabel })}
          onMouseLeave={() => setHoveredDay(null)}
          onTouchStart={() => setHoveredDay({ date: displayDate, scoreText: scoreLabel })}
        />
      );
    });
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center relative">
        {/* Soft background glow */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-primary-accent/10 blur-[80px] pointer-events-none" />
        
        <div className="text-primary-accent font-black text-3xl tracking-widest font-heading animate-pulse relative z-10">
          DDSCC
        </div>
        <div className="text-[10px] text-muted-text uppercase font-bold tracking-widest mt-3 animate-pulse relative z-10">
          Hydrating chamber...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* WELCOME HEADER CONTAINER */}
        <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle/40 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight uppercase">
                Good Evening, {profile.name}
              </h1>
              <Sparkles className="w-5 h-5 text-primary-accent animate-pulse" />
            </div>
            <p className="text-sm font-bold text-primary-accent mt-0.5 tracking-wide">
              Future {profile.role} 🚀
            </p>
            <p className="text-xs italic text-muted-text mt-1.5 max-w-2xl">
              {getMotivationalQuote()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text bg-secondary-surface px-3 py-1.5 rounded-lg border border-border-subtle/50">
              Path: {profile.role}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SECTION (SCORE CARD, STREAK, QUICK FOCUS GRID) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TIME-SEAL NIGHT REFLECTION BANNER OR COMPLETED METRICS */}
            {todayMission && !todayMission.isCompleted && (
              <div className="mb-6">
                <Card className="p-6 bg-card-surface border-primary-accent/30 relative overflow-hidden glow-emerald-sm">
                  <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-primary-accent" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent block">
                        Discipline Seal Needed
                      </span>
                      <h3 className="text-base font-black text-white uppercase tracking-wider font-heading">
                        Did you actually show up today?
                      </h3>
                      <p className="text-xs text-muted-text max-w-xl leading-relaxed">
                        Morning commitments are registered. Seal your EOD actual accomplishments honestly to calculate today&apos;s score and protect your streak.
                      </p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="shrink-0 text-[10px] py-3.5 px-6 uppercase font-extrabold tracking-widest font-heading animate-pulse"
                      onClick={() => router.push('/daily-review')}
                    >
                      Begin Night Reflection <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
              {/* STATS HEADERS (CIRCULAR PROGRESS & STREAK DISPLAY) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* TODAY'S SCORE CIRCULAR RING CARD */}
              <Card glowEffect={todayMission?.isCompleted} className="flex items-center justify-between p-4 min-h-[112px] bg-card-surface border-border-subtle hover:border-primary-accent/15 transition-all duration-300">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text">
                    Today&apos;s Score
                  </span>
                  <span className="text-xs font-black text-white mt-0.5 font-heading uppercase tracking-wider truncate">
                    {todayMission?.isCompleted ? getPerformanceBadge(todayMission.ddsccScore).label : 'Pending Seal'}
                  </span>
                  <div className="mt-2 flex items-center">
                    <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                      todayMission 
                        ? todayMission.isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                        : 'bg-red-500/10 border-red-500/25 text-red-400'
                    }`}>
                      Status: {todayMission ? (todayMission.isCompleted ? 'Completed' : 'In Progress') : 'Not Started'}
                    </span>
                  </div>
                </div>
                <ProgressCircle 
                  value={todayMission?.isCompleted ? todayMission.ddsccScore : 0} 
                  size={64} 
                  strokeWidth={5} 
                  textSub="DDSCC" 
                />
              </Card>

              {/* CURRENT STREAK CARD */}
              <Card className="flex flex-col justify-between p-4 min-h-[112px] bg-card-surface border-border-subtle hover:border-orange-500/10 transition-all duration-300">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text">
                    Discipline Streak
                  </span>
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="mt-2.5">
                  <span className="text-xl font-black text-white font-heading block">
                    🔥 {profile.streakDays} Days
                  </span>
                  <span className="text-[8px] uppercase font-bold text-muted-text/80 tracking-widest mt-0.5 block">
                    Active Streak
                  </span>
                </div>
              </Card>

              {/* BEST STREAK CARD */}
              <Card className="flex flex-col justify-between p-4 min-h-[112px] bg-card-surface border-border-subtle hover:border-primary-accent/10 transition-all duration-300">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text">
                    Best Streak
                  </span>
                  <Award className="w-3.5 h-3.5 text-primary-accent" />
                </div>
                <div className="mt-2.5">
                  <span className="text-xl font-black text-white font-heading block">
                    🏆 {analyticsData?.stats?.longestStreak || 0} Days
                  </span>
                  <span className="text-[8px] uppercase font-bold text-muted-text/80 tracking-widest mt-0.5 block">
                    Lifetime Record
                  </span>
                </div>
              </Card>

              {/* TODAY'S STATUS & DEADLINE TIMER CARD */}
              <Card className="flex flex-col justify-between p-4 min-h-[112px] bg-card-surface border-border-subtle hover:border-primary-accent/10 transition-all duration-300">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text">
                    Deadline & Status
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    !todayMission ? 'bg-red-500' : todayMission.isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  }`} />
                </div>
                <div className="mt-2 min-w-0">
                  {!todayMission ? (
                    <>
                      <span className="text-[11px] font-extrabold text-red-500 font-heading block truncate uppercase">
                        No Mission
                      </span>
                      <p className="text-[8px] text-muted-text leading-tight mt-0.5 select-none">
                        Seal commitments now.
                      </p>
                    </>
                  ) : todayMission.isCompleted ? (
                    <>
                      <span className="text-[11px] font-extrabold text-emerald-400 font-heading block truncate uppercase">
                        Sealed ✅
                      </span>
                      <p className="text-[8px] text-muted-text leading-tight mt-0.5 select-none">
                        Locked: {new Date(todayMission.updatedAt || todayMission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-black text-white font-heading tracking-wider block font-mono">
                        ⏳ {timeLeft}
                      </span>
                      <span className="text-[8px] uppercase font-extrabold text-amber-400 tracking-wider mt-0.5 block">
                        Reflection Pending
                      </span>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* PILLAR CAPACITIES INDICES (DYNAMIC FROM HISTORICAL AVERAGES) */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-extrabold tracking-widest uppercase text-muted-text font-heading">
                  Pillar Capacities (Historical 30-Day Averages)
                </h2>
                <span className="text-xs text-primary-accent italic font-semibold">
                  Compounded Consistency indices
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(['dsa', 'development', 'skills', 'core', 'communication', 'aptitude'] as DisciplineKey[]).map((key) => {
                  const val = analyticsData?.categoryAverages?.[key === 'core' ? 'core' : (key === 'development' ? 'development' : key)] || 0;
                  return (
                    <Card key={key} className="bg-card-surface border-border-subtle p-4 flex flex-col justify-between h-32 hover:border-primary-accent/20 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-primary-accent bg-primary-accent/5 border border-primary-accent/15 px-2.5 py-1 rounded-lg">
                          {renderDisciplineIcon(key)}
                          <span className="text-xs font-black uppercase tracking-wider font-heading">
                            {key.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-lg font-black text-white font-heading">
                          {val}%
                        </span>
                      </div>

                      {/* Title & Level Indicator */}
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-primary-text leading-tight">
                            {getDisciplineName(key)}
                          </h3>
                          <p className="text-[9px] text-muted-text mt-0.5 uppercase tracking-wider font-bold">
                            {val >= 90 ? 'Mastery Level' : val >= 75 ? 'Excellent' : val >= 50 ? 'Developing' : 'Requires Focus'}
                          </p>
                        </div>
                      </div>

                      {/* Small inline visual progress line */}
                      <div className="w-full bg-secondary-surface h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-primary-accent h-full transition-all duration-300"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

                      {/* GORGEOUS ANALYTICS TREND (RECHARTS DYNAMIC SMOOTH AREA CHART) */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-accent" />
                  <h2 className="text-sm font-extrabold tracking-widest uppercase text-muted-text font-heading">
                    Placement Readiness Trend
                  </h2>
                </div>
                <span className="text-xs text-muted-text font-semibold">
                  Last 7 preparation Cycles
                </span>
              </div>

              <Card className="p-6 bg-card-surface border-border-subtle">
                {analyticsLoading ? (
                  <div className="h-44 w-full flex items-center justify-center text-xs text-muted-text">
                    <div className="animate-pulse">Loading live consistency metrics...</div>
                  </div>
                ) : !analyticsData || analyticsData.weeklyTrend?.length === 0 ? (
                  <div className="h-44 w-full flex items-center justify-center text-xs text-muted-text">
                    No cycle history logged yet. Complete today&apos;s evening reflection to render your trend.
                  </div>
                ) : (
                  <div className="h-44 w-full">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analyticsData.weeklyTrend}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#555" 
                            tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#555" 
                            domain={[0, 100]}
                            tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0a0a0a', 
                              borderColor: 'rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                            labelStyle={{ color: '#10B981', fontWeight: 800 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#areaGlow)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
                
                {/* Legend indicator */}
                <div className="mt-6 flex justify-between items-center text-[10px] text-muted-text border-t border-border-subtle/30 pt-3">
                  <span>Compound consistency threshold: 60% standard capacity</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary-accent inline-block" />
                    <span className="font-semibold text-white">
                      Daily Prep Score (7d Avg: {analyticsData ? analyticsData.stats.averageDdsccScore : 0}%)
                    </span>
                  </span>
                </div>
              </Card>
            </section>

            {/* WEEKLY REFLECTION CARD */}
            {analyticsData?.weeklyReflection && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-accent" />
                  <h2 className="text-sm font-extrabold tracking-widest uppercase text-muted-text font-heading">
                    Weekly Placement Reflection
                  </h2>
                </div>

                <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="p-3 bg-[#070707] rounded-lg border border-border-subtle/50 text-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                        7-Day Average
                      </span>
                      <span className="text-xl font-black text-primary-accent font-heading block">
                        {analyticsData.weeklyReflection.averageScore}%
                      </span>
                    </div>

                    <div className="p-3 bg-[#070707] rounded-lg border border-border-subtle/50 text-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                        Weekly Best
                      </span>
                      <span className="text-xl font-black text-white font-heading block">
                        {analyticsData.weeklyReflection.bestDayScore}%
                      </span>
                    </div>

                    <div className="p-3 bg-[#070707] rounded-lg border border-border-subtle/50 text-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                        Strongest Area
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 font-heading block truncate mt-1">
                        {analyticsData.weeklyReflection.strongestArea}
                      </span>
                    </div>

                    <div className="p-3 bg-[#070707] rounded-lg border border-border-subtle/50 text-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                        Focus Needed
                      </span>
                      <span className="text-[10px] font-black text-orange-400 font-heading block truncate mt-1">
                        {analyticsData.weeklyReflection.weakestArea}
                      </span>
                    </div>

                  </div>
                </Card>
              </section>
            )}

            {/* STREAK PROTECTION CARD */}
            {analyticsData && (
              <div className="mt-4">
                {analyticsData.stats.currentStreak === 0 && analyticsData.stats.longestStreak > 0 ? (
                  <Card className="p-5 bg-card-surface border-orange-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-orange-500" />
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 text-lg">
                        🛡️
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-orange-400 block font-heading">
                          Streak Shield Activated
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                          One missed day does not define your journey
                        </h4>
                        <p className="text-xs text-muted-text leading-relaxed">
                          Your streak has reset, but your knowledge, progress, and capabilities remain intact. The covenant starts fresh today. Seal your morning oath to build new momentum!
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : !todayMission?.isCompleted && analyticsData.stats.currentStreak > 0 ? (
                  <Card className="p-5 bg-card-surface border-primary-accent/25 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-primary-accent" />
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent shrink-0 text-lg">
                        ⚡
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent block font-heading">
                          Streak Active & Protected
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                          Defend your {analyticsData.stats.currentStreak}-day consistency streak!
                        </h4>
                        <p className="text-xs text-muted-text leading-relaxed">
                          Your active placement streak is secured. Seal your EOD night reflection when your tasks are done to successfully roll it over to tomorrow!
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : null}
              </div>
            )}

            {/* PRIMARY 90-DAY HISTORY CONSISTENCY HEATMAP */}
            <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
              <CardHeader className="p-0 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-accent" />
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                      90-Day Consistency Heatmap Grid
                    </CardTitle>
                  </div>
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text font-heading bg-secondary-surface px-2.5 py-1 rounded border border-border-subtle/50">
                    Live Preparation Matrix
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                {/* 90 block grids */}
                <div className="flex flex-wrap gap-2 justify-center py-2 bg-[#060606] p-4 rounded-xl border border-border-subtle/40">
                  {renderRealHeatmapGrid()}
                </div>

                {/* Dynamic Interactive HUD Overlay */}
                <div className="text-center py-2 h-7 flex items-center justify-center border-t border-border-subtle/30 bg-[#050505] rounded-lg border border-border-subtle/45 select-none">
                  {hoveredDay ? (
                    <span className="text-[10px] text-primary-accent font-extrabold uppercase tracking-widest animate-pulse">
                      ⚡ {hoveredDay.date} : {hoveredDay.scoreText}
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider">
                      Hover cells to inspect placement ledger coefficient
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-text font-bold uppercase tracking-wider border-t border-border-subtle/30 pt-3">
                  <span>Less Active</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#0a0a0a] border border-white/[0.02]" />
                    <span className="w-2.5 h-2.5 rounded bg-[#131313] border border-white/5" />
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/15" />
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/25" />
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/55 border border-emerald-500/40" />
                    <span className="w-2.5 h-2.5 rounded bg-primary-accent border border-primary-accent/80 shadow-[0_0_10px_rgba(16,185,129,0.15)]" />
                  </div>
                  <span>Highly Consistent</span>
                </div>
              </CardContent>
            </Card>

            {/* SPACIOUS REAL ACTIVITY TIMELINE */}
            <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text block">
                    Discipline Ledger
                  </span>
                  <CardTitle className="text-sm font-bold text-white font-heading mt-0.5 uppercase tracking-wider">
                    Placement Journey Timeline Logs
                  </CardTitle>
                </div>
                <span className="text-[9px] uppercase font-extrabold text-primary-accent bg-primary-accent/5 px-2 py-0.5 rounded border border-primary-accent/15">
                  Dynamic Logs
                </span>
              </CardHeader>

              <CardContent className="p-0">
                {analyticsLoading ? (
                  <div className="py-8 text-center text-xs text-muted-text animate-pulse">
                    Retrieving activities from placement ledger...
                  </div>
                ) : analyticsData?.activityTimeline && analyticsData.activityTimeline.length > 0 ? (
                  <div>
                    <div className="relative border-l border-border-subtle/40 ml-3 pl-6 space-y-5 py-1">
                      {analyticsData.activityTimeline.slice(0, 5).map((act: any) => {
                        // Determine badge/color based on type
                        let dotColor = 'bg-muted-text';
                        let iconLabel = 'Commit';
                        let bgTint = 'bg-[#060606]';
                        let borderTint = 'border-border-subtle/30';
                        if (act.type === 'missed') {
                          dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                          iconLabel = 'Decay';
                          bgTint = 'bg-red-500/5';
                          borderTint = 'border-red-500/20';
                        } else if (act.type === 'eod') {
                          dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]';
                          iconLabel = 'Seal';
                          bgTint = 'bg-emerald-500/5';
                          borderTint = 'border-emerald-500/20';
                        } else if (act.type === 'dsa') {
                          dotColor = 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]';
                          iconLabel = 'DSA';
                          bgTint = 'bg-blue-500/5';
                          borderTint = 'border-blue-500/20';
                        } else if (act.type === 'dev' || act.type === 'github') {
                          dotColor = 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]';
                          iconLabel = 'Dev';
                          bgTint = 'bg-purple-500/5';
                          borderTint = 'border-purple-500/20';
                        } else if (act.type === 'skills') {
                          dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
                          iconLabel = 'Skill';
                          bgTint = 'bg-amber-500/5';
                          borderTint = 'border-amber-500/20';
                        } else if (act.type === 'aptitude') {
                          dotColor = 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.4)]';
                          iconLabel = 'Apt';
                          bgTint = 'bg-indigo-500/5';
                          borderTint = 'border-indigo-500/20';
                        } else if (act.type === 'comm') {
                          dotColor = 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.4)]';
                          iconLabel = 'Comm';
                          bgTint = 'bg-pink-500/5';
                          borderTint = 'border-pink-500/20';
                        } else if (act.type === 'mission') {
                          dotColor = 'bg-primary-accent shadow-[0_0_8px_rgba(16,185,129,0.4)]';
                          iconLabel = 'Oath';
                          bgTint = 'bg-primary-accent/5';
                          borderTint = 'border-primary-accent/20';
                        }
                        
                        const dateObj = new Date(act.date);
                        const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

                        return (
                          <div key={act.id} className="relative group">
                            {/* Timeline bullet element */}
                            <span className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-background transition-all duration-300 group-hover:scale-125 ${dotColor}`} />
                            
                            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-xl border ${bgTint} ${borderTint} hover:border-primary-accent/25 hover:bg-[#080808]/80 transition-all duration-300`}>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white tracking-wide">
                                  {act.message}
                                </p>
                                <span className="text-[8.5px] uppercase font-extrabold text-muted-text tracking-widest block font-heading">
                                  Type: {iconLabel}
                                </span>
                              </div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-[#9E9E9E] shrink-0 font-mono">
                                🗓️ {formattedDate}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {analyticsData.activityTimeline.length > 5 && (
                      <div className="mt-5 pt-4 border-t border-border-subtle/20 flex justify-end">
                        <button
                          onClick={() => router.push('/profile')}
                          className="text-[10px] uppercase font-extrabold tracking-widest font-heading text-primary-accent hover:text-white flex items-center gap-1 transition-colors cursor-pointer animate-pulse"
                        >
                          View Full Timeline →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#060606] rounded-xl border border-border-subtle/40 p-4">
                    <p className="text-xs text-muted-text leading-relaxed font-semibold">
                      No chronological activities committed to ledger yet. Commit to a daily oath to register logs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SECTION (OATH CARD, TASKS CHECKLIST, HISTORY GRID) */}
          <div className="lg:col-span-4 space-y-6">

            {/* WHY YOU STARTED / PERSONAL ANCHOR */}
            <Card className="p-6 bg-card-surface border-border-subtle/80">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary-accent font-heading">
                Your Anchor
              </span>
              <h4 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1">
                Why You Started
              </h4>
              <p className="text-sm italic text-muted-text/90 leading-relaxed bg-[#050505] p-3 rounded-lg border border-border-subtle/50 mt-3 select-none">
                &ldquo;{profile.oathText}&rdquo;
              </p>
            </Card>

            {/* TODAY'S MISSION SUMMARY CARD */}
            {todayMission && (
              <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden glow-emerald-sm">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary-accent/30" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-primary-accent font-heading">
                  {todayMission.isCompleted ? "Today's Outcome" : "Today's Intentions"}
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-4">
                  {todayMission.isCompleted ? "Night Reflection" : "Morning Commitment"}
                </h4>

                <div className="space-y-3">
                  {/* DSA targets info */}
                  <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-blue-400 pl-3.5 space-y-1.5 transition-all hover:border-border-subtle">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">💻 DSA Problems</span>
                      <span className="text-primary-accent font-extrabold">
                        {todayMission.isCompleted 
                          ? `${todayMission.eodActuals?.dsa?.total || 0} / ${todayMission.dsaTargets?.total || 0} Solved` 
                          : `${todayMission.dsaTargets?.total || 0} Target`}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] text-muted-text uppercase font-bold">
                      <span>Easy: {todayMission.isCompleted ? todayMission.eodActuals?.dsa?.easy || 0 : todayMission.dsaTargets?.easy || 0}</span>
                      <span>•</span>
                      <span>Medium: {todayMission.isCompleted ? todayMission.eodActuals?.dsa?.medium || 0 : todayMission.dsaTargets?.medium || 0}</span>
                      <span>•</span>
                      <span>Hard: {todayMission.isCompleted ? todayMission.eodActuals?.dsa?.hard || 0 : todayMission.dsaTargets?.hard || 0}</span>
                    </div>
                  </div>

                  {/* Dev targets info */}
                  {todayMission.development?.isBuilding || todayMission.eodActuals?.development?.projectName ? (
                    <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-purple-400 pl-3.5 space-y-1.5 transition-all hover:border-border-subtle">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span className="truncate">🛠️ Dev: {todayMission.isCompleted ? todayMission.eodActuals.development.projectName : todayMission.development.projectName}</span>
                        <span className="text-primary-accent font-extrabold shrink-0">
                          {todayMission.isCompleted 
                            ? `Rating: ${todayMission.eodActuals.development.satisfactionRating}/5` 
                            : `${todayMission.development.plannedHours}h Plan`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-text leading-relaxed">
                        {todayMission.isCompleted ? todayMission.eodActuals.development.projectDesc : todayMission.development.projectDesc}
                      </p>
                      <div className="flex gap-2 text-[10px] text-muted-text font-bold uppercase pt-0.5">
                        {todayMission.isCompleted ? (
                          <>
                            {todayMission.eodActuals.development.githubPushed && <span>GitHub Pushed</span>}
                            {todayMission.eodActuals.development.githubPushed && todayMission.eodActuals.development.exploreNew && <span>•</span>}
                            {todayMission.eodActuals.development.exploreNew && <span>New Tech</span>}
                          </>
                        ) : (
                          <>
                            {todayMission.development.willPushGithub && <span>Pushing Commits</span>}
                            {todayMission.development.willPushGithub && todayMission.development.exploreNew && <span>•</span>}
                            {todayMission.development.exploreNew && <span>Exploring Tech</span>}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#060606]/40 rounded-xl border border-border-subtle/30 border-l-2 border-l-purple-400/40 pl-3.5 text-center text-xs italic text-muted-text/50">
                      No development builds planned for today.
                    </div>
                  )}

                  {/* Skills tags list */}
                  {todayMission.skills?.length > 0 && (
                    <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-amber-400 pl-3.5 space-y-2 transition-all hover:border-border-subtle">
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">
                        🚀 {todayMission.isCompleted ? "Completed Skills" : "Target Skills"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {todayMission.skills.map((skill: string, i: number) => {
                          const completed = todayMission.isCompleted ? todayMission.eodActuals?.skills?.includes(skill) : false;
                          return (
                            <span 
                              key={i} 
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                todayMission.isCompleted 
                                  ? completed 
                                    ? 'bg-primary-accent/10 border-primary-accent text-white font-extrabold' 
                                    : 'bg-[#050505] border-border-subtle/40 text-muted-text line-through opacity-50'
                                  : 'bg-primary-accent/5 border-primary-accent/15 text-white'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CS subjects list */}
                  {todayMission.coreSubjects?.length > 0 && (
                    <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-cyan-400 pl-3.5 space-y-2 transition-all hover:border-border-subtle">
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">📚 CS Fundamentals</span>
                      <div className="space-y-1.5">
                        {todayMission.coreSubjects.map((sub: any, i: number) => {
                          const matchingActual = todayMission.isCompleted 
                            ? todayMission.eodActuals?.coreSubjects?.find((c: any) => c.subject === sub.subject)
                            : null;
                          return (
                            <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-white">{sub.subject}</span>
                              <span className="text-primary-accent">
                                {todayMission.isCompleted 
                                  ? `Actual: ${matchingActual ? matchingActual.actualEffort : 0}% / Target: ${sub.plannedEffort}%` 
                                  : `${sub.plannedEffort}% Intensity`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Communication focus */}
                  {todayMission.communication?.options?.length > 0 && (
                    <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-pink-400 pl-3.5 space-y-2 transition-all hover:border-border-subtle">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">💬 Communication Focus</span>
                        <span className="text-[9px] font-black text-primary-accent bg-primary-accent/5 border border-primary-accent/10 px-1.5 py-0.5 rounded">
                          Confidence: {todayMission.isCompleted ? todayMission.eodActuals?.communication?.confidenceRating : todayMission.communication.confidenceRating}/5
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {todayMission.communication.options.map((opt: string, i: number) => {
                          const completed = todayMission.isCompleted ? todayMission.eodActuals?.communication?.options?.includes(opt) : false;
                          return (
                            <span 
                              key={i} 
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                todayMission.isCompleted 
                                  ? completed 
                                    ? 'bg-primary-accent/10 border-primary-accent/20 text-white font-extrabold' 
                                    : 'bg-secondary-surface text-muted-text line-through opacity-50'
                                  : 'bg-secondary-surface text-muted-text'
                              }`}
                            >
                              {opt}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Aptitude focus */}
                  {(todayMission.aptitude?.plannedQuestions > 0 || todayMission.eodActuals?.aptitude?.actualQuestions > 0) && (
                    <div className="p-3 bg-[#060606] rounded-xl border border-border-subtle/40 border-l-2 border-l-indigo-400 pl-3.5 space-y-1 transition-all hover:border-border-subtle">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>🎯 Aptitude: {todayMission.isCompleted ? todayMission.eodActuals.aptitude.topicName : todayMission.aptitude.topicName}</span>
                        <span className="text-primary-accent font-extrabold">
                          {todayMission.isCompleted 
                            ? `${todayMission.eodActuals.aptitude.actualQuestions} / ${todayMission.aptitude.plannedQuestions} Solved` 
                            : `${todayMission.aptitude.plannedQuestions} Qs`}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </Card>
            )}

            {/* DAILY REFLECTION SUMMARY TAKEAWAYS */}
            {todayMission && todayMission.isCompleted && (
              <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                  Today&apos;s Seal Takeaway
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-3">
                  Reflection Takeaway
                </h4>

                <div className="space-y-3.5">
                  <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-text">Effort Pride Rating</span>
                    <span className="text-primary-accent font-extrabold font-heading">⭐ {todayMission.eodActuals?.prideRating || 3} of 5</span>
                  </div>

                  {todayMission.eodActuals?.reflectionNote && (
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted-text tracking-wider">Lessons Logged</span>
                      <p className="text-xs italic text-white leading-relaxed">
                        &ldquo;{todayMission.eodActuals.reflectionNote}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* MONTHLY AVERAGE GROWTH HUD */}
            {analyticsData && (
              <Card className="p-5 bg-card-surface border-border-subtle relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                  Discipline MoM Growth
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                  Monthly Performance averages
                </h4>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-2.5 bg-[#060606] rounded-lg border border-border-subtle/40 text-xs">
                    <span className="font-semibold text-muted-text">Current Month Avg</span>
                    <span className="text-white font-extrabold font-mono">{analyticsData.monthlyPerformance.currentMonthAvg}%</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#060606] rounded-lg border border-border-subtle/40 text-xs">
                    <span className="font-semibold text-muted-text">Previous Month Avg</span>
                    <span className="text-white font-extrabold font-mono">{analyticsData.monthlyPerformance.prevMonthAvg}%</span>
                  </div>

                  <div className="pt-2 border-t border-border-subtle/30 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">MoM Net Growth</span>
                    <span className={`text-xs font-black font-heading px-2 py-0.5 rounded border ${
                      analyticsData.monthlyPerformance.growthPercentage >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {analyticsData.monthlyPerformance.growthPercentage >= 0 ? '▲ +' : '▼ '}
                      {analyticsData.monthlyPerformance.growthPercentage}%
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* DATA-DRIVEN PERSONAL GROWTH INSIGHTS */}
            {analyticsData && analyticsData.insights && analyticsData.insights.length > 0 && (
              <Card className="p-5 bg-card-surface border-border-subtle relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                  Discipline Report
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                  Placement Insights
                </h4>

                <div className="space-y-3">
                  {analyticsData.insights.map((insight: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-[#060606] rounded-lg border border-border-subtle/40 flex items-start gap-2.5 hover:border-primary-accent/20 transition-all duration-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary-accent shrink-0 mt-0.5" />
                      <p className="text-[10.5px] text-[#9E9E9E] leading-relaxed font-semibold">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle/30">
                  <Button 
                    variant="secondary"
                    className="text-[9px] py-3.5 w-full uppercase font-extrabold tracking-widest font-heading hover:border-primary-accent/30"
                    onClick={() => router.push('/history')}
                  >
                    View Chronological History
                  </Button>
                </div>
              </Card>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
