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
  Plus, 
  Trash2, 
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

export default function DashboardPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [todayMission, setTodayMission] = React.useState<any>(null);
  
  const { 
    profile, 
    scores, 
    tasks, 
    history, 
    updateScore, 
    addTask, 
    toggleTask, 
    deleteTask, 
    toggleDailyOath,
    setProfile
  } = useProgressStore();

  const [newTaskText, setNewTaskText] = React.useState('');
  const [selectedDiscipline, setSelectedDiscipline] = React.useState<DisciplineKey>('dsa');

  React.useEffect(() => {
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
          setProfile({
            name: data.user.username,
            role: data.user.targetRole || 'Aspiring Computer Engineer',
            oathText: data.user.motivationText || 'I will dedicate focused, deliberate effort toward my placement goals today. No excuses, no shortcuts, just relentless self-growth.',
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


  // Dynamically calculate the overall average placement readiness score
  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 6
  );

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

  // Handler to safely add tasks
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    addTask(selectedDiscipline, newTaskText.trim());
    toast.success('Task logged in preparation chamber.', {
      description: `Added to ${selectedDiscipline.toUpperCase()} checklist.`,
    });
    setNewTaskText('');
  };

  // Helper to adjust scores in real time (Figma-like experience)
  const adjustScore = (key: DisciplineKey, amount: number) => {
    const current = scores[key];
    const target = Math.min(100, Math.max(0, current + amount));
    updateScore(key, target);
    
    if (target === 100) {
      toast.success(`Discipline Mastered!`, {
        description: `You have logged 100% capacity in ${key.toUpperCase()}. Outstanding.`,
      });
    }
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

  // Simulated 30-day consistency history squares (GitHub style)
  const renderConsistencyGrid = () => {
    const squares = [];
    // We render a grid of 30 blocks. To make it authentic, let's seed various intensity densities
    const densities = [
      4, 0, 3, 2, 4, 1, 0, 3, 4, 2,
      1, 4, 3, 2, 0, 4, 3, 1, 2, 4,
      3, 4, 0, 1, 2, 3, 4, 4, 3, profile.dailyOathCompleted ? 4 : 2
    ];

    for (let i = 0; i < 30; i++) {
      const density = densities[i];
      let bgClass = 'bg-[#111111] border border-white/5'; // level 0
      
      if (density === 1) bgClass = 'bg-primary-accent/15 border border-primary-accent/10';
      else if (density === 2) bgClass = 'bg-primary-accent/30 border border-primary-accent/15';
      else if (density === 3) bgClass = 'bg-primary-accent/55 border border-primary-accent/25';
      else if (density === 4) bgClass = 'bg-primary-accent/80 border border-primary-accent/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]';

      squares.push(
        <motion.div
          key={i}
          whileHover={{ scale: 1.25, zIndex: 10 }}
          className={`w-6 h-6 rounded-md transition-all cursor-pointer ${bgClass}`}
          title={`Day ${i + 1}: Consistency Score ${density * 25}%`}
        />
      );
    }
    return squares;
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION (SCORE CARD, STREAK, QUICK FOCUS GRID) */}
          <div className="lg:col-span-8 space-y-8">
            
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* TODAY'S SCORE CIRCULAR RING CARD */}
              <Card glowEffect={todayMission?.isCompleted} className="flex items-center justify-between p-6">
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
                    Today&apos;s DDSCC Score
                  </span>
                  <span className="text-xl font-black text-white mt-1 font-heading uppercase tracking-wide">
                    {todayMission?.isCompleted ? getPerformanceBadge(todayMission.ddsccScore).label : 'Pending Seal'}
                  </span>
                  <p className="text-xs text-muted-text mt-1.5 max-w-[180px] leading-relaxed">
                    {todayMission?.isCompleted 
                      ? "Weighted score finalized for today. Excellent discipline!" 
                      : "Seal today's EOD reflection to generate your discipline index."}
                  </p>
                </div>
                <ProgressCircle 
                  value={todayMission?.isCompleted ? todayMission.ddsccScore : 0} 
                  size={110} 
                  strokeWidth={8} 
                  textSub="DDSCC" 
                />
              </Card>

              {/* STREAK CARD */}
              <Card className="flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
                      Discipline Streak
                    </span>
                    <span className="text-2xl font-black text-white mt-1 font-heading">
                      Consistency Flame
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Flame className="w-5 h-5 fill-orange-400/20" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white font-heading">
                    🔥 {profile.streakDays} Days
                  </span>
                  <span className="text-sm font-semibold text-muted-text">
                    Active streak
                  </span>
                </div>

                <div className="mt-3 text-[10px] text-muted-text/80 leading-relaxed border-t border-border-subtle/40 pt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>Missed days auto-decay your active streak to zero. Stay persistent!</span>
                </div>
              </Card>

            </div>

            {/* QUICK SECTIONS GRID (DSA, DEV, ETC WITH INTERACTIVE ADJUSTMENTS) */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-extrabold tracking-widest uppercase text-muted-text font-heading">
                  Pillar Capacities (Manual Micro-Adjust)
                </h2>
                <span className="text-xs text-primary-accent italic font-semibold">
                  Tweak to simulate progress
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(scores) as DisciplineKey[]).map((key) => {
                  const val = scores[key];
                  return (
                    <Card key={key} className="bg-card-surface border-border-subtle p-4 flex flex-col justify-between h-36">
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

                      {/* Title & Micro-Adjust Buttons */}
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-primary-text leading-tight">
                            {getDisciplineName(key)}
                          </h3>
                        </div>
                        
                        {/* Interactive Plus Minus Buttons */}
                        <div className="flex items-center gap-1 bg-secondary-surface rounded-lg p-0.5 border border-border-subtle">
                          <button
                            onClick={() => adjustScore(key, -5)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-muted-text hover:text-white rounded hover:bg-card-surface transition-colors cursor-pointer"
                            title="Decrease 5%"
                          >
                            -
                          </button>
                          <button
                            onClick={() => adjustScore(key, 5)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-muted-text hover:text-white rounded hover:bg-card-surface transition-colors cursor-pointer"
                            title="Increase 5%"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Small inline visual progress line */}
                      <div className="w-full bg-secondary-surface h-1 rounded-full mt-3 overflow-hidden">
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

            {/* GORGEOUS ANALYTICS TREND (CUSTOM DRAWN PREMIUM INLINE SVG CHART) */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-accent" />
                  <h2 className="text-sm font-extrabold tracking-widest uppercase text-muted-text font-heading">
                    Placement Readiness Trend (Recharts Target)
                  </h2>
                </div>
                <span className="text-xs text-muted-text font-semibold">
                  Last 7 preparation Cycles
                </span>
              </div>

              <Card className="p-6 bg-card-surface border-border-subtle">
                {/* Visual Premium SVG Area Chart representation */}
                <div className="h-44 w-full relative flex items-end">
                  
                  {/* Subtle Grid Lines inside Chart */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full border-t border-white/[0.02]" />
                    <div className="w-full border-t border-white/[0.02]" />
                    <div className="w-full border-t border-white/[0.02]" />
                    <div className="w-full border-t border-white/[0.02]" />
                  </div>

                  {/* SVG Chart Core */}
                  <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 600 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* SVG Area Filled */}
                    <path
                      d="M0,130 Q100,110 200,80 T400,60 T600,45 L600,150 L0,150 Z"
                      fill="url(#areaGlow)"
                    />
                    
                    {/* SVG Trend Line */}
                    <path
                      d="M0,130 Q100,110 200,80 T400,60 T600,45"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Chart Points Glow */}
                    <circle cx="200" cy="80" r="5" fill="#34D399" />
                    <circle cx="400" cy="60" r="5" fill="#34D399" />
                    <circle cx="600" cy="45" r="5.5" fill="#10B981" className="animate-pulse" />
                  </svg>

                  {/* X Axis mock dates labels */}
                  <div className="w-full flex justify-between text-xs uppercase font-bold text-muted-text/80 z-20 pt-2 border-t border-border-subtle/30 px-1 relative top-[168px]">
                    <span>May 24 (45%)</span>
                    <span>May 26 (62%)</span>
                    <span>May 28 (68%)</span>
                    <span>Today ({overallScore}%)</span>
                  </div>

                </div>
                
                {/* Legend indicator */}
                <div className="mt-8 flex justify-between items-center text-xs text-muted-text border-t border-border-subtle/30 pt-3">
                  <span>Compound consistency threshold: 60% standard capacity</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary-accent inline-block" />
                    <span className="font-semibold text-white">Daily Prep Score (7d Average: 59%)</span>
                  </span>
                </div>
              </Card>
            </section>

          </div>

          {/* RIGHT SECTION (OATH CARD, TASKS CHECKLIST, HISTORY GRID) */}
          <div className="lg:col-span-4 space-y-8">

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

                <div className="space-y-4">
                  {/* DSA targets info */}
                  <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>DSA Problems</span>
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
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Active Building: {todayMission.isCompleted ? todayMission.eodActuals.development.projectName : todayMission.development.projectName}</span>
                        <span className="text-primary-accent font-extrabold">
                          {todayMission.isCompleted 
                            ? `Rating: ${todayMission.eodActuals.development.satisfactionRating}/5` 
                            : `${todayMission.development.plannedHours}h Plan`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-text leading-relaxed">
                        {todayMission.isCompleted ? todayMission.eodActuals.development.projectDesc : todayMission.development.projectDesc}
                      </p>
                      <div className="flex gap-2 text-[10px] text-muted-text font-bold uppercase pt-1">
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
                    <div className="p-3 bg-[#050505]/40 rounded-xl border border-border-subtle/30 text-center text-xs italic text-muted-text/50">
                      No development builds planned for today.
                    </div>
                  )}

                  {/* Skills tags list */}
                  {todayMission.skills?.length > 0 && (
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">
                        {todayMission.isCompleted ? "Completed Skills" : "Target Skills"}
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
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">CS Fundamentals</span>
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
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Communication Focus</span>
                        <span className="text-[10px] font-black text-primary-accent bg-primary-accent/5 border border-primary-accent/10 px-1.5 py-0.5 rounded">
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
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Aptitude: {todayMission.isCompleted ? todayMission.eodActuals.aptitude.topicName : todayMission.aptitude.topicName}</span>
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
            
            {/* DAILY MISSION CONTAINER (OATH SYSTEM) */}
            <Card glowEffect={profile.dailyOathCompleted} className="p-6 relative overflow-hidden transition-all duration-500">
              <CardHeader className="p-0 mb-4 flex flex-row justify-between items-start gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
                    Daily Discipline Seal
                  </span>
                  <CardTitle className="text-lg font-bold text-white font-heading mt-0.5">
                    Today&apos;s Commitment
                  </CardTitle>
                </div>
                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  profile.dailyOathCompleted ? 'bg-primary-accent/15 text-primary-accent border border-primary-accent/20' : 'bg-secondary-surface text-muted-text border border-border-subtle/60'
                }`}>
                  {profile.dailyOathCompleted ? 'Committed' : 'Pending'}
                </span>
              </CardHeader>
              
              <CardContent className="p-0">
                <p className="text-sm italic text-muted-text leading-relaxed bg-[#050505] p-3 rounded-lg border border-border-subtle/50 mb-4 select-none">
                  &ldquo;I commit to showing up for my future. Consistency beats motivation. I will build discipline, one day at a time.&rdquo;
                </p>

                {/* Big Seal Oath Button */}
                <Button
                  variant={profile.dailyOathCompleted ? 'secondary' : 'primary'}
                  className="w-full py-3 text-xs uppercase font-extrabold tracking-widest font-heading transition-all duration-300"
                  onClick={() => {
                    toggleDailyOath();
                    if (!profile.dailyOathCompleted) {
                      toast.success('Oath Committed Successfully!', {
                        description: `Consistency verified. Your streak was incremented by 1 day! 🔥`,
                      });
                    } else {
                      toast.error('Oath Withdrawn.', {
                        description: `Streak reverted. Consistency metrics decayed.`,
                      });
                    }
                  }}
                >
                  {profile.dailyOathCompleted ? 'Recall Oath Seal' : 'Seal Oath for Today'}
                </Button>
              </CardContent>
            </Card>

            {/* ACTIVE PREPARATION CHECKLIST */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text">
                  Discipline logs
                </span>
                <CardTitle className="text-base font-bold text-white font-heading mt-0.5">
                  Daily Check-in Checklist
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                {/* Input form to add a custom target task */}
                <form onSubmit={handleAddTaskSubmit} className="flex gap-2 mb-4">
                  <select
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value as DisciplineKey)}
                    className="bg-secondary-surface border border-border-subtle text-xs text-primary-text rounded-lg px-2 focus:outline-none focus:border-primary-accent/50 cursor-pointer"
                  >
                    <option value="dsa">DSA</option>
                    <option value="development">Dev</option>
                    <option value="skills">Skills</option>
                    <option value="core">Core</option>
                    <option value="communication">Comm</option>
                    <option value="aptitude">Apt</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Enter commitment task..."
                    className="flex-1 px-3 py-2 bg-secondary-surface border border-border-subtle rounded-lg text-xs text-primary-text placeholder:text-muted-text/40 focus:outline-none focus:border-primary-accent/40"
                  />
                  <Button type="submit" variant="glow" size="sm" className="px-2.5">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>

                {/* Render active tasks lists */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                          task.completed 
                            ? 'bg-primary-accent/[0.02] border-primary-accent/15 opacity-70' 
                            : 'bg-secondary-surface/50 border-border-subtle hover:border-border-subtle/90'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Checkbox Trigger */}
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {
                              toggleTask(task.id);
                              if (!task.completed) {
                                toast.success('Task checked off.', {
                                  description: 'Compounding discipline index.',
                                });
                              }
                            }}
                            className="mt-0.5 w-3.5 h-3.5 rounded bg-secondary-surface border-border-subtle text-primary-accent focus:ring-primary-accent/50 cursor-pointer shrink-0"
                          />
                          
                          <div className="min-w-0 flex-1">
                            <p className={`text-[11px] leading-tight break-words text-primary-text ${task.completed ? 'line-through text-muted-text/80' : ''}`}>
                              {task.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold text-muted-text uppercase tracking-wider">
                              <span className="text-primary-accent/80 font-heading">{task.discipline}</span>
                              <span>•</span>
                              <span>{task.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        {/* Trash Delete button */}
                        <button
                          onClick={() => {
                            deleteTask(task.id);
                            toast.error('Task purged.', {
                              description: 'Removed from checklist logs.',
                            });
                          }}
                          className="text-muted-text/50 hover:text-red-500 transition-colors cursor-pointer self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {tasks.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-[11px] text-muted-text">No logged tasks for today.</p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* COMMIT HISTORY GRID (GITHUB HEATMAP STYLE) */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-accent" />
                    <CardTitle className="text-base font-bold text-white font-heading">
                      History Consistency Matrix
                    </CardTitle>
                  </div>
                  <span className="text-[10px] text-muted-text">30 Days</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* 30 block grids */}
                <div className="flex flex-wrap gap-2.5 justify-center py-2">
                  {renderConsistencyGrid()}
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-text font-bold uppercase tracking-wider mt-4 border-t border-border-subtle/40 pt-3">
                  <span>Less Active</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#111111] border border-white/5" />
                    <span className="w-2.5 h-2.5 rounded bg-primary-accent/15 border border-primary-accent/10" />
                    <span className="w-2.5 h-2.5 rounded bg-primary-accent/30 border border-primary-accent/15" />
                    <span className="w-2.5 h-2.5 rounded bg-primary-accent/55 border border-primary-accent/25" />
                    <span className="w-2.5 h-2.5 rounded bg-primary-accent/80 border border-primary-accent/40" />
                  </div>
                  <span>Highly Consistent</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
