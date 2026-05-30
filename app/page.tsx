'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Layers, 
  Cpu, 
  Database, 
  MessageSquare, 
  Brain, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

export default function LandingPage() {
  
  // Animation container variants for clean, staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  // Focus Area Cards configuration
  const focusAreas = [
    {
      icon: <Code2 className="w-5 h-5 text-primary-accent" />,
      title: 'DSA',
      subtitle: 'Coding Consistency',
      description: 'Strengthen core data structures and algorithms by committing to a daily LeetCode/GFG problem-solving routine.',
    },
    {
      icon: <Layers className="w-5 h-5 text-primary-accent" />,
      title: 'Development',
      subtitle: 'Building Systems',
      description: 'Maintain development momentum by implementing feature modules, refactoring components, and committing code daily.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-primary-accent" />,
      title: 'Skills',
      subtitle: 'Industry Mastering',
      description: 'Master in-demand modern tools (Docker, AWS, CI/CD, caching layers) to stand out from average applicants.',
    },
    {
      icon: <Database className="w-5 h-5 text-primary-accent" />,
      title: 'Core CS',
      subtitle: 'Fundamental Knowledge',
      description: 'Systematic daily revision of crucial academic fundamentals: Operating Systems, DBMS, Networks, and OOPS.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-primary-accent" />,
      title: 'Communication',
      subtitle: 'Confidence & Impact',
      description: 'Practice telling stories, describing database schemas, or recording behavior responses to ace high-stress rounds.',
    },
    {
      icon: <Brain className="w-5 h-5 text-primary-accent" />,
      title: 'Aptitude',
      subtitle: 'Problem Solving Speed',
      description: 'Sharpen analytical logic with bite-sized daily quantitative assessments, probability problems, and puzzle solving.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      
      {/* Dynamic Navbar */}
      <Navbar />

      <main className="flex-1 w-full relative z-10">

        {/* HERO SECTION */}
        <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          {/* Subtle Emerald glow background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary-accent/5 blur-[100px] pointer-events-none z-0" />

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 flex flex-col items-center"
          >
            
            {/* Tagline Pill */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/20 text-primary-accent text-xs font-bold tracking-widest uppercase mb-6 font-heading"
            >
              <Zap className="w-3.5 h-3.5 fill-primary-accent/15" />
              <span>STRICTLY PERSONAL DISCIPLINE</span>
            </motion.div>

            {/* Giant Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading text-white tracking-tight uppercase leading-none mb-4"
            >
              DDSCC
            </motion.h1>

            {/* Subheading */}
            <motion.h2 
              variants={itemVariants}
              className="text-lg sm:text-2xl md:text-3xl font-extrabold font-heading text-primary-text tracking-wide mb-6"
            >
              Strengthening Your Placement Journey
            </motion.h2>

            {/* Paragraph explanation */}
            <motion.p 
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-muted-text max-w-2xl leading-relaxed mb-10"
            >
              An uncompromising, strictly private placement accountability system for computer engineers. 
              Track your daily consistency. Build ironclad coding discipline. Become placement ready on your own terms.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-sm"
            >
              <Link href="/auth" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full font-bold flex items-center justify-center gap-2">
                  <span>Start Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-sm">
                  Explore Focus Areas
                </Button>
              </Link>
            </motion.div>

            {/* Quote of Intent */}
            <motion.div 
              variants={itemVariants}
              className="mt-16 max-w-lg border-l border-primary-accent/30 pl-4 py-1 text-left"
            >
              <p className="text-xs italic text-muted-text">
                "DDSCC is not a social media feed or a todo list. It is an operating system of consistency. 
                You show up, commit to your daily routines, and measure only one competitor: who you were yesterday."
              </p>
            </motion.div>

          </motion.div>
        </section>

        {/* FOCUS AREAS / FEATURES SECTION */}
        <section id="features" className="py-20 md:py-28 border-t border-border-subtle/40 bg-secondary-surface/40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header info */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary-accent font-heading">
                6 Disciplines of Placement Prep
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 font-heading">
                Every focus area required to land a premium engineering offer.
              </p>
              <p className="text-sm text-muted-text mt-3 max-w-2xl mx-auto">
                A single page overview. Check off daily commitments across each core placement pillar to construct an elite resume.
              </p>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {focusAreas.map((item, idx) => (
                <Card 
                  key={idx} 
                  hoverEffect 
                  asMotion 
                  delay={idx * 0.05} 
                  className="bg-card-surface border-border-subtle"
                >
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-accent/5 border border-primary-accent/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
                        {item.subtitle}
                      </span>
                      <CardTitle className="text-base mt-0.5">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed text-muted-text">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section id="philosophy" className="py-20 md:py-28 border-t border-border-subtle/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 flex flex-col gap-4">
                <span className="text-xs font-bold tracking-widest text-primary-accent uppercase font-heading">
                  Product Philosophy
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
                  No leaderboards. No comparing social pressure. Only consistency.
                </h2>
                <p className="text-sm text-muted-text leading-relaxed mt-2">
                  DDSCC was architected out of frustration with toxic, gamified platform systems that induce comparison anxiety. 
                  Placement preparation is a highly personalized marathon. Comparing yourself to others leads to burnout or false security.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-accent mt-0.5 shrink-0" />
                    <span className="text-xs font-semibold text-primary-text">
                      Strict Accountability: You commit to an oath daily and record showing up.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-accent mt-0.5 shrink-0" />
                    <span className="text-xs font-semibold text-primary-text">
                      Quiet Progress: Self-growth is silent. No sharing progress widgets, no community likes.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-accent mt-0.5 shrink-0" />
                    <span className="text-xs font-semibold text-primary-text">
                      Discipline Focus: Scoring is based on personal consistent days, not speed tests.
                    </span>
                  </div>
                </div>
              </div>

              {/* Graphic manifesto visual */}
              <div className="lg:col-span-6">
                <Card className="bg-[#0D0D0D] border-border-subtle relative overflow-hidden glow-emerald-sm">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary-accent/30" />
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-text">
                      DDSCC Manifesto vs standard Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {/* Standard platform row */}
                    <div className="p-4 rounded-lg bg-background/40 border border-border-subtle/50 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-red-400 font-heading">Social Platforms</span>
                        <span className="text-[11px] text-muted-text mt-0.5">Competitive public ranking leaderboard</span>
                      </div>
                      <XCircle className="w-5 h-5 text-red-500/70 shrink-0" />
                    </div>

                    {/* DDSCC row */}
                    <div className="p-4 rounded-lg bg-primary-accent/5 border border-primary-accent/15 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-primary-accent font-heading">DDSCC Environment</span>
                        <span className="text-[11px] text-muted-text mt-0.5">Private discipline tracking, self-comparison</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary-accent shrink-0" />
                    </div>

                    <p className="text-[10px] text-muted-text/80 text-center italic mt-2">
                      “We perform best when we compete only with our yesterday's metrics.”
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* PRIVACY SECTION */}
        <section id="privacy" className="py-20 md:py-28 border-t border-border-subtle/40 bg-secondary-surface/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            
            <div className="w-12 h-12 rounded-full bg-primary-accent/10 border border-primary-accent/25 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-primary-accent" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              A Secure, Private Preparation Chamber
            </h2>
            
            <p className="text-sm text-muted-text max-w-2xl mt-4 leading-relaxed">
              We operate under absolute confidentiality. Your tracking statistics, daily tasks, study metrics, and 
              discipline records are accessible strictly by you. We do not sell your academic logs, nor do we host them 
              on open public channels. Your growth chamber remains quiet and secure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
              <div className="p-5 rounded-xl bg-card-surface border border-border-subtle/60 text-left">
                <span className="text-xs font-bold text-white block font-heading">No Public Profiles</span>
                <span className="text-[11px] text-muted-text mt-1.5 block leading-relaxed">
                  Your dashboard cannot be crawled by recruiters or peers. It is an internal workspace designed purely for personal preparation.
                </span>
              </div>
              <div className="p-5 rounded-xl bg-card-surface border border-border-subtle/60 text-left">
                <span className="text-xs font-bold text-white block font-heading">Encrypted Stats</span>
                <span className="text-[11px] text-muted-text mt-1.5 block leading-relaxed">
                  Every checklist commit, streak update, and section breakdown is processed under high security constraints.
                </span>
              </div>
              <div className="p-5 rounded-xl bg-card-surface border border-border-subtle/60 text-left">
                <span className="text-xs font-bold text-white block font-heading">Zero Tracker Ads</span>
                <span className="text-[11px] text-muted-text mt-1.5 block leading-relaxed">
                  No promotional trackers, pixel trackers, or ad cookies. DDSCC is a focused, premium workspace designed for academic study.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 md:py-28 border-t border-border-subtle/40 relative">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary-accent/3 blur-[90px] pointer-events-none z-0" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-heading">
              Start showing up for your future.
            </h2>
            <p className="text-sm text-muted-text max-w-xl mx-auto mt-4 leading-relaxed">
              Unlock the DDSCC private operating system. Commit to daily accountability and take total control over your placement destiny.
            </p>
            <div className="mt-10">
              <Link href="/auth">
                <Button variant="primary" size="lg" className="px-10 py-4 font-bold shadow-xl flex items-center justify-center gap-2 mx-auto">
                  <span>Get Started</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Dynamic Footer */}
      <Footer />

    </div>
  );
}
