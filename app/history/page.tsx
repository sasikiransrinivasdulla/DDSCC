'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Calendar, 
  ArrowLeft, 
  ChevronRight, 
  Flame, 
  Award, 
  TrendingUp,
  Search,
  BookOpen
} from 'lucide-react';

export default function HistoryArchivePage() {
  const router = useRouter();
  const [historyList, setHistoryList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) {
          router.push('/auth');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setHistoryList(data.history || []);
        }
      } catch (err) {
        console.error('History fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [router]);

  // Filter history logs based on search query (by date or categories)
  const filteredHistory = historyList.filter((item) => {
    const dateMatch = item.dateString.includes(searchQuery);
    const badgeMatch = item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    const projectMatch = item.summary.devProject?.toLowerCase().includes(searchQuery.toLowerCase());
    return dateMatch || badgeMatch || projectMatch;
  });

  const getBadgeColors = (badge: string) => {
    switch (badge) {
      case 'Beast Mode':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald-sm';
      case 'Strong Day':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Consistent':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Could Be Better':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Show Up Tomorrow':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Missed':
        return 'text-red-500 bg-red-500/5 border-red-500/15';
      default:
        return 'text-muted-text bg-secondary-surface border-border-subtle';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-primary-text flex flex-col font-sans antialiased selection:bg-primary-accent selection:text-[#050505]">
      
      {/* NAVBAR */}
      <Navbar />

      {/* CORE FRAMEWORK */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-12 space-y-8 mt-16">
        
        {/* UPPER NAVIGATION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-heading py-2.5"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-1.5">
              <History className="w-5 h-5 text-primary-accent" />
              <h1 className="text-lg font-black uppercase tracking-wider font-heading text-white">
                Discipline Archive Logs
              </h1>
            </div>
          </div>

          {/* Premium Search Filter bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text/50" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD) or badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-card-surface border border-border-subtle rounded-lg text-xs text-primary-text placeholder:text-muted-text/40 focus:outline-none focus:border-primary-accent/40 transition-colors"
            />
          </div>
        </div>

        {/* LOADER SPLASH */}
        {loading ? (
          <div className="py-24 text-center">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted-text animate-pulse block">
              Extracting historical preparation matrices...
            </span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 text-center bg-card-surface border-border-subtle relative overflow-hidden max-w-xl mx-auto">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary-accent font-heading block">
              No historical data mapped
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-wider font-heading mt-2">
              Discipline Logs Empty
            </h3>
            <p className="text-xs text-muted-text mt-2 leading-relaxed font-semibold">
              {searchQuery 
                ? 'No archive records matched your query. Refine dates or badge identifiers.' 
                : 'No historical days exist yet. Seal today\'s evening reflection on your dashboard to log your first discipline record.'}
            </p>
            {!searchQuery && (
              <Button 
                variant="glow"
                className="mt-6 text-[10px] uppercase tracking-widest font-heading py-3"
                onClick={() => router.push('/dashboard')}
              >
                Seal Daily Reflection
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredHistory.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <Card 
                    className="p-6 bg-card-surface border-border-subtle hover:border-primary-accent/30 hover:glow-emerald-sm transition-all duration-300 relative overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/history/${item.dateString}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-text" />
                          <span className="text-sm font-black text-white font-heading tracking-wide">
                            {item.dateString}
                          </span>
                        </div>
                        
                        {/* Summary tasks mapped */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.summary.dsaProblems > 0 && (
                            <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-primary-accent/10 text-primary-accent border border-primary-accent/25">
                              DSA: {item.summary.dsaProblems} Planned
                            </span>
                          )}
                          {item.summary.devProject && (
                            <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">
                              DEV: {item.summary.devProject.slice(0, 12)}...
                            </span>
                          )}
                          {item.summary.coreSubjects.length > 0 && (
                            <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                              CORE: {item.summary.coreSubjects.length} subjects
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score Indicator Badge */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColors(item.badge)}`}>
                          {item.badge}
                        </span>
                        
                        {!item.isMissed && (
                          <span className="text-base font-black text-primary-accent font-heading">
                            {item.ddsccScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact stats overview */}
                    <div className="p-3 bg-[#050505] rounded-xl border border-border-subtle/50 text-[10px] uppercase font-bold text-muted-text/80 space-y-1.5 select-none">
                      <div className="flex justify-between items-center">
                        <span>Technical Skills</span>
                        <span className="text-white">{item.summary.skillsCount} Targets</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Analytical Aptitude</span>
                        <span className="text-white">{item.summary.aptTopic ? 'Scheduled' : 'None'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle/30 flex items-center justify-between text-xs text-primary-accent font-extrabold font-heading hover:text-white transition-colors">
                      <span>Examine Preparedness Outcomes</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
