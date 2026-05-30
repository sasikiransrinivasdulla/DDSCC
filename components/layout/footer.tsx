import * as React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border-subtle/60 bg-[#050505] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border-subtle/30 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-primary-text font-heading">
                DDSCC
              </span>
              <span className="w-1 h-1 rounded-full bg-primary-accent" />
            </div>
            <p className="text-xs text-muted-text mt-2 max-w-xs leading-relaxed">
              Strengthening your placement journey through consistency, discipline, and structured self-growth.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8 text-xs font-semibold text-muted-text">
            <Link href="/#features" className="hover:text-primary-text transition-colors">
              Discipline Sections
            </Link>
            <Link href="/#philosophy" className="hover:text-primary-text transition-colors">
              Self-Growth Manifesto
            </Link>
            <Link href="/#privacy" className="hover:text-primary-text transition-colors">
              Privacy Standard
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary-text transition-colors">
              Core Guidelines
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <p className="text-[11px] text-muted-text/80 tracking-wide">
            © {new Date().getFullYear()} DDSCC. Built strictly for personal accountability.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-text/85">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
            <span>Zero leaderboards. Zero social pressure. Your progress is yours alone.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
