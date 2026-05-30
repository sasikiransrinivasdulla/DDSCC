'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProgressStore } from '@/store/useProgressStore';
import { Button } from '@/components/ui/button';
import { Flame, ShieldAlert, BookOpen, Compass, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const pathname = usePathname();
  const { profile } = useProgressStore();
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuth = pathname.startsWith('/auth');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/65 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary-accent/10 border border-primary-accent/30 flex items-center justify-center group-hover:border-primary-accent/80 transition-colors">
            <span className="text-primary-accent font-black text-sm tracking-widest font-heading">D</span>
          </div>
          <span className="text-lg font-black tracking-widest font-heading text-primary-text group-hover:text-white transition-colors">
            DDSCC
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse mt-3" />
        </Link>

        {/* MIDDLE NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8">
          {isDashboard ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm font-semibold text-primary-text border-b border-primary-accent px-1 py-1"
              >
                Dashboard
              </Link>
              <Link 
                href="/" 
                className="text-sm font-semibold text-muted-text hover:text-primary-text transition-colors px-1 py-1"
              >
                Philosophy
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/#features" 
                className="text-sm font-semibold text-muted-text hover:text-primary-text transition-colors px-1 py-1"
              >
                Focus Areas
              </Link>
              <Link 
                href="/#philosophy" 
                className="text-sm font-semibold text-muted-text hover:text-primary-text transition-colors px-1 py-1"
              >
                Philosophy
              </Link>
              <Link 
                href="/#privacy" 
                className="text-sm font-semibold text-muted-text hover:text-primary-text transition-colors px-1 py-1"
              >
                Privacy Standard
              </Link>
            </>
          )}
        </nav>

        {/* RIGHT SIDE CALL TO ACTIONS */}
        <div className="flex items-center gap-4">
          {isDashboard ? (
            <div className="flex items-center gap-3">
              {/* Premium Streak Pill */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-400"
              >
                <Flame className="w-4 h-4 fill-orange-400/20" />
                <span className="text-xs font-black tracking-wider uppercase font-heading">{profile.streakDays} Days</span>
              </motion.div>
              
              {/* Sasi's avatar or initials */}
              <div className="w-9 h-9 rounded-full bg-secondary-surface border border-border-subtle flex items-center justify-center cursor-pointer hover:border-primary-accent/40 transition-colors">
                <span className="text-xs font-black text-primary-accent font-heading">
                  {profile.name.substring(0, 2).toUpperCase()}
                </span>
              </div>

              <Link href="/auth">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                  Exit System
                </Button>
              </Link>
            </div>
          ) : isAuth ? (
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                Back to Site
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-xs">
                  Login
                </Button>
              </Link>
              <Link href="/auth?tab=signup">
                <Button variant="primary" size="sm" className="text-xs">
                  Enter System
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
