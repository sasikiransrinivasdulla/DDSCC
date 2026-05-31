'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Code2, 
  Terminal, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Plus, 
  X, 
  CheckCircle2, 
  MessageSquare,
  Bookmark,
  ExternalLink,
  Award,
  ShieldCheck,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/layout/footer';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function DailyReviewPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mission, setMission] = React.useState<any>(null);

  // FORM ACTUALS STATES
  const [dsaEasy, setDsaEasy] = React.useState(0);
  const [dsaMedium, setDsaMedium] = React.useState(0);
  const [dsaHard, setDsaHard] = React.useState(0);

  const [isBuilding, setIsBuilding] = React.useState(false);
  const [devProjectName, setDevProjectName] = React.useState('');
  const [devProjectDesc, setDevProjectDesc] = React.useState('');
  const [devGithubPushed, setDevGithubPushed] = React.useState(false);
  const [devExploreNew, setDevExploreNew] = React.useState(false);
  const [devSatisfactionRating, setDevSatisfactionRating] = React.useState(3);

  const [completedSkills, setCompletedSkills] = React.useState<string[]>([]);

  const [coreActualEffort, setCoreActualEffort] = React.useState<Record<string, number>>({});

  const [completedComm, setCompletedComm] = React.useState<string[]>([]);
  const [commConfidenceRating, setCommConfidenceRating] = React.useState(3);

  const [aptitudeTopic, setAptitudeTopic] = React.useState('');
  const [aptitudeQuestions, setAptitudeQuestions] = React.useState(0);

  const [prideRating, setPrideRating] = React.useState(3);
  const [reflectionNote, setReflectionNote] = React.useState('');

  // FETCH MORNING TARGETS
  React.useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await fetch('/api/daily-oath');
        if (!response.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await response.json();
        if (data.exists && !data.mission.isCompleted) {
          setMission(data.mission);
          
          // Prefill targets as baseline actual inputs
          setDsaEasy(data.mission.dsaTargets?.easy || 0);
          setDsaMedium(data.mission.dsaTargets?.medium || 0);
          setDsaHard(data.mission.dsaTargets?.hard || 0);

          setIsBuilding(data.mission.development?.isBuilding || false);
          setDevProjectName(data.mission.development?.projectName || '');
          setDevProjectDesc(data.mission.development?.projectDesc || '');
          setDevGithubPushed(data.mission.development?.willPushGithub || false);
          setDevExploreNew(data.mission.development?.exploreNew || false);

          setCompletedSkills(data.mission.skills || []);

          const initCoreEfforts: Record<string, number> = {};
          data.mission.coreSubjects?.forEach((c: any) => {
            initCoreEfforts[c.subject] = c.plannedEffort;
          });
          setCoreActualEffort(initCoreEfforts);

          setCompletedComm(data.mission.communication?.options || []);
          setAptitudeTopic(data.mission.aptitude?.topicName || '');
          setAptitudeQuestions(data.mission.aptitude?.plannedQuestions || 0);
        } else {
          // If no mission or already completed, direct immediately to dashboard
          toast.success('Your day is already fully reflected!');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load today\'s mission:', err);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMission();
  }, [router]);

  // AUTO CALCS
  const actualDsaTotal = Number(dsaEasy) + Number(dsaMedium) + Number(dsaHard);
  const plannedDsaTotal = mission?.dsaTargets?.total || 0;

  // ACTIONS
  const nextStep = () => {
    if (step < 8) setStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const toggleSkillCompleted = (skill: string) => {
    if (completedSkills.includes(skill)) {
      setCompletedSkills(completedSkills.filter((s) => s !== skill));
    } else {
      setCompletedSkills([...completedSkills, skill]);
    }
  };

  const toggleCommCompleted = (opt: string) => {
    if (completedComm.includes(opt)) {
      setCompletedComm(completedComm.filter((o) => o !== opt));
    } else {
      setCompletedComm([...completedComm, opt]);
    }
  };

  const handleCoreEffortChange = (sub: string, val: number) => {
    setCoreActualEffort({
      ...coreActualEffort,
      [sub]: val,
    });
  };

  // SUBMIT REVIEW
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/daily-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dsa: {
            easy: dsaEasy,
            medium: dsaMedium,
            hard: dsaHard,
          },
          development: {
            projectName: devProjectName,
            projectDesc: devProjectDesc,
            githubPushed: devGithubPushed,
            exploreNew: devExploreNew,
            satisfactionRating: devSatisfactionRating,
          },
          skills: completedSkills,
          coreSubjects: Object.keys(coreActualEffort).map((sub) => ({
            subject: sub,
            actualEffort: coreActualEffort[sub],
          })),
          communication: {
            options: completedComm,
            confidenceRating: commConfidenceRating,
          },
          aptitude: {
            topicName: aptitudeTopic,
            actualQuestions: aptitudeQuestions,
          },
          prideRating,
          reflectionNote,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to submit night reflection.');
        return;
      }

      // Automatically trigger a streak calculation refresh as well
      await fetch('/api/sync-streaks');

      toast.success('Reflection Sealed! 🌟', {
        description: `Your DDSCC score for today is ${data.score}%. Beast mode recorded!`,
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Reflection submission issue:', err);
      toast.error('Network issue. Try sealing your review again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ANIMATION SETTINGS
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as any } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
            Gathering Morning Targets...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary-accent/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary-accent/3 blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="w-full border-b border-border-subtle bg-background/60 backdrop-blur-md relative z-20 py-5">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-widest text-white font-heading">DDSCC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text">
              Night Reflection
            </span>
            <span className="px-2.5 py-0.5 rounded bg-primary-accent/10 border border-primary-accent/15 text-[10px] font-black text-primary-accent uppercase tracking-wider">
              Step {step} of 8
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-2xl">

          {/* Progress bar tracking line */}
          <div className="w-full h-1 bg-secondary-surface rounded-full overflow-hidden mb-8 border border-border-subtle/50">
            <div 
              className="h-full bg-primary-accent transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="bg-[#0A0A0A] border-border-subtle/90 shadow-2xl relative overflow-hidden glow-emerald-sm p-2 sm:p-6">
                
                {/* STEP 1: REFLECTION INTRO */}
                {step === 1 && (
                  <div className="space-y-6 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent">
                      <Smile className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white font-heading">
                        Let&apos;s reflect on today.
                      </h2>
                      <p className="text-sm text-muted-text leading-relaxed">
                        Progress isn&apos;t perfection. Honesty matters. Take a moment to catalogue what you completed today, calculate your DDSCC Score, and secure your accountability record.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-card-surface border border-border-subtle/60 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-text leading-relaxed">
                        Your honest reflection builds resilience. No leaderboard, no comparison. Only self-growth and real consistency metrics.
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button variant="primary" className="w-full py-4 text-xs font-extrabold uppercase tracking-widest font-heading" onClick={nextStep}>
                        Begin Reflection <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DSA ACTUALS */}
                {step === 2 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 01</span>
                        <h2 className="text-xl font-bold text-white font-heading">DSA Completed</h2>
                      </div>
                    </div>

                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/60">
                      <span className="text-[10px] uppercase font-bold text-primary-accent block mb-1">Morning Target</span>
                      <div className="flex gap-4 text-xs text-white font-bold">
                        <span>Planned Easy: {mission?.dsaTargets?.easy || 0}</span>
                        <span>Planned Medium: {mission?.dsaTargets?.medium || 0}</span>
                        <span>Planned Hard: {mission?.dsaTargets?.hard || 0}</span>
                        <span className="text-primary-accent ml-auto">Total: {plannedDsaTotal}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-text">
                      How many problems did you actually solve? Be extremely honest.
                    </p>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="bg-[#050505] p-3 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 font-heading mb-1.5">Easy Actual</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaEasy}
                          onChange={(e) => setDsaEasy(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-xl font-black text-white focus:outline-none"
                        />
                      </div>

                      <div className="bg-[#050505] p-3 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 font-heading mb-1.5">Medium Actual</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaMedium}
                          onChange={(e) => setDsaMedium(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-xl font-black text-white focus:outline-none"
                        />
                      </div>

                      <div className="bg-[#050505] p-3 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-heading mb-1.5">Hard Actual</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaHard}
                          onChange={(e) => setDsaHard(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-xl font-black text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Proportional calculations */}
                    <div className="p-4 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-text">Calculated Actual problems</span>
                      <span className="text-sm font-black text-primary-accent font-heading">
                        {actualDsaTotal} of {plannedDsaTotal} completed (
                        {plannedDsaTotal > 0 ? Math.round(Math.min(100, (actualDsaTotal / plannedDsaTotal) * 100)) : 100}%)
                      </span>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DEVELOPMENT ACTUAL REVIEW */}
                {step === 3 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 02</span>
                        <h2 className="text-xl font-bold text-white font-heading">Development Work Review</h2>
                      </div>
                    </div>

                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/60 text-xs text-muted-text space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary-accent block">Morning Goal</span>
                      {mission?.development?.isBuilding ? (
                        <>
                          <div className="font-bold text-white uppercase">Project: {mission.development.projectName}</div>
                          <div>Target planned effort: {mission.development.plannedHours} hours</div>
                        </>
                      ) : (
                        <div>No active development build was planned for today.</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#050505] border border-border-subtle/80">
                      <div>
                        <span className="text-xs font-bold text-white block">Did you build something today?</span>
                        <span className="text-[10px] text-muted-text mt-0.5 block">Toggle to record active coding sessions.</span>
                      </div>
                      <button 
                        onClick={() => setIsBuilding(!isBuilding)}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                          isBuilding ? 'bg-primary-accent' : 'bg-secondary-surface'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                          isBuilding ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {isBuilding && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        className="space-y-4 pt-2 border-t border-border-subtle/40"
                      >
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">What did you build today?</label>
                          <textarea 
                            placeholder="Describe what you engineered today..."
                            rows={3}
                            value={devProjectDesc}
                            onChange={(e) => setDevProjectDesc(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2 bg-[#050505] p-3 rounded-lg border border-border-subtle/80 justify-center">
                            <label className="flex items-center gap-2 text-xs font-semibold text-muted-text cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={devGithubPushed}
                                onChange={(e) => setDevGithubPushed(e.target.checked)}
                                className="accent-primary-accent"
                              />
                              Pushed commits to GitHub today
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-muted-text cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={devExploreNew}
                                onChange={(e) => setDevExploreNew(e.target.checked)}
                                className="accent-primary-accent"
                              />
                              Explored new systems/technologies
                            </label>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text">
                              Work Satisfaction: {devSatisfactionRating}/5
                            </label>
                            <div className="flex gap-1.5 pt-1.5">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setDevSatisfactionRating(val)}
                                  className={`w-8 h-8 rounded border text-xs font-bold transition-colors cursor-pointer ${
                                    devSatisfactionRating === val
                                      ? 'bg-primary-accent border-primary-accent text-black font-extrabold'
                                      : 'bg-[#050505] border-border-subtle text-muted-text hover:text-white'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: SKILLS CHECKLIST */}
                {step === 4 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 03</span>
                        <h2 className="text-xl font-bold text-white font-heading">Skills Completed</h2>
                      </div>
                    </div>

                    <p className="text-xs text-muted-text">
                      Check each skill you actively practiced or researched today:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {mission?.skills?.length === 0 ? (
                        <p className="text-xs text-muted-text/50 italic py-4">No skills were planned for today.</p>
                      ) : (
                        mission.skills.map((skill: string, idx: number) => {
                          const completed = completedSkills.includes(skill);
                          return (
                            <button 
                              key={idx}
                              type="button"
                              onClick={() => toggleSkillCompleted(skill)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-colors ${
                                completed 
                                  ? 'bg-primary-accent/10 border-primary-accent text-white font-extrabold'
                                  : 'bg-[#050505] border-border-subtle/80 text-muted-text hover:text-white'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                completed ? 'border-primary-accent bg-primary-accent text-black' : 'border-border-subtle'
                              }`}>
                                {completed && <CheckCircle2 className="w-2.5 h-2.5 text-black" />}
                              </span>
                              {skill}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {mission?.skills?.length > 0 && (
                      <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/60 text-xs text-muted-text flex justify-between items-center">
                        <span>Section Completion Progress</span>
                        <span className="text-primary-accent font-extrabold">
                          {completedSkills.length} of {mission.skills.length} completed (
                          {Math.round((completedSkills.length / mission.skills.length) * 100)}%)
                        </span>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: CORE CS SUBJECTS REVIEW */}
                {step === 5 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 04</span>
                        <h2 className="text-xl font-bold text-white font-heading">Core CS Fundamentals</h2>
                      </div>
                    </div>

                    <p className="text-xs text-muted-text">
                      Update your completion intensity sliders. How much focused revision did you execute?
                    </p>

                    <div className="space-y-4 pt-2">
                      {mission?.coreSubjects?.length === 0 ? (
                        <p className="text-xs text-muted-text/50 italic py-4">No core fundamentals were planned for today.</p>
                      ) : (
                        mission.coreSubjects.map((sub: any) => (
                          <div key={sub.subject} className="flex flex-col gap-2 p-3 rounded-lg bg-[#050505] border border-border-subtle/60">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-white">{sub.subject}</span>
                              <span className="text-[10px] text-muted-text">Planned Target: {sub.plannedEffort}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={coreActualEffort[sub.subject] || 0}
                                onChange={(e) => handleCoreEffortChange(sub.subject, parseInt(e.target.value))}
                                className="flex-grow accent-primary-accent bg-secondary-surface cursor-pointer"
                              />
                              <span className="text-xs font-extrabold text-primary-accent w-10 text-right">
                                {coreActualEffort[sub.subject] || 0}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 6: COMMUNICATION REVIEW */}
                {step === 6 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 05</span>
                        <h2 className="text-xl font-bold text-white font-heading">Communication Actuals</h2>
                      </div>
                    </div>

                    <p className="text-xs text-muted-text">
                      Check all planned activities you completed and report your actual confidence level.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {mission?.communication?.options?.length === 0 ? (
                        <p className="text-xs text-muted-text/50 italic col-span-2 py-4">No communication activities were planned.</p>
                      ) : (
                        mission.communication.options.map((opt: string) => {
                          const completed = completedComm.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleCommCompleted(opt)}
                              className={`p-3 rounded-xl flex items-center justify-between border text-left cursor-pointer transition-colors ${
                                completed
                                  ? 'bg-primary-accent/5 border-primary-accent/30 text-white font-bold'
                                  : 'bg-[#050505] border-border-subtle/80 text-muted-text hover:text-white'
                              }`}
                            >
                              <span className="text-xs font-semibold">{opt}</span>
                              <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                                completed ? 'border-primary-accent bg-primary-accent text-black' : 'border-border-subtle'
                              }`}>
                                {completed && <CheckCircle2 className="w-3 h-3 text-[#050505]" />}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-border-subtle/30">
                      <label className="block text-xs font-bold text-white">Actual Confidence Level Achieved</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCommConfidenceRating(val)}
                            className={`w-9 h-9 rounded-lg border text-xs font-extrabold cursor-pointer transition-colors ${
                              commConfidenceRating === val
                                ? 'bg-primary-accent border-primary-accent text-[#050505]'
                                : 'bg-[#050505] border-border-subtle text-muted-text hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 7: APTITUDE PRACTICE REVIEW */}
                {step === 7 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 06</span>
                        <h2 className="text-xl font-bold text-white font-heading">Aptitude & Analytical</h2>
                      </div>
                    </div>

                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/60 text-xs text-muted-text space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary-accent block">Morning Goal</span>
                      {mission?.aptitude?.plannedQuestions > 0 ? (
                        <>
                          <div className="font-bold text-white uppercase">Topic: {mission.aptitude.topicName}</div>
                          <div>Target planned count: {mission.aptitude.plannedQuestions} questions</div>
                        </>
                      ) : (
                        <div>No aptitude practice was planned for today.</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Analytical Topic Practiced</label>
                        <input 
                          type="text"
                          placeholder="Permutations, Blood Relations, Syllogisms"
                          value={aptitudeTopic}
                          onChange={(e) => setAptitudeTopic(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Questions Actually Solved</label>
                        <input 
                          type="number"
                          min="0"
                          value={aptitudeQuestions}
                          onChange={(e) => setAptitudeQuestions(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-1 py-3 text-xs" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button variant="primary" className="flex-1 py-3 text-xs" onClick={nextStep}>
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 8: DAILY REFLECTION & PRIDE */}
                {step === 8 && (
                  <div className="space-y-6 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent">
                      <Bookmark className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white font-heading">
                        Seal Today&apos;s Reflections
                      </h2>
                      <p className="text-sm text-muted-text leading-relaxed">
                        Conclude today&apos;s accountability cycle. Record lessons learned and calculate your weighted DDSCC Daily Score.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white">How proud are you of today&apos;s efforts?</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPrideRating(val)}
                              className={`w-9 h-9 rounded-lg border text-xs font-extrabold cursor-pointer transition-colors ${
                                prideRating === val
                                  ? 'bg-primary-accent border-primary-accent text-black'
                                  : 'bg-[#050505] border-border-subtle text-muted-text hover:text-white'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">What did you learn today? (Optional Note)</label>
                        <textarea 
                          placeholder="Log key patterns, technical takeaways, or discipline insights discovered today..."
                          rows={3}
                          value={reflectionNote}
                          onChange={(e) => setReflectionNote(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="secondary" className="flex-grow py-3 text-xs w-1/3" onClick={prevStep}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                      </Button>
                      <Button 
                        variant="primary" 
                        className="flex-grow py-3 text-xs w-2/3 uppercase font-extrabold tracking-widest font-heading" 
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                      >
                        Seal My Day
                      </Button>
                    </div>
                  </div>
                )}

              </Card>
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
