'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Search,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function DayDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dateString = params.date as string;

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!dateString) return;
    const fetchDayDetails = async () => {
      try {
        const res = await fetch(`/api/history/${dateString}`);
        if (!res.ok) {
          router.push('/history');
          return;
        }
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error('Details fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDayDetails();
  }, [dateString, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col items-center justify-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text animate-pulse">
          Parsing placement outcomes for {dateString}...
        </span>
      </div>
    );
  }

  if (!data || !data.mission) {
    return (
      <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
          <Card className="p-8 text-center bg-card-surface border-border-subtle max-w-md">
            <span className="text-xs text-red-500 uppercase font-extrabold tracking-widest">Error 404</span>
            <h3 className="text-lg font-black text-white uppercase tracking-wider font-heading mt-1">
              Log Record Not Found
            </h3>
            <p className="text-xs text-muted-text mt-2 leading-relaxed">
              No historical placement record exists for {dateString}.
            </p>
            <Button 
              variant="secondary"
              className="mt-6 text-[10px] uppercase tracking-widest font-heading w-full"
              onClick={() => router.push('/history')}
            >
              Return to Archives
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { mission, badge } = data;
  const actuals = mission.eodActuals || {};

  return (
    <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col font-sans antialiased">
      
      {/* NAVBAR */}
      <Navbar />

      {/* BODY FRAME */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-12 space-y-8 mt-16">
        
        {/* UPPER BREADCRUMBS */}
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm"
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-heading py-2.5"
            onClick={() => router.push('/history')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Archive
          </Button>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-accent" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
              Placement Report for {dateString}
            </span>
          </div>
        </div>

        {/* OVERALL PERFORMANCE SEALS HEADER */}
        <Card className="p-8 bg-card-surface border-border-subtle relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-accent/40 to-transparent" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Discipline Performance Rating
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider font-heading">
                Outcome Summary Log
              </h2>
              <p className="text-xs text-muted-text max-w-lg leading-relaxed font-semibold">
                This dynamic ledger archives all planned placement milestones compared with authentic, night-verified achievements on {dateString}.
              </p>
            </div>

            <div className="flex items-center gap-6 self-start md:self-center shrink-0">
              
              {/* Badge Label */}
              <div className="text-right">
                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded border inline-block ${badge.className}`}>
                  {badge.label}
                </span>
                <p className="text-[10px] text-muted-text mt-1.5 font-bold uppercase tracking-wider">
                  {badge.description}
                </p>
              </div>

              {/* Dynamic Score Ring */}
              <div className="w-20 h-20 rounded-full border-4 border-border-subtle/80 flex items-center justify-center relative overflow-hidden bg-[#050505]">
                <div className="absolute inset-0 bg-primary-accent/5 rounded-full" />
                <span className="text-xl font-black text-primary-accent font-heading relative z-10">
                  {mission.isMissed ? '0' : mission.ddsccScore || 0}%
                </span>
              </div>

            </div>
          </div>
        </Card>

        {/* 6 DISCIPLINE OUTCOMES DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. DSA PILLAR */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 1
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                DSA & Algorithms
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-border-subtle/40">
                  <span className="font-semibold text-muted-text">Targets Planned</span>
                  <span className="text-white font-extrabold">{mission.dsaTargets?.total || 0} Problems</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                    Easy: {actuals.dsa?.easy || 0}
                  </div>
                  <div className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg">
                    Med: {actuals.dsa?.medium || 0}
                  </div>
                  <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                    Hard: {actuals.dsa?.hard || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Status</span>
              <span className="text-white font-extrabold">
                {actuals.dsa?.easy || actuals.dsa?.medium || actuals.dsa?.hard ? 'Logged' : '0 Solved'}
              </span>
            </div>
          </Card>

          {/* 2. DEVELOPMENT PILLAR */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 2
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                Development Builds
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-border-subtle/40">
                  <span className="font-semibold text-muted-text">Project Target</span>
                  <span className="text-white font-extrabold">
                    {mission.development?.isBuilding ? mission.development.projectName : 'None Planned'}
                  </span>
                </div>

                {mission.development?.isBuilding && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-muted-text">GitHub Pushed</span>
                      <span className="text-white">{actuals.development?.githubPushed ? '🟢 Yes' : '🔴 No'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-muted-text">Satisfaction</span>
                      <span className="text-primary-accent">⭐ {actuals.development?.satisfactionRating || 0} / 5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Status</span>
              <span className="text-white font-extrabold">
                {mission.development?.isBuilding ? 'Completed Build' : 'Not Scheduled'}
              </span>
            </div>
          </Card>

          {/* 3. TECHNICAL SKILLS */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 3
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                Technical Skills Practice
              </h4>

              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">
                  Skills Focus Targets
                </span>
                
                <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
                  {mission.skills?.length > 0 ? (
                    mission.skills.map((skill: string, index: number) => {
                      const completed = (actuals.skills || []).includes(skill);
                      return (
                        <div key={index} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#050505] border border-border-subtle/40">
                          <span className="font-semibold text-white">{skill}</span>
                          {completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-accent" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500/60" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-muted-text">No technical skills scheduled.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Status</span>
              <span className="text-white font-extrabold">
                {(actuals.skills || []).length} / {mission.skills?.length || 0} Solved
              </span>
            </div>
          </Card>

          {/* 4. CORE CS FUNDAMENTALS */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 4
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                Core CS Fundamentals
              </h4>

              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">
                  OS, DBMS, CN Revise
                </span>

                <div className="space-y-2 max-h-[90px] overflow-y-auto pr-1">
                  {mission.coreSubjects?.length > 0 ? (
                    mission.coreSubjects.map((sub: any, index: number) => {
                      const matchingActual = (actuals.coreSubjects || []).find((a: any) => a.subject === sub.subject);
                      const actualEff = matchingActual ? matchingActual.actualEffort : 0;
                      return (
                        <div key={index} className="flex justify-between items-center text-xs p-2 rounded bg-[#050505] border border-border-subtle/40">
                          <span className="font-semibold text-white">{sub.subject}</span>
                          <span className="text-primary-accent font-extrabold font-heading">
                            {actualEff}% / {sub.plannedEffort}%
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-muted-text">No CS core hours planned.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Status</span>
              <span className="text-white font-extrabold">
                {mission.coreSubjects?.length || 0} Core Topics
              </span>
            </div>
          </Card>

          {/* 5. COMMUNICATION & BEHAVIORAL */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 5
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                Communication Skills
              </h4>

              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">
                  Verbal Mock Checked
                </span>

                <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
                  {mission.communication?.options?.length > 0 ? (
                    mission.communication.options.map((opt: string, index: number) => {
                      const completed = (actuals.communication?.options || []).includes(opt);
                      return (
                        <div key={index} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#050505] border border-border-subtle/40">
                          <span className="font-semibold text-white">{opt}</span>
                          {completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-accent" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500/60" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-muted-text">No speaking options scheduled.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Confidence</span>
              <span className="text-white font-extrabold">
                ⭐ {actuals.communication?.confidenceRating || 0} / 5
              </span>
            </div>
          </Card>

          {/* 6. APTITUDE PILLAR */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
                Pillar 6
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mt-0.5 mb-4">
                Aptitude & Quantitative
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-border-subtle/40">
                  <span className="font-semibold text-muted-text">Aptitude Topic</span>
                  <span className="text-white font-extrabold">
                    {mission.aptitude?.plannedQuestions > 0 ? mission.aptitude.topicName : 'None Planned'}
                  </span>
                </div>

                {mission.aptitude?.plannedQuestions > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-text">Questions Handled</span>
                    <span className="text-primary-accent font-heading font-extrabold">
                      {actuals.aptitude?.actualQuestions || 0} / {mission.aptitude.plannedQuestions} Solved
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-text">
              <span>Status</span>
              <span className="text-white font-extrabold">
                {mission.aptitude?.plannedQuestions > 0 ? 'Logged Questions' : 'Not Scheduled'}
              </span>
            </div>
          </Card>

        </div>

        {/* TAKEAway reflection panel */}
        {actuals.reflectionNote && (
          <Card className="p-6 bg-card-surface border-border-subtle relative overflow-hidden">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
              EOD Learn Takeaways
            </span>
            <h4 className="text-base font-black text-white uppercase tracking-wider font-heading mt-1 mb-3">
              Lessons & takeaways Registered
            </h4>
            
            <div className="p-4 bg-[#050505] rounded-xl border border-border-subtle/50 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-muted-text font-bold uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                <span>Self Pride Rating</span>
                <span className="text-primary-accent">⭐ {actuals.prideRating || 3} of 5 Rating</span>
              </div>
              <p className="text-sm italic text-white leading-relaxed select-text pt-1">
                &ldquo;{actuals.reflectionNote}&rdquo;
              </p>
            </div>
          </Card>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
