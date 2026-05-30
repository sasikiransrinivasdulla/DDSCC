'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Cpu, 
  BookOpen, 
  Target, 
  Heart,
  Code,
  Layers,
  Database,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const ROLE_OPTIONS = [
  { id: 'swe', label: 'Software Engineer', icon: Code },
  { id: 'ai', label: 'AI Engineer', icon: Cpu },
  { id: 'agentic', label: 'Agentic AI Engineer', icon: Target },
  { id: 'fullstack', label: 'Full Stack Developer', icon: Layers },
  { id: 'java', label: 'Java Developer', icon: Terminal },
  { id: 'product', label: 'Product Engineer', icon: Sparkles },
  { id: 'data', label: 'Data Engineer', icon: Database },
  { id: 'devops', label: 'DevOps Engineer', icon: Activity },
  { id: 'studies', label: 'Higher Studies', icon: BookOpen },
  { id: 'other', label: 'Other', icon: UserCheck }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Profile Onboarding states
  const [motivationText, setMotivationText] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('');
  const [customRole, setCustomRole] = React.useState('');
  const [oathAccepted, setOathAccepted] = React.useState(false);

  const activeRole = selectedRole === 'other' ? customRole : selectedRole;

  // Validation rules for steps
  const isStep2Valid = motivationText.trim().length >= 10;
  const isStep3Valid = selectedRole && (selectedRole !== 'other' || customRole.trim().length > 0);
  const isStep4Valid = oathAccepted;

  const nextStep = () => {
    if (step === 2 && !isStep2Valid) {
      toast.error('Deepen your anchor.', {
        description: 'Please describe why you are here in at least 10 characters.',
      });
      return;
    }
    if (step === 3 && !isStep3Valid) {
      toast.error('Clarify your path.', {
        description: 'Please select a target role or enter your custom path.',
      });
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSealOnboarding = async () => {
    if (!isStep4Valid) {
      toast.error('Oath signature missing.', {
        description: 'Please read and accept the personal commitment check.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole: activeRole,
          motivationText: motivationText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to seal onboarding data. Please try again.');
        setIsLoading(false);
        return;
      }

      toast.success('Chamber Initialized Successfully', {
        description: 'Welcome to your private discipline operating system.',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Onboarding seal error:', error);
      toast.error('Network connection issue. Failed to establish connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Decorative calm glowing circles in background */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-primary-accent/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-primary-accent/5 blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full max-w-2xl"
        >
          {/* Main Card */}
          <Card className="bg-card-surface border-border-subtle/80 shadow-2xl relative overflow-hidden">
            
            {/* Header visual gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-primary-accent/40 to-transparent" />

            {/* Stepper Progress Bar */}
            <div className="w-full bg-[#161616] h-1.5 overflow-hidden flex">
              <motion.div 
                className="bg-primary-accent h-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <CardContent className="p-8 md:p-10 min-h-[380px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: WELCOME SCREEN */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/5 border border-primary-accent/25 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary-accent" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-3xl font-black font-heading text-white tracking-tight uppercase">
                        Welcome to DDSCC
                      </h2>
                      <p className="text-base text-primary-text/90 leading-relaxed font-semibold">
                        This platform is built for discipline, consistency, and growth.
                      </p>
                      <p className="text-sm text-muted-text max-w-xl leading-relaxed">
                        DDSCC is not a tracker of checklists. It is a strictly personal preparation chamber designed to keep you focused on your placement milestones. There are no social networks. There are no comparison leaderboards. There is only self-growth.
                      </p>
                    </div>

                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-border-subtle/50 flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-primary-accent shrink-0 animate-pulse" />
                      <span className="text-xs uppercase font-bold tracking-wider text-muted-text">
                        No comparison. No pressure. Only progress.
                      </span>
                    </div>

                    <div className="pt-6 border-t border-border-subtle/40 flex justify-end">
                      <Button 
                        variant="primary" 
                        onClick={nextStep}
                        className="font-bold font-heading px-6 py-2.5 text-sm tracking-wide group"
                      >
                        Begin Journey
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: YOUR WHY */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/5 border border-primary-accent/25 flex items-center justify-center text-primary-accent">
                      <Heart className="w-6 h-6 fill-primary-accent/15" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-primary-accent font-heading">
                        Step 02 / Core Motivation
                      </span>
                      <h3 className="text-2xl font-black font-heading text-white tracking-tight uppercase">
                        Why are you here?
                      </h3>
                      <p className="text-sm text-muted-text leading-relaxed">
                        What is driving this journey? Define your personal anchor. Be honest, be serious, and be specific. This stays strictly private.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        required
                        value={motivationText}
                        onChange={(e) => setMotivationText(e.target.value)}
                        placeholder="e.g. Crack placements to secure my financial freedom, stop procrastinating on LeetCode questions, and become fully interview-ready by next month."
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg bg-secondary-surface border border-border-subtle/80 text-base text-primary-text placeholder:text-muted-text/40 focus:outline-none focus:border-primary-accent/50 focus:ring-1 focus:ring-primary-accent/20 transition-all resize-none"
                      />
                      
                      <div className="flex justify-between items-center text-xs text-muted-text">
                        <span>Characters: {motivationText.length} (Min 10 required)</span>
                        {motivationText.length > 0 && !isStep2Valid && (
                          <span className="text-red-400 font-bold">Anchor details too short</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border-subtle/40 flex justify-between items-center">
                      <Button variant="ghost" onClick={prevStep} className="text-sm font-heading font-bold">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={nextStep}
                        disabled={!isStep2Valid}
                        className="font-bold font-heading px-6 py-2.5 text-sm tracking-wide"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: TARGET ROLE */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/5 border border-primary-accent/25 flex items-center justify-center text-primary-accent">
                      <Target className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-primary-accent font-heading">
                        Step 03 / Engineering Path
                      </span>
                      <h3 className="text-2xl font-black font-heading text-white tracking-tight uppercase">
                        What are you becoming?
                      </h3>
                      <p className="text-sm text-muted-text leading-relaxed">
                        Select the goal you are dedicating your placement routines toward.
                      </p>
                    </div>

                    {/* SELECTABLE CARDS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                      {ROLE_OPTIONS.map((opt) => {
                        const IconComponent = opt.icon;
                        const isSelected = selectedRole === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setSelectedRole(opt.id)}
                            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                              isSelected 
                                ? 'bg-primary-accent/5 border-primary-accent/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.06)]' 
                                : 'bg-[#0f0f0f] border-border-subtle hover:border-border-subtle/80 hover:bg-[#131313]'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-primary-accent' : 'text-muted-text'}`} />
                            <span className="text-xs font-extrabold tracking-wide uppercase font-heading leading-tight truncate w-full mt-1.5">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* DYNAMIC OTHER TEXT INPUT */}
                    <AnimatePresence>
                      {selectedRole === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2"
                        >
                          <input
                            type="text"
                            required
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="Specify your target path..."
                            className="w-full px-4 py-2.5 bg-secondary-surface border border-border-subtle/80 rounded-lg text-sm text-primary-text placeholder:text-muted-text/40 focus:outline-none focus:border-primary-accent/40"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-6 border-t border-border-subtle/40 flex justify-between items-center">
                      <Button variant="ghost" onClick={prevStep} className="text-sm font-heading font-bold">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={nextStep}
                        disabled={!isStep3Valid}
                        className="font-bold font-heading px-6 py-2.5 text-sm tracking-wide"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: PERSONAL OATH */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/5 border border-primary-accent/25 flex items-center justify-center text-primary-accent animate-pulse">
                      <Sparkles className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-primary-accent font-heading">
                        Step 04 / Commitment Seal
                      </span>
                      <h3 className="text-2xl font-black font-heading text-white tracking-tight uppercase">
                        Seal Personal Oath
                      </h3>
                      <p className="text-sm text-muted-text leading-relaxed">
                        Read the personal discipline commitment carefully and sign to seal your progress logs.
                      </p>
                    </div>

                    {/* OATH DIALOG PANEL */}
                    <div className="bg-[#050505] p-5 rounded-lg border border-border-subtle/60 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="text-primary-accent font-black text-sm font-heading">01.</span>
                        <p className="text-sm text-primary-text/90 leading-relaxed">
                          I commit to showing up for my future.
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-2.5 border-t border-border-subtle/30 pt-3">
                        <span className="text-primary-accent font-black text-sm font-heading">02.</span>
                        <p className="text-sm text-primary-text/90 leading-relaxed">
                          I understand that consistency beats motivation.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 border-t border-border-subtle/30 pt-3">
                        <span className="text-primary-accent font-black text-sm font-heading">03.</span>
                        <p className="text-sm text-primary-text/90 leading-relaxed">
                          I will build discipline, one day at a time.
                        </p>
                      </div>
                    </div>

                    {/* CHECKBOX TRIGGER */}
                    <label className="flex items-center gap-3 p-3 bg-secondary-surface/40 rounded-lg border border-border-subtle/40 hover:border-border-subtle/80 transition-colors cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={oathAccepted}
                        onChange={(e) => setOathAccepted(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#0c0c0c] border-border-subtle text-primary-accent focus:ring-primary-accent/40 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-primary-text">
                        I accept this commitment.
                      </span>
                    </label>

                    <div className="pt-6 border-t border-border-subtle/40 flex justify-between items-center">
                      <Button variant="ghost" onClick={prevStep} className="text-sm font-heading font-bold" disabled={isLoading}>
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back
                      </Button>
                      <Button 
                        variant="glow" 
                        onClick={handleSealOnboarding}
                        isLoading={isLoading}
                        disabled={!isStep4Valid}
                        className="font-bold font-heading px-6 py-2.5 tracking-widest uppercase text-xs"
                      >
                        Start My Journey
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
