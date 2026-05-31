'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ui/progress';
import { 
  User as UserIcon, 
  Calendar, 
  Flame, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Compass,
  FileText,
  Activity,
  Award as TrophyIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = React.useState<any>(null);
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [historyList, setHistoryList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // History Explorer Detailed Date State
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>('');
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [reportLoading, setReportLoading] = React.useState(false);

  React.useEffect(() => {
    const loadProfileAndHistoryData = async () => {
      try {
        setIsLoading(true);
        // Hydrate all data in parallel
        const [meRes, analyticsRes, historyRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/analytics'),
          fetch('/api/history')
        ]);

        if (meRes.status === 401) {
          router.push('/auth');
          return;
        }

        const meJson = await meRes.json();
        const analyticsJson = await analyticsRes.json();
        const historyJson = await historyRes.json();

        if (meJson.success) setProfileData(meJson.user);
        if (analyticsJson.success) setAnalyticsData(analyticsJson);
        
        if (historyJson.success && historyJson.history) {
          setHistoryList(historyJson.history);
          // Set initial selection to the most recent day if exists
          if (historyJson.history.length > 0) {
            const firstDate = historyJson.history[0].dateString;
            setSelectedDateStr(firstDate);
            fetchDayDetails(firstDate);
          }
        }
      } catch (error) {
        console.error('Error hydating profile session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileAndHistoryData();
  }, [router]);

  const fetchDayDetails = async (dateStr: string) => {
    try {
      setReportLoading(true);
      const res = await fetch(`/api/history/${dateStr}`);
      const json = await res.json();
      if (json.success) {
        setSelectedReport(json);
      }
    } catch (err) {
      console.error('Failed to fetch detailed day report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    fetchDayDetails(dateStr);
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Discipline chamber initialized';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-primary-accent border-t-transparent animate-spin mb-4" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text animate-pulse">
            Sealing Cryptographic Session...
          </span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col font-sans antialiased selection:bg-primary-accent selection:text-[#050505]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-4 relative z-10">
        
        {/* HEADER PROFILE BANNER */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-card-surface border border-border-subtle rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-accent/30 to-transparent" />
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-secondary-surface border-2 border-primary-accent flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] relative group overflow-hidden select-none">
              <span className="text-2xl font-black text-primary-accent font-heading tracking-wider">
                {(profileData?.username || 'SS').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-black uppercase tracking-wider font-heading text-white">
                  {profileData?.username || 'Candidate'}
                </h1>
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-primary-accent/10 text-primary-accent border border-primary-accent/25">
                  Private Chamber
                </span>
              </div>
              <p className="text-xs text-muted-text font-bold">
                Target Objective: <span className="text-white uppercase tracking-wide">{profileData?.targetRole || 'Software Architect'}</span>
              </p>
              <p className="text-[10px] text-muted-text font-medium">
                Active Member since: <span className="text-primary-accent font-semibold">{formatJoinDate(profileData?.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto p-4 bg-[#0a0a0a] rounded-lg border border-border-subtle/50 relative">
            <span className="text-[8px] uppercase tracking-widest text-primary-accent font-bold block mb-1">Your Discipline Anchor</span>
            <p className="text-xs italic text-primary-text/90 font-medium leading-relaxed max-w-sm">
              "{profileData?.motivationText || 'No motivation logs defined yet.'}"
            </p>
          </div>
        </section>

        {/* METRICS HUB ROW */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card-surface border-border-subtle flex flex-col justify-between min-h-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">Active Streak</span>
            <div className="flex items-center gap-2 mt-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/10" />
              <span className="text-xl font-black text-white font-heading">{analyticsData?.stats?.currentStreak || 0} Days</span>
            </div>
          </Card>

          <Card className="p-4 bg-card-surface border-border-subtle flex flex-col justify-between min-h-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">Longest Streak</span>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-5 h-5 text-amber-500 fill-amber-500/10" />
              <span className="text-xl font-black text-white font-heading">{analyticsData?.stats?.longestStreak || 0} Days</span>
            </div>
          </Card>

          <Card className="p-4 bg-card-surface border-border-subtle flex flex-col justify-between min-h-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">Average Prep Score</span>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-black text-primary-accent font-heading">{analyticsData?.stats?.averageDdsccScore || 0}%</span>
            </div>
          </Card>

          <Card className="p-4 bg-card-surface border-border-subtle flex flex-col justify-between min-h-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">Total Active Days</span>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-black text-white font-heading">{analyticsData?.stats?.totalActiveDays || 0} Ledger Entries</span>
            </div>
          </Card>
        </section>

        {/* ACHIEVEMENT & PERSONAL RECORDS HUB */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PERSONAL BEST RECORDS & ACHIEVEMENTS (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. PERSONAL RECORDS SECTION */}
            <Card className="p-5 bg-card-surface border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
              <div className="flex items-center gap-2 border-b border-border-subtle/30 pb-3 mb-4">
                <TrophyIcon className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  Personal Best Records
                </CardTitle>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analyticsData?.personalBests ? (
                  Object.entries(analyticsData.personalBests).map(([key, record]: any) => (
                    <div 
                      key={key}
                      className="p-4 bg-[#070707] rounded-lg border border-border-subtle/40 hover:border-primary-accent/20 transition-all duration-300 group hover:-translate-y-0.5"
                    >
                      <span className="text-[9px] uppercase font-extrabold text-primary-accent bg-primary-accent/5 px-2 py-0.5 rounded border border-primary-accent/15">
                        {record.badge}
                      </span>
                      <h4 className="text-xs text-muted-text font-bold mt-2 uppercase tracking-wider">
                        {record.label}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-white font-heading">
                          {record.value}
                        </span>
                        {record.date && (
                          <span className="text-[9px] text-muted-text/80 font-semibold uppercase">
                            on {new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-6 text-center text-xs text-muted-text">
                    Complete your daily reviews to register personal records.
                  </div>
                )}
              </div>
            </Card>

            {/* 2. ACHIEVEMENTS GALLERY */}
            <Card className="p-5 bg-card-surface border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
              <div className="flex items-center gap-2 border-b border-border-subtle/30 pb-3 mb-4">
                <Award className="w-5 h-5 text-primary-accent" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  Personal Covenant Achievements
                </CardTitle>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {analyticsData?.achievements ? (
                  analyticsData.achievements.map((ach: any) => (
                    <div 
                      key={ach.id}
                      className={`p-4 rounded-lg border transition-all duration-300 text-center flex flex-col items-center justify-between min-h-[140px] group ${
                        ach.unlocked 
                          ? 'bg-primary-accent/5 border-primary-accent/30 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:border-primary-accent/50' 
                          : 'bg-[#070707] border-border-subtle/40 opacity-40 hover:opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-500 ${
                        ach.unlocked 
                          ? 'bg-primary-accent/10 border border-primary-accent/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] group-hover:scale-110' 
                          : 'bg-[#121212] border border-white/5'
                      }`}>
                        {ach.unlocked ? ach.icon : '🔒'}
                      </div>
                      <div className="mt-2 space-y-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                          {ach.title}
                        </h4>
                        <p className="text-[9px] text-muted-text font-medium leading-tight max-w-[120px] mx-auto">
                          {ach.desc}
                        </p>
                      </div>
                      <div className="mt-2">
                        {ach.unlocked ? (
                          <span className="text-[8px] uppercase font-extrabold text-primary-accent bg-primary-accent/10 px-1.5 py-0.5 rounded border border-primary-accent/20">
                            Unlocked {ach.unlockDate && new Date(ach.unlockDate).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                          </span>
                        ) : (
                          <span className="text-[8px] uppercase font-extrabold text-muted-text bg-secondary-surface px-1.5 py-0.5 rounded border border-border-subtle/50">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-xs text-muted-text">
                    Achievements chamber loading...
                  </div>
                )}
              </div>
            </Card>

          </div>

          {/* DDSCC JOURNEY TIMELINE (col-span-4) */}
          <div className="lg:col-span-4">
            <Card className="p-5 bg-card-surface border-border-subtle relative overflow-hidden h-full min-h-[480px]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/20 to-transparent" />
              <div className="flex items-center gap-2 border-b border-border-subtle/30 pb-3 mb-4">
                <Compass className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  DDSCC Journey Timeline
                </CardTitle>
              </div>

              <div className="relative border-l border-border-subtle/50 pl-4 ml-2 space-y-5 my-2">
                {analyticsData?.journeyTimeline && analyticsData.journeyTimeline.length > 0 ? (
                  analyticsData.journeyTimeline.map((item: any, index: number) => (
                    <div key={index} className="relative group">
                      {/* Node Bullet */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#050505] border border-primary-accent/60 group-hover:bg-primary-accent transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-primary-accent font-bold uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                          </span>
                          <span className="text-xs">{item.icon}</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-muted-text font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-muted-text">
                    Journey chronology is loading...
                  </div>
                )}
              </div>
            </Card>
          </div>

        </section>

        {/* HISTORY EXPLORER INTEGRATED COLUMN GRIDS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SELECTOR: Ledger dates scrollbar list (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 bg-card-surface border-border-subtle">
              <div className="flex items-center justify-between border-b border-border-subtle/30 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary-accent" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                    Placement Ledger
                  </CardTitle>
                </div>
                <span className="text-[10px] text-muted-text font-bold uppercase tracking-widest bg-secondary-surface px-2 py-0.5 rounded border border-border-subtle/50">
                  {historyList.length} Entries
                </span>
              </div>

              {historyList.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-muted-text font-medium leading-relaxed">
                    No accountability records logged yet in MongoDB database.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 text-[10px] uppercase tracking-widest"
                    onClick={() => router.push('/daily-oath')}
                  >
                    Commit Morning Oath
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                  {historyList.map((entry) => {
                    const isSelected = entry.dateString === selectedDateStr;
                    const dateObj = new Date(entry.dateString);
                    const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

                    return (
                      <div 
                        key={entry.dateString}
                        onClick={() => handleDateSelect(entry.dateString)}
                        className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between select-none ${
                          isSelected 
                            ? 'bg-primary-accent/10 border-primary-accent/40 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                            : 'bg-[#080808] border-border-subtle/50 hover:border-primary-accent/20 hover:bg-[#0c0c0c]'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-xs font-bold font-heading ${isSelected ? 'text-primary-accent' : 'text-white'}`}>
                            {formattedDate}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {entry.isMissed ? (
                              <span className="text-[8px] uppercase font-bold text-red-500">Missed Day</span>
                            ) : (
                              <span className="text-[8px] uppercase font-extrabold text-muted-text/80">
                                Badge: <span className="text-white">{entry.badge}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black font-heading ${entry.isMissed ? 'text-red-500' : 'text-primary-accent'}`}>
                            {entry.isMissed ? '0%' : `${entry.ddsccScore}%`}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-primary-accent translate-x-0.5' : 'text-muted-text/40'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT VIEW: Detailed Daily EOD Report Panel (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {reportLoading ? (
                <Card className="p-8 bg-card-surface border-border-subtle min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-accent border-t-transparent animate-spin mb-3" />
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-text animate-pulse">
                    Querying Ledger database...
                  </span>
                </Card>
              ) : selectedReport ? (
                <motion.div
                  key={selectedDateStr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 bg-card-surface border-border-subtle space-y-6">
                    
                    {/* REPORT PANEL HEADER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle/30 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text font-heading">
                            Placement Report Card
                          </span>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${selectedReport.badge.className}`}>
                            {selectedReport.badge.label}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-white font-heading uppercase tracking-wide">
                          {new Date(selectedReport.mission.dateString).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </h2>
                        <p className="text-[10px] text-muted-text italic font-medium">
                          "{selectedReport.badge.description}"
                        </p>
                      </div>

                      {/* PERFECTLY CENTERED RING */}
                      <ProgressCircle 
                        value={selectedReport.mission.ddsccScore || 0} 
                        size={80} 
                        strokeWidth={7} 
                        textSub="Score" 
                      />
                    </div>

                    {selectedReport.mission.isMissed ? (
                      <div className="py-16 text-center space-y-3">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="text-base font-black text-white uppercase tracking-wider font-heading">Discipline Decay Triggered</h3>
                        <p className="text-xs text-muted-text max-w-sm mx-auto leading-relaxed font-semibold">
                          No daily commitments or reflections were recorded in MongoDB on this calendar date. Streak collapsed and auto-decay resolved.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 6 DISCIPLINE COMPONENT GRIDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* 1. DSA */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-blue-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 font-heading">💻 DSA Pillars</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              <p>Planned Targets: <span className="text-white font-bold">{selectedReport.mission.dsaTargets?.total || 0} Problems</span></p>
                              <p>Actual Resolved: <span className="text-primary-accent font-bold">
                                {selectedReport.mission.eodActuals?.dsa 
                                  ? (Number(selectedReport.mission.eodActuals.dsa.easy || 0) + 
                                     Number(selectedReport.mission.eodActuals.dsa.medium || 0) + 
                                     Number(selectedReport.mission.eodActuals.dsa.hard || 0))
                                  : 0} completed
                              </span></p>
                              <p className="text-[10px] text-muted-text font-semibold">
                                (Easy: {selectedReport.mission.eodActuals?.dsa?.easy || 0} | Med: {selectedReport.mission.eodActuals?.dsa?.medium || 0} | Hard: {selectedReport.mission.eodActuals?.dsa?.hard || 0})
                              </p>
                            </div>
                          </div>

                          {/* 2. DEV */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-purple-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 font-heading">🛠️ Development</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              {selectedReport.mission.development?.isBuilding ? (
                                <>
                                  <p>Project Name: <span className="text-white font-bold">{selectedReport.mission.development.projectName}</span></p>
                                  <p>Session Satisfaction: <span className="text-primary-accent font-bold">{selectedReport.mission.eodActuals?.development?.satisfactionRating || 3}/5 Rating</span></p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black border ${
                                      selectedReport.mission.eodActuals?.development?.githubPushed 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/25'
                                    }`}>
                                      {selectedReport.mission.eodActuals?.development?.githubPushed ? 'GitHub Push Verified' : 'No Push Logs'}
                                    </span>
                                    {selectedReport.mission.eodActuals?.development?.exploreNew && (
                                      <span className="text-[8px] uppercase px-1.5 py-0.5 rounded font-black bg-purple-500/10 text-purple-400 border border-purple-500/25">
                                        Explored Tech Scopes
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-muted-text font-semibold">No development focus set for this day.</p>
                              )}
                            </div>
                          </div>

                          {/* 3. SKILLS */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-amber-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-heading">🚀 Target Skills</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              <p>Planned Frameworks: <span className="text-white font-bold">{selectedReport.mission.skills?.length || 0} tech systems</span></p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(selectedReport.mission.skills || []).map((skill: string) => {
                                  const completed = (selectedReport.mission.eodActuals?.skills || []).includes(skill);
                                  return (
                                    <span 
                                      key={skill}
                                      className={`text-[8px] uppercase px-2 py-0.5 rounded font-black border ${
                                        completed 
                                          ? 'bg-emerald-500/10 text-primary-accent border-primary-accent/30' 
                                          : 'bg-[#121212] text-muted-text border-white/5'
                                      }`}
                                    >
                                      {skill} {completed ? '✓' : '✗'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 4. CS CORE */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-cyan-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-heading">📚 CS Fundamentals</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              {selectedReport.mission.coreSubjects?.length > 0 ? (
                                <div className="space-y-1">
                                  {selectedReport.mission.coreSubjects.map((sub: any) => {
                                    const actual = (selectedReport.mission.eodActuals?.coreSubjects || []).find((a: any) => a.subject === sub.subject);
                                    const actualEff = actual ? actual.actualEffort : 0;
                                    return (
                                      <div key={sub.subject} className="flex justify-between items-center text-[11px]">
                                        <span className="text-white font-bold uppercase">{sub.subject}</span>
                                        <span className="text-muted-text">
                                          Commit: {sub.plannedEffort}% | Actual: <span className="text-primary-accent font-semibold">{actualEff}%</span>
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-muted-text font-semibold">No CS Fundamentals planned.</p>
                              )}
                            </div>
                          </div>

                          {/* 5. COMMUNICATION */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-pink-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400 font-heading">💬 Communication</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              {selectedReport.mission.communication?.options?.length > 0 ? (
                                <>
                                  <p>Planned Ratios: <span className="text-white font-bold">{selectedReport.mission.communication.options.length} target task scopes</span></p>
                                  <p>Actual Tasks Completed: <span className="text-primary-accent font-bold">{(selectedReport.mission.eodActuals?.communication?.options || []).length} registered</span></p>
                                  <p>Subjective Confidence: <span className="text-white font-bold">{selectedReport.mission.eodActuals?.communication?.confidenceRating || 3}/5 Rating</span></p>
                                </>
                              ) : (
                                <p className="text-muted-text font-semibold">No communication goals mapped.</p>
                              )}
                            </div>
                          </div>

                          {/* 6. APTITUDE */}
                          <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 border-l-2 border-l-indigo-500 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-heading">🎯 Aptitude Focus</span>
                            <div className="text-xs space-y-1 text-primary-text/90 font-medium">
                              {selectedReport.mission.aptitude?.plannedQuestions > 0 ? (
                                <>
                                  <p>Planned Topic: <span className="text-white font-bold">{selectedReport.mission.aptitude.topicName}</span></p>
                                  <p>Questions: <span className="text-white font-bold">{selectedReport.mission.aptitude.plannedQuestions} targets</span></p>
                                  <p>Questions Resolved: <span className="text-primary-accent font-bold">{selectedReport.mission.eodActuals?.aptitude?.actualQuestions || 0} completed</span></p>
                                </>
                              ) : (
                                <p className="text-muted-text font-semibold">No aptitude goals planned.</p>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* SELF-PRIDE & TAKEAWAY NOTE */}
                        <div className="p-4 bg-[#070707] rounded-lg border border-border-subtle/50 space-y-3">
                          <div className="flex justify-between items-center border-b border-border-subtle/30 pb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-accent font-heading flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> EOD Personal Reflections
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-text">
                              Pride Rating: <span className="text-primary-accent font-extrabold">{selectedReport.mission.eodActuals?.prideRating || 3}/5 Rating</span>
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-muted-text font-extrabold block">What went well and lessons learned</span>
                              <p className="text-xs text-primary-text/90 font-semibold italic leading-relaxed mt-1">
                                "{selectedReport.mission.eodActuals?.prideReason || 'No reflection details recorded for this daily review.'}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  </Card>
                </motion.div>
              ) : (
                <Card className="p-8 bg-card-surface border-border-subtle min-h-[400px] flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-muted-text/30 mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">No Day Selected</h3>
                  <p className="text-xs text-muted-text mt-2 max-w-xs leading-relaxed font-semibold">
                    Select a calendar date from the placement history ledger on the left to inspect detailed logs.
                  </p>
                </Card>
              )}
            </AnimatePresence>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
