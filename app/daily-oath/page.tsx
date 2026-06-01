'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/gtag';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/layout/footer';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const SUBJECT_OPTIONS = ['OOPS', 'OS', 'CN', 'DBMS', 'CO', 'SE'];
const COMMUNICATION_OPTIONS = [
  'English Speaking',
  'Interview Practice',
  'Group Discussion',
  'Resume Improvement',
  'LinkedIn Activity',
  'Mock Interview'
];

export default function DailyOathPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // FORM STATES
  const [dsaEasy, setDsaEasy] = React.useState(0);
  const [dsaMedium, setDsaMedium] = React.useState(0);
  const [dsaHard, setDsaHard] = React.useState(0);

  const [isBuilding, setIsBuilding] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [projectDesc, setProjectDesc] = React.useState('');
  const [plannedHours, setPlannedHours] = React.useState(2);
  const [willPushGithub, setWillPushGithub] = React.useState(false);
  const [exploreNew, setExploreNew] = React.useState(false);

  const [skills, setSkills] = React.useState<string[]>([]);
  const [newSkill, setNewSkill] = React.useState('');

  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
  const [subjectEffort, setSubjectEffort] = React.useState<Record<string, number>>({});

  const [selectedComm, setSelectedComm] = React.useState<string[]>([]);
  const [confidenceRating, setConfidenceRating] = React.useState(3);

  const [aptitudeTopic, setAptitudeTopic] = React.useState('');
  const [aptitudeQuestions, setAptitudeQuestions] = React.useState(0);

  const [oathAccepted, setOathAccepted] = React.useState(false);

  // AUTO CALCS
  const dsaTotal = Number(dsaEasy) + Number(dsaMedium) + Number(dsaHard);

  // ACTIONS
  const nextStep = () => {
    if (step < 8) setStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (!clean) return;
    if (skills.includes(clean)) {
      toast.warning('Skill already listed.');
      return;
    }
    setSkills([...skills, clean]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      const updatedEfforts = { ...subjectEffort };
      delete updatedEfforts[sub];
      setSubjectEffort(updatedEfforts);
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
      setSubjectEffort({ ...subjectEffort, [sub]: 50 }); // default to 50%
    }
  };

  const handleEffortChange = (sub: string, val: number) => {
    setSubjectEffort({
      ...subjectEffort,
      [sub]: val,
    });
  };

  const toggleComm = (opt: string) => {
    if (selectedComm.includes(opt)) {
      setSelectedComm(selectedComm.filter((o) => o !== opt));
    } else {
      setSelectedComm([...selectedComm, opt]);
    }
  };

  // SUBMIT HANDSHAKE
  const handleSubmit = async () => {
    if (!oathAccepted) {
      toast.error('You must accept today\'s commitment before entering your chamber.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/app/../api/daily-oath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dsaTargets: {
            easy: dsaEasy,
            medium: dsaMedium,
            hard: dsaHard,
          },
          development: {
            isBuilding,
            projectName: isBuilding ? projectName : '',
            projectDesc: isBuilding ? projectDesc : '',
            plannedHours: isBuilding ? plannedHours : 0,
            willPushGithub: isBuilding ? willPushGithub : false,
            exploreNew: isBuilding ? exploreNew : false,
          },
          skills,
          coreSubjects: selectedSubjects.map((sub) => ({
            subject: sub,
            plannedEffort: subjectEffort[sub] || 0,
          })),
          communication: {
            options: selectedComm,
            confidenceRating,
          },
          aptitude: {
            topicName: aptitudeTopic,
            plannedQuestions: aptitudeQuestions,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to submit morning oath.');
        return;
      }

      trackEvent('morning_oath_sealed', 'Oath');
      toast.success('Morning Oath Sealed!', {
        description: 'Today is officially registered. Relentless execution starts now! 🚀',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network connection issue. Try sealing again.');
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

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden select-none">
      {/* Background glow flares */}
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
              Morning Oath Engine
            </span>
            <span className="px-2.5 py-0.5 rounded bg-primary-accent/10 border border-primary-accent/15 text-[10px] font-black text-primary-accent uppercase tracking-wider">
              Step {step} of 8
            </span>
          </div>
        </div>
      </header>

      {/* CORE PAGE BODY */}
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
                
                {/* STEP 1: FOCUS & COMMITMENT WELCOME */}
                {step === 1 && (
                  <div className="space-y-6 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent">
                      <Flame className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white font-heading">
                        What are you building today?
                      </h2>
                      <p className="text-sm text-muted-text leading-relaxed">
                        Small consistent actions create big outcomes. Before launching your workspace, catalog your placement targets and seal your today&apos;s accountability oath.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-card-surface border border-border-subtle/60 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-text leading-relaxed">
                        DDSCC runs on absolute self-focus. Your daily targets are privately kept, helping you construct elite consistency day by day.
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button variant="primary" className="w-full py-4 text-xs font-extrabold uppercase tracking-widest font-heading" onClick={nextStep}>
                        Start Today&apos;s Mission <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DSA SECTION */}
                {step === 2 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 01</span>
                        <h2 className="text-xl font-bold text-white font-heading">DSA Problem Targets</h2>
                      </div>
                    </div>

                    <p className="text-sm text-muted-text">
                      How many DSA problems will you solve today? Be realistic. Consistency compounds.
                    </p>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="bg-[#050505] p-4 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 font-heading mb-2">Easy</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaEasy}
                          onChange={(e) => setDsaEasy(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                        />
                      </div>

                      <div className="bg-[#050505] p-4 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 font-heading mb-2">Medium</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaMedium}
                          onChange={(e) => setDsaMedium(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                        />
                      </div>

                      <div className="bg-[#050505] p-4 rounded-xl border border-border-subtle/80 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-heading mb-2">Hard</span>
                        <input
                          type="number"
                          min="0"
                          value={dsaHard}
                          onChange={(e) => setDsaHard(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live total view */}
                    <div className="p-4 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-text">Auto-Calculated Target Problems</span>
                      <span className="text-lg font-black text-primary-accent font-heading">{dsaTotal} Problems</span>
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

                {/* STEP 3: DEVELOPMENT SECTION */}
                {step === 3 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 02</span>
                        <h2 className="text-xl font-bold text-white font-heading">Development & Building</h2>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#050505] border border-border-subtle/80">
                      <div>
                        <span className="text-xs font-bold text-white block">Are you building something today?</span>
                        <span className="text-[10px] text-muted-text mt-0.5 block">Toggle to plan active coding/creation targets.</span>
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
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Project Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Portfolio Revamp"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Short Description</label>
                          <textarea 
                            placeholder="Describe what you plan to engineer today..."
                            rows={3}
                            value={projectDesc}
                            onChange={(e) => setProjectDesc(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                              Planned Effort: {plannedHours} Hours
                            </label>
                            <input 
                              type="range"
                              min="1"
                              max="12"
                              value={plannedHours}
                              onChange={(e) => setPlannedHours(parseInt(e.target.value))}
                              className="w-full accent-primary-accent bg-[#050505] cursor-pointer"
                            />
                          </div>
                          <div className="flex flex-col gap-2 bg-[#050505] p-3 rounded-lg border border-border-subtle/80 justify-center">
                            <label className="flex items-center gap-2 text-xs font-semibold text-muted-text cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={willPushGithub}
                                onChange={(e) => setWillPushGithub(e.target.checked)}
                                className="accent-primary-accent"
                              />
                              Will push commits to GitHub today
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-muted-text cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={exploreNew}
                                onChange={(e) => setExploreNew(e.target.checked)}
                                className="accent-primary-accent"
                              />
                              Planning to explore new technologies
                            </label>
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

                {/* STEP 4: SKILLS SECTION */}
                {step === 4 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 03</span>
                        <h2 className="text-xl font-bold text-white font-heading">Target Skills Acquisition</h2>
                      </div>
                    </div>

                    <p className="text-sm text-muted-text">
                      What skills are you strengthening today? Add multiple tools, stacks, or systems to show dynamic focus.
                    </p>

                    <form onSubmit={addSkill} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="e.g. MERN, Agentic AI, Resume Building"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-grow px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                      />
                      <Button type="submit" variant="secondary" className="px-4 py-2 flex items-center gap-1 text-xs">
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </form>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.length === 0 ? (
                        <p className="text-xs text-muted-text/50 italic py-4">No skills registered for today yet.</p>
                      ) : (
                        skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-accent/5 border border-primary-accent/15 text-xs text-white font-semibold group hover:border-red-500/30 transition-colors"
                          >
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => removeSkill(idx)} 
                              className="text-muted-text group-hover:text-red-400 hover:scale-110 transition-transform shrink-0 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
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

                {/* STEP 5: CORE SUBJECTS & EFFORT */}
                {step === 5 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 04</span>
                        <h2 className="text-xl font-bold text-white font-heading">Core Computer Science Subjects</h2>
                      </div>
                    </div>

                    <p className="text-sm text-muted-text">
                      Which CS fundamentals are you strengthening today? Select the targets and slide your planned revision intensity.
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      {SUBJECT_OPTIONS.map((sub) => {
                        const active = selectedSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              active 
                                ? 'bg-primary-accent/15 text-primary-accent border-primary-accent/30 font-extrabold'
                                : 'bg-[#050505] text-muted-text border-border-subtle/80 hover:text-white'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSubjects.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="space-y-4 pt-4 border-t border-border-subtle/30"
                      >
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider block">Set Planned Effort Targets</span>
                        {selectedSubjects.map((sub) => (
                          <div key={sub} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-[#050505] border border-border-subtle/60">
                            <span className="text-xs font-black text-white w-16">{sub}</span>
                            <div className="flex-grow flex items-center gap-3">
                              <input 
                                type="range"
                                min="10"
                                max="100"
                                step="10"
                                value={subjectEffort[sub] || 50}
                                onChange={(e) => handleEffortChange(sub, parseInt(e.target.value))}
                                className="flex-grow accent-primary-accent bg-secondary-surface cursor-pointer"
                              />
                              <span className="text-xs font-extrabold text-primary-accent w-10 text-right">
                                {subjectEffort[sub] || 50}%
                              </span>
                            </div>
                          </div>
                        ))}
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

                {/* STEP 6: COMMUNICATION */}
                {step === 6 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 05</span>
                        <h2 className="text-xl font-bold text-white font-heading">Communication & Profile</h2>
                      </div>
                    </div>

                    <p className="text-sm text-muted-text">
                      Strengthen your non-technical presentation capacity. Select today&apos;s active goals.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {COMMUNICATION_OPTIONS.map((opt) => {
                        const active = selectedComm.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleComm(opt)}
                            className={`p-3 rounded-xl flex items-center justify-between border text-left cursor-pointer transition-colors ${
                              active
                                ? 'bg-primary-accent/5 border-primary-accent/30 text-white'
                                : 'bg-[#050505] border-border-subtle/80 text-muted-text hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-semibold">{opt}</span>
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active ? 'border-primary-accent bg-primary-accent text-black' : 'border-border-subtle'
                            }`}>
                              {active && <CheckCircle2 className="w-3 h-3 text-[#050505]" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-border-subtle/30">
                      <label className="block text-xs font-bold text-white">Target Confidence Level for Today</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => setConfidenceRating(val)}
                            className={`w-9 h-9 rounded-lg border text-xs font-extrabold cursor-pointer transition-colors ${
                              confidenceRating === val
                                ? 'bg-primary-accent border-primary-accent text-[#050505]'
                                : 'bg-[#050505] border-border-subtle text-muted-text hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                        <span className="text-xs italic text-muted-text ml-2">
                          {confidenceRating === 5 ? 'Elite performance' : confidenceRating >= 3 ? 'Confident & fluent' : 'Deliberate practice'}
                        </span>
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

                {/* STEP 7: APTITUDE PRACTICE */}
                {step === 7 && (
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-widest block">Section 06</span>
                        <h2 className="text-xl font-bold text-white font-heading">Aptitude & Reasoning</h2>
                      </div>
                    </div>

                    <p className="text-sm text-muted-text">
                      Strengthen analytical, reasoning, and quantitative problem solving parameters.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Aptitude Topic</label>
                        <input 
                          type="text"
                          placeholder="e.g. Permutations, Blood Relations, Syllogisms"
                          value={aptitudeTopic}
                          onChange={(e) => setAptitudeTopic(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">Planned Quant/Verbal Questions</label>
                        <input 
                          type="number"
                          min="0"
                          value={aptitudeQuestions}
                          onChange={(e) => setAptitudeQuestions(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#050505] border border-border-subtle text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="pt-2">
                        <a 
                          href="https://www.indiabix.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs text-primary-accent hover:underline font-bold bg-[#050505] px-3.5 py-2 rounded-xl border border-border-subtle"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Practice on IndiaBix Portal
                        </a>
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

                {/* STEP 8: THE MORNING OATH COMMITMENT */}
                {step === 8 && (
                  <div className="space-y-6 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-center text-primary-accent">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white font-heading">
                        Seal Today&apos;s Morning Oath
                      </h2>
                      <p className="text-sm text-muted-text leading-relaxed">
                        By sealing this daily commitment record, you lock in your placement parameters. Track, focus, and execute under your own private standards today.
                      </p>
                    </div>

                    <div className="bg-[#050505] border border-border-subtle/80 p-5 rounded-xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary-accent" />
                      <p className="text-sm italic font-extrabold text-white leading-relaxed select-none">
                        &ldquo;I commit to showing up today. Progress is built one consistent day at a time.&rdquo;
                      </p>
                      <p className="text-xs text-muted-text leading-relaxed">
                        I pledge to deliberately focus on my targets. Easy problems, build efforts, and CS subjects. No comparing, only relentless self-growth.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2">
                      <input 
                        type="checkbox"
                        id="oath-check"
                        checked={oathAccepted}
                        onChange={(e) => setOathAccepted(e.target.checked)}
                        className="accent-primary-accent mt-0.5"
                      />
                      <label htmlFor="oath-check" className="text-xs font-semibold text-muted-text select-none cursor-pointer leading-tight">
                        I accept today&apos;s commitment as my final accountability contract.
                      </label>
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
                        Start My Day
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
