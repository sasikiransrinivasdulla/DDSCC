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
      try {
        const response = await fetch('/api/auth/me');
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

          // Background sync streaks
          await fetch('/api/sync-streaks');

          // Load live analytics payload
          fetch('/api/analytics')
            .then(res => res.json())
            .then(aData => {
              if (aData.success) {
                setAnalyticsData(aData);
                setProfile({
                  name: data.user.username,
                  role: data.user.targetRole || 'Aspiring Computer Engineer',
                  oathText: data.user.motivationText || 'I will dedicate focused, deliberate effort toward my placement goals today. No excuses, no shortcuts, just relentless self-growth.',
                  streakDays: aData.stats.currentStreak,
                });
              }
              setAnalyticsLoading(false);
            })
            .catch(err => {
              console.error('Analytics load failure:', err);
              setAnalyticsLoading(false);
            });

          // Check if today's daily mission exists
          const missionCheck = await fetch('/api/daily-oath');
          if (missionCheck.ok) {
            const missionData = await missionCheck.json();
            if (!missionData.exists) {
              router.push('/daily-oath');
              return;
            } else {
              setTodayMission(missionData.mission);
            }
          }
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

  // Real 30-day consistency history squares from MongoDB data
  const renderRealHeatmapGrid = () => {
    if (!analyticsData || !analyticsData.heatmap) {
      // Return 30 mock loading blocks
      return Array.from({ length: 30 }).map((_, i) => (
        <span key={i} className="w-5 h-5 rounded bg-[#111111] animate-pulse border border-white/5" />
      ));
    }
    
    const heatmapKeys = Object.keys(analyticsData.heatmap).sort(); // YYYY-MM-DD keys sorted ascending
    // Get the last 30 days
    const last30Keys = heatmapKeys.slice(-30);
    
    return last30Keys.map((dateStr) => {
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
        } else if (score > 60 && score <= 80) {
          colorClass = 'bg-emerald-500/55 border border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/60';
          scoreLabel = `Score: ${score}%`;
        } else if (score > 80 && score <= 100) {
          colorClass = 'bg-primary-accent border border-primary-accent/80 shadow-[0_0_8px_rgba(16,185,129,0.15)] hover:shadow-[0_0_12px_rgba(16,185,129,0.45)] hover:border-white';
          scoreLabel = `Score: ${score}% (Elite)`;
        }
      }
      
      const dateObj = new Date(dateStr);
      const displayDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });
      
      return (
        <motion.div 
          key={dateStr}
          whileHover={{ scale: 1.25, zIndex: 10 }}
          className={`w-5 h-5 rounded transition-all duration-300 cursor-pointer ${colorClass}`}
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
            
            {/* REAL ACTIVITY TIMELINE */}
            <Card className="p-5 bg-card-surface border-border-subtle">
              <CardHeader className="p-0 mb-3">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-text">
                  Discipline Logs
                </span>
                <CardTitle className="text-sm font-bold text-white font-heading mt-0.5">
                  Real Activity Timeline
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {analyticsLoading ? (
                  <div className="py-6 text-center text-xs text-muted-text animate-pulse">
                    Retrieving activities from placement ledger...
                  </div>
                ) : analyticsData?.activityTimeline && analyticsData.activityTimeline.length > 0 ? (
                  <div className="relative border-l border-border-subtle/40 ml-2 pl-4 space-y-3.5 py-0.5">
                    {analyticsData.activityTimeline.map((act: any) => {
                      // Determine badge/color based on type
                      let dotColor = 'bg-muted-text';
                      let iconLabel = 'Commit';
                      if (act.type === 'missed') {
                        dotColor = 'bg-red-500 shadow-md shadow-red-950/20';
                        iconLabel = 'Decay';
                      } else if (act.type === 'eod') {
                        dotColor = 'bg-emerald-400 shadow-md shadow-emerald-950/20';
                        iconLabel = 'Seal';
                      } else if (act.type === 'dsa') {
                        dotColor = 'bg-blue-400 shadow-md shadow-blue-950/20';
                        iconLabel = 'DSA';
                      } else if (act.type === 'dev' || act.type === 'github') {
                        dotColor = 'bg-purple-400 shadow-md shadow-purple-950/20';
                        iconLabel = 'Dev';
                      } else if (act.type === 'skills') {
                        dotColor = 'bg-amber-400 shadow-md shadow-amber-950/20';
                        iconLabel = 'Skill';
                      } else if (act.type === 'aptitude') {
                        dotColor = 'bg-indigo-400 shadow-md shadow-indigo-950/20';
                        iconLabel = 'Apt';
                      } else if (act.type === 'comm') {
                        dotColor = 'bg-pink-400 shadow-md shadow-pink-950/20';
                        iconLabel = 'Comm';
                      } else if (act.type === 'mission') {
                        dotColor = 'bg-primary-accent shadow-md shadow-emerald-950/20';
                        iconLabel = 'Oath';
                      }
                      
                      const dateObj = new Date(act.date);
                      const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });

                      return (
                        <div key={act.id} className="relative">
                          {/* Timeline bullet element */}
                          <span className={`absolute -left-[22px] top-1.5 w-2 h-2 rounded-full border border-black/40 ${dotColor}`} />
                          
                          <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[8px] uppercase font-extrabold tracking-widest text-muted-text font-mono">
                                {formattedDate} • {iconLabel}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-primary-text leading-snug">
                              {act.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[10px] text-muted-text leading-relaxed">
                      No chronological activities committed to ledger yet. Commit to a daily oath to register logs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* COMMIT HISTORY GRID (GITHUB HEATMAP STYLE) */}
            <Card className="p-6 bg-card-surface border-border-subtle">
              <CardHeader className="p-0 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-accent" />
                    <CardTitle className="text-base font-bold text-white font-heading">
                      History Consistency Matrix
                    </CardTitle>
                  </div>
                  <span className="text-[10px] text-muted-text font-bold">30 Days</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* 30 block grids */}
                <div className="flex flex-wrap gap-2.5 justify-center py-2">
                  {renderRealHeatmapGrid()}
                </div>

                {/* Dynamic Interactive HUD Overlay */}
                <div className="text-center py-1.5 h-6 flex items-center justify-center border-t border-border-subtle/30 mt-3 select-none">
                  {hoveredDay ? (
                    <span className="text-[10px] text-primary-accent font-extrabold uppercase tracking-widest animate-pulse">
                      ⚡ {hoveredDay.date} : {hoveredDay.scoreText}
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider">
                      Hover cells to inspect Prep ledger
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-text font-bold uppercase tracking-wider mt-2 border-t border-border-subtle/30 pt-3">
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

          </div>

        </div>

        {/* PLACEMENT BEHAVIORAL ANALYTICS SECTION */}
        <div className="mt-8">
          {/* GLOWING HORIZONTAL SEPARATOR */}
          <div className="my-8 border-t border-border-subtle/40 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#050505] px-6 text-xs uppercase font-extrabold tracking-widest text-primary-accent">
              Placement Insights & Analytics
            </div>
          </div>

          {analyticsLoading ? (
            <div className="py-16 text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text animate-pulse block">
                Aggregating live consistency metrics...
              </span>
            </div>
          ) : !analyticsData || analyticsData.stats.totalActiveDays === 0 ? (
            <Card className="p-8 text-center bg-card-surface border-border-subtle relative overflow-hidden max-w-xl mx-auto">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                No active days compiled
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider font-heading mt-2">
                Begin your discipline logs
              </h3>
              <p className="text-xs text-muted-text mt-2 leading-relaxed font-semibold">
                Your morning commitments are registered. Complete your very first evening reflection honestly to calculate today&apos;s score and launch your placement heatmaps.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              
              {/* SECTION 1 - PERFORMANCE OVERVIEW STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="p-5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text">
                    Current Streak
                  </span>
                  <span className="text-xl font-black text-white mt-1 font-heading">
                    🔥 {analyticsData.stats.currentStreak} Days
                  </span>
                </Card>
                <Card className="p-5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text">
                    Best Streak
                  </span>
                  <span className="text-xl font-black text-white mt-1 font-heading">
                    🏆 {analyticsData.stats.longestStreak} Days
                  </span>
                </Card>
                <Card className="p-5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text">
                    Average DDSCC Score
                  </span>
                  <span className="text-xl font-black text-white mt-1 font-heading">
                    🎯 {analyticsData.stats.averageDdsccScore}%
                  </span>
                </Card>
                <Card className="p-5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text">
                    Total Active Days
                  </span>
                  <span className="text-xl font-black text-white mt-1 font-heading">
                    ⚡ {analyticsData.stats.totalActiveDays} Days
                  </span>
                </Card>
              </div>

              {/* MONTHLY PERFORMANCE & GITHUB HEATMAP GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* SECTION 3 - MONTHLY PERFORMANCE (col-span-4) */}
                <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                      Discipline Index Growth
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-6">
                      Monthly Averages
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-text">Current Month Avg</span>
                        <span className="text-white font-extrabold">{analyticsData.monthlyPerformance.currentMonthAvg}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-text">Previous Month Avg</span>
                        <span className="text-white font-extrabold">{analyticsData.monthlyPerformance.prevMonthAvg}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-border-subtle/30 pt-4 flex justify-between items-center">
                    <span className="text-xs text-muted-text">Month-over-Month Growth</span>
                    <span className={`text-base font-black font-heading px-2 py-0.5 rounded ${
                      analyticsData.monthlyPerformance.growthPercentage >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {analyticsData.monthlyPerformance.growthPercentage >= 0 ? '+' : ''}
                      {analyticsData.monthlyPerformance.growthPercentage}%
                    </span>
                  </div>
                </Card>

                {/* SECTION 4 - GITHUB CONTRIBUTION STYLE HEATMAP (col-span-8) */}
                <Card className="lg:col-span-8 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary-accent" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                          90-Day Consistency Map
                        </h3>
                      </div>
                      <span className="text-[10px] text-muted-text uppercase font-bold tracking-wider">
                        Last 3 Months Grid
                      </span>
                    </div>

                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
                      {Object.entries(analyticsData.heatmap).map(([dateStr, score]: any) => {
                        let colorClass = 'bg-[#111] border border-white/5';
                        if (score >= 0) {
                          if (score === 0) colorClass = 'bg-[#1a0f0f] border border-red-500/15';
                          else if (score < 40) colorClass = 'bg-red-500/10 border border-red-500/30';
                          else if (score < 60) colorClass = 'bg-emerald-500/10 border border-emerald-500/20';
                          else if (score < 75) colorClass = 'bg-emerald-500/25 border border-emerald-500/35';
                          else if (score < 90) colorClass = 'bg-emerald-500/50 border border-emerald-500/60';
                          else colorClass = 'bg-primary-accent border border-primary-accent/80 glow-emerald-sm';
                        }
                        
                        return (
                          <div
                            key={dateStr}
                            className={`w-3.5 h-3.5 rounded transition-all cursor-help hover:scale-110 ${colorClass}`}
                            title={`${dateStr}: ${score >= 0 ? score + '%' : 'No mission committed'}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-text font-bold uppercase tracking-wider mt-6 border-t border-border-subtle/40 pt-4">
                    <span>Less Disciplined</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-[#11] border border-white/5" />
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/20" />
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500/25 border border-emerald-500/35" />
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500/50 border border-emerald-500/60" />
                      <span className="w-2.5 h-2.5 rounded bg-primary-accent border border-primary-accent/80" />
                    </div>
                    <span>Elite (90%+)</span>
                  </div>
                </Card>

              </div>

              {/* CATEGORY METRICS & DATA-DRIVEN INSIGHTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* SECTION 6 - CATEGORY LIFETIME ANALYTICS (col-span-7) */}
                <Card className="lg:col-span-7 p-6">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                    Discipline Pillars
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-6">
                    Category Weaknesses & Strengths
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(analyticsData.categoryAverages).map(([category, avgScore]: any) => {
                      const nameMap: Record<string, string> = {
                        dsa: 'DSA & Algorithms',
                        development: 'Development Builds',
                        skills: 'Technical Skills Focus',
                        core: 'CS Core Fundamentals',
                        communication: 'Communication & Verbal',
                        aptitude: 'Aptitude & Analytical',
                      };
                      return (
                        <div key={category} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-white">{nameMap[category] || category}</span>
                            <span className="text-primary-accent font-heading font-extrabold">{avgScore}%</span>
                          </div>
                          <div className="w-full bg-[#111] h-2 rounded-full overflow-hidden border border-white/[0.03]">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                avgScore >= 75 ? 'bg-primary-accent' : avgScore >= 60 ? 'bg-amber-400' : 'bg-red-500/80'
                              }`}
                              style={{ width: `${avgScore}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* SECTION 7 - PERSONAL GROWTH DATA-DRIVEN INSIGHTS (col-span-5) */}
                <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                      Discipline Report
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-6">
                      Personal Growth Insights
                    </h3>

                    <div className="space-y-4">
                      {analyticsData.insights.map((insight: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 flex items-start gap-2.5"
                        >
                          <Sparkles className="w-4 h-4 text-primary-accent shrink-0 mt-0.5" />
                          <p className="text-xs text-primary-text leading-relaxed font-semibold">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border-subtle/40 text-center">
                    <Button 
                      variant="secondary"
                      className="text-[10px] py-3.5 w-full uppercase font-extrabold tracking-widest font-heading"
                      onClick={() => router.push('/history')}
                    >
                      View Chronological History Archive
                    </Button>
                  </div>
                </Card>

              </div>

            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
