'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, Sparkles, LogIn, UserPlus } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set tab based on query param, default to 'login'
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>(initialTab);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form states
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (activeTab === 'login') {
        toast.success('Access Granted', {
          description: `Entering placement accountability dashboard. Welcome back, ${data.user?.username || username}.`,
        });
      } else {
        toast.success('Preparation Chamber Established', {
          description: `Your quiet progression logs have been initialized. Welcome, ${username}.`,
        });
      }

      // Small delay for smooth toast reading before redirect
      const redirectStartTime = performance.now();
      setTimeout(() => {
        console.log(`[PERFORMANCE LOG] Initiating router push. Delay time: ${(performance.now() - redirectStartTime).toFixed(2)}ms`);
        if (data.user?.isFirstLogin) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }, 150);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Network error. Failed to establish connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        
        {/* Soft emerald glow centered under the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary-accent/5 blur-[90px] pointer-events-none z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Main Auth Container */}
          <Card className="bg-card-surface border-border-subtle/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-accent/40 to-transparent" />
            
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-accent/5 border border-primary-accent/25 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-primary-accent" />
              </div>
              <CardTitle className="text-xl font-bold font-heading text-white">
                Access Discipline System
              </CardTitle>
              <CardDescription className="text-xs text-muted-text mt-1">
                Your quiet workspace to build consistency. Zero public comparison.
              </CardDescription>
            </CardHeader>

            {/* TAB SELECTORS */}
            <div className="px-6 pb-2">
              <div className="grid grid-cols-2 p-1 rounded-lg bg-secondary-surface border border-border-subtle/60 relative">
                
                {/* Login Tab Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setUsername('');
                    setPassword('');
                  }}
                  className={`py-2 text-xs font-bold font-heading rounded-md transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login' ? 'text-white' : 'text-muted-text'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>

                {/* Signup Tab Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setUsername('');
                    setPassword('');
                  }}
                  className={`py-2 text-xs font-bold font-heading rounded-md transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'signup' ? 'text-white' : 'text-muted-text'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>

                {/* Animated Background Selector */}
                <motion.div
                  className="absolute top-1 bottom-1 left-1 rounded-md bg-[#161616] border border-border-subtle/80 shadow z-0"
                  layoutId="activeTabBg"
                  animate={{
                    left: activeTab === 'login' ? '4px' : 'calc(50% + 2px)',
                    right: activeTab === 'login' ? 'calc(50% + 2px)' : '4px',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              </div>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-4 space-y-4">

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-1.5 font-heading">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. sasi"
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary-surface border border-border-subtle/80 text-base text-primary-text placeholder:text-muted-text/45 focus:outline-none focus:border-primary-accent/50 transition-colors"
                  />
                </div>

                {/* Password input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-text font-heading">
                      Access Password
                    </label>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary-surface border border-border-subtle/80 text-base text-primary-text placeholder:text-muted-text/45 focus:outline-none focus:border-primary-accent/50 transition-colors"
                  />
                </div>

              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full py-3 font-semibold text-sm tracking-wide font-heading"
                >
                  {activeTab === 'login' ? 'Access System' : 'Create Preparation Chamber'}
                </Button>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-text">
                  <Sparkles className="w-3 h-3 text-primary-accent" />
                  <span>Encrypted progress. Strictly confidential.</span>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background items-center justify-center relative">
        {/* Soft background glow */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-primary-accent/10 blur-[80px] pointer-events-none" />
        
        <div className="text-primary-accent font-black text-3xl tracking-widest font-heading animate-pulse relative z-10">
          DDSCC
        </div>
        <div className="text-xs text-muted-text uppercase font-bold tracking-widest mt-3 animate-pulse relative z-10">
          Initializing Chamber...
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
